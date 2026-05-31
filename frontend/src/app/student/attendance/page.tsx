"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import ThemeToggle from "@/components/ThemeToggle";
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  BookOpen,
  Award,
  Filter,
  Download,
  BarChart4,
  Target,
  Zap,
  Flame,
  Shield,
  Activity,
  ChevronDown,
  ChevronUp,
  Search,
  FileText,
  X,
  Cpu
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell
} from "recharts";

// ========================
// Static mock data (realistic campus data)
// ========================

const subjectDetails = [
  {
    code: "CS-401",
    name: "Advanced Mathematics",
    instructor: "Dr. Priya Sharma",
    color: "#6366f1",
    totalLectures: 30,
    attended: 27,
    excused: 1,
    absent: 2,
    rate: 90,
    status: "safe",
    weeklyTrend: [88, 90, 90, 88, 92, 90, 90],
    logs: [
      { date: "2026-05-19", day: "Mon", status: "PRESENT", topic: "Fourier Series — Chapter 7" },
      { date: "2026-05-20", day: "Tue", status: "PRESENT", topic: "Laplace Transforms (Part 1)" },
      { date: "2026-05-22", day: "Thu", status: "PRESENT", topic: "Laplace Transforms (Part 2)" },
      { date: "2026-05-12", day: "Mon", status: "ABSENT", topic: "Complex Analysis — Intro" },
      { date: "2026-05-13", day: "Tue", status: "EXCUSED", topic: "Partial Derivatives" },
      { date: "2026-05-08", day: "Thu", status: "PRESENT", topic: "Matrix Theory" },
      { date: "2026-05-06", day: "Tue", status: "PRESENT", topic: "Eigenvalues & Eigenvectors" },
      { date: "2026-05-05", day: "Mon", status: "PRESENT", topic: "Numerical Methods — Overview" },
      { date: "2026-04-29", day: "Tue", status: "ABSENT", topic: "Z-Transforms" },
      { date: "2026-04-28", day: "Mon", status: "PRESENT", topic: "Linear Algebra Recap" },
    ]
  },
  {
    code: "CS-402",
    name: "Data Structures & Algorithms",
    instructor: "Prof. Rajesh Kumar",
    color: "#ef4444",
    totalLectures: 28,
    attended: 18,
    excused: 0,
    absent: 10,
    rate: 64,
    status: "danger",
    weeklyTrend: [70, 68, 66, 65, 64, 63, 64],
    logs: [
      { date: "2026-05-21", day: "Wed", status: "ABSENT", topic: "Red-Black Trees (Deletion)" },
      { date: "2026-05-20", day: "Tue", status: "ABSENT", topic: "Red-Black Trees (Insertion)" },
      { date: "2026-05-19", day: "Mon", status: "PRESENT", topic: "AVL Tree Rotations" },
      { date: "2026-05-14", day: "Thu", status: "ABSENT", topic: "Heap Sort Variations" },
      { date: "2026-05-13", day: "Wed", status: "ABSENT", topic: "Priority Queues" },
      { date: "2026-05-12", day: "Tue", status: "PRESENT", topic: "Min-Heap Implementation" },
      { date: "2026-05-08", day: "Fri", status: "ABSENT", topic: "Graph Traversals - BFS" },
      { date: "2026-05-07", day: "Thu", status: "PRESENT", topic: "Graph Theory - DFS" },
      { date: "2026-05-06", day: "Wed", status: "ABSENT", topic: "Trie Data Structure" },
      { date: "2026-04-30", day: "Wed", status: "PRESENT", topic: "B-Trees Intro" },
    ]
  },
  {
    code: "CS-403",
    name: "Computer Networks",
    instructor: "Dr. Anika Verma",
    color: "#f59e0b",
    totalLectures: 26,
    attended: 20,
    excused: 1,
    absent: 5,
    rate: 77,
    status: "warning",
    weeklyTrend: [74, 75, 76, 77, 78, 77, 77],
    logs: [
      { date: "2026-05-22", day: "Fri", status: "PRESENT", topic: "TCP/IP Stack Deep Dive" },
      { date: "2026-05-20", day: "Wed", status: "PRESENT", topic: "UDP Protocol Analysis" },
      { date: "2026-05-15", day: "Fri", status: "ABSENT", topic: "DNS & HTTP Internals" },
      { date: "2026-05-14", day: "Thu", status: "EXCUSED", topic: "Network Security Basics" },
      { date: "2026-05-13", day: "Wed", status: "PRESENT", topic: "Routing Algorithms" },
      { date: "2026-05-08", day: "Fri", status: "ABSENT", topic: "Switching & VLANs" },
      { date: "2026-05-07", day: "Thu", status: "PRESENT", topic: "OSI vs TCP Model" },
      { date: "2026-05-06", day: "Wed", status: "ABSENT", topic: "CSMA/CD Protocol" },
      { date: "2026-04-30", day: "Wed", status: "PRESENT", topic: "Error Detection Codes" },
      { date: "2026-04-29", day: "Tue", status: "ABSENT", topic: "Flow Control Mechanisms" },
    ]
  },
  {
    code: "CS-404",
    name: "Software Engineering",
    instructor: "Dr. Michael Chen",
    color: "#10b981",
    totalLectures: 25,
    attended: 23,
    excused: 0,
    absent: 2,
    rate: 92,
    status: "safe",
    weeklyTrend: [90, 91, 92, 91, 93, 92, 92],
    logs: [
      { date: "2026-05-22", day: "Fri", status: "PRESENT", topic: "Agile Sprint Planning Workshop" },
      { date: "2026-05-21", day: "Thu", status: "PRESENT", topic: "SOLID Principles Deep Dive" },
      { date: "2026-05-19", day: "Tue", status: "PRESENT", topic: "UML Activity Diagrams" },
      { date: "2026-05-14", day: "Thu", status: "ABSENT", topic: "Design Patterns — Factory" },
      { date: "2026-05-12", day: "Tue", status: "PRESENT", topic: "Observer Pattern Lab" },
      { date: "2026-05-08", day: "Fri", status: "PRESENT", topic: "SRS Document Review" },
      { date: "2026-05-07", day: "Thu", status: "PRESENT", topic: "Use Case Diagrams" },
      { date: "2026-05-06", day: "Wed", status: "PRESENT", topic: "Entity Relationship Diagrams" },
      { date: "2026-05-05", day: "Tue", status: "ABSENT", topic: "Project Management Intro" },
      { date: "2026-04-30", day: "Thu", status: "PRESENT", topic: "Code Review Best Practices" },
    ]
  },
];

