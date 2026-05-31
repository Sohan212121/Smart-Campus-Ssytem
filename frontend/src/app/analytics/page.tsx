"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import GlassNav from "@/components/ui/GlassNav";
import PageTransition from "@/components/ui/PageTransition";
import ScrollReveal from "@/components/ui/ScrollReveal";
import GlassCard from "@/components/ui/GlassCard";
import StatsCard from "@/components/ui/StatsCard";
import FloatingOrb from "@/components/ui/FloatingOrb";
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  TrendingUp, 
  Download, 
  ChevronDown, 
  Filter, 
  Activity,
  Award,
  Zap,
  Clock,
  BookOpen
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";

// Mock datasets for presentation
const weeklyTrends = [
  { name: "Week 1", attendance: 82, compliance: 80 },
  { name: "Week 2", attendance: 85, compliance: 82 },
  { name: "Week 3", attendance: 88, compliance: 84 },
  { name: "Week 4", attendance: 84, compliance: 85 },
  { name: "Week 5", attendance: 90, compliance: 88 },
  { name: "Week 6", attendance: 92, compliance: 90 },
];

const departmentData = [
  { name: "CSE", rate: 89 },
  { name: "ECE", rate: 81 },
  { name: "MECH", rate: 74 },
  { name: "CIVIL", rate: 68 },
  { name: "EEE", rate: 79 },
];

const statusDistribution = [
  { name: "Present", value: 80, color: "#10b981" },
  { name: "Late", value: 10, color: "#f5a623" },
  { name: "Absent", value: 7, color: "#ef4444" },
  { name: "Excused", value: 3, color: "#6366f1" },
];

