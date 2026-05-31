import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-scaash-token-2026";

export type RoleType = "ADMIN" | "TEACHER" | "STUDENT" | "HOD" | "EVENT_COORDINATOR" | "PLACEMENT_OFFICER";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: RoleType;
  };
  sessionToken?: string;
}

export const authenticateJWT = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
      }

      const decodedUser = decoded as AuthRequest["user"];

      // If token is a real JWT (not offline demo), check session status in DB
      if (token && !token.startsWith("demo-jwt-token-") && decodedUser) {
        try {
          const session = await prisma.session.findUnique({
            where: { token: token },
          });

          if (!session || session.isRevoked) {
            return res.status(403).json({ error: "Session has been revoked or expired" });
          }

          // Check if user is suspended
          const userObj = await prisma.user.findUnique({
            where: { id: decodedUser.id },
            select: { accountStatus: true },
          });

          if (userObj && userObj.accountStatus === "SUSPENDED") {
            return res.status(403).json({ error: "Your account has been suspended. Please contact admin." });
          }
        } catch (dbErr) {
          console.error("Session verification DB error:", dbErr);
        }
      }

      req.user = decodedUser;
      req.sessionToken = token;
      next();
    });
  } else {
    res.status(401).json({ error: "Authorization header missing or malformed" });
  }
};

export const requireRole = (roles: RoleType[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Requires one of the roles: ${roles.join(", ")}`,
      });
    }

    next();
  };
};
