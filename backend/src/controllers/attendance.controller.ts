import { Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import {
  generateQRToken,
  validateQRToken,
  calculateDistanceMeters,
  DEFAULT_CLASSROOM_COORDS,
  MAX_GEOFENCE_RADIUS_METERS,
} from "../services/qr.service";
import { authenticateJWT, requireRole, AuthRequest } from "../middleware/auth";
import { rewardCheckIn, resetStreak } from "../services/gamification.service";

const prisma = new PrismaClient();
export const attendanceRouter = Router();

// ----- Validation Schemas -----
const createLectureSchema = z.object({
  sectionId: z.string().uuid("Invalid section ID"),
  topic: z.string().optional(),
});

const checkinSchema = z.object({
  lectureId: z.string().uuid("Invalid lecture ID"),
  qrToken: z.string().min(1, "QR token is required"),
  qrTimestamp: z.number().positive("Invalid timestamp"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const manualOverrideSchema = z.object({
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
});

// ----- Routes -----

/**
 * POST /api/v1/attendance/lectures
 * Teacher creates/starts a new lecture session
 */
attendanceRouter.post(
  "/lectures",
  authenticateJWT,
  requireRole(["TEACHER", "ADMIN"]),
  async (req: AuthRequest, res: Response) => {
    try {
      const data = createLectureSchema.parse(req.body);

      // Verify teacher owns this section
      const section = await prisma.section.findFirst({
        where: { id: data.sectionId, instructorId: req.user!.id },
      });

      if (!section) {
        return res.status(403).json({ error: "You are not the instructor for this section." });
      }

      const lecture = await prisma.lecture.create({
        data: {
          sectionId: data.sectionId,
          dateTime: new Date(),
          topic: data.topic || "Untitled Lecture",
          status: "ONGOING",
        },
      });

      // Generate the first QR token for this lecture
      const qrPayload = generateQRToken(lecture.id);

      res.status(201).json({
        message: "Lecture session started successfully",
        lecture,
        qr: qrPayload,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Create lecture error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * GET /api/v1/attendance/lectures/active
 * Returns all currently ongoing lecture sessions
 */
attendanceRouter.get(
  "/lectures/active",
  authenticateJWT,
  async (req: AuthRequest, res: Response) => {
    try {
      const lectures = await prisma.lecture.findMany({
        where: { status: "ONGOING" },
        include: {
          section: {
            include: {
              course: true,
              instructor: {
                select: { id: true, firstName: true, lastName: true, email: true },
              },
            },
          },
        },
        orderBy: { dateTime: "desc" },
      });

      res.status(200).json({ lectures });
    } catch (error) {
      console.error("Fetch active lectures error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * POST /api/v1/attendance/qr/refresh/:lectureId
 * Teacher refreshes the QR token for a live session
 */
attendanceRouter.post(
  "/qr/refresh/:lectureId",
  authenticateJWT,
  requireRole(["TEACHER", "ADMIN"]),
  async (req: AuthRequest, res: Response) => {
    try {
      const { lectureId } = req.params;

      const lecture = await prisma.lecture.findFirst({
        where: { id: lectureId, status: "ONGOING" },
      });

      if (!lecture) {
        return res.status(404).json({ error: "Active lecture session not found." });
      }

      const qrPayload = generateQRToken(lectureId);
      res.status(200).json({ qr: qrPayload });
    } catch (error) {
      console.error("QR refresh error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * POST /api/v1/attendance/verify-checkin
 * Student submits a QR token + GPS coords for check-in verification
 */
attendanceRouter.post(
  "/verify-checkin",
  authenticateJWT,
  requireRole(["STUDENT"]),
  async (req: AuthRequest, res: Response) => {
    try {
      const data = checkinSchema.parse(req.body);

      // 1. Verify the lecture exists and is ongoing
      const lecture = await prisma.lecture.findFirst({
        where: { id: data.lectureId, status: "ONGOING" },
        include: { section: { include: { enrollments: true } } },
      });

      if (!lecture) {
        return res.status(404).json({ error: "No active session found for this lecture." });
      }

      // 2. Verify student is enrolled in this section
      const isEnrolled = lecture.section.enrollments.some(
        (e) => e.studentId === req.user!.id
      );

      if (!isEnrolled) {
        return res.status(403).json({ error: "You are not enrolled in this course section." });
      }

      // 3. Check if student already checked in
      const existingRecord = await prisma.attendanceRecord.findUnique({
        where: {
          studentId_lectureId: {
            studentId: req.user!.id,
            lectureId: data.lectureId,
          },
        },
      });

      if (existingRecord) {
        return res.status(409).json({ error: "You have already checked in for this lecture." });
      }

      // 4. Validate QR token cryptographic signature
      const qrResult = validateQRToken(data.lectureId, data.qrToken, data.qrTimestamp);
      if (!qrResult.valid) {
        return res.status(400).json({ error: qrResult.reason });
      }

      // 5. Validate GPS proximity (Haversine distance check)
      const distance = calculateDistanceMeters(
        data.latitude,
        data.longitude,
        DEFAULT_CLASSROOM_COORDS.latitude,
        DEFAULT_CLASSROOM_COORDS.longitude
      );

      let attendanceStatus: "PRESENT" | "LATE" = "PRESENT";
      const verificationMethod: "QR" | "GEOLOCATION" = "QR";

      // If distance is beyond geofence radius, reject
      if (distance > MAX_GEOFENCE_RADIUS_METERS) {
        return res.status(403).json({
          error: `Location verification failed. You are ${Math.round(distance)}m away from the classroom (max: ${MAX_GEOFENCE_RADIUS_METERS}m).`,
        });
      }

      // 6. Check if student is late (more than 10 minutes after lecture start)
      const minutesSinceStart =
        (Date.now() - new Date(lecture.dateTime).getTime()) / (1000 * 60);
      if (minutesSinceStart > 10) {
        attendanceStatus = "LATE";
      }

      // 7. Persist the attendance record
      const record = await prisma.attendanceRecord.create({
        data: {
          studentId: req.user!.id,
          lectureId: data.lectureId,
          status: attendanceStatus,
          markedById: req.user!.id,
          verificationMethod,
        },
      });

      // 8. Reward check-in (gamification points, badges, achievements)
      let gamificationResult = { xpAwarded: 0, newBadges: [] as string[], newAchievements: [] as string[] };
      try {
        gamificationResult = await rewardCheckIn(req.user!.id, attendanceStatus);
      } catch (gameErr) {
        console.error("Failed to reward check-in:", gameErr);
      }

      res.status(201).json({
        message: `Check-in successful! Status: ${attendanceStatus}`,
        record,
        distance: Math.round(distance),
        gamification: gamificationResult,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Check-in verification error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * PATCH /api/v1/attendance/records/:id
 * Teacher manually overrides an attendance status
 */
attendanceRouter.patch(
  "/records/:id",
  authenticateJWT,
  requireRole(["TEACHER", "ADMIN"]),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const data = manualOverrideSchema.parse(req.body);

      const record = await prisma.attendanceRecord.update({
        where: { id },
        data: {
          status: data.status,
          markedById: req.user!.id,
          verificationMethod: "MANUAL",
          markedAt: new Date(),
        },
      });

      if (data.status === "ABSENT") {
        try {
          await resetStreak(record.studentId);
        } catch (err) {
          console.error("Failed to reset streak on manual override:", err);
        }
      }

      res.status(200).json({
        message: `Attendance updated to ${data.status}`,
        record,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Manual override error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * POST /api/v1/attendance/lectures/:id/end
 * Teacher ends an active lecture session
 */
attendanceRouter.post(
  "/lectures/:id/end",
  authenticateJWT,
  requireRole(["TEACHER", "ADMIN"]),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const lecture = await prisma.lecture.update({
        where: { id },
        data: { status: "COMPLETED" },
      });

      // Mark all enrolled students who didn't check in as ABSENT
      const section = await prisma.section.findUnique({
        where: { id: lecture.sectionId },
        include: { enrollments: true },
      });

      if (section) {
        const checkedInStudentIds = await prisma.attendanceRecord.findMany({
          where: { lectureId: id },
          select: { studentId: true },
        });

        const checkedInSet = new Set(checkedInStudentIds.map((r) => r.studentId));

        const absentRecords = section.enrollments
          .filter((e) => !checkedInSet.has(e.studentId))
          .map((e) => ({
            studentId: e.studentId,
            lectureId: id,
            status: "ABSENT" as const,
            markedById: req.user!.id,
            verificationMethod: "MANUAL" as const,
          }));

        if (absentRecords.length > 0) {
          await prisma.attendanceRecord.createMany({ data: absentRecords });
          try {
            await Promise.all(
              absentRecords.map((rec) => resetStreak(rec.studentId))
            );
          } catch (gameErr) {
            console.error("Failed to reset streaks for absent students:", gameErr);
          }
        }
      }

      res.status(200).json({
        message: "Lecture session ended. Absent students have been marked.",
        lecture,
      });
    } catch (error) {
      console.error("End lecture error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * GET /api/v1/attendance/student/stats
 * Student fetches their own attendance analytics
 */
attendanceRouter.get(
  "/student/stats",
  authenticateJWT,
  requireRole(["STUDENT"]),
  async (req: AuthRequest, res: Response) => {
    try {
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: req.user!.id },
        include: {
          section: {
            include: {
              course: true,
              lectures: {
                include: {
                  attendanceRecords: {
                    where: { studentId: req.user!.id },
                  },
                },
              },
            },
          },
        },
      });

      const stats = enrollments.map((enrollment) => {
        const section = enrollment.section;
        const totalLectures = section.lectures.length;
        const attended = section.lectures.filter((l) =>
          l.attendanceRecords.some(
            (r) => r.status === "PRESENT" || r.status === "LATE"
          )
        ).length;

        const rate = totalLectures > 0 ? Math.round((attended / totalLectures) * 100) : 100;

        // Predictive calculation: how many more can be missed to stay above 75%
        const threshold = 0.75;
        const remainingLecturesEstimate = 5; // Estimate 5 more lectures in the term
        const totalProjected = totalLectures + remainingLecturesEstimate;
        const canMiss = Math.max(0, Math.floor(attended + remainingLecturesEstimate - threshold * totalProjected));

        return {
          courseCode: section.course.code,
          courseName: section.course.name,
          sectionName: section.name,
          totalLectures,
          attended,
          rate,
          status: rate >= 85 ? "safe" : rate >= 75 ? "warning" : "danger",
          prediction:
            rate >= 85
              ? `You can safely skip ${canMiss} more lecture(s).`
              : rate >= 75
              ? `Caution: Do not miss the next lecture.`
              : `Must attend next ${Math.ceil(threshold * totalProjected - attended)} lectures to reach 75%!`,
        };
      });

      const overallRate =
        stats.length > 0
          ? Math.round(stats.reduce((sum, s) => sum + s.rate, 0) / stats.length)
          : 100;

      res.status(200).json({ overallRate, subjects: stats });
    } catch (error) {
      console.error("Student stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * GET /api/v1/attendance/sections
 * Returns sections taught by the logged-in instructor, or all sections if ADMIN
 */
attendanceRouter.get(
  "/sections",
  authenticateJWT,
  async (req: AuthRequest, res: Response) => {
    try {
      const whereClause = req.user!.role === "ADMIN" ? {} : { instructorId: req.user!.id };
      const sections = await prisma.section.findMany({
        where: whereClause,
        include: {
          course: true,
          enrollments: {
            select: {
              id: true,
              studentId: true,
            },
          },
        },
      });
      res.status(200).json({ sections });
    } catch (error) {
      console.error("Fetch sections error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

