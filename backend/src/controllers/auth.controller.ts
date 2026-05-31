import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-scaash-token-2026";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

// Zod validation schemas
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["ADMIN", "TEACHER", "STUDENT", "HOD", "EVENT_COORDINATOR", "PLACEMENT_OFFICER"]),
  institutionalId: z.string().min(4, "Institutional ID must be at least 4 characters").optional(),
  departmentCode: z.enum(["CSE", "EE", "PHYS"]).optional().nullable(),
  semester: z.number().min(1).max(8).optional().nullable(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    // ID Validation Logic
    if (validatedData.institutionalId) {
      const existingId = await prisma.user.findUnique({
        where: { institutionalId: validatedData.institutionalId },
      });
      if (existingId) {
        return res.status(400).json({ error: "Institutional ID is already registered" });
      }

      if (validatedData.role === "STUDENT" && !validatedData.institutionalId.startsWith("STU-")) {
        return res.status(400).json({ error: "Student ID must start with 'STU-' (e.g., STU-2026-44)" });
      }

      if (
        validatedData.role !== "STUDENT" && 
        validatedData.role !== "ADMIN" && 
        !validatedData.institutionalId.startsWith("FAC-")
      ) {
        return res.status(400).json({ error: "Faculty / HOD ID must start with 'FAC-' (e.g., FAC-2026-10)" });
      }
    } else {
      if (validatedData.role !== "ADMIN") {
        return res.status(400).json({ error: "Institutional ID is required for this role" });
      }
    }

    // Dynamic department resolution
    let departmentId: string | null = null;
    if (validatedData.departmentCode) {
      const dept = await prisma.department.findUnique({
        where: { code: validatedData.departmentCode },
      });
      if (dept) {
        departmentId = dept.id;
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validatedData.password, salt);

    const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        passwordHash,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        role: validatedData.role,
        institutionalId: validatedData.institutionalId,
        isEmailVerified: false,
        emailVerificationToken: verificationToken,
        accountStatus: "PENDING_VERIFICATION",
        departmentId: departmentId,
        semester: validatedData.semester,
      },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "REGISTER",
        details: `Account registered as ${validatedData.role} with ID ${validatedData.institutionalId}`,
        ipAddress: req.ip || "127.0.0.1",
        userAgent: req.headers["user-agent"] || "Unknown Device",
      },
    });

    // Visual console log of mock verification email for verification check
    console.log("\n================ MOCK CAMPUS EMAIL SYSTEM ================");
    console.log(`To: ${validatedData.email}`);
    console.log("Subject: Verify Your Smart Campus Account");
    console.log(`Verification URL: http://localhost:3000/verify-email?token=${verificationToken}`);
    console.log("==========================================================\n");

    const { passwordHash: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: "Registration successful. Please verify your email to log in.",
      user: userWithoutPassword,
      verificationUrl: `http://localhost:3000/verify-email?token=${verificationToken}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (user.accountStatus === "SUSPENDED") {
      return res.status(403).json({ error: "Your account is suspended. Please contact the administrator." });
    }

    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        jti: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    // Save session in DB
    const device = req.headers["user-agent"] || "Unknown Device";
    const ipAddress = req.ip || "127.0.0.1";

    await prisma.session.create({
      data: {
        userId: user.id,
        token: token,
        device: device,
        ipAddress: ipAddress,
      },
    });

    // Update lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "LOGIN",
        details: `Successful login from ${device}`,
        ipAddress: ipAddress,
        userAgent: device,
      },
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        institutionalId: user.institutionalId,
        avatarUrl: user.avatarUrl,
        departmentId: user.departmentId,
        semester: user.semester,
        accountStatus: user.accountStatus,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
