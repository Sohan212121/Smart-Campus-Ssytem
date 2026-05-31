"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import ThemeToggle from "@/components/ThemeToggle";
import { 
  ArrowLeft, 
  Briefcase, 
  Users, 
  Building2, 
  TrendingUp, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ChevronRight, 
  Settings, 
  FileText,
  Calendar,
  Sparkles,
  Shield
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";

// Mock placement data for charts
const recruitmentTrends = [
  { name: "Jan", companies: 4, offers: 12 },
  { name: "Feb", companies: 8, offers: 25 },
  { name: "Mar", companies: 15, offers: 48 },
  { name: "Apr", companies: 12, offers: 35 },
  { name: "May", companies: 18, offers: 54 },
];

export default function PlacementOfficerDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  // Filter States
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [attendanceFilter, setAttendanceFilter] = useState(75);
  const [searchQuery, setSearchQuery] = useState("");

  // New Interview Prep Schedule Form States
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [newDrive, setNewDrive] = useState({
    company: "",
    topic: "Technical Assessment",
    date: "",
    time: "",
    targetDept: "CSE",
  });

  // Mock list of recruiting drives
  const [drives, setDrives] = useState([
    { id: "drv-1", company: "Google", role: "Software Engineering Intern", package: "12 LPA", date: "May 28, 2026", criteria: "CGPA > 8.0 & Attendance > 75%", status: "UPCOMING", registered: 45 },
    { id: "drv-2", company: "Microsoft", role: "Support Engineer", package: "9.5 LPA", date: "June 03, 2026", criteria: "CGPA > 7.0 & Attendance > 75%", status: "UPCOMING", registered: 32 },
    { id: "drv-3", company: "Accenture", role: "Associate Software Engineer", package: "4.5 LPA", date: "May 20, 2026", criteria: "CGPA > 6.0 & Attendance > 70%", status: "COMPLETED", registered: 110 },
    { id: "drv-4", company: "Amazon", role: "Cloud Support Associate", package: "8 LPA", date: "June 10, 2026", criteria: "CGPA > 7.5 & Attendance > 75%", status: "UPCOMING", registered: 18 },
  ]);

  // Mock list of students for eligibility audit
  const [students, setStudents] = useState([
    { id: "std-101", name: "Sohan kumar kj", roll: "CS-2026-44", dept: "CSE", sem: 6, cgpa: 8.4, attendance: 80 },
    { id: "std-102", name: "Chloe Bennett", roll: "CS-2026-12", dept: "CSE", sem: 6, cgpa: 7.9, attendance: 76 },
    { id: "std-103", name: "Devon Miller", roll: "CS-2026-19", dept: "CSE", sem: 6, cgpa: 6.8, attendance: 64 },
    { id: "std-104", name: "Elena Rostova", roll: "EE-2026-05", dept: "EE", sem: 6, cgpa: 9.1, attendance: 85 },
    { id: "std-105", name: "Marcus Vance", roll: "EE-2026-14", dept: "EE", sem: 6, cgpa: 7.2, attendance: 58 },
    { id: "std-106", name: "Sara Jenkins", roll: "PHYS-2026-02", dept: "PHYS", sem: 6, cgpa: 8.7, attendance: 71 },
    { id: "std-107", name: "Rohan Gupta", roll: "CS-2026-30", dept: "CSE", sem: 6, cgpa: 8.9, attendance: 92 },
  ]);

  // Mock list of scheduled preparation sessions
  const [prepSessions, setPrepSessions] = useState([
    { id: "prep-1", company: "Google Prep", topic: "DS & Algo Bootcamp", date: "May 26, 2026", time: "10:00 AM", targetDept: "CSE" },
    { id: "prep-2", company: "General Drives", topic: "HR Interview & Resume Review", date: "May 27, 2026", time: "02:00 PM", targetDept: "ALL" },
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Handle scheduling a new drive prep session
  const handleSchedulePrep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDrive.company || !newDrive.date || !newDrive.time) {
      alert("Please fill in all scheduling fields.");
      return;
    }
    const newSession = {
      id: `prep-${Date.now()}`,
      company: newDrive.company,
      topic: newDrive.topic,
      date: newDrive.date,
      time: newDrive.time,
      targetDept: newDrive.targetDept,
    };
    setPrepSessions([newSession, ...prepSessions]);
    setShowScheduleForm(false);
    setNewDrive({
      company: "",
      topic: "Technical Assessment",
      date: "",
      time: "",
      targetDept: "CSE",
    });
  };

  // Filter students based on current filters
  const filteredStudents = students.filter((s) => {
    const matchesDept = deptFilter === "ALL" || s.dept === deptFilter;
    const matchesAttendance = s.attendance >= attendanceFilter;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.roll.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesAttendance && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-x-hidden">
      {/* Background gradients and matrix overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.12)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.08)_0%,transparent_40%)] pointer-events-none" />
      <div className="cyber-grid-backdrop" />
      
      {/* Top horizontal scanning scanline */}
      <div className="scanline" />

      {/* Header Panel */}
      <header className="sticky top-0 z-30 -mx-4 md:-mx-8 px-6 py-4 border-b border-white/[0.08] bg-slate-950/40 backdrop-blur-xl glow-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/")}
            className="glass-panel p-2.5 text-gray-400 hover:text-white transition-all hover:scale-110 active:scale-95 bg-white/5 border-white/10 hover:border-primary/40 flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              SCAAS <span className="bg-primary/20 text-primary-glow text-xs px-2.5 py-0.5 rounded-full font-bold border border-primary/45 uppercase tracking-widest text-[9px] neon-text-purple">Placements</span>
            </span>
            <p className="text-[10px] text-gray-400 font-mono tracking-wider uppercase mt-0.5">Recruiting & Eligibility Command Portal</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={() => router.push("/profile")}
            className="glass-panel px-3 py-2 text-xs text-gray-300 hover:text-white transition-all flex items-center gap-1.5 hover:scale-105 hover:border-primary/40 bg-white/5 border-white/10 cursor-pointer"
            title="Profile Settings"
          >
            <Settings className="h-3.5 w-3.5 text-primary" /> Profile
          </button>
          <button
            onClick={() => { logout(); router.push("/login"); }}
            className="bg-red-500/10 border border-red-500/30 hover:bg-red-500/25 text-red-400 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all btn-elastic cursor-pointer shadow-lg shadow-red-500/5 hover:shadow-red-500/20"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Grid content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full z-10">
        
        {/* Left Side: Summary and Charts */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Metrics Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Metric 1: Placed Students */}
            <div className="glass-panel p-5 flex flex-col justify-between border-white/[0.06] bg-white/[0.03] perspective-card shimmer-effect relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Briefcase className="h-3.5 w-3.5 text-primary-glow" />
                  </span>
                  Placed Students
                </span>
                <span className="text-[10px] text-accent font-bold bg-accent/15 border border-accent/30 px-2 py-0.5 rounded-full neon-text-emerald">
                  77% Rate
                </span>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-white tracking-tight">154<span className="text-gray-500 text-lg font-medium">/200</span></span>
                <div className="w-full bg-white/5 rounded-full h-1.5 mt-3 border border-white/5">
                  <div className="bg-gradient-to-r from-primary to-secondary h-full rounded-full" style={{ width: "77%" }}></div>
                </div>
              </div>
            </div>
            
            {/* Metric 2: Active Drives */}
            <div className="glass-panel p-5 flex flex-col justify-between border-white/[0.06] bg-white/[0.03] perspective-card shimmer-effect relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                    <Building2 className="h-3.5 w-3.5 text-secondary-glow" />
                  </span>
                  Active Drives
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                </span>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-white tracking-tight neon-text-cyan">12 Ongoing</span>
                <p className="text-[10px] text-gray-500 font-mono mt-2.5 uppercase">Visiting corporate partners this month</p>
              </div>
            </div>

            {/* Metric 3: Eligible Cohort */}
            <div className="glass-panel p-5 flex flex-col justify-between border-primary/25 bg-primary/[0.04] perspective-card shimmer-effect relative overflow-hidden glow-border">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest text-primary-glow flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-accent/15 border border-accent/20 flex items-center justify-center">
                    <Users className="h-3.5 w-3.5 text-accent" />
                  </span>
                  Eligible Cohort
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-white tracking-tight neon-text-emerald">
                  {students.filter(s => s.attendance >= 75).length}
                </span>
                <p className="text-[10px] text-gray-400 font-mono mt-2.5 uppercase">Students above 75% Attendance</p>
              </div>
            </div>
          </div>

          {/* Placement Drive Trends Chart */}
          <div className="glass-panel p-6 border-white/[0.06] bg-white/[0.02] panel-interactive relative overflow-hidden">
            {/* Ambient inner card glow */}
            <div className="absolute -top-12 -left-12 w-36 h-36 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Recruitment Analytics & Trend HUD <TrendingUp className="h-4.5 w-4.5 text-primary" />
                </h3>
                <p className="text-xs text-gray-400">Visiting recruiters vs total generated placement offers per month</p>
              </div>
              <span className="text-[10px] uppercase font-bold font-mono tracking-widest text-primary-glow bg-primary/15 border border-primary/25 px-2.5 py-1 rounded-lg flex items-center gap-1.5 animate-pulse-glow">
                <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" /> Batch of 2026 Summary
              </span>
            </div>

            <div className="h-60 w-full flex items-center justify-center pr-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={recruitmentTrends} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="primaryGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.85}/>
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.15}/>
                    </linearGradient>
                    <linearGradient id="secondaryGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.85}/>
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.15}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{
                      backgroundColor: "rgba(10, 7, 20, 0.95)",
                      border: "1px solid rgba(139, 92, 246, 0.25)",
                      borderRadius: "12px",
                      fontSize: "11px",
                      color: "#fff",
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)"
                    }}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }} />
                  <Bar name="Companies Visited" dataKey="companies" fill="url(#primaryGlow)" radius={[4, 4, 0, 0]} stroke="#8b5cf6" strokeWidth={1} />
                  <Bar name="Offers Released" dataKey="offers" fill="url(#secondaryGlow)" radius={[4, 4, 0, 0]} stroke="#10b981" strokeWidth={1} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Student Placement Eligibility Roster with Filters */}
          <div className="glass-panel p-6 border-white/[0.06] bg-white/[0.02] panel-interactive space-y-6 relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Student Eligibility Registry <FileText className="h-4.5 w-4.5 text-secondary-glow" />
                </h3>
                <p className="text-xs text-gray-400">Filter students dynamically by attendance thresholds and academic parameters.</p>
              </div>

              {/* Action */}
              <button 
                onClick={() => {
                  const blob = new Blob([JSON.stringify(filteredStudents, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `eligible-students-${deptFilter}-attr-${attendanceFilter}.json`;
                  a.click();
                }}
                className="bg-accent hover:bg-accent/80 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-accent/20 flex items-center justify-center gap-2 btn-elastic cursor-pointer"
              >
                Export Eligibility Ledger
              </button>
            </div>

            {/* Filter Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/50 p-4 rounded-xl border border-white/[0.05] text-xs">
              <div className="space-y-2">
                <label className="text-[9px] uppercase font-bold tracking-widest text-gray-400 block font-mono">Department Filter</label>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                  <select 
                    value={deptFilter} 
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-white outline-none cursor-pointer focus:border-primary/50 transition-all font-mono"
                  >
                    <option value="ALL">All Departments</option>
                    <option value="CSE">Computer Science (CSE)</option>
                    <option value="EE">Electrical (EE)</option>
                    <option value="PHYS">Applied Physics (PHYS)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] uppercase font-bold tracking-widest text-gray-400 block font-mono">Min. Attendance</label>
                  <span className="text-[10px] font-bold text-accent font-mono">{attendanceFilter}%</span>
                </div>
                <div className="pt-2">
                  <input 
                    type="range" 
                    min="50" 
                    max="90" 
                    step="5"
                    value={attendanceFilter} 
                    onChange={(e) => setAttendanceFilter(Number(e.target.value))}
                    className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] uppercase font-bold tracking-widest text-gray-400 block font-mono">Search Student Ledger</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Enter Student Name or Roll..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-white outline-none focus:border-primary/50 transition-all placeholder:text-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Roster Table */}
            <div className="overflow-x-auto rounded-xl border border-white/[0.05] bg-slate-950/20">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.05] text-gray-400 font-bold uppercase tracking-wider text-[9px] font-mono bg-slate-950/30">
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Roll Number</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4 text-center">CGPA</th>
                    <th className="py-3 px-4 text-center">Attendance</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredStudents.map((std) => {
                    const isEligible = std.attendance >= 75 && std.cgpa >= 7.0;
                    return (
                      <tr key={std.id} className="text-gray-300 hover:bg-white/[0.04] transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-white">{std.name}</td>
                        <td className="py-3.5 px-4 font-mono text-gray-400">{std.roll}</td>
                        <td className="py-3.5 px-4"><span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] font-mono">{std.dept}</span></td>
                        <td className="py-3.5 px-4 text-center font-bold text-white">{std.cgpa}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`font-bold ${std.attendance >= 75 ? 'text-accent' : 'text-red-400'}`}>
                            {std.attendance}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                            isEligible 
                              ? "bg-accent/15 text-accent border border-accent/25" 
                              : "bg-red-500/15 text-red-400 border border-red-500/25"
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${isEligible ? 'bg-accent' : 'bg-red-500'}`} />
                            {isEligible ? "Eligible" : "Ineligible"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500 font-mono text-[11px]">
                        No cohort matched the selected diagnostic filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Recruitment Drives & Interview Scheduler */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Scheduling Panel */}
          <div className="glass-panel p-6 border-primary/25 bg-primary/[0.02] relative overflow-hidden glow-border">
            {/* Sonar sweep overlay inside form card */}
            <div className="absolute inset-0 opacity-15 pointer-events-none radar-grid" />
            
            <div className="flex justify-between items-center relative z-10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary-glow" /> Prep Session Scheduler
              </h3>
              {!showScheduleForm && (
                <button 
                  onClick={() => setShowScheduleForm(true)}
                  className="bg-primary/20 hover:bg-primary/30 border border-primary/30 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all btn-elastic cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Schedule Drive
                </button>
              )}
            </div>

            {showScheduleForm ? (
              <form onSubmit={handleSchedulePrep} className="space-y-4 text-xs animate-fade-in relative z-10 pt-2">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-gray-400 block font-mono">Company Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Google, Microsoft, Amazon" 
                    value={newDrive.company}
                    onChange={(e) => setNewDrive({ ...newDrive, company: e.target.value })}
                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl py-2 px-3 text-white outline-none focus:border-primary/50 transition-all font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-gray-400 block font-mono">Preparation Focus Topic</label>
                  <select 
                    value={newDrive.topic}
                    onChange={(e) => setNewDrive({ ...newDrive, topic: e.target.value })}
                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl py-2 px-3 text-white outline-none cursor-pointer focus:border-primary/50 transition-all font-mono"
                  >
                    <option value="Technical Assessment">Technical Assessment</option>
                    <option value="Mock Coding Round">Mock Coding Round</option>
                    <option value="System Design Session">System Design Session</option>
                    <option value="HR Interview Prep">HR Interview Prep</option>
                    <option value="Resume Review Clinic">Resume Review Clinic</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-gray-400 block font-mono">Target Date</label>
                    <input 
                      type="date" 
                      value={newDrive.date}
                      onChange={(e) => setNewDrive({ ...newDrive, date: e.target.value })}
                      className="w-full bg-slate-900/80 border border-white/10 rounded-xl py-2 px-3 text-white outline-none focus:border-primary/50 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-gray-400 block font-mono">Target Time</label>
                    <input 
                      type="time" 
                      value={newDrive.time}
                      onChange={(e) => setNewDrive({ ...newDrive, time: e.target.value })}
                      className="w-full bg-slate-900/80 border border-white/10 rounded-xl py-2 px-3 text-white outline-none focus:border-primary/50 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-gray-400 block font-mono">Target Department Cohort</label>
                  <select 
                    value={newDrive.targetDept}
                    onChange={(e) => setNewDrive({ ...newDrive, targetDept: e.target.value })}
                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl py-2 px-3 text-white outline-none cursor-pointer focus:border-primary/50 transition-all font-mono"
                  >
                    <option value="CSE">Computer Science (CSE)</option>
                    <option value="EE">Electrical Engineering (EE)</option>
                    <option value="PHYS">Applied Physics (PHYS)</option>
                    <option value="ALL">All Departments</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary/95 text-white font-bold py-2.5 rounded-xl transition-all btn-elastic shadow-lg shadow-primary/25 cursor-pointer"
                  >
                    Commit Session
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowScheduleForm(false)}
                    className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 pt-2 relative z-10">
                {prepSessions.map((session) => (
                  <div key={session.id} className="p-3 bg-white/[0.03] border border-white/[0.05] rounded-xl hover:border-primary/30 transition-all hover:bg-white/[0.05] group">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-primary-glow transition-colors">{session.company}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">{session.topic}</p>
                      </div>
                      <span className="text-[9px] bg-primary/10 border border-primary/20 px-2 py-0.5 rounded text-primary-glow font-bold font-mono">
                        {session.targetDept}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[9px] text-gray-500 mt-3 pt-2 border-t border-white/[0.04] font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-primary-glow" /> {session.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-primary-glow" /> {session.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Placement Drive Timelines */}
          <div className="glass-panel p-6 border-white/[0.06] bg-white/[0.02] space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-secondary-glow" /> Upcoming & Concluded Drives
              </h3>
              <p className="text-[11px] text-gray-400 mt-1">Real-time tracking of incoming corporate recruiters</p>
            </div>

            <div className="space-y-4 pt-1">
              {drives.map((drv) => (
                <div key={drv.id} className="p-4 rounded-xl border border-white/[0.05] bg-white/[0.02] flex flex-col justify-between gap-3.5 hover:border-white/15 transition-all relative overflow-hidden group">
                  {/* Subtle side-glow color coding based on status */}
                  <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                    drv.status === "UPCOMING" ? 'bg-secondary' : 'bg-gray-600'
                  }`} />
                  
                  <div className="flex justify-between items-start pl-1">
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight group-hover:text-secondary-glow transition-colors">{drv.company}</h4>
                      <span className="text-[10px] text-primary-glow font-semibold mt-0.5 block">{drv.role}</span>
                    </div>
                    <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      drv.status === "UPCOMING" 
                        ? "bg-secondary/10 text-secondary border-secondary/20 animate-pulse-glow" 
                        : "bg-white/5 text-gray-400 border-white/10"
                    }`}>
                      {drv.status}
                    </span>
                  </div>

                  <div className="text-[10px] space-y-1.5 bg-slate-950/60 p-2.5 rounded-lg border border-white/[0.05] font-mono">
                    <div className="flex justify-between text-gray-400">
                      <span>Package:</span>
                      <span className="font-bold text-white">{drv.package}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Date:</span>
                      <span className="text-white">{drv.date}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Cutoff:</span>
                      <span className="text-accent truncate max-w-[170px]" title={drv.criteria}>
                        {drv.criteria}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] pt-1 pl-1">
                    <span className="text-gray-500 font-mono">Cohort Size: {drv.registered}</span>
                    <button className="text-[9px] font-bold uppercase tracking-widest text-secondary-glow hover:text-white flex items-center gap-0.5 transition-colors cursor-pointer">
                      Manage Registry <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Administrative Policy Warnings */}
          <div className="glass-panel p-5 border-white/[0.06] bg-white/[0.02] space-y-2.5 text-xs relative overflow-hidden">
            {/* Warning flare */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-xl pointer-events-none" />
            
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 flex items-center gap-2 font-mono">
              <Shield className="h-3.5 w-3.5 text-yellow-500 animate-pulse" /> Placement Officer Advisory
            </span>
            <p className="text-gray-400 leading-relaxed text-[10px] font-mono">
              REAL-TIME SYNC PROTOCOL: Alterations in student academic profiles and attendance records take up to 24 hours to reconcile with the main placement register. Ensure eligibility lists are audited before issuing drive coordinates.
            </p>
          </div>

        </div>

      </main>
    </div>
  );
}
