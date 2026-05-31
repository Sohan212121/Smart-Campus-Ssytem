"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import ThemeToggle from "@/components/ThemeToggle";
import {
  ArrowLeft,
  Users,
  TrendingUp,
  AlertTriangle,
  Building,
  GraduationCap,
  Download,
  Search,
  Mail,
  TrendingDown,
  Activity,
  Calendar,
  Award,
  Compass,
  Sparkles,
  Cpu,
  Layers
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie
} from "recharts";

interface AtRiskStudent {
  id: string;
  name: string;
  email: string;
  complianceRate: number;
  totalLectures: number;
  attended: number;
}

interface DepartmentRate {
  name: string;
  code: string;
  complianceRate: number;
}

const fallbackDepts: DepartmentRate[] = [
  { name: "Computer Science & Eng", code: "CSE", complianceRate: 85 },
  { name: "Electrical Engineering", code: "EE", complianceRate: 74 },
  { name: "Mechanical Engineering", code: "ME", complianceRate: 68 },
  { name: "Physics Department", code: "PHY", complianceRate: 82 },
  { name: "Mathematics Department", code: "MATH", complianceRate: 91 },
  { name: "Chemistry Department", code: "CHEM", complianceRate: 79 },
];

const fallbackAtRisk: AtRiskStudent[] = [
  { id: "std-1", email: "devon.m@campus.edu", name: "Devon Miller", complianceRate: 64, totalLectures: 25, attended: 16 },
  { id: "std-2", email: "marcus.v@campus.edu", name: "Marcus Vance", complianceRate: 58, totalLectures: 25, attended: 14.5 },
  { id: "std-3", email: "sara.j@campus.edu", name: "Sara Jenkins", complianceRate: 71, totalLectures: 25, attended: 17.5 },
  { id: "std-4", email: "rahul.k@campus.edu", name: "Rahul Kapoor", complianceRate: 52, totalLectures: 25, attended: 13 },
  { id: "std-5", email: "emily.w@campus.edu", name: "Emily Watson", complianceRate: 69, totalLectures: 25, attended: 17.2 },
];

const monthlyTrendsData = [
  { month: "Jan", rate: 78, target: 80 },
  { month: "Feb", rate: 82, target: 80 },
  { month: "Mar", rate: 81, target: 80 },
  { month: "Apr", rate: 85, target: 80 },
  { month: "May", rate: 82, target: 80 },
];

const eventAttendanceData = [
  { name: "CodeCraft Hackathon", attendance: 92 },
  { name: "RoboWars", attendance: 88 },
  { name: "AI/ML Seminar", attendance: 95 },
  { name: "Math Olympiad", attendance: 76 },
  { name: "Physics Workshop", attendance: 81 },
];

const engagementData = [
  { name: "Dynamic QR Scanner", value: 58, fill: "#8b5cf6" },
  { name: "GPS Geofencing Lock", value: 32, fill: "#06b6d4" },
  { name: "Manual Verification", value: 10, fill: "#10b981" },
];