const overallWeeklyTrend = [
  { week: "W1 Apr", rate: 78 },
  { week: "W2 Apr", rate: 80 },
  { week: "W3 Apr", rate: 76 },
  { week: "W4 Apr", rate: 79 },
  { week: "W1 May", rate: 78 },
  { week: "W2 May", rate: 80 },
  { week: "W3 May", rate: 81 },
];

const radarData = [
  { subject: "Math", fullMark: 100, rate: 90 },
  { subject: "DSA", fullMark: 100, rate: 64 },
  { subject: "Networks", fullMark: 100, rate: 77 },
  { subject: "SoftEng", fullMark: 100, rate: 92 },
];

// Generate heatmap calendar data (6 weeks × 5 days)
const generateHeatmapData = () => {
  const allLogs: Record<string, "PRESENT" | "ABSENT" | "EXCUSED" | "HOLIDAY"> = {};
  // Compile logs from all subjects
  subjectDetails.forEach(sub => {
    sub.logs.forEach(log => {
      const existing = allLogs[log.date];
      if (!existing) {
        allLogs[log.date] = log.status as "PRESENT" | "ABSENT" | "EXCUSED";
      } else if (existing === "ABSENT" && log.status === "PRESENT") {
        allLogs[log.date] = "PRESENT"; // At least one present → present
      }
    });
  });

  const days: { date: string; day: string; month: string; status: "PRESENT" | "ABSENT" | "EXCUSED" | "HOLIDAY" | "FUTURE" | "WEEKEND" }[] = [];
  const startDate = new Date("2026-04-27");
  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dayOfWeek = d.getDay();
    const dateStr = d.toISOString().split("T")[0];
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      days.push({ date: dateStr, day: d.toLocaleDateString("en-US", { weekday: "short" }), month: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), status: "WEEKEND" });
    } else if (d > new Date("2026-05-22")) {
      days.push({ date: dateStr, day: d.toLocaleDateString("en-US", { weekday: "short" }), month: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), status: "FUTURE" });
    } else {
      days.push({ date: dateStr, day: d.toLocaleDateString("en-US", { weekday: "short" }), month: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), status: allLogs[dateStr] || "PRESENT" });
    }
  }
  return days;
};

