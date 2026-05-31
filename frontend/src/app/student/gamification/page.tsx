"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import ThemeToggle from "@/components/ThemeToggle";
import {
  ArrowLeft,
  Award,
  Trophy,
  Flame,
  Zap,
  Gift,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Calendar,
  Building2,
  ShoppingBag,
  Ticket,
  ChevronRight,
  TrendingUp,
  Cpu,
  Target
} from "lucide-react";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
}

interface UserBadge {
  earnedAt: string;
  badge: Badge;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  targetValue: number;
  pointsReward: number;
  category: string;
}

interface UserAchievement {
  progress: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
  achievement: Achievement;
}

interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  nextLevelXp: number;
  currentLevelXp: number;
  progressPercent: number;
  badgesEarned: UserBadge[];
  achievementsProgress: UserAchievement[];
}

interface LeaderboardUser {
  id: string;
  firstName: string;
  lastName: string;
  xp: number;
  level: number;
  streak: number;
  department: { name: string; code: string } | null;
  _count: { badgesEarned: number };
}

interface DepartmentRanking {
  id: string;
  name: string;
  code: string;
  studentCount: number;
  totalXp: number;
  avgXp: number;
  avgLevel: number;
}

interface RewardItem {
  id: string;
  title: string;
  description: string;
  costPoints: number;
  quantity: number;
  category: string;
}

