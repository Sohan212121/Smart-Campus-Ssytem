import { Router, Response } from "express";
import { authenticateJWT, AuthRequest } from "../middleware/auth";
import {
  getGamificationProfile,
  getCampusLeaderboard,
  getDepartmentRankings,
  getRewardStoreItems,
  redeemReward,
} from "../services/gamification.service";

export const gamificationRouter = Router();

/**
 * GET /api/v1/gamification/profile
 * Returns the authenticated student's gamification profile (XP, level, streak, badges, achievements).
 */
gamificationRouter.get(
  "/profile",
  authenticateJWT,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const profile = await getGamificationProfile(req.user.id);
      if (!profile) {
        return res.status(404).json({ error: "Gamification profile not found" });
      }

      res.status(200).json(profile);
    } catch (error) {
      console.error("Gamification profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * GET /api/v1/gamification/leaderboard
 * Returns campus-wide leaderboard sorted by XP (top 20 students).
 */
gamificationRouter.get(
  "/leaderboard",
  authenticateJWT,
  async (req: AuthRequest, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const leaderboard = await getCampusLeaderboard(limit);

      res.status(200).json(leaderboard);
    } catch (error) {
      console.error("Leaderboard error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * GET /api/v1/gamification/departments
 * Returns department competition rankings (avg XP per student).
 */
gamificationRouter.get(
  "/departments",
  authenticateJWT,
  async (req: AuthRequest, res: Response) => {
    try {
      const rankings = await getDepartmentRankings();
      res.status(200).json(rankings);
    } catch (error) {
      console.error("Department rankings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * GET /api/v1/gamification/rewards
 * Returns all available reward store items.
 */
gamificationRouter.get(
  "/rewards",
  authenticateJWT,
  async (req: AuthRequest, res: Response) => {
    try {
      const items = await getRewardStoreItems();
      res.status(200).json(items);
    } catch (error) {
      console.error("Reward store error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * POST /api/v1/gamification/redeem
 * Redeems a reward item using student's XP points.
 * Body: { itemId: string }
 */
gamificationRouter.post(
  "/redeem",
  authenticateJWT,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { itemId } = req.body;
      if (!itemId) {
        return res.status(400).json({ error: "itemId is required" });
      }

      const result = await redeemReward(req.user.id, itemId);
      res.status(200).json({
        message: `Successfully redeemed "${result.itemTitle}"!`,
        voucherCode: result.voucherCode,
        pointsSpent: result.pointsSpent,
      });
    } catch (error: any) {
      if (
        error.message === "Insufficient XP points" ||
        error.message === "This reward is out of stock"
      ) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === "Reward item not found" || error.message === "User not found") {
        return res.status(404).json({ error: error.message });
      }
      console.error("Redeem error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