const heatmapDays = generateHeatmapData();

// Custom tooltip for recharts
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs shadow-2xl">
        <p className="text-gray-400 font-mono">{label}</p>
        <p className="text-white font-bold mt-0.5">{payload[0].value}% compliance</p>
      </div>
    );
  }
  return null;
};

export default function StudentAttendancePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PRESENT" | "ABSENT" | "EXCUSED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      router.push("/login");
    }
  }, [isMounted, isAuthenticated, router]);

  const totalPresent = subjectDetails.reduce((s, sub) => s + sub.attended, 0);
  const totalExcused = subjectDetails.reduce((s, sub) => s + sub.excused, 0);
  const totalAbsent = subjectDetails.reduce((s, sub) => s + sub.absent, 0);
  const totalLectures = subjectDetails.reduce((s, sub) => s + sub.totalLectures, 0);
  const overallRate = Math.round((totalPresent / totalLectures) * 100);
  const atRiskCount = subjectDetails.filter(s => s.status === "danger").length;
  const warningCount = subjectDetails.filter(s => s.status === "warning").length;

  const selectedSubject = activeSubject
    ? subjectDetails.find(s => s.code === activeSubject)
    : null;

  const filteredLogs = selectedSubject
    ? selectedSubject.logs.filter(log => {
        const matchesFilter = filterStatus === "ALL" || log.status === filterStatus;
        const matchesSearch = searchQuery === "" || log.topic.toLowerCase().includes(searchQuery.toLowerCase()) || log.date.includes(searchQuery);
        return matchesFilter && matchesSearch;
      })
    : [];

  if (!isMounted || !user) return null;

  const getStatusBg = (status: string) => {
    switch (status) {
      case "PRESENT": return "bg-emerald-500/80";
      case "ABSENT": return "bg-red-500/80";
      case "EXCUSED": return "bg-amber-500/80";
      case "WEEKEND": return "bg-white/5";
      case "FUTURE": return "bg-white/2 opacity-30";
      default: return "bg-white/10";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "safe": return { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/25" };
      case "warning": return { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/25" };
      case "danger": return { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/25" };
      default: return { text: "text-gray-400", bg: "bg-white/5", border: "border-white/5" };
    }
  };

  const getLogStatusStyle = (status: string) => {
    switch (status) {
      case "PRESENT": return "bg-emerald-500/10 border-emerald-500/25 text-emerald-400";
      case "ABSENT": return "bg-red-500/10 border-red-500/25 text-red-400";
      case "EXCUSED": return "bg-amber-500/10 border-amber-500/25 text-amber-400";
      default: return "bg-white/5 border-white/5 text-gray-400";
    }
  };

  const missedLecturesNeeded = (sub: typeof subjectDetails[0]) => {
    const needed = Math.ceil(0.75 * sub.totalLectures) - sub.attended;
    return needed > 0 ? needed : 0;
  };

  const canMissCount = (sub: typeof subjectDetails[0]) => {
    const safeToMiss = Math.floor(sub.attended - 0.75 * sub.totalLectures);
    return safeToMiss > 0 ? safeToMiss : 0;
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-x-hidden text-gray-100">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.07)_0%,transparent_55%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.04)_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_60%,rgba(0,0,0,0.4))] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-30 w-full px-6 py-4 border-b border-white/5 bg-slate-950/40 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/student/dashboard")}
            className="glass-panel p-2.5 text-gray-400 hover:text-white transition-all hover:scale-105 border border-white/5 cursor-pointer btn-elastic"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-black uppercase tracking-wider text-white font-mono flex items-center gap-2">
              Attendance Matrix <Activity className="h-4 w-4 text-primary animate-pulse" />
            </h1>
            <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">
              {user.firstName} {user.lastName} · CS-2026 · SEM 4
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {/* Navigation pills */}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => router.push("/student/dashboard")}
              className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-white bg-white/5 border border-white/5 rounded-lg transition-all"
            >
              Dashboard
            </button>
            <button
              className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white bg-primary border border-primary/30 rounded-lg"
            >
              Attendance
            </button>
            <button
              onClick={() => router.push("/student/events")}
              className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-white bg-white/5 border border-white/5 rounded-lg transition-all"
            >
              Events
            </button>
            <button
              onClick={() => router.push("/student/gamification")}
              className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-white bg-white/5 border border-white/5 rounded-lg transition-all"
            >
              Achievements
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full z-10 space-y-6">

        {/* ===== TOP METRICS STRIP ===== */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: "Overall Rate", value: `${overallRate}%`, sub: "All courses avg", color: overallRate >= 75 ? "text-emerald-400" : "text-red-400", icon: <Target className="h-4 w-4" />, glow: "border-primary/20" },
            { label: "Total Present", value: totalPresent, sub: `of ${totalLectures} lectures`, color: "text-emerald-400", icon: <CheckCircle className="h-4 w-4" />, glow: "border-emerald-500/20" },
            { label: "Excused Leaves", value: totalExcused, sub: "OD / Medical leave", color: "text-amber-400", icon: <FileText className="h-4 w-4" />, glow: "border-amber-500/20" },
            { label: "Total Absent", value: totalAbsent, sub: "Unexcused gaps", color: "text-red-400", icon: <X className="h-4 w-4" />, glow: "border-red-500/20" },
            { label: "At-Risk Courses", value: atRiskCount, sub: "Below 75%", color: "text-red-400", icon: <AlertTriangle className="h-4 w-4" />, glow: "border-red-500/20" },
            { label: "Safe Courses", value: subjectDetails.length - atRiskCount - warningCount, sub: "Above 85%", color: "text-emerald-400", icon: <Shield className="h-4 w-4" />, glow: "border-emerald-500/20" },
          ].map((m, i) => (
            <div key={i} className={`glass-panel p-4 flex flex-col gap-2 border ${m.glow} hover:scale-[1.02] transition-all`}>
              <div className={`flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest ${m.color}`}>
                {m.icon} {m.label}
              </div>
              <span className={`text-2xl font-black font-mono ${m.color}`}>{m.value}</span>
              <span className="text-[9px] text-gray-500 font-mono uppercase tracking-widest">{m.sub}</span>
            </div>
          ))}
        </div>

        {/* ===== MAIN GRID ===== */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

          {/* LEFT: Subject Cards + Log Detail */}
          <div className="xl:col-span-7 space-y-4">

            {/* Section header */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" /> Course Compliance Matrix
              </h2>
              <span className="text-[10px] text-gray-500 font-mono">Click a subject to drill down</span>
            </div>

            {subjectDetails.map(sub => {
              const colors = getStatusColor(sub.status);
              const isActive = activeSubject === sub.code;
              const isExpanded = expandedSubject === sub.code;
              const needed = missedLecturesNeeded(sub);
              const canMiss = canMissCount(sub);

              return (
                <div key={sub.code} className={`glass-panel overflow-hidden border transition-all duration-300 ${isActive ? `border-[${sub.color}]/40 shadow-lg shadow-[${sub.color}]/5` : "border-white/5 hover:border-white/10"}`}>
                  {/* Subject header bar */}
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() => {
                      setActiveSubject(isActive ? null : sub.code);
                      setExpandedSubject(null);
                      setFilterStatus("ALL");
                      setSearchQuery("");
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {/* Color dot */}
                        <div className="relative flex-shrink-0">
                          <div
                            className="w-3 h-3 rounded-full animate-pulse"
                            style={{ backgroundColor: sub.color, boxShadow: `0 0 8px ${sub.color}60` }}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className="text-[9px] font-extrabold font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider"
                              style={{ color: sub.color, borderColor: `${sub.color}40`, backgroundColor: `${sub.color}15` }}
                            >
                              {sub.code}
                            </span>
                            <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${colors.text} ${colors.bg} ${colors.border}`}>
                              {sub.status === "safe" ? "Safe" : sub.status === "warning" ? "Warning" : "Critical"}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-white mt-1">{sub.name}</h3>
                          <p className="text-[10px] text-gray-500 font-mono mt-0.5">{sub.instructor}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <span className={`text-2xl font-black font-mono ${sub.rate >= 85 ? "text-emerald-400" : sub.rate >= 75 ? "text-amber-400" : "text-red-500"}`}>
                            {sub.rate}%
                          </span>
                          <p className="text-[9px] text-gray-500 font-mono">{sub.attended}/{sub.totalLectures}</p>
                        </div>
                        {isActive ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4 space-y-1.5">
                      <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                        <span>Compliance: {sub.rate}%</span>
                        <span>Threshold: 75%</span>
                      </div>
                      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                        {/* Threshold marker */}
                        <div className="absolute top-0 bottom-0 w-0.5 bg-amber-500/60 z-10" style={{ left: "75%" }} />
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${sub.rate}%`,
                            background: `linear-gradient(to right, ${sub.color}99, ${sub.color})`
                          }}
                        />
                      </div>
                      <div className="flex gap-3 text-[9px] font-mono">
                        <span className="text-emerald-400">✓ {sub.attended} Present</span>
                        <span className="text-amber-400">⊘ {sub.excused} Excused</span>
                        <span className="text-red-400">✗ {sub.absent} Absent</span>
                      </div>
                    </div>

                    {/* Prediction Banner */}
                    <div className={`mt-3 p-2.5 rounded-lg border text-[10px] font-mono flex items-center gap-2 ${
                      sub.status === "danger"
                        ? "bg-red-500/5 border-red-500/20 text-red-400"
                        : sub.status === "warning"
                        ? "bg-amber-500/5 border-amber-500/20 text-amber-400"
                        : "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                    }`}>
                      {sub.status === "danger" ? (
                        <><AlertTriangle className="h-3.5 w-3.5 shrink-0" /> Must attend next <strong className="font-black">{needed}</strong> classes to reach 75% threshold.</>
                      ) : sub.status === "warning" ? (
                        <><AlertTriangle className="h-3.5 w-3.5 shrink-0" /> Caution: Do not miss any more classes this week.</>
                      ) : (
                        <><CheckCircle className="h-3.5 w-3.5 shrink-0" /> Safe zone. Can miss up to <strong className="font-black">{canMiss}</strong> lecture(s) without falling below threshold.</>
                      )}
                    </div>
                  </div>

                  {/* Expanded Log Detail */}
                  {isActive && (
                    <div className="border-t border-white/5 bg-white/2 animate-fade-in">
                      {/* Filter Bar */}
                      <div className="p-4 flex flex-col sm:flex-row gap-3 border-b border-white/5">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search lecture topic..."
                            className="w-full bg-slate-950 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-primary/50 transition-all"
                          />
                        </div>
                        <div className="flex gap-1.5">
                          {["ALL", "PRESENT", "ABSENT", "EXCUSED"].map(f => (
                            <button
                              key={f}
                              onClick={() => setFilterStatus(f as "ALL" | "PRESENT" | "ABSENT" | "EXCUSED")}
                              className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
                                filterStatus === f
                                  ? "bg-primary border border-primary/30 text-white shadow-lg shadow-primary/20"
                                  : "bg-white/5 border border-white/5 text-gray-400 hover:text-white"
                              }`}
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Log List */}
                      <div className="divide-y divide-white/5 max-h-72 overflow-y-auto scrollbar-thin">
                        {filteredLogs.length === 0 ? (
                          <div className="p-8 text-center text-xs text-gray-500">No records match the current filter.</div>
                        ) : (
                          filteredLogs.map((log, idx) => (
                            <div key={idx} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/3 transition-all group">
                              <div className="flex-shrink-0 w-20 text-center">
                                <span className="text-[9px] text-gray-500 font-mono block">{log.day}</span>
                                <span className="text-xs font-bold text-white font-mono">{log.date.slice(5)}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-300 truncate font-medium group-hover:text-white transition-colors">{log.topic}</p>
                              </div>
                              <span className={`flex-shrink-0 text-[8px] font-extrabold px-2.5 py-1 rounded-full border uppercase tracking-widest ${getLogStatusStyle(log.status)}`}>
                                {log.status}
                              </span>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Weekly trend mini-chart for the subject */}
                      <div className="p-4 border-t border-white/5">
                        <p className="text-[10px] text-gray-500 font-mono uppercase font-bold mb-2">Weekly Compliance Trend</p>
                        <ResponsiveContainer width="100%" height={60}>
                          <AreaChart data={sub.weeklyTrend.map((r, i) => ({ week: `W${i + 1}`, rate: r }))}>
                            <defs>
                              <linearGradient id={`grad-${sub.code}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={sub.color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={sub.color} stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="week" tick={{ fontSize: 9, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                            <Area type="monotone" dataKey="rate" stroke={sub.color} strokeWidth={2} fill={`url(#grad-${sub.code})`} dot={{ r: 3, fill: sub.color, strokeWidth: 0 }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* RIGHT: Charts + Heatmap */}
          <div className="xl:col-span-5 space-y-5 sticky top-24">

            {/* Overall Trend Chart */}
            <div className="glass-panel p-5 border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Semester Trend
                </h3>
                <span className="text-[9px] text-gray-500 font-mono">Past 7 weeks</span>
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={overallWeeklyTrend}>
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="week" tick={{ fontSize: 9, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[60, 100]} tick={{ fontSize: 9, fill: "#6b7280" }} axisLine={false} tickLine={false} width={25} />
                  <Tooltip content={<CustomTooltip />} />
                  {/* 75% threshold reference line */}
                  <Area type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={2.5} fill="url(#trendGrad)" dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#1e1b4b" }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Subject Radar Chart */}
            <div className="glass-panel p-5 border-white/5 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <BarChart4 className="h-4 w-4 text-secondary" /> Coverage Radar
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar dataKey="rate" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} dot={{ r: 3, fill: "#6366f1" }} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2">
                {radarData.map(d => (
                  <div key={d.subject} className="flex items-center justify-between bg-white/3 border border-white/5 rounded-lg px-3 py-2">
                    <span className="text-[10px] text-gray-400 font-mono">{d.subject}</span>
                    <span className={`text-xs font-black font-mono ${d.rate >= 85 ? "text-emerald-400" : d.rate >= 75 ? "text-amber-400" : "text-red-400"}`}>{d.rate}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Attendance Heatmap */}
            <div className="glass-panel p-5 border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-accent" /> Attendance Heatmap
                </h3>
                <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-wider text-gray-500">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500/80 inline-block" /> Present</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-500/80 inline-block" /> Absent</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-500/80 inline-block" /> Excused</span>
                </div>
              </div>

              {/* Day labels */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <div key={i} className="text-center text-[9px] text-gray-600 font-bold font-mono">{d}</div>
                ))}
              </div>

              {/* Heatmap grid */}
              <div className="grid grid-cols-7 gap-1">
                {heatmapDays.map((day, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-md transition-all cursor-pointer hover:scale-110 hover:z-10 relative group ${getStatusBg(day.status)}`}
                    title={`${day.month}: ${day.status}`}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-20 hidden group-hover:block pointer-events-none">
                      <div className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-[9px] text-white font-mono whitespace-nowrap shadow-xl">
                        {day.month} · {day.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Month labels */}
              <div className="flex justify-between text-[9px] text-gray-600 font-mono mt-1">
                <span>Apr 27</span>
                <span>May 2026</span>
                <span>Jun 6</span>
              </div>
            </div>

            {/* Quick Export */}
            <div className="glass-panel p-5 border-white/5 space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Download className="h-4 w-4 text-gray-400" /> Export Records
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Download CSV", icon: <FileText className="h-3.5 w-3.5" />, onClick: () => alert("Export initiated (Demo mode — connect backend for real data export)") },
                  { label: "Print Report", icon: <Cpu className="h-3.5 w-3.5" />, onClick: () => window.print() },
                ].map((btn, i) => (
                  <button
                    key={i}
                    onClick={btn.onClick}
                    className="flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/20 rounded-xl text-[10px] font-bold text-gray-300 hover:text-white transition-all btn-elastic"
                  >
                    {btn.icon} {btn.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ===== BOTTOM: SUBJECT-WISE BAR COMPARISON ===== */}
        <div className="glass-panel p-6 border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-secondary" /> Attendance Comparison
            </h2>
            <span className="text-[10px] text-gray-500 font-mono uppercase">All Subjects · Current Semester</span>
          </div>

          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={subjectDetails.map(s => ({ name: s.code, rate: s.rate, fill: s.color }))}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "#6b7280" }} axisLine={false} tickLine={false} width={25} />
              <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
                <div className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs shadow-2xl">
                  <p className="text-gray-400 font-mono">{label}</p>
                  <p className="text-white font-bold">{payload[0].value}%</p>
                  <p className="text-[9px] text-gray-500">Threshold: 75%</p>
                </div>
              ) : null} />
              <Bar dataKey="rate" radius={[6, 6, 0, 0]} maxBarSize={64}>
                {subjectDetails.map((s, i) => (
                  <Cell key={`cell-${i}`} fill={s.color} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Per-bar status labels */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {subjectDetails.map(sub => {
              const colors = getStatusColor(sub.status);
              return (
                <div
                  key={sub.code}
                  className={`p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${colors.bg} ${colors.border}`}
                  onClick={() => setActiveSubject(sub.code === activeSubject ? null : sub.code)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-mono font-bold" style={{ color: sub.color }}>{sub.code}</span>
                    <span className={`text-[8px] font-bold uppercase ${colors.text}`}>{sub.status}</span>
                  </div>
                  <span className={`text-lg font-black font-mono ${colors.text}`}>{sub.rate}%</span>
                  <p className="text-[9px] text-gray-500 font-mono mt-0.5 truncate">{sub.name}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== BOTTOM: ACHIEVEMENT ALERTS ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: <Flame className="h-5 w-5 text-orange-400" />,
              title: "Attendance Streak",
              value: "7 Days",
              sub: "Consecutive days present",
              color: "border-orange-500/20 bg-orange-500/5"
            },
            {
              icon: <Award className="h-5 w-5 text-yellow-400" />,
              title: "Best Subject",
              value: "CS-404",
              sub: "Software Engineering — 92%",
              color: "border-yellow-500/20 bg-yellow-500/5"
            },
            {
              icon: <Target className="h-5 w-5 text-red-400" />,
              title: "Most At-Risk",
              value: "CS-402",
              sub: "DSA — 64% (needs +3 classes)",
              color: "border-red-500/20 bg-red-500/5"
            },
          ].map((card, i) => (
            <div key={i} className={`glass-panel p-4 border ${card.color} flex items-center gap-4`}>
              <div className="p-2.5 bg-white/5 rounded-xl">
                {card.icon}
              </div>
              <div>
                <p className="text-[9px] text-gray-500 font-mono uppercase font-bold tracking-widest">{card.title}</p>
                <p className="text-base font-black text-white font-mono">{card.value}</p>
                <p className="text-[10px] text-gray-400">{card.sub}</p>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
