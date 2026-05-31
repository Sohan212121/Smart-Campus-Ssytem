import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// XP thresholds for each level (level index = level number)
const LEVEL_THRESHOLDS = [0, 0, 100, 250, 500, 850, 1300, 1900, 2600, 3500, 5000];

/**
 * Calculates the player level based on total XP.
 */
function calculateLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i;
  }
  return 1;
}

/**
 * Returns the XP needed for the next level.
 */
function xpForNextLevel(currentLevel: number): number {
  if (currentLevel + 1 < LEVEL_THRESHOLDS.length) {
    return LEVEL_THRESHOLDS[currentLevel + 1];
  }
  return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 1000; // Beyond max
}

/**
 * Awards XP to a student after a successful attendance check-in.
 * - +15 XP base for any check-in
 * - +5 bonus XP if status is PRESENT (not LATE)
 * - Increments streak, updates longestStreak
 * - Evaluates attendance-related badges and achievements
 */
export async function rewardCheckIn(
  studentId: string,
  attendanceStatus: "PRESENT" | "LATE"
): Promise<{ xpAwarded: number; newBadges: string[]; newAchievements: string[] }> {
  let xpAwarded = 15;
  if (attendanceStatus === "PRESENT") {
    xpAwarded += 5; // Punctuality bonus
  }

  const newBadges: string[] = [];
  const newAchievements: string[] = [];

  // 1. Fetch current user stats
  const user = await prisma.user.findUnique({
    where: { id: studentId },
    select: { xp: true, level: true, streak: true, longestStreak: true },
  });

  if (!user) return { xpAwarded: 0, newBadges: [], newAchievements: [] };

  const newStreak = user.streak + 1;
  const newLongestStreak = Math.max(newStreak, user.longestStreak);
  const newXp = user.xp + xpAwarded;
  const newLevel = calculateLevel(newXp);

  // 2. Update user stats
  await prisma.user.update({
    where: { id: studentId },
    data: {
      xp: newXp,
      level: newLevel,
      streak: newStreak,
      longestStreak: newLongestStreak,
    },
  });

  // 3. Evaluate badges
  // "Perfect Week" badge: streak reaches 5
  if (newStreak >= 5) {
    const badge = await prisma.badge.findUnique({ where: { name: "Perfect Week" } });
    if (badge) {
      const existing = await prisma.userBadge.findUnique({
        where: { userId_badgeId: { userId: studentId, badgeId: badge.id } },
      });
      if (!existing) {
        await prisma.userBadge.create({
          data: { userId: studentId, badgeId: badge.id },
        });
        // Award badge XP bonus
        await prisma.user.update({
          where: { id: studentId },
          data: { xp: { increment: badge.xpReward } },
        });
        xpAwarded += badge.xpReward;
        newBadges.push(badge.name);
      }
    }
  }

  // "Academic Loyalist" badge: streak reaches 10
  if (newStreak >= 10) {
    const badge = await prisma.badge.findUnique({ where: { name: "Academic Loyalist" } });
    if (badge) {
      const existing = await prisma.userBadge.findUnique({
        where: { userId_badgeId: { userId: studentId, badgeId: badge.id } },
      });
      if (!existing) {
        await prisma.userBadge.create({
          data: { userId: studentId, badgeId: badge.id },
        });
        await prisma.user.update({
          where: { id: studentId },
          data: { xp: { increment: badge.xpReward } },
        });
        xpAwarded += badge.xpReward;
        newBadges.push(badge.name);
      }
    }
  }

  // 4. Evaluate achievements
  // "Streak Pioneer" — streak-based
  const streakAch = await prisma.achievement.findUnique({ where: { name: "Streak Pioneer" } });
  if (streakAch) {
    const userAch = await prisma.userAchievement.upsert({
      where: { userId_achievementId: { userId: studentId, achievementId: streakAch.id } },
      update: {
        progress: newStreak,
        isUnlocked: newStreak >= streakAch.targetValue,
        unlockedAt: newStreak >= streakAch.targetValue ? new Date() : undefined,
      },
      create: {
        userId: studentId,
        achievementId: streakAch.id,
        progress: newStreak,
        isUnlocked: newStreak >= streakAch.targetValue,
        unlockedAt: newStreak >= streakAch.targetValue ? new Date() : undefined,
      },
    });
    if (userAch.isUnlocked && newStreak === streakAch.targetValue) {
      newAchievements.push(streakAch.name);
      await prisma.user.update({
        where: { id: studentId },
        data: { xp: { increment: streakAch.pointsReward } },
      });
      xpAwarded += streakAch.pointsReward;
    }
  }

  // "Lecture Loyalist" — total classes attended
  const loyalAch = await prisma.achievement.findUnique({ where: { name: "Lecture Loyalist" } });
  if (loyalAch) {
    const totalAttended = await prisma.attendanceRecord.count({
      where: { studentId, status: { in: ["PRESENT", "LATE"] } },
    });
    const userAch = await prisma.userAchievement.upsert({
      where: { userId_achievementId: { userId: studentId, achievementId: loyalAch.id } },
      update: {
        progress: totalAttended,
        isUnlocked: totalAttended >= loyalAch.targetValue,
        unlockedAt: totalAttended >= loyalAch.targetValue ? new Date() : undefined,
      },
      create: {
        userId: studentId,
        achievementId: loyalAch.id,
        progress: totalAttended,
        isUnlocked: totalAttended >= loyalAch.targetValue,
        unlockedAt: totalAttended >= loyalAch.targetValue ? new Date() : undefined,
      },
    });
    if (userAch.isUnlocked && totalAttended === loyalAch.targetValue) {
      newAchievements.push(loyalAch.name);
      await prisma.user.update({
        where: { id: studentId },
        data: { xp: { increment: loyalAch.pointsReward } },
      });
      xpAwarded += loyalAch.pointsReward;
    }
  }

  return { xpAwarded, newBadges, newAchievements };
}

