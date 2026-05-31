"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Clock,
  Zap,
  BookOpen,
  Calendar,
  Settings,
  Check,
  RotateCcw,
  Loader2,
  Gauge
} from "lucide-react";

interface SubjectPrediction {
  courseCode: string;
  courseName: string;
  currentRate: number;
  history: number[];
  projections: number[];
  predictedFinalRate: number;
  isAtRisk: boolean;
}

interface AttendancePredictionResponse {
  averageCurrent: number;
  averageProjected: number;
  trend: "UPWARD" | "DOWNWARD" | "STABLE";
  subjects: SubjectPrediction[];
}

interface RiskResponse {
  score: number;
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  factors: string[];
  recommendations: string[];
}

interface AcademicRec {
  subject: string;
  grade: number;
  gap: string;
  tips: string[];
}

interface AcademicRecsResponse {
  overallCgpa: number;
  weakAreasCount: number;
  recommendations: AcademicRec[];
}

interface EventRec {
  title: string;
  matchScore: number;
  reason: string;
  date: string;
  venue: string;
  eligibility: string;
}

interface Reminder {
  id: string;
  type: string;
  message: string;
  urgency: "HIGH" | "MEDIUM" | "LOW";
  remainingSeconds: number;
}

interface TimetableOptResponse {
  preferences: {
    preferMorning: boolean;
    preferredGapMins: number;
    studyBlockMins: number;
  };
  gapCount: number;
  recommendations: string[];
}

const mockPredictionsData: AttendancePredictionResponse = {
  averageCurrent: 80,
  averageProjected: 84,
  trend: "UPWARD",
  subjects: [
    {
      courseCode: "CS-401",
      courseName: "Advanced Mathematics",
      currentRate: 88,
      history: [80, 82, 85, 84, 88],
      projections: [90, 92, 92],
      predictedFinalRate: 92,
      isAtRisk: false
    },
    {
      courseCode: "CS-402",
      courseName: "Data Structures & Algorithms",
      currentRate: 64,
      history: [70, 68, 65, 62, 64],
      projections: [66, 68, 70],
      predictedFinalRate: 70,
      isAtRisk: true
    },
    {
      courseCode: "CS-403",
      courseName: "Computer Networks",
      currentRate: 76,
      history: [72, 74, 75, 76, 76],
      projections: [78, 80, 80],
      predictedFinalRate: 80,
      isAtRisk: false
    },
    {
      courseCode: "CS-404",
      courseName: "Software Engineering",
      currentRate: 92,
      history: [88, 90, 92, 92, 92],
      projections: [94, 95, 95],
      predictedFinalRate: 95,
      isAtRisk: false
    }
  ]
};

const mockRiskData: RiskResponse = {
  score: 42,
  level: "MEDIUM",
  factors: [
    "Attendance in Data Structures (64%) is below 75% threshold.",
    "Missed consecutive labs for Computer Networks.",
    "Revision gap of 4 days detected on core database topics."
  ],
  recommendations: [
    "Attend the next 3 lectures in Data Structures to clear warning status.",
    "Schedule a 45-minute revision block for tree data structures.",
    "Meet Prof. Priya during office hours to log manual check-ins."
  ]
};

const mockAcademicRecs: AcademicRecsResponse = {
  overallCgpa: 8.2,
  weakAreasCount: 2,
  recommendations: [
    {
      subject: "Data Structures & Algorithms",
      grade: 6.8,
      gap: "1.2",
      tips: [
        "Review Red-Black tree insertion visualizer.",
        "Practice daily coding challenges on heap allocation.",
        "Schedule group study for mock midterm prep."
      ]
    },
    {
      subject: "Computer Networks",
      grade: 7.2,
      gap: "0.8",
      tips: [
        "Simulate TCP three-way handshake parameters.",
        "Solve previous year question papers on subnetting.",
        "Attend the lab review session on Friday."
      ]
    }
  ]
};

const mockEventRecs: EventRec[] = [
  {
    title: "CodeCraft Hackathon 2026",
    matchScore: 95,
    reason: "Aligned with your focus on Data Structures and team software design projects.",
    date: "June 01, 2026",
    venue: "Seminar Hall-2",
    eligibility: "Open to CSE/ECE students"
  },
  {
    title: "RoboWars Exhibition",
    matchScore: 82,
    reason: "Great match for system optimization and hardware interface topics.",
    date: "June 04, 2026",
    venue: "Main Ground",
    eligibility: "Open to all candidates"
  }
];

