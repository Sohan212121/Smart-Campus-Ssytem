"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import GlassNav from "@/components/ui/GlassNav";
import PageTransition from "@/components/ui/PageTransition";
import ScrollReveal from "@/components/ui/ScrollReveal";
import GlassCard from "@/components/ui/GlassCard";
import FloatingOrb from "@/components/ui/FloatingOrb";
import { 
  Users, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Check, 
  X, 
  Clock, 
  Calendar as CalendarIcon, 
  ChevronRight,
  UserCheck,
  UserX,
  FileSpreadsheet,
  Trash2,
  Sparkles,
  Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StudentRosterItem {
  id: string;
  name: string;
  roll: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  method: string;
  time: string;
}

const mockRoster: StudentRosterItem[] = [
  { id: "1", name: "Aaron Carter", roll: "CS-2026-04", status: "PRESENT", method: "QR Scan", time: "09:02 AM" },
  { id: "2", name: "Chloe Bennett", roll: "CS-2026-12", status: "PRESENT", method: "Geofence", time: "09:04 AM" },
  { id: "3", name: "Devon Miller", roll: "CS-2026-19", status: "ABSENT", method: "-", time: "-" },
  { id: "4", name: "Elena Rostova", roll: "CS-2026-25", status: "PRESENT", method: "QR Scan", time: "09:01 AM" },
  { id: "5", name: "Marcus Vance", roll: "CS-2026-38", status: "LATE", method: "Manual", time: "09:12 AM" },
  { id: "6", name: "Sohan kumar kj", roll: "CS-2026-44", status: "PRESENT", method: "QR Scan", time: "09:03 AM" },
  { id: "7", name: "Rohan Gupta", roll: "CS-2026-51", status: "EXCUSED", method: "Medical Claim", time: "-" },
  { id: "8", name: "Sara Jenkins", roll: "CS-2026-58", status: "PRESENT", method: "Geofence", time: "09:05 AM" },
];

const mockLeaves = [
  { id: "lv-1", student: "Devon Miller", email: "devon.m@campus.edu", type: "MEDICAL", date: "May 18-19", reason: "Severe flu symptoms and fever.", status: "PENDING" },
  { id: "lv-2", student: "Sara Jenkins", email: "sara.j@campus.edu", type: "EVENT", date: "May 21-22", reason: "Inter-University Coding competition representation.", status: "PENDING" }
];

export default function AttendanceManagementPage() {
  const { user } = useAuthStore();
  const [roster, setRoster] = useState<StudentRosterItem[]>(mockRoster);
  const [leaves, setLeaves] = useState(mockLeaves);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PRESENT" | "ABSENT" | "LATE" | "EXCUSED">("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleCheckboxToggle = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredRoster.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRoster.map(s => s.id));
    }
  };

  const handleBulkStatusChange = (status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED") => {
    if (selectedIds.length === 0) return;
    setRoster(prev => 
      prev.map(student => 
        selectedIds.includes(student.id) 
          ? { 
              ...student, 
              status, 
              method: "Bulk Edit", 
              time: status === "PRESENT" || status === "LATE" ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-" 
            } 
          : student
      )
    );
    setSelectedIds([]);
    window.alert(`Successfully updated status to ${status} for ${selectedIds.length} candidates.`);
  };

  const handleReviewLeave = (id: string, action: "APPROVED" | "REJECTED") => {
    setLeaves(prev => prev.filter(l => l.id !== id));
    if (action === "APPROVED") {
      const leave = leaves.find(l => l.id === id);
      if (leave) {
        setRoster(prev => 
          prev.map(student => 
            student.name === leave.student 
              ? { ...student, status: "EXCUSED", method: "Exemption", time: "-" } 
              : student
          )
        );
      }
    }
  };

  const filteredRoster = roster.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase()) || 
                          student.roll.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" ? true : student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calendar attendance density heatmap data (simulated month)
  const heatmapDays = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    let density = "low";
    if ([2, 4, 9, 11, 14, 16, 21, 23, 28, 30].includes(day)) density = "high"; // High check-in days
    else if ([3, 7, 10, 15, 17, 22, 24, 29, 31].includes(day)) density = "medium";
    else if ([5, 6, 12, 13, 19, 20, 26, 27].includes(day)) density = "zero"; // Weekends
    return { day, density };
  });

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-x-hidden flex flex-col selection:bg-primary/30 selection:text-white">
      <GlassNav />
      <PageTransition className="flex-1 flex flex-col pt-24 pb-12">
        
        {/* Orbs */}
        <FloatingOrb color="violet" size={350} top="-5%" right="-5%" delay={0} />
        <FloatingOrb color="cyan" size={350} bottom="-5%" left="-5%" delay={2} />

        {/* Content Container */}
        <div className="max-w-7xl w-full mx-auto px-6 sm:px-8 flex-1 space-y-8 z-10 relative">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="inline-flex bg-primary/10 border border-primary/20 text-primary-glow px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest font-mono mb-2">
                Operations Ledger
              </div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white font-mono flex items-center gap-2">
                Attendance Management <UserCheck className="h-6 w-6 text-secondary animate-pulse" />
              </h1>
              <p className="text-[10px] text-gray-500 font-mono font-bold tracking-widest uppercase mt-0.5">
                Instructor HUD Course Section Controls
              </p>
            </div>
            
            {/* Export */}
            <button 
              onClick={() => window.alert("Exporting rosters as high-fidelity Spreadsheet...")}
              className="glow-border bg-slate-900 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-lg hover:shadow-primary/20 flex items-center gap-2 btn-elastic shimmer-effect cursor-pointer"
            >
              Export Spreadsheet <FileSpreadsheet className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Heatmap Density + Roster List (lg:col-span-8) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Heatmap Density Calendar Card */}
              <ScrollReveal direction="up" delay={0.1}>
                <GlassCard className="p-6 border-white/5 space-y-4">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2 font-mono">
                      Density Calendar Heatmap <CalendarIcon className="h-4.5 w-4.5 text-primary" />
                    </h3>
                    <p className="text-[10px] text-gray-500 font-mono font-bold uppercase mt-0.5">Monthly checking saturation levels</p>
                  </div>
                  
                  {/* Grid */}
                  <div className="grid grid-cols-7 gap-2.5 max-w-md">
                    {heatmapDays.map((dayData, idx) => (
                      <div 
                        key={idx} 
                        className={`h-9 rounded-lg flex items-center justify-center text-xs font-mono font-bold border transition-all ${
                          dayData.density === "high" 
                            ? "bg-emerald-500/25 border-emerald-500 text-emerald-300"
                            : dayData.density === "medium"
                            ? "bg-yellow-500/15 border-yellow-500/30 text-yellow-300"
                            : dayData.density === "low"
                            ? "bg-red-500/10 border-red-500/20 text-red-300"
                            : "bg-white/1 border-white/5 text-gray-600"
                        }`}
                        title={`Day ${dayData.day}: ${dayData.density.toUpperCase()} Density`}
                      >
                        {dayData.day}
                      </div>
                    ))}
                  </div>

                  {/* Heatmap Legend */}
                  <div className="flex gap-4 text-[9px] font-mono font-bold text-gray-500 pt-2">
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 bg-emerald-500/25 border border-emerald-500 rounded-sm" /> High (&gt;85%)</span>
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 bg-yellow-500/15 border border-yellow-500/30 rounded-sm" /> Medium (75%-85%)</span>
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 bg-red-500/10 border border-red-500/20 rounded-sm" /> Deficit (&lt;75%)</span>
                  </div>
                </GlassCard>
              </ScrollReveal>

              {/* Roster Controls & Data Table */}
              <ScrollReveal direction="up" delay={0.2}>
                <GlassCard className="p-6 border-white/5 space-y-6">
                  
                  {/* Filters block */}
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Search */}
                    <div className="relative w-full md:max-w-xs">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input 
                        type="text"
                        placeholder="Search candidate / ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 focus:border-primary/50 rounded-xl py-2 px-9 text-xs text-white placeholder-gray-500 outline-none transition-all font-mono"
                      />
                    </div>

                    {/* Status Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                      {(["ALL", "PRESENT", "ABSENT", "LATE", "EXCUSED"] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setStatusFilter(tab)}
                          className={`text-[9px] uppercase font-bold tracking-wider px-3 py-2 rounded-lg border transition-all cursor-pointer shrink-0 ${
                            statusFilter === tab 
                              ? "bg-primary/20 border-primary text-white" 
                              : "text-gray-500 border-transparent hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bulk Operations Toolbar */}
                  {selectedIds.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-primary/10 border border-primary/30 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono font-bold"
                    >
                      <span className="text-primary-glow flex items-center gap-1.5">
                        <Cpu className="h-4 w-4 animate-spin-slow" /> {selectedIds.length} Candidates selected
                      </span>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleBulkStatusChange("PRESENT")}
                          className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/35 rounded-lg text-[9px] uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Mark Present
                        </button>
                        <button 
                          onClick={() => handleBulkStatusChange("ABSENT")}
                          className="px-3 py-1.5 bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/35 rounded-lg text-[9px] uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Mark Absent
                        </button>
                        <button 
                          onClick={() => handleBulkStatusChange("EXCUSED")}
                          className="px-3 py-1.5 bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/35 rounded-lg text-[9px] uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Mark Excused
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Table */}
                  <div className="overflow-x-auto border border-white/5 rounded-xl bg-white/1">
                    <table className="w-full text-left text-xs font-mono min-w-[600px]">
                      <thead>
                        <tr className="border-b border-white/5 text-gray-500 font-extrabold uppercase tracking-widest text-[9px] bg-slate-950/40">
                          <th className="py-3 px-4 w-12">
                            <input 
                              type="checkbox"
                              checked={selectedIds.length === filteredRoster.length && filteredRoster.length > 0}
                              onChange={handleSelectAll}
                              className="accent-primary h-3.5 w-3.5 rounded border-white/10 cursor-pointer"
                            />
                          </th>
                          <th className="py-3 px-4">CANDIDATE NAME</th>
                          <th className="py-3 px-4">ID CODE</th>
                          <th className="py-3 px-4">VERIFICATION</th>
                          <th className="py-3 px-4">TIMESTAMP</th>
                          <th className="py-3 px-4 text-right">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-[11px]">
                        <AnimatePresence initial={false}>
                          {filteredRoster.map((student) => (
                            <motion.tr 
                              key={student.id} 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="text-gray-300 hover:bg-white/5 transition-colors"
                            >
                              <td className="py-3 px-4">
                                <input 
                                  type="checkbox"
                                  checked={selectedIds.includes(student.id)}
                                  onChange={() => handleCheckboxToggle(student.id)}
                                  className="accent-primary h-3.5 w-3.5 rounded border-white/10 cursor-pointer"
                                />
                              </td>
                              <td className="py-3 px-4 font-bold text-white">{student.name}</td>
                              <td className="py-3 px-4 text-gray-500 font-semibold">{student.roll}</td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-white/5 border border-white/10 text-gray-400 uppercase tracking-wider">
                                  {student.method}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-400 font-medium">{student.time}</td>
                              <td className="py-3 px-4 text-right">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                  student.status === "PRESENT" 
                                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" 
                                    : student.status === "ABSENT" 
                                    ? "bg-red-500/15 text-red-400 border border-red-500/20" 
                                    : student.status === "LATE"
                                    ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20"
                                    : "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20"
                                }`}>
                                  {student.status}
                                </span>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>

                </GlassCard>
              </ScrollReveal>

            </div>

            {/* Right: Leave claim समीक्षा Queue + Logs (lg:col-span-4) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Leave Exemption review Queue */}
              <ScrollReveal direction="up" delay={0.3}>
                <GlassCard className="p-6 border-white/5 space-y-4">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2 font-mono">
                      Leave reviews Queue <UserX className="h-4.5 w-4.5 text-primary" />
                    </h3>
                    <p className="text-[10px] text-gray-500 font-mono font-bold uppercase mt-0.5">Exemption request processing</p>
                  </div>

                  <div className="space-y-4">
                    <AnimatePresence initial={false}>
                      {leaves.length === 0 ? (
                        <p className="text-xs text-gray-500 py-4 font-mono uppercase tracking-wide">No pending review claims registered.</p>
                      ) : (
                        leaves.map((leave) => (
                          <motion.div 
                            key={leave.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, x: 50 }}
                            className="p-4 rounded-xl border border-white/5 bg-white/2 space-y-3.5 panel-interactive"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">{leave.student}</h4>
                                <p className="text-[10px] text-gray-500 font-mono mt-0.5">{leave.email}</p>
                              </div>
                              <span className="text-[8px] font-mono font-extrabold text-primary-glow bg-primary/10 border border-primary/25 px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                                {leave.type}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-400 bg-slate-900 border border-white/5 p-3 rounded-xl leading-relaxed italic">
                              &ldquo;{leave.reason}&rdquo;
                            </p>
                            <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase tracking-wider pt-1.5 border-t border-white/5">
                              <span className="text-gray-500">
                                {leave.date}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleReviewLeave(leave.id, "REJECTED")}
                                  className="p-1.5 text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-xl transition-all cursor-pointer btn-elastic"
                                  title="Reject"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleReviewLeave(leave.id, "APPROVED")}
                                  className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 rounded-xl transition-all cursor-pointer btn-elastic"
                                  title="Approve"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </GlassCard>
              </ScrollReveal>

              {/* Roster Live Feed Logs */}
              <ScrollReveal direction="up" delay={0.4}>
                <GlassCard className="p-6 border-white/5 space-y-4">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2 font-mono">
                      Operations Live Feed <Clock className="h-4.5 w-4.5 text-primary" />
                    </h3>
                    <p className="text-[10px] text-gray-500 font-mono font-bold uppercase mt-0.5">Biometric Socket audit trail</p>
                  </div>

                  <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 font-mono">
                    <div className="p-3 bg-white/2 rounded-xl border border-white/5 flex justify-between items-start gap-4">
                      <div>
                        <p className="text-[11px] text-white font-bold uppercase">Sohan kumar checked-in</p>
                        <span className="text-[9px] text-gray-500">METHOD: CRYPTO QR</span>
                      </div>
                      <span className="text-[9px] text-primary font-bold shrink-0">09:03 AM</span>
                    </div>
                    <div className="p-3 bg-white/2 rounded-xl border border-white/5 flex justify-between items-start gap-4">
                      <div>
                        <p className="text-[11px] text-white font-bold uppercase">Chloe Bennett checked-in</p>
                        <span className="text-[9px] text-gray-500">METHOD: GEOLOCK RADAR</span>
                      </div>
                      <span className="text-[9px] text-primary font-bold shrink-0">09:04 AM</span>
                    </div>
                    <div className="p-3 bg-white/2 rounded-xl border border-white/5 flex justify-between items-start gap-4">
                      <div>
                        <p className="text-[11px] text-white font-bold uppercase">Aaron Carter checked-in</p>
                        <span className="text-[9px] text-gray-500">METHOD: CRYPTO QR</span>
                      </div>
                      <span className="text-[9px] text-primary font-bold shrink-0">09:02 AM</span>
                    </div>
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
