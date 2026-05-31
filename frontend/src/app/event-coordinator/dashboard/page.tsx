"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import ThemeToggle from "@/components/ThemeToggle";
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  QrCode, 
  Plus, 
  Check, 
  Clock, 
  Send,
  Sparkles,
  Settings,
  Shield
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

const participantTrend = [
  { name: "Sem 1", count: 120 },
  { name: "Sem 2", count: 180 },
  { name: "Sem 3", count: 240 },
  { name: "Sem 4", count: 310 },
  { name: "Sem 5", count: 280 },
  { name: "Sem 6", count: 420 },
];

export default function EventCoordinatorDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const [isQrActive, setIsQrActive] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState("evt-1");
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [currentSignature, setCurrentSignature] = useState("FEST-8A39");

  const [activeEvents] = useState([
    { id: "evt-1", name: "Annual Hackathon 2026", type: "TECHNICAL", date: "May 25, 2026", registered: 142, status: "ONGOING" },
    { id: "evt-2", name: "National Cyber Seminar", type: "SEMINAR", date: "May 27, 2026", registered: 85, status: "UPCOMING" },
    { id: "evt-3", name: "Inter-College Robotics Meet", type: "WORKSHOP", date: "June 02, 2026", registered: 60, status: "UPCOMING" },
  ]);

  const [recentAttendees, setRecentAttendees] = useState<Array<{ id: string; name: string; roll: string; verifiedAt: string }>>([]);

  // Mock countdown timer for event QR rotation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isQrActive) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setCurrentSignature("FEST-" + Math.random().toString(36).substring(2, 6).toUpperCase());
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isQrActive]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Simulate mock check-ins when QR scanner active
  useEffect(() => {
    if (!isQrActive) return;

    // Simulate periodic student checking in
    const students = [
      { id: "1", name: "Sohan kumar kj", roll: "CS-2026-44" },
      { id: "2", name: "Chloe Bennett", roll: "CS-2026-12" },
      { id: "3", name: "Elena Rostova", roll: "CS-2026-25" },
    ];
    let idx = 0;

    const interval = setInterval(() => {
      if (idx >= students.length) {
        clearInterval(interval);
        return;
      }
      const currentStudent = students[idx];
      if (currentStudent) {
        setRecentAttendees((prev) => [
          {
            id: currentStudent.id,
            name: currentStudent.name,
            roll: currentStudent.roll,
            verifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          },
          ...prev,
        ]);
      }
      idx++;
    }, 3000);

    return () => clearInterval(interval);
  }, [isQrActive]);

  const startQRCheckIn = () => {
    setIsQrActive(true);
    setRecentAttendees([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-x-hidden">
      {/* Background gradients and matrix overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.12)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.08)_0%,transparent_40%)] pointer-events-none" />
      <div className="cyber-grid-backdrop" />
      
      {/* Top horizontal scanning scanline */}
      <div className="scanline" />

      {/* Header Panel */}
      <header className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between border-b border-white/[0.08] bg-slate-950/80 backdrop-blur-xl relative overflow-hidden">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/")}
            className="glass-panel p-2.5 text-gray-400 hover:text-white transition-all hover:scale-110 active:scale-95 bg-white/5 border-white/10 hover:border-primary/40 flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              SCAAS <span className="bg-primary/20 text-primary-glow text-xs px-2.5 py-0.5 rounded-full font-bold border border-primary/45 uppercase tracking-widest text-[9px] neon-text-purple">Events</span>
            </span>
            <p className="text-[10px] text-gray-400 font-mono tracking-wider uppercase mt-0.5">Campus Events & Exemption Command Hub</p>
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
        
        {/* Left Column: Event List and Analytics */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Events List */}
          <div className="glass-panel p-6 border-white/[0.06] bg-white/[0.02] panel-interactive space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Active & Upcoming Events <Calendar className="h-4.5 w-4.5 text-primary-glow" />
              </h3>
              <button className="bg-primary hover:bg-primary/90 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-primary/20 flex items-center gap-1.5 btn-elastic cursor-pointer">
                <Plus className="h-4 w-4" /> Schedule Event
              </button>
            </div>

            <div className="space-y-3">
              {activeEvents.map((evt) => {
                const isSelected = selectedEventId === evt.id;
                return (
                  <div 
                    key={evt.id} 
                    onClick={() => !isQrActive && setSelectedEventId(evt.id)}
                    className={`p-4 rounded-xl border flex justify-between items-center transition-all duration-300 perspective-card relative overflow-hidden ${
                      isQrActive 
                        ? "pointer-events-none opacity-40" 
                        : "cursor-pointer"
                    } ${
                      isSelected 
                        ? "bg-primary/[0.04] border-primary/45 shadow-lg shadow-primary/5 glow-border" 
                        : "bg-white/[0.02] border-white/[0.05] hover:border-white/15"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-[8px] font-extrabold uppercase bg-white/5 border border-white/10 px-2 py-0.5 rounded text-gray-400 font-mono tracking-wider">
                          {evt.type}
                        </span>
                        <h4 className="text-xs font-bold text-white leading-tight group-hover:text-primary-glow transition-colors">{evt.name}</h4>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-2 font-mono">
                        Date: {evt.date} • <span className="text-gray-500">Registered:</span> <span className="text-white font-bold">{evt.registered} students</span>
                      </p>
                    </div>
                    
                    <span className={`text-[8px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border font-mono ${
                      evt.status === "ONGOING" 
                        ? "bg-accent/15 text-accent border-accent/20 animate-pulse-glow" 
                        : "bg-white/5 text-gray-400 border-white/10"
                    }`}>
                      {evt.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Event Participation Trends Recharts Area Chart */}
          <div className="glass-panel p-6 border-white/[0.06] bg-white/[0.02] panel-interactive">
            <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
              Event Participation Index <Sparkles className="h-4.5 w-4.5 text-secondary-glow" />
            </h3>
            
            <div className="h-52 w-full flex items-center justify-center pr-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={participantTrend} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorParticipate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={9} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={9} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(10, 7, 20, 0.95)",
                      border: "1px solid rgba(139, 92, 246, 0.25)",
                      borderRadius: "12px",
                      fontSize: "11px",
                      color: "#fff",
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)"
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#8b5cf6" 
                    fillOpacity={1} 
                    fill="url(#colorParticipate)" 
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Column: Live Check-in Launcher */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 border-accent/30 bg-accent/[0.02] relative overflow-hidden glow-border">
            {/* Ambient grid overlay inside checkout card */}
            <div className="absolute inset-0 opacity-15 pointer-events-none radar-grid" />
            
            <div className="flex justify-between items-start gap-4 relative z-10">
              <div>
                <span className="inline-flex items-center gap-1.5 bg-accent/15 border border-accent/25 px-2.5 py-1 rounded-full text-[9px] font-bold text-accent tracking-widest uppercase mb-2.5 font-mono">
                  Event Check-in Station
                </span>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {activeEvents.find((e) => e.id === selectedEventId)?.name}
                </h3>
                <p className="text-[10px] text-gray-400 font-mono mt-1 uppercase">Dynamic QR code terminal generator</p>
              </div>
            </div>

            {!isQrActive ? (
              <button
                onClick={startQRCheckIn}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs py-3.5 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/35 flex items-center justify-center gap-2 btn-elastic cursor-pointer mt-6 relative z-10"
              >
                Launch Check-in Station <QrCode className="h-4 w-4" />
              </button>
            ) : (
              <div className="space-y-6 text-center animate-fade-in relative z-10 mt-4">
                <div className="inline-flex items-center gap-2 bg-slate-900 border border-primary/30 px-4 py-1.5 rounded-xl text-xs font-mono font-bold text-primary-glow tracking-widest uppercase shadow-md animate-pulse-glow">
                  Rotating OTP: {currentSignature}
                </div>
                
                {/* Visual QR Code Display with target sweep */}
                <div className="relative p-5 bg-white rounded-2xl w-44 h-44 mx-auto shadow-2xl flex items-center justify-center border-4 border-primary overflow-hidden group">
                  <div className="absolute inset-0 border-2 border-dashed border-secondary/35 animate-spin rounded-full pointer-events-none" style={{ animationDuration: '10s' }} />
                  <QrCode className="h-32 w-32 text-gray-900 z-10" />
                </div>

                <p className="text-xs text-gray-400 flex items-center justify-center gap-2 font-mono">
                  <Clock className="h-3.5 w-3.5 animate-spin text-accent" /> Cryptographic Rotate in: <span className="font-bold text-white text-sm">{secondsLeft}s</span>
                </p>

                <button
                  onClick={() => setIsQrActive(false)}
                  className="w-full bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/25 font-bold text-xs py-3.5 rounded-xl transition-all btn-elastic cursor-pointer"
                >
                  Terminate Terminal Station
                </button>
              </div>
            )}
          </div>

          {/* Roster of checked-in event attendees */}
          {recentAttendees.length > 0 && (
            <div className="glass-panel p-6 border-primary/25 bg-white/[0.01] space-y-4 animate-fade-in">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2 font-mono">
                  <Users className="h-4 w-4 text-primary-glow" /> Telemetry Feed Checked-in ({recentAttendees.length})
                </h4>
                
                <button className="text-[9px] uppercase font-bold tracking-widest text-accent bg-accent/10 border border-accent/30 hover:bg-accent/25 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer btn-elastic">
                  <Send className="h-3.5 w-3.5" /> Submit Exception leaves
                </button>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 text-xs">
                {recentAttendees.map((att) => (
                  <div key={att.id} className="p-3 bg-white/[0.03] border border-white/[0.05] rounded-xl flex justify-between items-center animate-fade-in hover:border-accent/20 transition-all font-mono group">
                    <div>
                      <h5 className="font-bold text-white leading-tight group-hover:text-accent transition-colors">{att.name}</h5>
                      <span className="text-[9px] text-gray-500 font-mono mt-0.5 block">{att.roll}</span>
                    </div>
                    <span className="text-[9px] text-accent font-bold flex items-center gap-1 bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                      <Check className="h-3 w-3" /> {att.verifiedAt}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warning notice */}
          <div className="glass-panel p-5 border-white/[0.06] bg-white/[0.02] text-xs space-y-2 relative overflow-hidden">
            {/* Caution warning flare */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full blur-xl pointer-events-none" />
            
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 flex items-center gap-2 font-mono">
              <Shield className="h-3.5 w-3.5 text-secondary-glow animate-pulse" /> Administrative Assertion Notice
            </span>
            <p className="text-gray-400 leading-relaxed text-[10px] font-mono">
              EXCEPTION AUDIT PROTOCOL: Submitting leaves triggers a system-wide academic exemption request, excusing all registered event participants from their standard academic classes for the selected timestamped interval.
            </p>
          </div>

        </div>

      </main>
    </div>
  );
}