/**
 * Resets streak to 0 when a student is marked ABSENT.
 */
export async function resetStreak(studentId: string): Promise<void> {
  await prisma.user.update({
    where: { id: studentId },
    data: { streak: 0 },
  });
}

/**
 * Awards XP for event participation.
 */
export async function rewardEventParticipation(studentId: string): Promise<number> {
  const xpAwarded = 50;

  const user = await prisma.user.findUnique({
    where: { id: studentId },
    select: { xp: true },
  });
  if (!user) return 0;

  const newXp = user.xp + xpAwarded;
  await prisma.user.update({
    where: { id: studentId },
    data: {
      xp: newXp,
      level: calculateLevel(newXp),
    },
  });

  return xpAwarded;
}

/**
 * Fetches the full gamification profile for a student.
 */
export async function getGamificationProfile(studentId: string) {
  const user = await prisma.user.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      xp: true,
      level: true,
      streak: true,
      longestStreak: true,
      badgesEarned: {
        include: { badge: true },
        orderBy: { earnedAt: "desc" },
      },
      achievementsProgress: {
        include: { achievement: true },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!user) return null;

  const nextLevelXp = xpForNextLevel(user.level);
  const currentLevelXp = LEVEL_THRESHOLDS[user.level] || 0;

  return {
    ...user,
    nextLevelXp,
    currentLevelXp,
    progressPercent: Math.min(
      100,
      Math.round(((user.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100)
    ),
  };
}

/**
 * Returns the campus-wide leaderboard (top students by XP).
 */
export async function getCampusLeaderboard(limit: number = 20) {
  return prisma.user.findMany({
    where: { role: "STUDENT" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      xp: true,
      level: true,
      streak: true,
      departmentId: true,
      department: { select: { name: true, code: true } },
      _count: { select: { badgesEarned: true } },
    },
    orderBy: { xp: "desc" },
    take: limit,
  });
}

/**
 * Returns department competition rankings (average XP per student per department).
 */
export async function getDepartmentRankings() {
  const departments = await prisma.department.findMany({
    include: {
      users: {
        where: { role: "STUDENT" },
        select: { xp: true, level: true },
      },
    },
  });

  return departments
    .map((dept) => {
      const studentCount = dept.users.length;
      const totalXp = dept.users.reduce((sum, u) => sum + u.xp, 0);
      const avgXp = studentCount > 0 ? Math.round(totalXp / studentCount) : 0;
      const avgLevel =
        studentCount > 0
          ? Math.round(
              (dept.users.reduce((sum, u) => sum + u.level, 0) / studentCount) * 10
            ) / 10
          : 0;
      return {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        studentCount,
        totalXp,
        avgXp,
        avgLevel,
      };
    })
    .sort((a, b) => b.avgXp - a.avgXp);
}

/**
 * Returns all available reward store items.
 */
export async function getRewardStoreItems() {
  return prisma.rewardStoreItem.findMany({
    where: { quantity: { gt: 0 } },
    orderBy: { costPoints: "asc" },
  });
}

/**
 * Redeems a reward for a student (deducts XP, creates voucher).
 */
export async function redeemReward(studentId: string, itemId: string) {
  const user = await prisma.user.findUnique({
    where: { id: studentId },
    select: { xp: true },
  });
  if (!user) throw new Error("User not found");

  const item = await prisma.rewardStoreItem.findUnique({
    where: { id: itemId },
  });
  if (!item) throw new Error("Reward item not found");
  if (item.quantity <= 0) throw new Error("This reward is out of stock");
  if (user.xp < item.costPoints) throw new Error("Insufficient XP points");

  // Generate a voucher code
  const voucherCode =
    "SCAAS-" +
    Math.random().toString(36).substring(2, 8).toUpperCase() +
    "-" +
    Date.now().toString(36).toUpperCase();

  // Transaction: deduct XP, decrement stock, create redemption record
  const [, , redemption] = await prisma.$transaction([
    prisma.user.update({
      where: { id: studentId },
      data: { xp: { decrement: item.costPoints } },
    }),
    prisma.rewardStoreItem.update({
      where: { id: itemId },
      data: { quantity: { decrement: 1 } },
    }),
    prisma.rewardRedemption.create({
      data: {
        userId: studentId,
        itemId,
        voucherCode,
        status: "COMPLETED",
      },
    }),
  ]);

  return { voucherCode, itemTitle: item.title, pointsSpent: item.costPoints, redemption };
}
