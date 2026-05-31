import { Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { authenticateJWT, requireRole, AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();
export const leaveRouter = Router();

// ----- Validation Schemas -----
const createLeaveSchema = z.object({
  type: z.enum(["MEDICAL", "EVENT", "PERSONAL", "FAMILY", "OTHER"]),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid start date"),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid end date"),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
});

const reviewLeaveSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  reviewNote: z.string().optional(),
});

// ----- Routes -----

/**
 * POST /api/v1/leaves
 * Student submits a new leave/exemption request
 */
leaveRouter.post(
  "/",
  authenticateJWT,
  requireRole(["STUDENT"]),
  async (req: AuthRequest, res: Response) => {
    try {
      const data = createLeaveSchema.parse(req.body);

      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);

      if (endDate < startDate) {
        return res.status(400).json({ error: "End date cannot be before start date." });
      }

      const leave = await prisma.leaveRequest.create({
        data: {
          studentId: req.user!.id,
          type: data.type,
          startDate,
          endDate,
          reason: data.reason,
          status: "PENDING",
        },
      });

      res.status(201).json({
        message: "Leave request submitted successfully.",
        leave,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Create leave error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * GET /api/v1/leaves/student
 * Student fetches their own leave request history
 */
leaveRouter.get(
  "/student",
  authenticateJWT,
  requireRole(["STUDENT"]),
  async (req: AuthRequest, res: Response) => {
    try {
      const leaves = await prisma.leaveRequest.findMany({
        where: { studentId: req.user!.id },
        orderBy: { createdAt: "desc" },
      });

      res.status(200).json({ leaves });
    } catch (error) {
      console.error("Fetch student leaves error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * GET /api/v1/leaves/pending
 * Teacher/Admin fetches all pending leave requests
 */
leaveRouter.get(
  "/pending",
  authenticateJWT,
  requireRole(["TEACHER", "ADMIN"]),
  async (req: AuthRequest, res: Response) => {
    try {
      const leaves = await prisma.leaveRequest.findMany({
        where: { status: "PENDING" },
        include: {
          student: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Fallback demo data if database is empty
      const fallbackLeaves = [
        {
          id: "leave-demo-1",
          studentId: "std-1",
          type: "MEDICAL",
          startDate: new Date(Date.now() - 86400000 * 2),
          endDate: new Date(Date.now() - 86400000),
          reason: "High fever and flu symptoms. Doctor advised 2 days rest.",
          status: "PENDING",
          createdAt: new Date(Date.now() - 86400000 * 3),
          student: { id: "std-1", firstName: "Devon", lastName: "Miller", email: "devon.m@campus.edu" },
        },
        {
          id: "leave-demo-2",
          studentId: "std-2",
          type: "EVENT",
          startDate: new Date(Date.now() + 86400000),
          endDate: new Date(Date.now() + 86400000 * 2),
          reason: "Participating in Inter-University Hackathon (with dean approval).",
          status: "PENDING",
          createdAt: new Date(Date.now() - 86400000),
          student: { id: "std-2", firstName: "Sara", lastName: "Jenkins", email: "sara.j@campus.edu" },
        },
        {
          id: "leave-demo-3",
          studentId: "std-3",
          type: "FAMILY",
          startDate: new Date(Date.now() - 86400000),
          endDate: new Date(Date.now() + 86400000),
          reason: "Family emergency - need to travel home urgently.",
          status: "PENDING",
          createdAt: new Date(Date.now() - 86400000 * 2),
          student: { id: "std-3", firstName: "Rahul", lastName: "Kapoor", email: "rahul.k@campus.edu" },
        },
      ];

      res.status(200).json({
        leaves: leaves.length > 0 ? leaves : fallbackLeaves,
      });
    } catch (error) {
      console.error("Fetch pending leaves error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * PATCH /api/v1/leaves/:id
 * Teacher approves/rejects a leave request.
 * On APPROVED: retroactively updates overlapping ABSENT records to EXCUSED.
 */
leaveRouter.patch(
  "/:id",
  authenticateJWT,
  requireRole(["TEACHER", "ADMIN"]),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const data = reviewLeaveSchema.parse(req.body);

      const leave = await prisma.leaveRequest.update({
        where: { id },
        data: {
          status: data.status,
          reviewedById: req.user!.id,
          reviewNote: data.reviewNote || null,
        },
      });

      // If approved, retroactively update overlapping ABSENT records to EXCUSED
      if (data.status === "APPROVED") {
        const updatedRecords = await prisma.attendanceRecord.updateMany({
          where: {
            studentId: leave.studentId,
            status: "ABSENT",
            lecture: {
              dateTime: {
                gte: leave.startDate,
                lte: leave.endDate,
              },
            },
          },
          data: {
            status: "EXCUSED",
            verificationMethod: "MANUAL",
          },
        });

        return res.status(200).json({
          message: `Leave request approved. ${updatedRecords.count} absent record(s) updated to EXCUSED.`,
          leave,
          excusedCount: updatedRecords.count,
        });
      }

      res.status(200).json({
        message: `Leave request ${data.status.toLowerCase()}.`,
        leave,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Review leave error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