const mockReminders: Reminder[] = [
  {
    id: "rem-1",
    type: "ACADEMIC",
    message: "Submit Software Engineering SRS document draft.",
    urgency: "HIGH",
    remainingSeconds: 7200
  },
  {
    id: "rem-2",
    type: "COMPLIANCE",
    message: "Verify attendance geofence log for CS-403 lecture.",
    urgency: "MEDIUM",
    remainingSeconds: 86400
  }
];

const mockTimetable: TimetableOptResponse = {
  preferences: {
    preferMorning: true,
    preferredGapMins: 30,
    studyBlockMins: 60
  },
  gapCount: 2,
  recommendations: [
    "You have a 90-minute gap on Monday. AI recommends scheduling a revision block for Mathematics in the central library.",
    "Morning slots show high engagement. Shift self-study sessions before 10:00 AM for optimal retention."
  ]
};

export default function AiInsightsPanel() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"predictions" | "risk" | "recommendations" | "reminders" | "timetable">("predictions");

  // State hooks for data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [predictions, setPredictions] = useState<AttendancePredictionResponse | null>(null);
  const [risk, setRisk] = useState<RiskResponse | null>(null);
  const [academicRecs, setAcademicRecs] = useState<AcademicRecsResponse | null>(null);
  const [eventRecs, setEventRecs] = useState<EventRec[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [timetable, setTimetable] = useState<TimetableOptResponse | null>(null);

  // Timetable Preferences editor state
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [preferMorning, setPreferMorning] = useState(true);
  const [preferredGap, setPreferredGap] = useState(30);
  const [studyBlock, setStudyBlock] = useState(60);
  const [showPrefModal, setShowPrefModal] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Fetch all AI data
  const fetchAllAiData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    // Fall back immediately if user is on a demo session
    if (user.token.startsWith("demo-jwt-token-")) {
      setPredictions(mockPredictionsData);
      setRisk(mockRiskData);
      setAcademicRecs(mockAcademicRecs);
      setEventRecs(mockEventRecs);
      setReminders(mockReminders);
      setTimetable(mockTimetable);
      setPreferMorning(mockTimetable.preferences.preferMorning);
      setPreferredGap(mockTimetable.preferences.preferredGapMins);
      setStudyBlock(mockTimetable.preferences.studyBlockMins);
      setLoading(false);
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${user.token}` };

      // Make concurrent requests to AI endpoints safely
      const [predRes, riskRes, acadRes, evRes, remRes, timeRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/ai/predict/attendance`, { headers }).catch(() => null),
        fetch(`${API_URL}/api/v1/ai/risk-score`, { headers }).catch(() => null),
        fetch(`${API_URL}/api/v1/ai/recommendations/academic`, { headers }).catch(() => null),
        fetch(`${API_URL}/api/v1/ai/recommendations/events`, { headers }).catch(() => null),
        fetch(`${API_URL}/api/v1/ai/reminders`, { headers }).catch(() => null),
        fetch(`${API_URL}/api/v1/ai/timetable/optimize`, { headers }).catch(() => null),
      ]);

      if (predRes && predRes.ok) {
        setPredictions(await predRes.json());
      } else {
        setPredictions(mockPredictionsData);
      }

      if (riskRes && riskRes.ok) {
        setRisk(await riskRes.json());
      } else {
        setRisk(mockRiskData);
      }

      if (acadRes && acadRes.ok) {
        setAcademicRecs(await acadRes.json());
      } else {
        setAcademicRecs(mockAcademicRecs);
      }

      if (evRes && evRes.ok) {
        const d = await evRes.json();
        setEventRecs(d.recommendations || []);
      } else {
        setEventRecs(mockEventRecs);
      }

      if (remRes && remRes.ok) {
        const d = await remRes.json();
        setReminders(d.reminders || []);
      } else {
        setReminders(mockReminders);
      }

      if (timeRes && timeRes.ok) {
        const d = await timeRes.json();
        setTimetable(d);
        setPreferMorning(d.preferences.preferMorning);
        setPreferredGap(d.preferences.preferredGapMins);
        setStudyBlock(d.preferences.studyBlockMins);
      } else {
        setTimetable(mockTimetable);
        setPreferMorning(mockTimetable.preferences.preferMorning);
        setPreferredGap(mockTimetable.preferences.preferredGapMins);
        setStudyBlock(mockTimetable.preferences.studyBlockMins);
      }
    } catch (err) {
      console.warn("Failed to load live AI Insights data, using offline fallback:", err);
      // Fallback to high quality mock data in case of unexpected errors
      setPredictions(mockPredictionsData);
      setRisk(mockRiskData);
      setAcademicRecs(mockAcademicRecs);
      setEventRecs(mockEventRecs);
      setReminders(mockReminders);
      setTimetable(mockTimetable);
    } finally {
      setLoading(false);
    }
  }, [user, API_URL]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      if (active) {
        fetchAllAiData();
      }
    }, 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [fetchAllAiData]);

  // Handle saving customization preferences
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingPrefs(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/ai/timetable/preferences`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          preferMorning,
          preferredGap: Number(preferredGap),
          studyBlockMins: Number(studyBlock),
        }),
      });

      if (res.ok) {
        await res.json();
        // Update optimization text list
        const timeRes = await fetch(`${API_URL}/api/v1/ai/timetable/optimize`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (timeRes.ok) {
          setTimetable(await timeRes.json());
        }
        setShowPrefModal(false);
      }
    } catch (err) {
      console.error("Failed to save timetable preferences:", err);
    } finally {
      setSavingPrefs(false);
    }
  };

  // Sparkline Chart SVG Helper
  const renderSparkline = (points: number[]) => {
    if (!points || points.length === 0) return null;
    const width = 100;
    const height = 24;
    const minVal = 0;
    const maxVal = 100;
    const xStep = width / (points.length - 1);
    
    const svgPoints = points.map((p, idx) => {
      const x = idx * xStep;
      // Invert Y since (0,0) is top-left
      const y = height - ((p - minVal) / (maxVal - minVal)) * height;
      return `${x},${Math.max(2, Math.min(height - 2, y))}`;
    }).join(" ");

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke="var(--color-primary, #6366f1)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={svgPoints}
        />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="glass-panel p-10 flex flex-col items-center justify-center space-y-4 min-h-[300px]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-gray-400">Loading AI Copilot Core Insights...</p>
      </div>
    );
  }

  if (error || !predictions || !risk) {
    return (
      <div className="glass-panel p-8 text-center space-y-4">
        <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
        <h4 className="text-sm font-bold text-white">AI Core Sync Interrupted</h4>
        <p className="text-xs text-gray-400 max-w-md mx-auto">
          The dashboard is running in offline demo simulation mode. Activate your local Express API Server to retrieve live predictions.
        </p>
        <button
          onClick={fetchAllAiData}
          className="px-4 py-2 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold transition-all flex items-center gap-2 mx-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reconnect AI Core
        </button>
      </div>
    );
  }

  // Get dynamic level colors for risk badge
  const getRiskColor = (level: string) => {
    switch (level) {
      case "CRITICAL": return "text-red-500 bg-red-500/10 border-red-500/20";
      case "HIGH": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "MEDIUM": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      default: return "text-green-500 bg-green-500/10 border-green-500/20";
    }
  };

  return (
    <div className="glass-panel p-6 border-white/5 space-y-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-primary animate-pulse" /> AI-Powered Campus Insights
          </h3>
          <p className="text-xs text-gray-400">Advanced local regression modeling and student risk diagnostics.</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5 overflow-x-auto self-start sm:self-center">
          <button
            onClick={() => setActiveTab("predictions")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "predictions"
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Predictions
          </button>
          <button
            onClick={() => setActiveTab("risk")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "risk"
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Risk Assessment
          </button>
          <button
            onClick={() => setActiveTab("recommendations")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "recommendations"
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Study & Events
          </button>
          <button
            onClick={() => setActiveTab("reminders")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "reminders"
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Reminders
            {reminders.length > 0 && (
              <span className="bg-red-500 text-white text-[9px] font-extrabold h-4 w-4 rounded-full flex items-center justify-center animate-bounce">
                {reminders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("timetable")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "timetable"
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Schedule Optimizer
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white/5 border border-white/5 rounded-2xl p-5 overflow-y-auto max-h-[420px] scrollbar-thin">
        {/* Tab 1: Attendance Projections */}
        {activeTab === "predictions" && (
          <div className="space-y-5 animate-slide-up">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-white/5">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Current Average</span>
                <p className="text-2xl font-extrabold text-white mt-1">{predictions.averageCurrent}%</p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Projected (Term End)</span>
                <p className={`text-2xl font-extrabold mt-1 ${predictions.averageProjected >= 75 ? "text-primary-glow" : "text-red-500"}`}>{predictions.averageProjected}%</p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center flex flex-col items-center justify-center">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Calculated Trend</span>
                <span className={`mt-1.5 px-3 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider flex items-center gap-1 ${
                  predictions.trend === "UPWARD" 
                    ? "bg-green-500/10 text-green-400 border-green-500/20" 
                    : predictions.trend === "DOWNWARD" 
                    ? "bg-red-500/10 text-red-400 border-red-500/20" 
                    : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                }`}>
                  <TrendingUp className={`h-3 w-3 ${predictions.trend === "DOWNWARD" ? "rotate-180" : ""}`} />
                  {predictions.trend}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Subjected Linear Forecasts</h4>
              <div className="space-y-2">
                {predictions.subjects.map((sub, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-white/5 bg-slate-900/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-white/10 transition-all">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{sub.courseCode}</span>
                        <span className="text-xs text-gray-400">— {sub.courseName}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-2">
                        Current: <strong className="text-white">{sub.currentRate}%</strong> | Projected Final: <strong className={sub.predictedFinalRate >= 75 ? "text-primary-glow" : "text-red-500"}>{sub.predictedFinalRate}%</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Sparkline chart */}
                      <div className="hidden sm:block">
                        <span className="text-[9px] text-gray-500 block mb-1 text-center font-bold">Trend history</span>
                        {renderSparkline([...sub.history, ...sub.projections])}
                      </div>

                      {sub.isAtRisk ? (
                        <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                          Critical Warning
                        </span>
                      ) : (
                        <span className="bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                          Compliant
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Risk Assessment */}
        {activeTab === "risk" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
            {/* Risk Gauge Circle */}
            <div className="flex flex-col items-center justify-center p-6 border border-white/5 bg-slate-900/40 rounded-2xl relative overflow-hidden">
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-4">Risk Severity Scale</span>
              
              <div className="relative h-32 w-32 flex items-center justify-center mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    stroke={risk.score > 75 ? "#ef4444" : risk.score > 55 ? "#f97316" : risk.score > 30 ? "#eab308" : "#22c55e"}
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={326.7}
                    strokeDashoffset={326.7 - (326.7 * risk.score) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-white">{risk.score}</span>
                  <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">Score</span>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRiskColor(risk.level)}`}>
                {risk.level} RISK PROFILE
              </span>
            </div>

            {/* Risk Factors & Recommendations */}
            <div className="space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Analytical Diagnostics
                </h4>
                <ul className="space-y-2 text-[11px] text-gray-300">
                  {risk.factors.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <p>{f}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-white/5 pt-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-primary" /> Core Action Checklist
                </h4>
                <div className="space-y-2">
                  {risk.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[10px] text-gray-400 bg-white/5 p-2 rounded-lg border border-white/5">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      <p>{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Study & Events Recommendations */}
        {activeTab === "recommendations" && (
          <div className="space-y-6 animate-slide-up">
            {/* Academic Recommendations */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-primary" /> Grade & Performance Enhancers
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {academicRecs?.recommendations.map((rec, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-white/5 bg-slate-900/50 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{rec.subject}</span>
                        <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-bold px-2 py-0.5 rounded">
                          Grade Gap: -{rec.gap}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500">Current Grade Target: B- (needs boost to A)</p>
                    </div>

                    <ul className="space-y-1.5 border-t border-white/5 pt-2 mt-2">
                      {rec.tips.slice(0, 3).map((tip, tIdx) => (
                        <li key={tIdx} className="text-[10px] text-gray-400 flex items-start gap-1.5">
                          <Check className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Recommendations */}
            <div className="space-y-3 border-t border-white/5 pt-5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-secondary animate-pulse" /> Extracurricular event pairings
              </h4>
              <div className="space-y-2.5">
                {eventRecs.map((ev, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-white/5 bg-slate-900/40 hover:border-white/10 transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-bold text-white">{ev.title}</h5>
                        <span className="bg-secondary/10 border border-secondary/20 text-secondary-glow text-[9px] font-bold px-2 py-0.5 rounded">
                          {ev.matchScore}% relevance
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">{ev.reason}</p>
                      <p className="text-[9px] text-gray-500 mt-1 font-mono">{ev.date} | Venue: {ev.venue}</p>
                    </div>

                    <button className="px-3 py-1 bg-secondary/10 border border-secondary/20 hover:bg-secondary/20 text-secondary-glow text-[10px] font-bold rounded-lg transition-all self-start sm:self-center">
                      Register & Waiver
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Smart Reminders */}
        {activeTab === "reminders" && (
          <div className="space-y-3 animate-slide-up">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Temporal Countdown & Deadlines</h4>
            {reminders.length === 0 ? (
              <div className="text-center p-8 text-xs text-gray-400">
                You have no active high-priority reminders. Check back later!
              </div>
            ) : (
              <div className="space-y-2">
                {reminders.map((rem, idx) => (
                  <div key={idx} className={`p-3.5 rounded-xl border flex justify-between items-center gap-4 bg-slate-900/50 ${
                    rem.urgency === "HIGH" 
                      ? "border-red-500/25 border-l-4 border-l-red-500" 
                      : rem.urgency === "MEDIUM" 
                      ? "border-amber-500/25 border-l-4 border-l-amber-500" 
                      : "border-white/5 border-l-4 border-l-gray-500"
                  }`}>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white">{rem.message}</p>
                      <span className="text-[9px] text-gray-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded font-mono uppercase tracking-wider">{rem.type}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400 bg-black/20 px-2 py-1 rounded border border-white/5 select-none font-bold">
                      <Clock className="h-3.5 w-3.5 text-primary animate-pulse" />
                      <span>
                        {rem.remainingSeconds > 3600 
                          ? `${Math.round(rem.remainingSeconds / 3600)} hrs remaining` 
                          : `${Math.round(rem.remainingSeconds / 60)} mins remaining`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Schedule Optimizer */}
        {activeTab === "timetable" && (
          <div className="space-y-5 animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Free Period Gap Diagnostics</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Optimized slot recommendations matching study patterns.</p>
              </div>

              <button
                onClick={() => setShowPrefModal(true)}
                className="px-2.5 py-1 bg-white/5 border border-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
              >
                <Settings className="h-3.5 w-3.5" /> Adjust preferences
              </button>
            </div>

            {timetable && (
              <div className="space-y-4">
                <div className="bg-slate-900/50 border border-white/5 p-4 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] text-gray-500 uppercase font-extrabold tracking-wider">Active optimization rules</span>
                    <div className="flex gap-2 flex-wrap mt-1">
                      <span className="bg-primary/10 border border-primary/20 text-primary-glow text-[9px] px-2 py-0.5 rounded-full font-bold">
                        {timetable.preferences.preferMorning ? "Morning study focus" : "Evening study focus"}
                      </span>
                      <span className="bg-secondary/10 border border-secondary/20 text-secondary-glow text-[9px] px-2 py-0.5 rounded-full font-bold">
                        Class Gap Target: {timetable.preferences.preferredGapMins} mins
                      </span>
                      <span className="bg-slate-800 border border-white/5 text-gray-400 text-[9px] px-2 py-0.5 rounded-full font-bold">
                        Block: {timetable.preferences.studyBlockMins} mins
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] text-gray-500 block uppercase font-bold">Gap conflicts</span>
                    <strong className="text-lg text-white font-extrabold">{timetable.gapCount} identified</strong>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">AI Generated Timetable Study Prompts</span>
                  {timetable.recommendations.map((rec, idx) => (
                    <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-xl text-[11px] text-gray-300 flex items-start gap-2.5">
                      <Gauge className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <p>{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Timetable Preferences Editor Modal overlay */}
      {showPrefModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSavePreferences}
            className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-sm space-y-4 shadow-2xl animate-scale-up"
          >
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Settings className="h-4.5 w-4.5 text-primary" /> Timetable AI parameters
              </h3>
              <p className="text-xs text-gray-400 mt-1">Configure your personal learning algorithms.</p>
            </div>

            <div className="space-y-3.5">
              {/* Morning / Evening Toggle */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-extrabold tracking-widest text-gray-400 block">Class Study Time Focus</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPreferMorning(true)}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                      preferMorning 
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                        : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    Morning study
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferMorning(false)}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                      !preferMorning 
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                        : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    Evening study
                  </button>
                </div>
              </div>

              {/* Class Gap Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] uppercase font-extrabold tracking-widest text-gray-400">
                  <span>Target Class Gap</span>
                  <span className="text-primary font-mono font-bold">{preferredGap} mins</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="10"
                  value={preferredGap}
                  onChange={(e) => setPreferredGap(Number(e.target.value))}
                  className="w-full accent-primary bg-white/10 h-1.5 rounded-lg"
                />
              </div>

              {/* Study block slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] uppercase font-extrabold tracking-widest text-gray-400">
                  <span>Revision block length</span>
                  <span className="text-primary font-mono font-bold">{studyBlock} mins</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="180"
                  step="15"
                  value={studyBlock}
                  onChange={(e) => setStudyBlock(Number(e.target.value))}
                  className="w-full accent-primary bg-white/10 h-1.5 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPrefModal(false)}
                className="px-3.5 py-2 border border-white/5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-bold rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingPrefs}
                className="px-4 py-2 bg-primary hover:bg-primary-glow text-white text-xs font-bold rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center gap-1.5"
              >
                {savingPrefs ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Optimize
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
