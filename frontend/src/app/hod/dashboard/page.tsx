"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import ThemeToggle from "@/components/ThemeToggle";
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  BookOpen, 
  CheckSquare, 
  Settings, 
  ChevronRight,
  Shield,
  FileSpreadsheet
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from "recharts";

const complianceData = [
  { name: "CS-301", rate: 85, fill: "#8b5cf6" },
  { name: "CS-302", rate: 74, fill: "#06b6d4" },
  { name: "CS-401", rate: 88, fill: "#10b981" },
  { name: "CS-402", rate: 64, fill: "#ef4444" },
  { name: "CS-403", rate: 76, fill: "#8b5cf6" },
];

export default function HODDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const [atRiskCount] = useState(14);
  const [deptCompliance] = useState(78);

  const [atRiskList] = useState([
    { id: "std-1", name: "Devon Miller", email: "devon.m@campus.edu", rate: 64, lectures: "16/25" },
    { id: "std-2", name: "Marcus Vance", email: "marcus.v@campus.edu", rate: 58, lectures: "14/25" },
    { id: "std-3", name: "Sara Jenkins", email: "sara.j@campus.edu", rate: 71, lectures: "17/25" },
  ]);

  const [facultyLogs] = useState([
    { id: "fac-1", name: "Dr. Priya Sharma", subject: "CS-301 (Sec A)", status: "COMPLETED", time: "09:00 - 10:30 AM", marked: 39 },
    { id: "fac-2", name: "Prof. Amit Verma", subject: "CS-402 (Sec B)", status: "ONGOING", time: "11:00 - 12:30 PM", marked: 28 },
    { id: "fac-3", name: "Dr. K. R. Rao", subject: "CS-401 (Sec A)", status: "SCHEDULED", time: "02:00 - 03:30 PM", marked: 0 },
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full relative">
      {/* Background gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.06)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_60%)] pointer-events-none" />

      {/* Header Panel */}
      <header className="sticky top-0 z-30 -mx-4 md:-mx-8 px-6 py-4 border-b border-primary/10 bg-slate-950/40 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/")}
            className="glass-panel p-2.5 text-gray-400 hover:text-white transition-all hover:scale-105 border border-white/5 bg-white/2 cursor-pointer btn-elastic"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <span className="text-xl font-black uppercase tracking-wider text-white flex items-center gap-1.5 font-mono">
              SCAAS <span className="bg-primary/20 text-primary-glow text-xs px-2.5 py-0.5 rounded-full font-bold border border-primary/30">HOD</span>
            </span>
            <p className="text-[10px] text-gray-400 font-mono font-bold tracking-widest uppercase">Computer Science & Engineering Department</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={() => router.push("/profile")}
            className="glass-panel p-2 text-[10px] font-mono font-extrabold uppercase text-gray-400 hover:text-white transition-all flex items-center gap-1.5 hover:scale-105 cursor-pointer btn-elastic border border-white/5"
            title="Profile Settings"
          >
            <Settings className="h-4 w-4" /> Profile
          </button>
          <button
            onClick={() => { logout(); router.push("/login"); }}
            className="bg-red-500/10 border border-red-500/25 hover:bg-red-500/25 text-red-400 text-[10px] font-mono font-extrabold uppercase px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all btn-elastic cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Grid content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full z-10 relative">
        
        {/* Left Side: Summary and Charts */}
        <div className="lg:col-span-8 space-y-6 w-full">
          
          {/* Metrics summary grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="perspective-card glass-panel p-5 flex flex-col justify-between border-white/5 bg-white/2 shadow-lg">
              <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-gray-500 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-primary" /> Active Cohort
              </span>
              <div className="flex items-baseline gap-2 mt-3">
                <span className="text-3xl font-black text-white font-mono">420</span>
                <span className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-wider">Students</span>
              </div>
            </div>
            
            <div className="perspective-card glass-panel p-5 flex flex-col justify-between border-red-500/25 bg-red-500/5 shadow-lg">
              <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-red-400 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-red-400 animate-pulse" /> Low-Compliance
              </span>
              <div className="flex items-baseline gap-2 mt-3">
                <span className="text-3xl font-black text-red-400 font-mono">{atRiskCount}</span>
                <span className="text-[10px] text-red-300 font-mono font-bold uppercase tracking-wider">&lt; 75% rate</span>
              </div>
            </div>

            <div className="perspective-card glass-panel p-5 flex flex-col justify-between border-accent/20 bg-accent/5 shadow-lg">
              <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-accent flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-accent" /> Dept. average
              </span>
              <div className="flex items-baseline gap-2 mt-3">
                <span className="text-3xl font-black text-accent font-mono text-shadow-glow">{deptCompliance}%</span>
                <span className="text-[10px] text-accent/75 font-mono font-bold uppercase tracking-wider">Attendance Index</span>
              </div>
            </div>
          </div>

          {/* Department wide compliance Recharts Bar chart */}
          <div className="glass-panel p-6 border-primary/15 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent blur-md pointer-events-none" />
            <div className="flex justify-between items-center mb-6 relative">
              <div>
                <h3 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
                  Course Compliance Audits <BookOpen className="h-4.5 w-4.5 text-primary" />
                </h3>
                <p className="text-xs text-gray-400">Aggregated student attendance metrics by subject code.</p>
              </div>
              <button className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-primary hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer">
                <FileSpreadsheet className="h-4 w-4" /> Download Report
              </button>
            </div>

            <div className="h-56 w-full flex items-center justify-center relative">
              {complianceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={complianceData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#4b5563" fontSize={9} tickLine={false} />
                    <YAxis stroke="#4b5563" fontSize={9} tickLine={false} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(13, 10, 24, 0.95)",
                        border: "1px solid rgba(139, 92, 246, 0.2)",
                        borderRadius: "12px",
                        fontSize: "10px",
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="rate" radius={[6, 6, 0, 0]} maxBarSize={36}>
                      {complianceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <span className="text-xs text-gray-500 font-mono">Loading matrix charts...</span>
              )}
            </div>
          </div>

          {/* Faculty lectures logs registry */}
          <div className="glass-panel p-6 border-white/5 shadow-2xl relative overflow-hidden">
            <h3 className="text-base font-black uppercase tracking-wider text-white mb-4.5 flex items-center gap-2">
              Faculty Lecture Registers <CheckSquare className="h-4.5 w-4.5 text-secondary animate-pulse" />
            </h3>
            
            <div className="overflow-x-auto relative">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/5 text-gray-500 font-extrabold uppercase tracking-widest text-[9px] pb-2">
                    <th className="py-2.5">INSTRUCTOR</th>
                    <th className="py-2.5">COURSE SECTION</th>
                    <th className="py-2.5">SCHEDULE</th>
                    <th className="py-2.5">STUDENTS LOGGED</th>
                    <th className="py-2.5 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[11px]">
                  {facultyLogs.map((log) => (
                    <tr key={log.id} className="text-gray-300 hover:bg-white/5 transition-colors">
                      <td className="py-3 font-extrabold text-white">{log.name}</td>
                      <td className="py-3 text-gray-400 font-semibold">{log.subject}</td>
                      <td className="py-3 text-gray-500">{log.time}</td>
                      <td className="py-3 font-bold text-white">{log.marked > 0 ? `${log.marked} present` : "-"}</td>
                      <td className="py-3 text-right">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[9px] font-extrabold uppercase border ${
                          log.status === "COMPLETED" 
                            ? "bg-accent/15 text-accent border-accent/20" 
                            : log.status === "ONGOING" 
                            ? "bg-primary/15 text-primary border-primary/25 animate-pulse" 
                            : "bg-white/5 text-gray-400 border-white/10"
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Side: At-risk alert panel */}
        <div className="lg:col-span-4 space-y-6 w-full">
          <div className="glass-panel p-6 border-red-500/25 bg-red-500/2 shadow-2xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-red-500/5 to-transparent blur-md" />
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5 text-red-400 animate-pulse" /> Risk warnings queue
              </h3>
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mt-1 leading-normal">LOW COMPLIANCE THRESHOLD DISPATCH</p>
            </div>

            <div className="space-y-3.5 pt-2">
              {atRiskList.map((std) => (
                <div key={std.id} className="p-4 rounded-xl border border-red-500/15 bg-slate-950/20 flex flex-col justify-between gap-3 hover:border-red-500/25 transition-all panel-interactive">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-white tracking-wide uppercase">{std.name}</h4>
                      <span className="text-[9px] text-gray-500 font-mono mt-0.5 block">{std.email}</span>
                    </div>
                    <span className="text-xs font-mono font-black text-red-400 text-shadow-glow">{std.rate}%</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase tracking-wider border-t border-white/5 pt-2 mt-1">
                    <span className="text-gray-500">Classes: {std.lectures}</span>
                    <button className="text-[9px] font-extrabold uppercase tracking-widest text-red-400 hover:text-white flex items-center gap-0.5 cursor-pointer btn-elastic">
                      Issue Alert <ChevronRight className="h-3.5 w-3.5 text-cyan-glow" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick info support desk */}
          <div className="glass-panel p-5 border-white/5 space-y-2 text-xs relative overflow-hidden">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 flex items-center gap-1.5 font-mono">
              <Shield className="h-3.5 w-3.5 text-secondary" /> HOD advisory Board
            </span>
            <p className="text-gray-400 leading-relaxed text-[11px] font-mono">
              You have system level authority to approve retroactive leaves for college events, suspend students, and download complete semester CSV registries.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