export default function GamificationHub() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"achievements" | "leaderboards" | "rewards">("achievements");
  const [leaderboardTab, setLeaderboardTab] = useState<"campus" | "departments">("campus");

  // State arrays loaded from API
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [deptRankings, setDeptRankings] = useState<DepartmentRanking[]>([]);
  const [rewards, setRewards] = useState<RewardItem[]>([]);

  // Loading & error flags
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Redeem state
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<{
    voucherCode: string;
    itemTitle: string;
    pointsSpent: number;
  } | null>(null);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const isDemo = user?.token ? user.token.startsWith("demo-jwt-token-") : true;

  // Fetch gamification profile, leaderboards, rewards
  const loadData = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    setLoading(true);
    setError("");

    // Offline demo fallbacks
    if (isDemo) {
      setTimeout(() => {
        setProfile({
          id: user.id || "demo-student-id",
          firstName: user.firstName || "Sohan",
          lastName: user.lastName || "kumar kj",
          xp: 680,
          level: 5,
          streak: 4,
          longestStreak: 8,
          currentLevelXp: 500,
          nextLevelXp: 850,
          progressPercent: 51,
          badgesEarned: [
            {
              earnedAt: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
              badge: {
                id: "badge-1",
                name: "Perfect Week",
                description: "Maintained a streak of 5 consecutive lecture attendances.",
                icon: "⚡",
                xpReward: 50,
              },
            },
            {
              earnedAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
              badge: {
                id: "badge-2",
                name: "Early Bird",
                description: "Logged attendance within the first 2 minutes of class.",
                icon: "🌅",
                xpReward: 30,
              },
            },
          ],
          achievementsProgress: [
            {
              progress: 4,
              isUnlocked: false,
              unlockedAt: null,
              achievement: {
                id: "ach-1",
                name: "Streak Pioneer",
                description: "Achieve a consecutive attendance streak of 5 classes.",
                targetValue: 5,
                pointsReward: 100,
                category: "STREAK",
              },
            },
            {
              progress: 23,
              isUnlocked: true,
              unlockedAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
              achievement: {
                id: "ach-2",
                name: "Lecture Loyalist",
                description: "Attend a total of 20 lectures across the semester.",
                targetValue: 20,
                pointsReward: 150,
                category: "ATTENDANCE",
              },
            },
            {
              progress: 2,
              isUnlocked: false,
              unlockedAt: null,
              achievement: {
                id: "ach-3",
                name: "Campus Socialite",
                description: "Register and check in at 3 events or club workshops.",
                targetValue: 3,
                pointsReward: 200,
                category: "EVENTS",
              },
            },
          ],
        });

        setLeaderboard([
          { id: "1", firstName: "Emily", lastName: "Watson", xp: 1250, level: 6, streak: 12, department: { name: "Computer Science", code: "CSE" }, _count: { badgesEarned: 3 } },
          { id: "2", firstName: "Sohan", lastName: "kumar kj", xp: 680, level: 5, streak: 4, department: { name: "Computer Science", code: "CSE" }, _count: { badgesEarned: 2 } },
          { id: "3", firstName: "Karan", lastName: "Sharma", xp: 590, level: 4, streak: 7, department: { name: "Electrical Engineering", code: "EE" }, _count: { badgesEarned: 1 } },
          { id: "4", firstName: "Sneha", lastName: "Patel", xp: 480, level: 3, streak: 2, department: { name: "Physics", code: "PHYS" }, _count: { badgesEarned: 0 } },
        ]);

        setDeptRankings([
          { id: "dept-1", name: "Computer Science & Engineering", code: "CSE", studentCount: 42, totalXp: 28400, avgXp: 676, avgLevel: 4.8 },
          { id: "dept-2", name: "Electrical Engineering", code: "EE", studentCount: 35, totalXp: 18200, avgXp: 520, avgLevel: 4.1 },
          { id: "dept-3", name: "Physics Department", code: "PHYS", studentCount: 20, totalXp: 9100, avgXp: 455, avgLevel: 3.6 },
        ]);

        setRewards([
          { id: "rew-1", title: "Free Cafeteria Meal Voucher", description: "Get a free deluxe lunch at the main campus cafeteria.", costPoints: 200, quantity: 15, category: "FOOD" },
          { id: "rew-2", title: "Campus Premium Hoodie", description: "Vibrant high-quality smart campus branded winter hoodie.", costPoints: 800, quantity: 5, category: "MERCH" },
          { id: "rew-3", title: "Library Late-Fee Waiver", description: "Waive off up to Rs. 200 of outstanding library delays.", costPoints: 150, quantity: 50, category: "ACADEMICS" },
          { id: "rew-4", title: "Front Row Seminar Pass", description: "Guaranteed front-row seating at the next Google/Meta seminar.", costPoints: 300, quantity: 10, category: "EVENTS" },
        ]);

        setLoading(false);
      }, 500);
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const headers = { Authorization: `Bearer ${user.token}` };

      const [profRes, leadRes, deptRes, rewRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/gamification/profile`, { headers }),
        fetch(`${API_URL}/api/v1/gamification/leaderboard`, { headers }),
        fetch(`${API_URL}/api/v1/gamification/departments`, { headers }),
        fetch(`${API_URL}/api/v1/gamification/rewards`, { headers }),
      ]);

      if (profRes.ok) setProfile(await profRes.json());
      if (leadRes.ok) setLeaderboard(await leadRes.json());
      if (deptRes.ok) setDeptRankings(await deptRes.json());
      if (rewRes.ok) setRewards(await rewRes.json());
    } catch (err) {
      console.error("Failed to load gamification data:", err);
      setError("Failed to load gamification hub. Please verify backend connectivity.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, isDemo]);

  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      router.push("/login");
      return;
    }
    if (isMounted) {
      loadData();
    }
  }, [isMounted, isAuthenticated, user, loadData, router]);

  const handleRedeem = async (itemId: string) => {
    if (!profile) return;
    setRedeemingId(itemId);
    
    // Offline simulation
    if (isDemo) {
      setTimeout(() => {
        const item = rewards.find(r => r.id === itemId);
        if (!item) return;
        if (profile.xp < item.costPoints) {
          alert("Insufficient XP points!");
          setRedeemingId(null);
          return;
        }
        
        setRedeemSuccess({
          voucherCode: "SCAAS-" + Math.random().toString(36).substring(2, 8).toUpperCase() + "-" + Date.now().toString(36).toUpperCase(),
          itemTitle: item.title,
          pointsSpent: item.costPoints,
        });

        // Deduct points locally
        setProfile(prev => prev ? { ...prev, xp: prev.xp - item.costPoints } : null);
        setRewards(prev => prev.map(r => r.id === itemId ? { ...r, quantity: r.quantity - 1 } : r));
        setRedeemingId(null);
      }, 800);
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/v1/gamification/redeem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ itemId }),
      });

      const data = await res.json();
      if (res.ok) {
        setRedeemSuccess({
          voucherCode: data.voucherCode,
          itemTitle: data.message.replace("Successfully redeemed \"", "").replace("\"!", ""),
          pointsSpent: data.pointsSpent,
        });
        // Reload data to reflect new XP and item count
        loadData();
      } else {
        alert(data.error || "Failed to redeem reward.");
      }
    } catch (err) {
      console.error("Redemption error:", err);
      alert("Failed to contact redemption servers.");
    } finally {
      setRedeemingId(null);
    }
  };

  // Safe check
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950 min-h-screen">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 min-h-screen bg-slate-950">
        <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin flex items-center justify-center">
          <Trophy className="h-6 w-6 text-primary animate-bounce" />
        </div>
        <h2 className="text-sm font-bold font-mono tracking-widest text-white uppercase">Syncing Gamification Core</h2>
        <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Syncing XP ledger, badges unlocked, and reward items...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full relative">
      {/* Background gradients */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.06)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_60%)] pointer-events-none" />

      {/* Sticky Header & Nav Wrapper */}
      <div className="sticky top-0 z-30 -mx-4 md:-mx-8 px-4 md:px-8 py-4 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 space-y-4">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => router.push("/student/dashboard")}
              className="glass-panel p-2.5 text-gray-400 hover:text-white transition-all hover:scale-105 border border-white/5 bg-white/2 cursor-pointer btn-elastic"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-wider text-white font-mono flex items-center gap-2">
                Gamification Center <Trophy className="h-6 w-6 text-yellow-500 animate-pulse" />
              </h1>
              <p className="text-[10px] text-gray-400 font-mono font-bold tracking-widest uppercase">
                ATTENDANCE REWARDS ENGINE • LIVE METRICS
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => router.push("/student/events")}
              className="glow-border bg-slate-900 px-5 py-2.5 text-[10px] font-mono font-extrabold uppercase text-primary-glow border border-primary/20 shadow-md transition-all hover:scale-[1.02] cursor-pointer btn-elastic"
            >
              Explore Events
            </button>
          </div>
        </div>

        {/* Page Navigation Tabs */}
        <div className="flex flex-wrap gap-2.5 relative">
          <button
            onClick={() => router.push("/student/dashboard")}
            className="bg-white/2 border border-white/5 text-gray-400 hover:text-white hover:bg-white/5 flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-mono font-extrabold uppercase transition-all hover:scale-[1.02] cursor-pointer"
          >
            <TrendingUp className="h-4 w-4" /> Analytics Board
          </button>
          <button
            onClick={() => router.push("/student/events")}
            className="bg-white/2 border border-white/5 text-gray-400 hover:text-white hover:bg-white/5 flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-mono font-extrabold uppercase transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Calendar className="h-4 w-4" /> Events Hub
          </button>
          <button
            onClick={() => router.push("/student/gamification")}
            className="bg-primary border border-primary/30 text-white flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-mono font-extrabold uppercase shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Award className="h-4 w-4 text-yellow-500 animate-pulse" /> Gamification Core
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="font-mono font-bold uppercase tracking-wider">{error}</span>
        </div>
      )}

      {/* Main Student Profile & Stats Section */}
      {profile && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 z-10 relative">
          {/* XP & Level Tracker */}
          <div className="perspective-card glass-panel p-6 bg-gradient-to-br from-primary/10 to-slate-900/60 border-primary/20 space-y-5 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent blur-md pointer-events-none" />
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-primary-glow">Rank Credentials</span>
                <h2 className="text-base font-extrabold text-white mt-1.5 tracking-wide">{profile.firstName} {profile.lastName}</h2>
              </div>
              <div className="bg-primary/20 border border-primary/45 text-primary-glow font-black text-xs font-mono h-11 w-11 rounded-xl flex items-center justify-center tracking-wider uppercase animate-pulse shadow-inner">
                LVL {profile.level}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-[11px] font-mono font-bold tracking-wider uppercase">
                <span className="text-gray-400">XP Progress</span>
                <span className="text-white text-secondary-glow">{profile.xp} / {profile.nextLevelXp} XP</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-3 border border-white/5 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-500 shadow-md shadow-primary/30"
                  style={{ width: `${profile.progressPercent}%` }}
                />
              </div>
              <p className="text-[9px] text-gray-500 font-mono uppercase tracking-widest text-right">
                {profile.nextLevelXp - profile.xp} XP needed to Level {profile.level + 1}
              </p>
            </div>
          </div>

          {/* Streak Indicator */}
          <div className="perspective-card glass-panel p-6 bg-gradient-to-br from-orange-500/10 to-slate-900/60 border-orange-500/20 flex flex-col justify-between space-y-5 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-500/5 to-transparent blur-md pointer-events-none" />
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-orange-400">Attendance Streak</span>
                <div className="flex items-center gap-2 mt-1.5">
                  <h3 className="text-3xl font-black text-white font-sans">{profile.streak}</h3>
                  <span className="text-[10px] font-mono font-extrabold uppercase text-gray-500 tracking-wider">CLASSES</span>
                </div>
              </div>
              <div className="bg-orange-500/20 border border-orange-500/30 p-2.5 rounded-xl animate-pulse relative">
                <Flame className="h-7 w-7 text-orange-500" />
                <div className="absolute -inset-0.5 rounded-xl bg-orange-500 opacity-20 blur-sm z-[-1]" />
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase border-t border-white/5 pt-3 tracking-wider">
              <span className="text-gray-400">Max Peak: <strong className="text-white">{profile.longestStreak}</strong></span>
              <span className="flex items-center gap-1 text-orange-400">
                <Zap className="h-3.5 w-3.5 text-orange-400" /> +20% BONUS ACTIVE
              </span>
            </div>
          </div>

          {/* Badges Earned */}
          <div className="perspective-card glass-panel p-6 bg-gradient-to-br from-accent/10 to-slate-900/60 border-accent/20 flex flex-col justify-between space-y-4 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-accent/5 to-transparent blur-md pointer-events-none" />
            <div>
              <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-accent-glow block mb-2.5">Streak Badges</span>
              {profile.badgesEarned.length > 0 ? (
                <div className="flex flex-wrap gap-2.5 mt-1.5">
                  {profile.badgesEarned.map((ub, idx) => (
                    <div
                      key={idx}
                      className="group relative bg-slate-950/80 border border-accent/30 rounded-xl px-3 py-2 flex items-center gap-2 hover:bg-slate-950 transition-all hover:scale-[1.03] shadow-md cursor-help"
                      title={ub.badge.description}
                    >
                      <span className="text-xl">{ub.badge.icon}</span>
                      <div>
                        <h4 className="text-[10px] font-black text-white uppercase tracking-wider">{ub.badge.name}</h4>
                        <span className="text-[9px] text-accent font-mono font-bold">+{ub.badge.xpReward} XP</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-[11px] text-gray-500 font-mono uppercase tracking-wide">No badges unlocked yet.</p>
                  <p className="text-[9px] text-gray-600 mt-1 uppercase font-mono tracking-widest">Attend 5 classes in a row to unlock!</p>
                </div>
              )}
            </div>
            <div className="text-[10px] text-gray-500 font-mono font-bold uppercase border-t border-white/5 pt-3 tracking-wider">
              Total Badges: <strong className="text-white">{profile.badgesEarned.length}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-white/5 space-x-6 z-10 relative">
        <button
          onClick={() => setActiveTab("achievements")}
          className={`pb-3 text-xs font-mono font-extrabold uppercase tracking-widest transition-all cursor-pointer relative ${
            activeTab === "achievements"
              ? "text-primary-glow font-black"
              : "text-gray-500 hover:text-white"
          }`}
        >
          Achievements
          {activeTab === "achievements" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("leaderboards")}
          className={`pb-3 text-xs font-mono font-extrabold uppercase tracking-widest transition-all cursor-pointer relative ${
            activeTab === "leaderboards"
              ? "text-primary-glow font-black"
              : "text-gray-500 hover:text-white"
          }`}
        >
          Leaderboards
          {activeTab === "leaderboards" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("rewards")}
          className={`pb-3 text-xs font-mono font-extrabold uppercase tracking-widest transition-all cursor-pointer relative ${
            activeTab === "rewards"
              ? "text-primary-glow font-black"
              : "text-gray-500 hover:text-white"
          }`}
        >
          Reward Store
          {activeTab === "rewards" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full" />
          )}
        </button>
      </div>

      {/* Achievements Tab Content */}
      {activeTab === "achievements" && profile && (
        <div className="space-y-4 animate-fade-in z-10 relative w-full">
          <div className="flex justify-between items-center relative">
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Award className="h-4.5 w-4.5 text-secondary animate-pulse" /> Goals & Milestones
            </h3>
            <span className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-wider">
              COMPLETED: {profile.achievementsProgress.filter((a) => a.isUnlocked).length} / {profile.achievementsProgress.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.achievementsProgress.map((ua, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border transition-all panel-interactive ${
                  ua.isUnlocked
                    ? "bg-slate-900/60 border-accent/35 shadow-[inset_0_0_12px_rgba(16,185,129,0.02)]"
                    : "bg-white/2 border-white/5"
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white tracking-wide uppercase">{ua.achievement.name}</h4>
                      {ua.isUnlocked && (
                        <span className="bg-accent/15 border border-accent/25 text-accent text-[8px] font-mono font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Unlocked
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-medium mt-1">{ua.achievement.description}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl shrink-0 font-mono font-extrabold text-[10px] border tracking-wider uppercase ${
                    ua.isUnlocked ? "bg-accent/15 text-accent border-accent/25" : "bg-white/5 text-gray-400 border-white/10"
                  }`}>
                    +{ua.achievement.pointsReward} XP
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="flex justify-between text-[10px] font-mono font-bold uppercase text-gray-500">
                    <span>Progress: {Math.min(ua.progress, ua.achievement.targetValue)} / {ua.achievement.targetValue}</span>
                    <span>{Math.round((Math.min(ua.progress, ua.achievement.targetValue) / ua.achievement.targetValue) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 border border-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        ua.isUnlocked ? "bg-accent shadow-md shadow-accent/40" : "bg-primary shadow-md shadow-primary/45"
                      }`}
                      style={{ width: `${(Math.min(ua.progress, ua.achievement.targetValue) / ua.achievement.targetValue) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboards Tab Content */}
      {activeTab === "leaderboards" && (
        <div className="space-y-5 animate-fade-in z-10 relative w-full">
          {/* Sub-tabs */}
          <div className="flex bg-white/2 p-1.5 rounded-xl w-fit border border-white/5 font-mono">
            <button
              onClick={() => setLeaderboardTab("campus")}
              className={`px-4 py-2 text-[10px] font-extrabold uppercase rounded-lg transition-all cursor-pointer ${
                leaderboardTab === "campus"
                  ? "bg-primary text-white shadow-md shadow-primary/30"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              Top Students
            </button>
            <button
              onClick={() => setLeaderboardTab("departments")}
              className={`px-4 py-2 text-[10px] font-extrabold uppercase rounded-lg transition-all cursor-pointer ${
                leaderboardTab === "departments"
                  ? "bg-primary text-white shadow-md shadow-primary/30"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              Department Battle
            </button>
          </div>

          {leaderboardTab === "campus" ? (
            <div className="glass-panel overflow-hidden border-white/5 shadow-2xl">
              <div className="p-4 border-b border-white/5 bg-white/2">
                <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <Trophy className="h-4.5 w-4.5 text-yellow-500" /> Campus Rankings
                </h3>
              </div>
              <div className="divide-y divide-white/5">
                {leaderboard.map((student, idx) => {
                  const isCurrentUser = student.id === user?.id || (isDemo && student.firstName === "Sohan");
                  return (
                    <div
                      key={student.id}
                      className={`p-4 flex items-center justify-between gap-4 transition-all hover:bg-white/2 ${
                        isCurrentUser ? "bg-primary/5 border-l-4 border-primary" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`w-8 font-mono font-black text-xs text-center ${
                          idx === 0 
                            ? "text-yellow-400 text-shadow-glow" 
                            : idx === 1 
                            ? "text-slate-400" 
                            : idx === 2 
                            ? "text-amber-500" 
                            : "text-gray-500"
                        }`}>
                          #{idx + 1}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center gap-2">
                            {student.firstName} {student.lastName}
                            {isCurrentUser && (
                              <span className="bg-primary/10 border border-primary/20 text-primary-glow text-[9px] font-mono font-bold px-2 py-0.5 rounded">
                                YOU
                              </span>
                            )}
                          </h4>
                          <span className="text-[10px] text-gray-500 font-mono font-semibold">
                            {student.department?.code || "GEN"} • Lvl {student.level} • {student._count.badgesEarned} Badges
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-5">
                        {student.streak >= 3 && (
                          <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/25 px-2.5 py-1 rounded-full text-orange-400 text-[10px] font-mono font-extrabold uppercase">
                            <Flame className="h-3 w-3 animate-pulse" /> {student.streak} Streak
                          </div>
                        )}
                        <span className="text-xs font-mono font-black text-white">{student.xp} XP</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Sleek 3D department Podium Layout */}
              <div className="glass-panel p-6 border-white/5 bg-white/2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-primary/10 to-transparent blur-xl pointer-events-none" />
                <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-gray-500 block mb-6">Department Power Standings Mockup</span>
                
                <div className="flex items-end justify-center gap-6 md:gap-12 h-44 border-b border-white/10 pb-2 relative">
                  {deptRankings.map((dept, idx) => {
                    const heightClass = idx === 0 ? "h-32 bg-gradient-to-t from-yellow-500/40 to-yellow-500/10 border-yellow-500/30" : idx === 1 ? "h-24 bg-gradient-to-t from-slate-500/40 to-slate-500/10 border-slate-500/30" : "h-16 bg-gradient-to-t from-amber-600/40 to-amber-600/10 border-amber-600/30";
                    return (
                      <div key={dept.id} className="flex flex-col items-center flex-1 max-w-[150px] relative">
                        <span className="text-xs font-mono font-black text-white mb-2">{dept.code}</span>
                        <div className={`w-full rounded-t-xl border border-b-0 flex items-center justify-center text-sm font-mono font-black text-white relative ${heightClass}`}>
                          #{idx + 1}
                        </div>
                        <span className="text-[9px] font-mono font-bold text-accent mt-2">{dept.avgXp} XP Avg</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Standard rankings breakdown */}
              <div className="glass-panel overflow-hidden border-white/5 shadow-2xl">
                <div className="p-4 border-b border-white/5 bg-white/2">
                  <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <Building2 className="h-4.5 w-4.5 text-primary" /> Tactical Standings Logs
                  </h3>
                </div>
                <div className="divide-y divide-white/5">
                  {deptRankings.map((dept, idx) => (
                    <div key={dept.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <span className={`w-6 font-mono font-black text-xs text-center ${
                          idx === 0 ? "text-yellow-400 text-shadow-glow" : "text-gray-500"
                        }`}>
                          #{idx + 1}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                            {dept.name}
                          </h4>
                          <p className="text-[10px] text-gray-500 font-mono font-bold mt-0.5 uppercase tracking-wider">
                            Enrolled: {dept.studentCount} Nodes • Average Cycle: Level {dept.avgLevel}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-8 justify-between border-t md:border-t-0 border-white/5 pt-2.5 md:pt-0 font-mono text-xs">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-gray-500 tracking-widest font-mono">Combined XP Matrix</span>
                          <p className="font-bold text-gray-300 mt-0.5">{dept.totalXp} XP</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] uppercase font-bold text-gray-500 tracking-widest font-mono">Node average XP</span>
                          <p className="font-extrabold text-accent mt-0.5">{dept.avgXp} XP</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reward Store Tab Content */}
      {activeTab === "rewards" && profile && (
        <div className="space-y-5 animate-fade-in z-10 relative w-full">
          <div className="flex justify-between items-center relative">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <ShoppingBag className="h-4.5 w-4.5 text-secondary animate-pulse" /> Claim Incentives
              </h3>
              <p className="text-[10px] text-gray-400 font-mono font-bold tracking-widest uppercase mt-0.5">EXCHANGE POINTS FOR ACADEMIC WAIVERS & MERCH</p>
            </div>
            <div className="bg-white/2 border border-white/5 px-4.5 py-2.5 rounded-xl flex items-center gap-2 font-mono shadow-md">
              <span className="text-[10px] text-gray-500 uppercase font-bold">Ledger Wallet:</span>
              <strong className="text-xs text-yellow-500">{profile.xp} XP Points</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewards.map((item) => {
              const isRedeeming = redeemingId === item.id;
              const hasEnoughPoints = profile.xp >= item.costPoints;
              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl border border-white/5 bg-white/2 flex flex-col justify-between gap-4 panel-interactive"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="bg-primary/10 border border-primary/25 text-primary-glow text-[8px] font-mono font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {item.category}
                        </span>
                        <h4 className="text-xs font-bold text-white mt-2 leading-snug tracking-wide uppercase">{item.title}</h4>
                      </div>
                      <span className="text-xs font-mono font-black text-yellow-500 shrink-0 uppercase tracking-wider">
                        {item.costPoints} XP
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-medium mt-1">{item.description}</p>
                  </div>

                  <div className="flex justify-between items-center border-t border-white/5 pt-4">
                    <span className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-wider">
                      Stock: <strong className="text-gray-300">{item.quantity} nodes</strong>
                    </span>
                    {isRedeeming ? (
                      <button disabled className="bg-primary/10 border border-primary/20 text-primary-glow text-[10px] font-mono font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-not-allowed">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> Syncing...
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRedeem(item.id)}
                        disabled={!hasEnoughPoints || item.quantity <= 0}
                        className={`text-[10px] font-mono font-extrabold uppercase tracking-widest px-4 py-2 rounded-xl border transition-all cursor-pointer ${
                          hasEnoughPoints && item.quantity > 0
                            ? "bg-primary hover:bg-primary/95 border-primary text-white hover:scale-[1.02] active:scale-[0.98]"
                            : "bg-white/5 border-white/5 text-gray-600 cursor-not-allowed"
                        }`}
                      >
                        {item.quantity <= 0 ? "Out of Stock" : "Redeem Ticket"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Redeem Success Modal */}
      {redeemSuccess && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-panel p-6 max-w-md w-full border-accent/25 bg-slate-900 text-center space-y-6 shadow-2xl relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col items-center space-y-3">
              <div className="bg-accent/20 border border-accent/40 p-4 rounded-full shadow-lg shadow-accent/15 animate-float">
                <Ticket className="h-9 w-9 text-accent animate-pulse" />
              </div>
              <h3 className="text-base font-black uppercase tracking-wider text-white font-mono">Incentive Redeemed</h3>
              <p className="text-xs text-gray-400 font-medium leading-relaxed">
                You successfully redeemed claim voucher: <br />
                <strong className="text-white mt-1 block">{redeemSuccess.itemTitle}</strong>
              </p>
            </div>

            {/* Voucher Card Container */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-white/5 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-accent/5 to-transparent blur-md" />
              <div className="flex justify-between text-[8px] uppercase tracking-widest text-gray-500 font-mono font-bold">
                <span>SYSTEM DISPATCH</span>
                <span className="text-yellow-500">PAID: {redeemSuccess.pointsSpent} XP</span>
              </div>
              
              <div className="space-y-1.5">
                <span className="text-[9px] uppercase tracking-widest font-mono font-bold text-gray-500 block">Voucher Pass Code:</span>
                <p className="text-base font-extrabold text-white font-mono tracking-widest bg-white/5 py-2.5 px-4 rounded-xl border border-white/10 select-all">
                  {redeemSuccess.voucherCode}
                </p>
              </div>

              <div className="pt-2 text-[9px] text-gray-500 leading-normal font-mono font-bold uppercase tracking-wider">
                Present claim log coordinates at cafeteria admin desk to verify.
              </div>
            </div>

            <button
              onClick={() => setRedeemSuccess(null)}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white font-extrabold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-lg hover:shadow-primary/20 hover:scale-[1.01] btn-elastic cursor-pointer"
            >
              Close Ledger Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
