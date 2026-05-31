import { Response, Router } from "express";
import { authenticateJWT, requireRole, AuthRequest } from "../middleware/auth";
import { AiService } from "../services/ai.service";
import { z } from "zod";

export const aiRouter = Router();

const chatSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

const timetablePreferencesSchema = z.object({
  preferMorning: z.boolean(),
  preferredGap: z.number().int().min(0).max(180),
  studyBlockMins: z.number().int().min(15).max(300),
});

/**
 * POST /api/v1/ai/chat
 * Chatbot message handler
 */
aiRouter.post(
  "/chat",
  authenticateJWT,
  async (req: AuthRequest, res: Response) => {
    try {
      const data = chatSchema.parse(req.body);
      const userId = req.user!.id;
      const role = req.user!.role;

      const reply = await AiService.getChatbotResponse(userId, role, data.message);

      res.status(200).json({ reply });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("AI Chat error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * POST /api/v1/ai/assistant
 * General campus assistant questions (alias to chat)
 */
aiRouter.post(
  "/assistant",
  authenticateJWT,
  async (req: AuthRequest, res: Response) => {
    try {
      const data = chatSchema.parse(req.body);
      const userId = req.user!.id;
      const role = req.user!.role;

      const reply = await AiService.getChatbotResponse(userId, role, data.message);

      res.status(200).json({ reply });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("AI Assistant error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * GET /api/v1/ai/predict/attendance
 * Student attendance linear regression predictions
 */
aiRouter.get(
  "/predict/attendance",
  authenticateJWT,
  requireRole(["STUDENT"]),
  async (req: AuthRequest, res: Response) => {
    try {
      const predictions = await AiService.getAttendancePrediction(req.user!.id);
      res.status(200).json(predictions);
    } catch (error) {
      console.error("AI Attendance Prediction error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * GET /api/v1/ai/insights/academic
 * Student academic performance indicators and statistical variance
 */
aiRouter.get(
  "/insights/academic",
  authenticateJWT,
  requireRole(["STUDENT"]),
  async (req: AuthRequest, res: Response) => {
    try {
      const insights = await AiService.getAcademicInsights(req.user!.id);
      res.status(200).json(insights);
    } catch (error) {
      console.error("AI Academic Insights error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * GET /api/v1/ai/suggestions/dashboard
 * Role-based personalized priority suggestions
 */
aiRouter.get(
  "/suggestions/dashboard",
  authenticateJWT,
  async (req: AuthRequest, res: Response) => {
    try {
      const suggestions = await AiService.getDashboardSuggestions(
        req.user!.id,
        req.user!.role
      );
      res.status(200).json({ suggestions });
    } catch (error) {
      console.error("AI Dashboard Suggestions error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * GET /api/v1/ai/reminders
 * Student time-sensitive countdown reminders
 */
aiRouter.get(
  "/reminders",
  authenticateJWT,
  requireRole(["STUDENT"]),
  async (req: AuthRequest, res: Response) => {
    try {
      const reminders = await AiService.getSmartReminders(req.user!.id);
      res.status(200).json({ reminders });
    } catch (error) {
      console.error("AI Reminders error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * GET /api/v1/ai/risk-score
 * Student overall risk assessment indices
 */
aiRouter.get(
  "/risk-score",
  authenticateJWT,
  requireRole(["STUDENT", "TEACHER", "ADMIN"]),
  async (req: AuthRequest, res: Response) => {
    try {
      // In case of teachers or admins, they can pass a studentId query param, otherwise it assesses the current student
      let studentId = req.user!.id;
      if (
        (req.user!.role === "TEACHER" || req.user!.role === "ADMIN") &&
        typeof req.query.studentId === "string"
      ) {
        studentId = req.query.studentId;
      }

      const riskAssessment = await AiService.getStudentRiskScore(studentId);
      res.status(200).json(riskAssessment);
    } catch (error) {
      console.error("AI Risk Score error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * GET /api/v1/ai/recommendations/academic
 * Academic study habits improvement suggestions
 */
aiRouter.get(
  "/recommendations/academic",
  authenticateJWT,
  requireRole(["STUDENT"]),
  async (req: AuthRequest, res: Response) => {
    try {
      const recs = await AiService.getAcademicRecommendations(req.user!.id);
      res.status(200).json(recs);
    } catch (error) {
      console.error("AI Academic Recommendations error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * GET /api/v1/ai/recommendations/events
 * Match interests and departments against upcoming activities
 */
aiRouter.get(
  "/recommendations/events",
  authenticateJWT,
  requireRole(["STUDENT"]),
  async (req: AuthRequest, res: Response) => {
    try {
      const recs = await AiService.getEventRecommendations(req.user!.id);
      res.status(200).json({ recommendations: recs });
    } catch (error) {
      console.error("AI Event Recommendations error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * GET /api/v1/ai/timetable/optimize
 * Proposes optimal gap slots and revision periods
 */
aiRouter.get(
  "/timetable/optimize",
  authenticateJWT,
  requireRole(["STUDENT"]),
  async (req: AuthRequest, res: Response) => {
    try {
      const optimization = await AiService.getTimetableOptimization(req.user!.id);
      res.status(200).json(optimization);
    } catch (error) {
      console.error("AI Timetable Optimize error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * POST /api/v1/ai/timetable/preferences
 * Saves customized morning/evening study gap preferences
 */
aiRouter.post(
  "/timetable/preferences",
  authenticateJWT,
  requireRole(["STUDENT"]),
  async (req: AuthRequest, res: Response) => {
    try {
      const data = timetablePreferencesSchema.parse(req.body);
      const pref = await AiService.saveTimetablePreferences(req.user!.id, data);
      res.status(200).json({ message: "Preferences saved successfully", preferences: pref });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("AI Timetable Preference error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