const subjectPerformance = [
  { subject: "Mathematics", current: 88, target: 80 },
  { subject: "Algorithms", current: 64, target: 80 },
  { subject: "Networks", current: 76, target: 80 },
  { subject: "Software Eng", current: 92, target: 80 },
  { subject: "Databases", current: 85, target: 80 },
];

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const [selectedRange, setSelectedRange] = useState("Last 30 Days");
  const [isRangeDropdownOpen, setIsRangeDropdownOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleExport = () => {
    window.alert("Exporting analytics report as high-resolution PDF...");
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-x-hidden flex flex-col selection:bg-primary/30 selection:text-white">
      <GlassNav />
      <PageTransition className="flex-1 flex flex-col pt-24 pb-12">
        
        {/* Decorative Floating Orbs */}
        <FloatingOrb color="violet" size={350} top="-5%" left="-5%" delay={0} />
        <FloatingOrb color="cyan" size={400} bottom="-10%" right="-5%" delay={2} />

        {/* Core Container */}
        <div className="max-w-7xl w-full mx-auto px-6 sm:px-8 flex-1 space-y-8 z-10 relative">
          
          {/* Header Panel */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="inline-flex bg-primary/10 border border-primary/20 text-primary-glow px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest font-mono mb-2">
                ML Telemetry Core
              </div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white font-mono flex items-center gap-2">
                Performance Analytics <TrendingUp className="h-6 w-6 text-secondary animate-pulse" />
              </h1>
              <p className="text-[10px] text-gray-500 font-mono font-bold tracking-widest uppercase mt-0.5">
                {user ? `Role Channel: ${user.role} Context` : "Operational Overview"}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative shrink-0">
                <button 
                  onClick={() => setIsRangeDropdownOpen(!isRangeDropdownOpen)}
                  className="glass-panel px-4 py-2.5 text-xs text-gray-400 hover:text-white border border-white/5 hover:border-white/10 rounded-xl transition-all flex items-center gap-2 cursor-pointer bg-white/2"
                >
                  <Calendar className="h-4 w-4 text-cyan-400" />
                  {selectedRange}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {isRangeDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-950/90 border border-white/10 rounded-xl shadow-2xl p-1 z-20 backdrop-blur-xl animate-fade-in">
                    {["Today", "Last 7 Days", "Last 30 Days", "Current Semester"].map((range) => (
                      <button
                        key={range}
                        onClick={() => {
                          setSelectedRange(range);
                          setIsRangeDropdownOpen(false);
                        }}
                        className="w-full text-left text-xs text-gray-400 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={handleExport}
                className="glow-border bg-slate-900 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-lg hover:shadow-primary/20 flex items-center gap-2 btn-elastic shimmer-effect cursor-pointer"
              >
                Export Report <Download className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Metrics StatsCards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard icon={Users} label="Total Managed Candidates" value={1042} accentColor="violet" delay={0} />
            <StatsCard icon={CheckCircle} label="Average Compliance Index" value={86} suffix="%" accentColor="cyan" delay={1} />
            <StatsCard icon={Activity} label="Active Interactive Rooms" value={12} accentColor="emerald" delay={2} />
            <StatsCard icon={Clock} label="Average Lecture Duration" value={88} suffix="m" accentColor="amber" delay={3} />
          </div>

          {/* Charts Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 1. Area Chart: Weekly Attendance Trends */}
            <div className="lg:col-span-8">
              <ScrollReveal direction="up" delay={0.1}>
                <GlassCard className="p-6 h-[400px] flex flex-col justify-between border-white/5">
                  <div className="mb-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2 font-mono">
                      Weekly Compliance Progression <Activity className="h-4 w-4 text-cyan-400" />
                    </h3>
                    <p className="text-[10px] text-gray-500 font-mono font-bold uppercase mt-0.5">Staggered regression charting</p>
                  </div>
                  
                  <div className="flex-1 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weeklyTrends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#4b5563" fontSize={9} tickLine={false} />
                        <YAxis stroke="#4b5563" fontSize={9} tickLine={false} domain={[50, 100]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(9, 6, 20, 0.95)",
                            border: "1px solid rgba(139, 92, 246, 0.2)",
                            borderRadius: "12px",
                            color: "#fff",
                            fontSize: "10px",
                          }}
                        />
                        <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '9px', textTransform: 'uppercase', fontFamily: 'monospace' }} />
                        <Area type="monotone" name="Attendance (%)" dataKey="attendance" stroke="#06b6d4" fillOpacity={1} fill="url(#colorAtt)" strokeWidth={2} />
                        <Area type="monotone" name="Compliance Index" dataKey="compliance" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorComp)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>
              </ScrollReveal>
            </div>

            {/* 2. Pie Chart: Attendance Status Distribution */}
            <div className="lg:col-span-4">
              <ScrollReveal direction="up" delay={0.2}>
                <GlassCard className="p-6 h-[400px] flex flex-col justify-between border-white/5">
                  <div className="mb-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2 font-mono">
                      Roster Status Split <Zap className="h-4 w-4 text-yellow-400" />
                    </h3>
                    <p className="text-[10px] text-gray-500 font-mono font-bold uppercase mt-0.5">Telemetry segmentation</p>
                  </div>
                  
                  <div className="flex-1 w-full flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={statusDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(9, 6, 20, 0.95)",
                            border: "1px solid rgba(139, 92, 246, 0.2)",
                            borderRadius: "12px",
                            color: "#fff",
                            fontSize: "10px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    {/* Floating Center Count */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-6">
                      <span className="text-2xl font-black font-mono">80%</span>
                      <span className="text-[8px] text-gray-500 uppercase tracking-widest font-extrabold font-mono">Present</span>
                    </div>
                  </div>

                  {/* Legend labels */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono font-bold pt-4 border-t border-white/5">
                    {statusDistribution.map((entry, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                        <span className="text-gray-400 uppercase">{entry.name}:</span>
                        <span className="text-white">{entry.value}%</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </ScrollReveal>
            </div>

            {/* 3. Bar Chart: Department-wise Comparison */}
            <div className="lg:col-span-6">
              <ScrollReveal direction="up" delay={0.3}>
                <GlassCard className="p-6 h-[400px] flex flex-col justify-between border-white/5">
                  <div className="mb-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2 font-mono">
                      Departmental Compliance <BookOpen className="h-4 w-4 text-emerald-400" />
                    </h3>
                    <p className="text-[10px] text-gray-500 font-mono font-bold uppercase mt-0.5">Faculty Matrix comparison</p>
                  </div>
                  
                  <div className="flex-1 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <XAxis dataKey="name" stroke="#4b5563" fontSize={9} tickLine={false} />
                        <YAxis stroke="#4b5563" fontSize={9} tickLine={false} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(9, 6, 20, 0.95)",
                            border: "1px solid rgba(139, 92, 246, 0.2)",
                            borderRadius: "12px",
                            color: "#fff",
                            fontSize: "10px",
                          }}
                        />
                        <Bar name="Compliance Rate (%)" dataKey="rate" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                          {departmentData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.rate > 80 ? "#10b981" : entry.rate > 70 ? "#8b5cf6" : "#ef4444"} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>
              </ScrollReveal>
            </div>

            {/* 4. Radar Chart: Subject Performance */}
            <div className="lg:col-span-6">
              <ScrollReveal direction="up" delay={0.4}>
                <GlassCard className="p-6 h-[400px] flex flex-col justify-between border-white/5">
                  <div className="mb-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2 font-mono">
                      Subject Performance Vector <Award className="h-4 w-4 text-yellow-400 animate-pulse" />
                    </h3>
                    <p className="text-[10px] text-gray-500 font-mono font-bold uppercase mt-0.5">ML deflection matrix</p>
                  </div>
                  
                  <div className="flex-1 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={subjectPerformance}>
                        <PolarGrid stroke="#374151" />
                        <PolarAngleAxis dataKey="subject" stroke="#9ca3af" fontSize={8} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#4b5563" fontSize={7} />
                        <Radar name="Current Status" dataKey="current" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                        <Radar name="Institutional Target" dataKey="target" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.1} />
                        <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '8px', textTransform: 'uppercase', fontFamily: 'monospace' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(9, 6, 20, 0.95)",
                            border: "1px solid rgba(139, 92, 246, 0.2)",
                            borderRadius: "12px",
                            color: "#fff",
                            fontSize: "10px",
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>
              </ScrollReveal>
            </div>

          </div>
        </div>
      </PageTransition>
    </div>
  );
}
