import { Response, Router } from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { authenticateJWT, requireRole, AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();
export const authMgmtRouter = Router();

// ----- Validation Schemas -----
const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  semester: z.number().min(1).max(8).optional().nullable(),
  departmentId: z.string().uuid().optional().nullable(),
});

const avatarSchema = z.object({
  base64Image: z.string().min(10, "Base64 image is too short").nullable(),
});

const updateStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "PENDING_VERIFICATION"]),
});

// ----- Routes -----

/**
 * POST /api/v1/auth/verify-email
 * Verifies student/faculty email and marks status as ACTIVE
 */
authMgmtRouter.post("/verify-email", async (req, res) => {
  try {
    const { token } = verifyEmailSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired verification token." });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        accountStatus: "ACTIVE",
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "VERIFY_EMAIL",
        details: "Email verified successfully. Account set to ACTIVE.",
        ipAddress: req.ip || "127.0.0.1",
        userAgent: req.headers["user-agent"] || "Unknown Device",
      },
    });

    res.status(200).json({ message: "Email verified successfully! Account is now active. Please log in." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Verify email error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/v1/auth/forgot-password
 * Initiates forgot password flow, generates recovery token
 */
authMgmtRouter.post("/forgot-password", async (req, res) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security reasons, don't leak user existence
      return res.status(200).json({ message: "If this email exists in our records, reset instructions have been sent." });
    }

    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expires = new Date(Date.now() + 3600000); // 1 hour validity

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: expires,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "FORGOT_PASSWORD_REQUEST",
        details: "Password reset token requested.",
        ipAddress: req.ip || "127.0.0.1",
        userAgent: req.headers["user-agent"] || "Unknown Device",
      },
    });

    // Mock sending email to server stdout
    console.log("\n================ MOCK CAMPUS EMAIL SYSTEM ================");
    console.log(`To: ${email}`);
    console.log("Subject: Reset Your Smart Campus Password");
    console.log(`Reset URL: http://localhost:3000/reset-password?token=${resetToken}`);
    console.log("==========================================================\n");

    res.status(200).json({
      message: "If this email exists in our records, reset instructions have been sent.",
      resetUrl: `http://localhost:3000/reset-password?token=${resetToken}`, // Pass back in response for sandbox testing ease
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/v1/auth/reset-password
 * Resets user password using reset token
 */
authMgmtRouter.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired password reset token." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    // Revoke all existing sessions for safety after password change
    await prisma.session.updateMany({
      where: { userId: user.id },
      data: { isRevoked: true },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "RESET_PASSWORD",
        details: "Password reset completed. All prior sessions revoked for safety.",
        ipAddress: req.ip || "127.0.0.1",
        userAgent: req.headers["user-agent"] || "Unknown Device",
      },
    });

    res.status(200).json({ message: "Password updated successfully! Please login with your new password." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/v1/auth/sessions
 * Returns user's active/historic sessions (Protected)
 */
authMgmtRouter.get("/sessions", authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const sessions = await prisma.session.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    res.status(200).json({ sessions });
  } catch (error) {
    console.error("Fetch sessions error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/v1/auth/sessions/revoke
 * Revokes a specific session (Protected)
 */
authMgmtRouter.post("/sessions/revoke", authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required." });
    }

    const session = await prisma.session.findFirst({
      where: { id: sessionId, userId: req.user!.id },
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found." });
    }

    await prisma.session.update({
      where: { id: sessionId },
      data: { isRevoked: true },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user!.id,
        action: "REVOKE_SESSION",
        details: `Revoked session from device: ${session.device}`,
        ipAddress: req.ip || "127.0.0.1",
        userAgent: req.headers["user-agent"] || "Unknown Device",
      },
    });

    res.status(200).json({ message: "Session revoked successfully." });
  } catch (error) {
    console.error("Revoke session error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/v1/auth/sessions/revoke-others
 * Logs out all other active sessions of this user (Protected)
 */
authMgmtRouter.post("/sessions/revoke-others", authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const activeToken = req.sessionToken;

    await prisma.session.updateMany({
      where: {
        userId: req.user!.id,
        token: { not: activeToken },
        isRevoked: false,
      },
      data: { isRevoked: true },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user!.id,
        action: "REVOKE_OTHER_SESSIONS",
        details: "Terminated all other active device logins.",
        ipAddress: req.ip || "127.0.0.1",
        userAgent: req.headers["user-agent"] || "Unknown Device",
      },
    });

    res.status(200).json({ message: "Other device sessions revoked successfully." });
  } catch (error) {
    console.error("Revoke other sessions error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PATCH /api/v1/users/profile
 * Modifies personal details (Protected)
 */
authMgmtRouter.patch("/users/profile", authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(validatedData.firstName && { firstName: validatedData.firstName }),
        ...(validatedData.lastName && { lastName: validatedData.lastName }),
        ...(validatedData.semester !== undefined && { semester: validatedData.semester }),
        ...(validatedData.departmentId !== undefined && { departmentId: validatedData.departmentId }),
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user!.id,
        action: "UPDATE_PROFILE",
        details: "Modified profile personal credentials.",
        ipAddress: req.ip || "127.0.0.1",
        userAgent: req.headers["user-agent"] || "Unknown Device",
      },
    });

    res.status(200).json({
      message: "Profile updated successfully.",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        isEmailVerified: updatedUser.isEmailVerified,
        institutionalId: updatedUser.institutionalId,
        avatarUrl: updatedUser.avatarUrl,
        departmentId: updatedUser.departmentId,
        semester: updatedUser.semester,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/v1/users/avatar
 * Uploads a profile image as base64 data URI (Protected)
 */
authMgmtRouter.post("/users/avatar", authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const { base64Image } = avatarSchema.parse(req.body);

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        avatarUrl: base64Image,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user!.id,
        action: base64Image ? "UPDATE_AVATAR" : "REMOVE_AVATAR",
        details: base64Image ? "Updated profile avatar picture." : "Removed profile avatar picture.",
        ipAddress: req.ip || "127.0.0.1",
        userAgent: req.headers["user-agent"] || "Unknown Device",
      },
    });

    res.status(200).json({
      message: base64Image ? "Avatar uploaded successfully." : "Avatar removed successfully.",
      avatarUrl: updatedUser.avatarUrl,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Upload avatar error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/v1/users/activity-logs
 * Retrieves user audit trails (Protected)
 */
authMgmtRouter.get("/users/activity-logs", authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const logs = await prisma.activityLog.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    res.status(200).json({ logs });
  } catch (error) {
    console.error("Fetch activity logs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PATCH /api/v1/admin/users/:id/status
 * Suspends or activates user account (Protected: Admins only)
 */
authMgmtRouter.patch("/admin/users/:id/status", authenticateJWT, requireRole(["ADMIN"]), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = updateStatusSchema.parse(req.body);

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return res.status(404).json({ error: "Target user not found." });
    }

    await prisma.user.update({
      where: { id },
      data: { accountStatus: status },
    });

    // Revoke target user's active sessions if suspended for immediate lock-out
    if (status === "SUSPENDED") {
      await prisma.session.updateMany({
        where: { userId: id },
        data: { isRevoked: true },
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user!.id,
        action: "ADMIN_UPDATE_STATUS",
        details: `Updated status of user ${targetUser.email} to ${status}.`,
        ipAddress: req.ip || "127.0.0.1",
        userAgent: req.headers["user-agent"] || "Unknown Device",
      },
    });

    res.status(200).json({ message: `User account status updated to ${status}.` });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Admin update status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
