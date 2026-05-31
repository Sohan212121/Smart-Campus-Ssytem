import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { register, login } from "./controllers/auth.controller";
import { authMgmtRouter } from "./controllers/auth-mgmt.controller";
import { attendanceRouter } from "./controllers/attendance.controller";
import { analyticsRouter } from "./controllers/analytics.controller";
import { leaveRouter } from "./controllers/leave.controller";
import { aiRouter } from "./controllers/ai.controller";
import { gamificationRouter } from "./controllers/gamification.controller";
import { authenticateJWT, AuthRequest } from "./middleware/auth";
import { generateQRToken } from "./services/qr.service";

// Load configuration env variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Real-Time Socket.io Server initialization
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

const PORT = process.env.PORT || 5000;

// Middleware stack
app.use(cors());
app.use(express.json());

// Socket.io Real-Time Event Handlers
io.on("connection", (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Teacher joins a lecture room and starts a check-in session
  socket.on("session:start", (data: { lectureId: string; radius?: number }) => {
    console.log(`[Socket] Session started for lecture: ${data.lectureId}`);
    socket.join(data.lectureId);

    // Generate initial QR token and broadcast session activation
    const qr = generateQRToken(data.lectureId);
    io.emit("session:broadcast", {
      lectureId: data.lectureId,
      status: "ONGOING",
      radius: data.radius || 30,
      qr,
    });

    // Auto-refresh QR token every 5 seconds while session is active
    const qrInterval = setInterval(() => {
      const freshQR = generateQRToken(data.lectureId);
      io.to(data.lectureId).emit("qr:refresh", { qr: freshQR });
    }, 5000);

    // Store interval so we can clear it when session ends
    socket.data.qrInterval = qrInterval;
  });

  // Student joins a lecture room to receive live updates
  socket.on("session:join", (data: { lectureId: string }) => {
    socket.join(data.lectureId);
    console.log(`[Socket] Student ${socket.id} joined lecture room: ${data.lectureId}`);
  });

  // Student successfully checks in
  socket.on("check_in:success", (data: { lectureId: string; studentId: string; name: string }) => {
    console.log(`[Socket] Student ${data.name} checked in for lecture ${data.lectureId}`);
    io.to(data.lectureId).emit("student:checked_in", {
      studentId: data.studentId,
      name: data.name,
      timestamp: new Date(),
    });
  });

  // Teacher ends the session
  socket.on("session:end", (data: { lectureId: string }) => {
    console.log(`[Socket] Session ended for lecture: ${data.lectureId}`);
    if (socket.data.qrInterval) {
      clearInterval(socket.data.qrInterval);
    }
    io.to(data.lectureId).emit("session:ended", { lectureId: data.lectureId });
  });

  socket.on("disconnect", () => {
    if (socket.data.qrInterval) {
      clearInterval(socket.data.qrInterval);
    }
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// --- API Endpoint Mapping ---

// Health check endpoint
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

// Authentication Routes
app.post("/api/v1/auth/register", register);
app.post("/api/v1/auth/login", login);
app.use("/api/v1", authMgmtRouter);

// Attendance Engine Routes
app.use("/api/v1/attendance", attendanceRouter);

// Analytics Routes
app.use("/api/v1/analytics", analyticsRouter);

// Leave & Exemption Routes
app.use("/api/v1/leaves", leaveRouter);

// AI-Powered Feature Routes
app.use("/api/v1/ai", aiRouter);

// Gamification Routes
app.use("/api/v1/gamification", gamificationRouter);

// Profile Fetching Route (Protected)
app.get("/api/v1/users/me", authenticateJWT, (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.status(200).json({ user: req.user });
});

// Global Error Handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("[Fatal Error]:", err);
  res.status(500).json({ error: "An internal server error occurred" });
});

// Launch server instance
server.listen(PORT, () => {
  console.log(`[SCAAS Server] Listening on http://localhost:${PORT}`);
});