const defaultSystemLogs = [
  { id: "log-1", message: "Sohan kumar checked in successfully for CS-404 Section A via Dynamic QR.", time: "2 mins ago", type: "success" },
  { id: "log-2", message: "Dr. Priya Sharma launched a Dynamic QR session for Database Systems (sec-demo-2).", time: "5 mins ago", type: "info" },
  { id: "log-3", message: "Admin system generated warning notification for Devon Miller (64% compliance).", time: "15 mins ago", type: "warn" },
  { id: "log-4", message: "HOD Computer Science approved leave request for Devon Miller (MEDICAL).", time: "1 hour ago", type: "success" },
  { id: "log-5", message: "User Sohan kumar updated profile avatar photo successfully.", time: "2 hours ago", type: "info" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const [trends] = useState(monthlyTrendsData);
  const [eventData] = useState(eventAttendanceData);
  const [engagement] = useState(engagementData);
  const [systemLogs] = useState(defaultSystemLogs);
  
  // Hydration state check for Recharts safety in Next.js
  const [isMounted, setIsMounted] = useState(false);

  // States
  const [stats, setStats] = useState({
    totalStudents: 480,
    totalTeachers: 36,
    totalDepartments: 6,
    overallCompliance: 82,
    atRiskStudents: 14,
  });

  const [departments, setDepartments] = useState<DepartmentRate[]>(fallbackDepts);
  const [atRiskList, setAtRiskList] = useState<AtRiskStudent[]>(fallbackAtRisk);
  const [searchQuery, setSearchQuery] = useState("");

  // Enable chart rendering only after component mounts client-side
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Authentication check and redirect
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Fetch real database records if authenticated with a real JWT
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    if (user.token.startsWith("demo-jwt-token-")) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    const fetchAdminData = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${user.token}`,
        };

        const statsRes = await fetch(`${API_URL}/api/v1/analytics/overall`, { headers });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        const deptsRes = await fetch(`${API_URL}/api/v1/analytics/departments`, { headers });
        if (deptsRes.ok) {
          const deptsData = await deptsRes.json();
          setDepartments(deptsData.departments);
        }

        const atRiskRes = await fetch(`${API_URL}/api/v1/analytics/at-risk`, { headers });
        if (atRiskRes.ok) {
          const atRiskData = await atRiskRes.json();
          setAtRiskList(atRiskData.students);
        }
      } catch (err) {
        console.error("Failed to load admin dashboard data from API:", err);
      }
    };

    fetchAdminData();
  }, [isAuthenticated, user]);

  // Handle Search Filtering
  const filteredStudents = atRiskList.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Export CSV summary of audit data
  const handleExportAuditSummary = () => {
    const csvRows = [];
    
    // Header & Overall Stats
    csvRows.push("=== SMART CAMPUS ATTENDANCE AUDIT SUMMARY ===");
    csvRows.push(`Generated On,${new Date().toLocaleString()}`);
    csvRows.push(`Total Students,${stats.totalStudents}`);
    csvRows.push(`Active Faculty,${stats.totalTeachers}`);
    csvRows.push(`Total Departments,${stats.totalDepartments}`);
    csvRows.push(`Overall Compliance Rate,${stats.overallCompliance}%`);
    csvRows.push(`At-Risk Students Count,${stats.atRiskStudents}`);
    csvRows.push("");
    
    // Department compliance
    csvRows.push("=== DEPARTMENT PERFORMANCE ===");
    csvRows.push("Department Name,Code,Compliance Rate");
    departments.forEach((dept) => {
      csvRows.push(`"${dept.name}",${dept.code},${dept.complianceRate}%`);
    });
    csvRows.push("");
    
    // At-Risk list
    csvRows.push("=== AT-RISK STUDENTS (Below 75% Threshold) ===");
    csvRows.push("Student ID,Student Name,Email,Compliance Rate,Total Lectures,Attended Lectures");
    atRiskList.forEach((student) => {
      csvRows.push(`${student.id},"${student.name}",${student.email},${student.complianceRate}%,${student.totalLectures},${student.attended}`);
    });
    
    // Create Blob and trigger download
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `campus_audit_summary_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full relative">
      {/* Background gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.06)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_60%)] pointer-events-none" />

      {/* Roster Header */}
      <div className="sticky top-0 z-30 -mx-4 md:-mx-8 px-4 md:px-8 py-4 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/")}
            className="glass-panel p-2.5 text-gray-400 hover:text-white transition-all hover:scale-105 border border-white/5 bg-white/2 cursor-pointer btn-elastic"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-wider text-white font-mono flex items-center gap-2">
              Supervisor Control <Cpu className="h-5 w-5 text-secondary animate-pulse" />
            </h1>
            <p className="text-[10px] text-gray-400 font-mono font-bold tracking-widest uppercase">CAMPUS COMPLIANCE AUDITING CHASSIS</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button 
            onClick={handleExportAuditSummary}
            className="glow-border bg-slate-900 px-5 py-2.5 text-[10px] font-mono font-extrabold uppercase text-primary-glow border border-primary/20 shadow-md hover:bg-white/5 transition-all active:scale-95 cursor-pointer btn-elastic"
          >
            <Download className="h-4 w-4 text-cyan-glow animate-bounce" /> Export Summary
          </button>
          <button
            onClick={() => { logout(); router.push("/login"); }}
            className="bg-red-500/10 border border-red-500/25 hover:bg-red-500/25 text-red-400 text-[10px] font-mono font-extrabold uppercase px-4 py-2.5 rounded-none border border-red-500/30 transition-all btn-elastic cursor-pointer shadow-lg shadow-red-500/5 hover:shadow-red-500/20 font-bold"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Analytics Highlights Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 z-10 relative">
        <div className="perspective-card glass-panel p-5 flex items-center gap-4 border-white/10 bg-white/2 shadow-lg">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/25">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span className="text-2xl font-black text-white font-mono">{stats.totalStudents}</span>
            <p className="text-[9px] text-gray-500 uppercase tracking-widest font-extrabold font-mono mt-1 leading-none">Roster Nodes</p>
          </div>
        </div>

        <div className="perspective-card glass-panel p-5 flex items-center gap-4 border-white/10 bg-white/2 shadow-lg">
          <div className="p-3 bg-secondary/10 rounded-xl border border-secondary/25">
            <GraduationCap className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <span className="text-2xl font-black text-white font-mono">{stats.totalTeachers}</span>
            <p className="text-[9px] text-gray-500 uppercase tracking-widest font-extrabold font-mono mt-1 leading-none">Faculty Active</p>
          </div>
        </div>

        <div className="perspective-card glass-panel p-5 flex items-center gap-4 border-white/10 bg-white/2 shadow-lg">
          <div className="p-3 bg-accent/10 rounded-xl border border-accent/25">
            <TrendingUp className="h-5 w-5 text-accent" />
          </div>
          <div>
            <span className="text-2xl font-black text-accent font-mono text-shadow-glow">{stats.overallCompliance}%</span>
            <p className="text-[9px] text-gray-500 uppercase tracking-widest font-extrabold font-mono mt-1 leading-none">Global Index</p>
          </div>
        </div>

        <div className="perspective-card glass-panel p-5 flex items-center gap-4 border-red-500/20 bg-red-500/5 shadow-lg">
          <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/25">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <span className="text-2xl font-black text-red-400 font-mono">{stats.atRiskStudents}</span>
            <p className="text-[9px] text-gray-500 uppercase tracking-widest font-extrabold font-mono mt-1 leading-none">Low-Compliance</p>
          </div>
        </div>
      </div>

      {/* AI Campus Intelligence Panel */}
      <div className="glass-panel p-6 border-white/15 bg-gradient-to-br from-primary/10 via-slate-900/40 to-slate-900/60 space-y-5 shadow-2xl relative overflow-hidden z-10">
        <div className="absolute -top-20 -left-20 w-44 h-44 rounded-full bg-primary/10 blur-[80px] pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-44 h-44 rounded-full bg-accent/10 blur-[80px] pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2 uppercase tracking-wide">
              <Sparkles className="h-4.5 w-4.5 text-primary animate-pulse" /> AI supervisor audit Summary
            </h3>
            <p className="text-xs text-gray-400">Contextual natural-language summaries and predictive risk metrics.</p>
          </div>

          <span className="bg-primary/20 border border-primary/30 text-primary-glow text-[9px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider self-start sm:self-center">
            Predictive Model v1.2
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* AI natural language summary */}
          <div className="lg:col-span-6 bg-slate-950/40 border border-white/5 rounded-2xl p-4.5 space-y-3 relative overflow-hidden">
            <span className="text-[10px] uppercase font-bold tracking-widest text-primary flex items-center gap-1.5 font-mono">
              <Activity className="h-3.5 w-3.5 text-primary" /> Core health status
            </span>
            <p className="text-[11.5px] leading-relaxed text-gray-300">
              Today&apos;s overall campus compliance rate is stable at **{stats.overallCompliance}%** (Target: 80%). 
              Our linear forecasting models predict **{stats.atRiskStudents} students** are at-risk of falling below the 75% threshold within 2 weeks if their attendance trend velocities persist.
              The **Electrical Engineering (EE)** and **Mechanical Engineering (ME)** departments currently show negative trend curves, prompting recommended supervisor interventions.
            </p>
          </div>

          {/* Department risk heatmap */}
          <div className="lg:col-span-6 bg-slate-950/40 border border-white/5 rounded-2xl p-4.5 space-y-3 flex flex-col justify-between relative overflow-hidden">
            <span className="text-[10px] uppercase font-bold tracking-widest text-secondary flex items-center gap-1.5 font-mono">
              <Layers className="h-3.5 w-3.5 text-secondary" /> Risk Heatmap per Department
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono font-bold">
              <div className="p-2 border border-green-500/20 bg-green-500/5 rounded-xl text-center">
                <span className="text-[9px] text-gray-500 block uppercase">CSE</span>
                <span className="text-[10px] font-black text-green-400">96% SAFE</span>
              </div>
              <div className="p-2 border border-yellow-500/20 bg-yellow-500/5 rounded-xl text-center animate-pulse">
                <span className="text-[9px] text-gray-500 block uppercase">EE</span>
                <span className="text-[10px] font-black text-yellow-400">74% ALERT</span>
              </div>
              <div className="p-2 border border-red-500/20 bg-red-500/5 rounded-xl text-center">
                <span className="text-[9px] text-gray-500 block uppercase">ME</span>
                <span className="text-[10px] font-black text-red-400">68% WARN</span>
              </div>
              <div className="p-2 border border-green-500/20 bg-green-500/5 rounded-xl text-center">
                <span className="text-[9px] text-gray-500 block uppercase">MATH</span>
                <span className="text-[10px] font-black text-green-400">98% SAFE</span>
              </div>
              <div className="p-2 border border-green-500/20 bg-green-500/5 rounded-xl text-center">
                <span className="text-[9px] text-gray-500 block uppercase">PHY</span>
                <span className="text-[10px] font-black text-green-400">85% SAFE</span>
              </div>
              <div className="p-2 border border-yellow-500/20 bg-yellow-500/5 rounded-xl text-center animate-pulse">
                <span className="text-[9px] text-gray-500 block uppercase">CHEM</span>
                <span className="text-[10px] font-black text-yellow-400">79% ALERT</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main visual charting and table listing grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 z-10 relative w-full">
        
        {/* Left Side: Department-wise Compliance Comparison (Recharts) */}
        <div className="lg:col-span-7 glass-panel p-6 border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent blur-md" />
          <div>
            <h3 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" /> Compliance Index per Dept
            </h3>
            <p className="text-xs text-gray-400">Comparing average attendance rates across divisions</p>
          </div>

          <div className="h-72 w-full flex items-center justify-center relative">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departments} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="code" 
                    stroke="#4b5563" 
                    fontSize={9} 
                    tickLine={false} 
                  />
                  <YAxis 
                    stroke="#4b5563" 
                    fontSize={9} 
                    tickLine={false} 
                    domain={[0, 100]} 
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(13, 10, 24, 0.95)",
                      border: "1px solid rgba(139, 92, 246, 0.2)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "10px",
                    }}
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  />
                  <Bar dataKey="complianceRate" radius={[6, 6, 0, 0]}>
                    {departments.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.complianceRate < 75 ? "#f87171" : entry.complianceRate < 85 ? "#fbbf24" : "#10b981"} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-gray-500 font-mono">Loading charts...</span>
            )}
          </div>
        </div>

        {/* Right Side: Compliance target alerts & benchmarks */}
        <div className="lg:col-span-5 glass-panel p-6 border-white/10 space-y-4 shadow-2xl relative overflow-hidden">
          <h3 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
            Target Metrics benchmarks
          </h3>

          <div className="space-y-4 pt-2">
            <div className="p-3.5 bg-white/2 border border-white/5 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs font-mono font-bold uppercase">
                <span className="text-green-400">Safe Tier (75%+)</span>
                <span className="text-white">88% of sections</span>
              </div>
              <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-1.5 bg-green-500 rounded-full" style={{ width: "88%" }}></div>
              </div>
            </div>

            <div className="p-3.5 bg-white/2 border border-white/5 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs font-mono font-bold uppercase">
                <span className="text-red-400">Risk Tier (&lt;75%)</span>
                <span className="text-white">12% of sections</span>
              </div>
              <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-1.5 bg-red-500 rounded-full" style={{ width: "12%" }}></div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-dashed border-red-500/20 bg-red-500/5 space-y-2 mt-4 animate-pulse">
            <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase font-mono">
              <AlertTriangle className="h-4 w-4 shrink-0" /> Immediate Audit Triggered
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed font-mono">
              Average attendance in Electrical Engineering (EE) has dropped below the threshold warning parameter (74%). Automatically scheduling an administrative check.
            </p>
          </div>
        </div>
      </div>

      {/* Row 2: Campus-Wide Trends & Event Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 z-10 relative w-full">
        {/* Left Column: Monthly Trends Line Chart */}
        <div className="lg:col-span-7 glass-panel p-6 border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-secondary/5 to-transparent blur-md" />
          <div>
            <h3 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-secondary" /> Campus Monthly Trends
            </h3>
            <p className="text-xs text-gray-400">Monthly aggregate attendance compliance rates against target index</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center relative">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="month" stroke="#4b5563" fontSize={9} tickLine={false} />
                  <YAxis stroke="#4b5563" fontSize={9} tickLine={false} domain={[60, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(13, 10, 24, 0.95)",
                      border: "1px solid rgba(139, 92, 246, 0.2)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "10px",
                    }}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '9px', textTransform: 'uppercase', fontFamily: 'monospace' }} />
                  <Line name="Attendance Rate (%)" type="monotone" dataKey="rate" stroke="var(--secondary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line name="Regulatory Target (%)" type="monotone" dataKey="target" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-gray-500 font-mono">Loading monthly trends...</span>
            )}
          </div>
        </div>

        {/* Right Column: Event Attendance Analytics */}
        <div className="lg:col-span-5 glass-panel p-6 border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
          <div>
            <h3 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-accent animate-pulse" /> Event Attendance Analysis
            </h3>
            <p className="text-xs text-gray-400">Participation compliance and average attendance across campus events</p>
          </div>

          <div className="space-y-4 pt-2">
            {eventData.map((ev, idx) => (
              <div key={idx} className="p-3.5 bg-white/2 border border-white/5 rounded-xl space-y-2 panel-interactive">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-white uppercase tracking-wide">{ev.name}</span>
                  <span className="font-black text-accent font-mono">{ev.attendance}%</span>
                </div>
                <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-1.5 rounded-full bg-gradient-to-r from-primary to-accent shadow-lg shadow-accent/25" 
                    style={{ width: `${ev.attendance}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Student Engagement Metrics & System Activity Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 z-10 relative w-full">
        {/* Left Column: Student Engagement Metrics breakdown */}
        <div className="lg:col-span-5 glass-panel p-6 border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
          <div>
            <h3 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" /> Engagement Breakdown
            </h3>
            <p className="text-xs text-gray-400">Breakdown of student check-in types across all departments</p>
          </div>

          <div className="flex flex-col md:flex-row justify-around items-center gap-6 pt-2">
            {/* Recharts Pie Chart */}
            <div className="h-40 w-40 flex items-center justify-center shrink-0 relative">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(13, 10, 24, 0.95)",
                        border: "1px solid rgba(139, 92, 246, 0.2)",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "9px",
                      }}
                    />
                    <Pie
                      data={engagement}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {engagement.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <span className="text-xs text-gray-500 font-mono">Loading...</span>
              )}
            </div>

            {/* Labels and values details list */}
            <div className="space-y-3.5 w-full font-mono text-[11px] font-bold">
              {engagement.map((eng, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0 shadow" style={{ backgroundColor: eng.fill }}></div>
                    <span className="text-gray-400 uppercase">{eng.name}</span>
                  </div>
                  <span className="text-white text-secondary-glow">{eng.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: System Activity Monitor log panel */}
        <div className="lg:col-span-7 glass-panel p-6 border-white/10 space-y-4 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center relative">
            <div>
              <h3 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-secondary animate-pulse" /> System Logs HUD
              </h3>
              <p className="text-xs text-gray-400">Live operational events audit log</p>
            </div>
            <span className="bg-secondary/15 border border-secondary/25 text-secondary-glow text-[9px] font-mono font-extrabold px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
              Live Feed
            </span>
          </div>

          <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
            {systemLogs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-xl border border-white/5 bg-white/2 flex justify-between items-start gap-4 hover:bg-white/5 transition-all">
                <div className="flex items-start gap-2.5">
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    log.type === "success" 
                      ? "bg-accent shadow-md shadow-accent/40" 
                      : log.type === "warn" 
                      ? "bg-red-500 shadow-md shadow-red-500/40" 
                      : "bg-secondary shadow-md shadow-secondary/40"
                  }`}></span>
                  <p className="text-xs text-gray-300 leading-relaxed font-medium">{log.message}</p>
                </div>
                <span className="text-[9px] text-gray-500 font-mono font-bold shrink-0">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Flagged At-Risk Students list log */}
      <div className="glass-panel p-6 border-white/10 space-y-4 shadow-2xl relative overflow-hidden z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-400" /> Deficit Compliance Register
            </h3>
            <p className="text-xs text-gray-400">Auditing students below the regulatory 75% attendance threshold</p>
          </div>

          {/* Filtering panels */}
          <div className="flex items-center gap-3 w-full md:w-auto font-mono">
            <div className="relative flex-1 md:flex-initial">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/2 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-gray-600 outline-none focus:border-primary/50 transition-all w-full md:w-56"
              />
            </div>
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="text-center py-10 text-xs text-gray-500 font-mono uppercase tracking-widest">
            No at-risk students match search query parameters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 font-extrabold uppercase tracking-widest text-[9px] pb-2">
                  <th className="py-2.5">STUDENT NAME</th>
                  <th className="py-2.5">SIGNATURE EMAIL</th>
                  <th className="py-2.5">ATTENDED CLASSES</th>
                  <th className="py-2.5">INDEX RATE</th>
                  <th className="py-2.5 text-right">SYSTEM ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[11px]">
                {filteredStudents.map((student, idx) => (
                  <tr key={idx} className="text-gray-300 hover:bg-white/5 transition-colors">
                    <td className="py-3 font-extrabold text-white uppercase tracking-wider">{student.name}</td>
                    <td className="py-3 text-gray-500">{student.email}</td>
                    <td className="py-3 font-semibold text-gray-400">{student.attended} / {student.totalLectures} LECTURES</td>
                    <td className="py-3">
                      <span className="font-extrabold text-red-400 text-shadow-glow">{student.complianceRate}%</span>
                    </td>
                    <td className="py-3 text-right">
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 transition-all cursor-pointer btn-elastic uppercase">
                        <Mail className="h-3 w-3" /> email alert
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
