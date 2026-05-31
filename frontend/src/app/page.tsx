"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import GlassNav from "@/components/ui/GlassNav";
import PageTransition from "@/components/ui/PageTransition";
import ScrollReveal from "@/components/ui/ScrollReveal";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import FloatingOrb from "@/components/ui/FloatingOrb";
import { 
  Shield, 
  UserCheck, 
  BarChart3, 
  ArrowRight, 
  QrCode, 
  MapPin, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock,
  Sparkles,
  Loader2,
  Cpu,
  Layers,
  Fingerprint,
  Play,
  Check,
  Star,
  Quote,
  Zap,
  Globe
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"student" | "teacher">("student");
  const [typewriterText, setTypewriterText] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  // Safeguard hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Typewriter effect for subtitle
  useEffect(() => {
    if (!isMounted) return;
    const phrases = ["Real-Time Analytics Core", "Cryptographic Roster Defense", "Geolocked Verification Engine"];
    let currentPhraseIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let typingSpeed = 80;

    const handleTypewriter = () => {
      const currentPhrase = phrases[currentPhraseIndex];
      if (!isDeleting) {
        setTypewriterText(currentPhrase.substring(0, currentCharIndex + 1));
        currentCharIndex++;
        if (currentCharIndex === currentPhrase.length) {
          isDeleting = true;
          typingSpeed = 1500; // Pause at end
        } else {
          typingSpeed = 80;
        }
      } else {
        setTypewriterText(currentPhrase.substring(0, currentCharIndex - 1));
        currentCharIndex--;
        if (currentCharIndex === 0) {
          isDeleting = false;
          currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
          typingSpeed = 400; // Pause at start
        } else {
          typingSpeed = 40;
        }
      }
    };

    const timer = setTimeout(handleTypewriter, typingSpeed);
    return () => clearTimeout(timer);
  }, [isMounted, typewriterText]);

  // Safe redirect if already logged in
  useEffect(() => {
    if (isMounted && isAuthenticated && user) {
      const redirectTimer = setTimeout(() => {
        if (user.role === "ADMIN") {
          router.replace("/admin/dashboard");
        } else if (user.role === "TEACHER") {
          router.replace("/teacher/dashboard");
        } else if (user.role === "HOD") {
          router.replace("/hod/dashboard");
        } else if (user.role === "EVENT_COORDINATOR") {
          router.replace("/event-coordinator/dashboard");
        } else if (user.role === "PLACEMENT_OFFICER") {
          router.replace("/placement-officer/dashboard");
        } else {
          router.replace("/student/dashboard");
        }
      }, 800);
      return () => clearTimeout(redirectTimer);
    }
  }, [isMounted, isAuthenticated, user, router]);

  // Subject and Roster mock data for previews
  const studentSubjects = [
    { name: "Advanced Mathematics", rate: 88, lectures: "22/25", status: "safe", prediction: "You can skip 2 lectures safely." },
    { name: "Data Structures & Algorithms", rate: 64, lectures: "16/25", status: "danger", prediction: "Must attend next 3 lectures to hit 75%!" },
    { name: "Computer Networks", rate: 76, lectures: "19/25", status: "warning", prediction: "Caution: Do not miss next lecture." },
    { name: "Software Engineering", rate: 92, lectures: "23/25", status: "safe", prediction: "Excellent compliance." },
  ];

  const liveRoster = [
    { id: 1, name: "Aaron Carter", roll: "CS-2026-04", status: "PRESENT", method: "QR Scan", time: "09:02 AM" },
    { id: 2, name: "Chloe Bennett", roll: "CS-2026-12", status: "PRESENT", method: "Geofence", time: "09:04 AM" },
    { id: 3, name: "Devon Miller", roll: "CS-2026-19", status: "ABSENT", method: "-", time: "-" },
    { id: 4, name: "Elena Rostova", roll: "CS-2026-25", status: "PRESENT", method: "QR Scan", time: "09:01 AM" },
    { id: 5, name: "Marcus Vance", roll: "CS-2026-38", status: "LATE", method: "Manual", time: "09:12 AM" },
  ];

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.08)_0%,transparent_60%)] pointer-events-none" />
        <div className="text-center z-10 space-y-4 animate-pulse">
          <div className="inline-flex bg-white/5 p-4 rounded-2xl border border-white/10 glass-panel shadow-2xl">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
          <div className="space-y-1 font-mono">
            <h2 className="text-sm font-bold text-white tracking-wider uppercase">Initializing Quantum Core</h2>
            <p className="text-xs text-gray-400">Loading Smart Campus Ecosystem...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.08)_0%,transparent_60%)] pointer-events-none" />
        <div className="text-center z-10 space-y-4">
          <div className="inline-flex bg-white/5 p-4 rounded-2xl border border-white/10 glass-panel shadow-2xl">
            <Loader2 className="h-8 w-8 text-secondary animate-spin" />
          </div>
          <div className="space-y-1 font-mono">
            <h2 className="text-sm font-bold text-white tracking-wider uppercase">Verifying Digital Session</h2>
            <p className="text-xs text-gray-400">Welcome back, {user.firstName}. Routing to control dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-x-hidden flex flex-col selection:bg-primary/30 selection:text-white">
      <GlassNav />
      <PageTransition className="flex-1 flex flex-col">
        
        {/* Floating background elements */}
        <FloatingOrb color="violet" size={400} top="-10%" left="-10%" delay={0} />
        <FloatingOrb color="cyan" size={350} top="40%" right="-5%" delay={2} />
        <FloatingOrb color="emerald" size={300} bottom="-5%" left="20%" delay={4} />

        {/* 1. HERO SECTION WITH FULL SCREEN VIDEO */}
        <section className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden">
          
          {/* HLS/MP4 Video Background */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover scale-105 opacity-35 filter brightness-75 contrast-125"
            >
              {/* Premium abstract technology fallback loop */}
              <source src="https://assets.mixkit.co/videos/preview/mixkit-futuristic-technology-digital-grid-background-40742-large.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Cinematic Gradient Masking Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/40 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-transparent to-slate-950/30 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.15)_0%,transparent_50%)] pointer-events-none" />
            <div className="absolute inset-0 bg-cyber-grid pointer-events-none opacity-20" />
          </div>

          {/* Hero Content (Positioned Bottom-Left for Cinematic Contrast) */}
          <div className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 sm:px-8 flex flex-col justify-end pb-16 md:pb-24">
            <div className="max-w-2xl space-y-6">
              
              <ScrollReveal direction="up" delay={0.1}>
                <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-primary-glow px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" /> 
                  Redefining Campus Intelligence
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.2}>
                <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
                  Next-Generation <br />
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent drop-shadow-sm font-sans">
                    Intelligent Campus
                  </span>
                </h1>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.3}>
                <div className="h-6 flex items-center">
                  <p className="text-secondary-glow font-mono text-xs uppercase tracking-widest font-bold">
                    [ <span className="text-white">{typewriterText}</span><span className="animate-pulse">|</span> ]
                  </p>
                </div>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-lg mt-3">
                  Say goodbye to archaic registers. Empower instructors with dynamic rotating QR security systems and precise geofenced classroom lockers. Elevate student performance with automated AI compliance analytics.
                </p>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.4}>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link 
                    href="/login" 
                    className="glow-border bg-gradient-to-r from-primary to-secondary text-white text-xs font-black uppercase tracking-widest px-8 py-4 rounded-xl shadow-2xl shadow-primary/25 hover:shadow-primary/45 btn-elastic shimmer-effect flex items-center gap-2 cursor-pointer"
                  >
                    Launch Core HUD <Cpu className="h-4 w-4" />
                  </Link>
                  <a 
                    href="#demo" 
                    className="glass-panel text-white border border-white/10 hover:border-white/20 text-xs font-bold uppercase tracking-wider px-8 py-4 rounded-xl hover:bg-white/5 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    Watch Projections <Play className="h-3.5 w-3.5 fill-white text-white" />
                  </a>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>



        {/* 3. FEATURES SHOWCASE SECTION */}
        <section id="features" className="relative z-10 py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-16">
            
            <div className="text-center max-w-xl mx-auto space-y-4">
              <ScrollReveal direction="up" delay={0.1}>
                <div className="inline-flex bg-primary/10 border border-primary/20 text-primary-glow px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  High-Yield Mechanics
                </div>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={0.2}>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Integrated Defense & Control</h2>
                <p className="text-gray-400 text-sm">Advanced telemetry and authentication lockers to secure attendance protocols.</p>
              </ScrollReveal>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <ScrollReveal direction="up" delay={0.1}>
                <GlassCard hover3D className="p-6 h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="bg-primary/20 border border-primary/30 p-3.5 rounded-2xl w-fit">
                      <QrCode className="h-6 w-6 text-primary animate-pulse" />
                    </div>
                    <h3 className="text-base font-bold text-white uppercase tracking-wide">Dynamic QR Scanning</h3>
                    <p className="text-xs text-gray-400 leading-relaxed font-medium">
                      Time-rotating cryptographic codes generated every few seconds on-screen prevent remote proxies and verification sharing.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-primary font-mono tracking-widest">
                    <span>ROTATION ACTIVE</span>
                    <Zap className="h-3.5 w-3.5 text-yellow-400" />
                  </div>
                </GlassCard>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.2}>
                <GlassCard hover3D className="p-6 h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="bg-secondary/20 border border-secondary/30 p-3.5 rounded-2xl w-fit">
                      <MapPin className="h-6 w-6 text-secondary" />
                    </div>
                    <h3 className="text-base font-bold text-white uppercase tracking-wide">Proximity Geofencing</h3>
                    <p className="text-xs text-gray-400 leading-relaxed font-medium">
                      Automated geolocation radar lockers ensure students are physically inside the lecture boundary to record successful logs.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-secondary font-mono tracking-widest">
                    <span>GPS LOCK ACTIVE</span>
                    <Globe className="h-3.5 w-3.5 text-cyan-400 animate-spin-slow" />
                  </div>
                </GlassCard>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.3}>
                <GlassCard hover3D className="p-6 h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="bg-accent/20 border border-accent/30 p-3.5 rounded-2xl w-fit">
                      <BarChart3 className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="text-base font-bold text-white uppercase tracking-wide">Predictive Deficit Alarms</h3>
                    <p className="text-xs text-gray-400 leading-relaxed font-medium">
                      Advanced machine-learning trend charts notify students of potential academic shortfalls and calculate exactly how many lectures they must attend.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-accent font-mono tracking-widest">
                    <span>ML ENGINE ACTIVE</span>
                    <TrendingUp className="h-3.5 w-3.5 text-accent" />
                  </div>
                </GlassCard>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.4}>
                <GlassCard hover3D className="p-6 h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-3.5 rounded-2xl w-fit">
                      <Shield className="h-6 w-6 text-yellow-500" />
                    </div>
                    <h3 className="text-base font-bold text-white uppercase tracking-wide">Anti-Proxy Intelligence</h3>
                    <p className="text-xs text-gray-400 leading-relaxed font-medium">
                      Device fingerprint tracking, cryptographic IP assertion, and biometric verification prevent students from marking attendance for peers.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-yellow-500 font-mono tracking-widest">
                    <span>FINGERPRINT LOCK</span>
                    <Fingerprint className="h-3.5 w-3.5 text-yellow-400" />
                  </div>
                </GlassCard>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.5}>
                <GlassCard hover3D className="p-6 h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="bg-indigo-500/10 border border-indigo-500/20 p-3.5 rounded-2xl w-fit">
                      <Users className="h-6 w-6 text-indigo-400" />
                    </div>
                    <h3 className="text-base font-bold text-white uppercase tracking-wide">Real-time WebSockets</h3>
                    <p className="text-xs text-gray-400 leading-relaxed font-medium">
                      Bi-directional live sockets feed roster logs directly into the instructorHUD as students check-in, providing instant visual feedback.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-indigo-400 font-mono tracking-widest">
                    <span>SOCKET STREAM ON</span>
                    <Layers className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                  </div>
                </GlassCard>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.6}>
                <GlassCard hover3D className="p-6 h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl w-fit">
                      <Sparkles className="h-6 w-6 text-emerald-400 animate-spin-slow" />
                    </div>
                    <h3 className="text-base font-bold text-white uppercase tracking-wide">Cognitive AI Chatbot</h3>
                    <p className="text-xs text-gray-400 leading-relaxed font-medium">
                      Built-in Large Language Model chatbot processes class compliance datasets to answer queries and write performance summary reviews.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-emerald-400 font-mono tracking-widest">
                    <span>COGNITIVE BOT READY</span>
                    <Cpu className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                </GlassCard>
              </ScrollReveal>

            </div>
          </div>
        </section>

        {/* 4. LIVE DASHBOARD PREVIEW SECTION */}
        <section id="demo" className="relative z-10 py-24 sm:py-32 bg-slate-900/35 border-y border-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
            
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
              <div className="space-y-2">
                <ScrollReveal direction="up" delay={0.1}>
                  <div className="text-xs font-black uppercase text-secondary font-mono tracking-widest">Interactive Projection</div>
                </ScrollReveal>
                <ScrollReveal direction="up" delay={0.2}>
                  <h2 className="text-3xl font-extrabold tracking-tight">Tactical Dashboard Mockups</h2>
                </ScrollReveal>
              </div>

              {/* Tabs Control Box */}
              <ScrollReveal direction="up" delay={0.3}>
                <div className="glass-panel p-1.5 flex gap-1 border border-white/10 relative overflow-hidden bg-slate-950/80 backdrop-blur-md rounded-2xl shrink-0">
                  <button 
                    onClick={() => setActiveTab("student")}
                    className={`text-[10px] uppercase font-mono font-extrabold tracking-wider px-5 py-2.5 rounded-xl transition-all cursor-pointer ${
                      activeTab === "student" 
                        ? "bg-primary text-white shadow-lg shadow-primary/35 border border-primary/20" 
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Student Module
                  </button>
                  <button 
                    onClick={() => setActiveTab("teacher")}
                    className={`text-[10px] uppercase font-mono font-extrabold tracking-wider px-5 py-2.5 rounded-xl transition-all cursor-pointer ${
                      activeTab === "teacher" 
                        ? "bg-primary text-white shadow-lg shadow-primary/35 border border-primary/20" 
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Instructor HUD
                  </button>
                </div>
              </ScrollReveal>
            </div>

            {/* Interactive Simulation Dashboard Canvas */}
            <ScrollReveal direction="scale" delay={0.1}>
              <div className="perspective-card glass-panel p-6 sm:p-8 min-h-[450px] flex flex-col justify-between border-primary/20 bg-slate-950/60 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-cyan-500/10 to-transparent blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-500/10 to-transparent blur-2xl pointer-events-none" />
                
                {activeTab === "student" ? (
                  // Student View Renders
                  <div className="space-y-6 z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                          Academic Analytics Summary <TrendingUp className="h-4.5 w-4.5 text-secondary animate-pulse" />
                        </h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Candidate: Sohan kumar kj (Roll: CS-2026-44)</p>
                      </div>
                      <div className="text-left sm:text-right bg-white/5 border border-white/10 px-4 py-2 rounded-xl shrink-0 backdrop-blur-md">
                        <span className="text-3xl font-black bg-gradient-to-r from-secondary via-accent to-primary bg-clip-text text-transparent text-secondary-glow font-mono">80%</span>
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest font-extrabold font-mono">Current Attendance</p>
                      </div>
                    </div>

                    {/* Grid layout of subjects */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {studentSubjects.map((sub, idx) => (
                        <div 
                          key={idx} 
                          className={`p-4 rounded-xl border flex flex-col justify-between hover:bg-white/5 transition-all hover:scale-[1.01] ${
                            sub.status === "danger" 
                              ? "bg-red-500/5 border-red-500/20" 
                              : sub.status === "warning"
                              ? "bg-yellow-500/5 border-yellow-500/20"
                              : "bg-white/5 border-white/5"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-gray-200 tracking-wide leading-tight">{sub.name}</h4>
                              <span className="text-[9px] text-gray-500 font-bold tracking-widest mt-1 block">LECTURES: {sub.lectures}</span>
                            </div>
                            <span className={`text-xs font-black ${
                              sub.status === "danger" 
                                ? "text-red-400" 
                                : sub.status === "warning" 
                                ? "text-yellow-400" 
                                : "text-accent"
                            }`}>{sub.rate}%</span>
                          </div>

                          {/* Micro Progress Bar */}
                          <div className="w-full bg-white/5 rounded-full h-1.5 my-3.5">
                            <div 
                              className={`h-1.5 rounded-full ${
                                sub.status === "danger" 
                                  ? "bg-red-500 shadow-lg shadow-red-500/30 animate-pulse" 
                                  : sub.status === "warning" 
                                  ? "bg-yellow-500 shadow-lg shadow-yellow-500/30" 
                                  : "bg-accent shadow-lg shadow-accent/30"
                              }`}
                              style={{ width: `${sub.rate}%` }}
                            ></div>
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-1">
                            {sub.status === "danger" ? (
                              <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                            ) : sub.status === "warning" ? (
                              <AlertTriangle className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" />
                            )}
                            <span className={sub.status === "danger" ? "text-red-300 font-bold" : sub.status === "warning" ? "text-yellow-300 font-semibold" : "text-gray-400 font-medium"}>{sub.prediction}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Teacher View Renders
                  <div className="space-y-5 z-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                          Active Lecture Session HUD <Users className="h-4.5 w-4.5 text-primary" />
                        </h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Software Engineering (Section A • Room A-102)</p>
                      </div>
                      
                      {/* Dynamic checking status banner */}
                      <div className="flex items-center gap-2 bg-accent/15 border border-accent/25 px-3 py-1.5 rounded-xl shrink-0">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                        </span>
                        <span className="text-[9px] font-black text-accent tracking-widest uppercase font-mono">DYNAMIC GEOLOCK ACTIVE</span>
                      </div>
                    </div>

                    {/* Table of Roster Renders */}
                    <div className="overflow-x-auto border border-white/5 rounded-xl bg-white/1">
                      <table className="w-full text-left text-xs font-mono min-w-[600px]">
                        <thead>
                          <tr className="border-b border-white/5 text-gray-500 font-extrabold uppercase tracking-wider text-[9px] bg-slate-950/40">
                            <th className="py-3 px-4">STUDENT NAME</th>
                            <th className="py-3 px-4">ID CODE</th>
                            <th className="py-3 px-4">VERIFICATION</th>
                            <th className="py-3 px-4">LOG TIME</th>
                            <th className="py-3 px-4 text-right">STATUS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-[11px]">
                          {liveRoster.map((student) => (
                            <tr key={student.id} className="text-gray-300 hover:bg-white/5 transition-colors">
                              <td className="py-3 px-4 font-bold text-white">{student.name}</td>
                              <td className="py-3 px-4 text-gray-500 font-semibold">{student.roll}</td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-white/5 border border-white/10 text-gray-400">
                                  {student.method === "QR Scan" ? (
                                    <QrCode className="h-3 w-3 text-primary" />
                                  ) : student.method === "Geofence" ? (
                                    <MapPin className="h-3 w-3 text-secondary" />
                                  ) : (
                                    <Clock className="h-3 w-3 text-gray-500" />
                                  )}
                                  {student.method}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-400 font-medium">{student.time}</td>
                              <td className="py-3 px-4 text-right">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                  student.status === "PRESENT" 
                                    ? "bg-accent/15 text-accent border border-accent/20" 
                                    : student.status === "ABSENT" 
                                    ? "bg-red-500/15 text-red-400 border border-red-500/20" 
                                    : "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20"
                                }`}>
                                  {student.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Bottom Info Bar inside mockups */}
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-white/5 pt-4 text-[9px] text-gray-500 font-mono font-bold tracking-wider z-10">
                  <span>MODULE STREAM FEED SECURE</span>
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <Fingerprint className="h-3.5 w-3.5 text-secondary" /> BIOMETRIC LOGS ACTIVE
                  </span>
                </div>

              </div>
            </ScrollReveal>

          </div>
        </section>

        {/* 5. STATISTICS SECTION */}
        <section className="relative z-10 py-24 sm:py-32 bg-slate-950">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              
              <ScrollReveal direction="up" delay={0.1}>
                <div className="text-center space-y-2 border border-white/5 p-6 rounded-2xl bg-white/2 relative overflow-hidden group hover:border-primary/30 transition-colors">
                  <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary to-transparent" />
                  <span className="text-3xl sm:text-4xl font-mono font-black text-white block">
                    <AnimatedCounter target={10} suffix="K+" />
                  </span>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-extrabold font-mono">Enrolled Candidates</p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.2}>
                <div className="text-center space-y-2 border border-white/5 p-6 rounded-2xl bg-white/2 relative overflow-hidden group hover:border-secondary/30 transition-colors">
                  <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-secondary to-transparent" />
                  <span className="text-3xl sm:text-4xl font-mono font-black text-white block">
                    <AnimatedCounter target={500} suffix="+" />
                  </span>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-extrabold font-mono">Assigned Instructors</p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.3}>
                <div className="text-center space-y-2 border border-white/5 p-6 rounded-2xl bg-white/2 relative overflow-hidden group hover:border-accent/30 transition-colors">
                  <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-accent to-transparent" />
                  <span className="text-3xl sm:text-4xl font-mono font-black text-white block">
                    <AnimatedCounter target={99.9} decimals={1} suffix="%" />
                  </span>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-extrabold font-mono">Operation Uptime</p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.4}>
                <div className="text-center space-y-2 border border-white/5 p-6 rounded-2xl bg-white/2 relative overflow-hidden group hover:border-yellow-500/30 transition-colors">
                  <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-yellow-500 to-transparent" />
                  <span className="text-3xl sm:text-4xl font-mono font-black text-white block">
                    <AnimatedCounter target={50} suffix="+" />
                  </span>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-extrabold font-mono">Institutions Active</p>
                </div>
              </ScrollReveal>

            </div>
          </div>
        </section>

        {/* 6. HOW IT WORKS SECTION */}
        <section id="timeline" className="relative z-10 py-24 sm:py-32 bg-slate-900/10 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-16">
            
            <div className="text-center max-w-xl mx-auto space-y-4">
              <ScrollReveal direction="up" delay={0.1}>
                <div className="inline-flex bg-secondary/10 border border-secondary/20 text-secondary-glow px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest font-mono">
                  Execution Pathway
                </div>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={0.2}>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Quantum Attendance Routine</h2>
                <p className="text-gray-400 text-sm">3 simple operations to capture and analyze institutional telemetry datasets.</p>
              </ScrollReveal>
            </div>

            <div className="relative border-l border-white/10 ml-4 md:ml-0 md:grid md:grid-cols-3 md:border-l-0 md:border-t md:pt-8 md:gap-8 gap-y-12 flex flex-col">
              
              <ScrollReveal direction="up" delay={0.1}>
                <div className="relative pl-6 md:pl-0 space-y-3">
                  <div className="absolute -left-[9px] top-0 md:relative md:left-0 md:-top-12 h-4 w-4 bg-primary rounded-full border-4 border-slate-950 shadow-md shadow-primary/30 z-10 shrink-0" />
                  <span className="text-xs uppercase font-mono font-black text-primary">Step 01</span>
                  <h3 className="text-base font-bold text-white uppercase tracking-wide">Instructor Dispatch</h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-medium">
                    The instructor starts the lecture check-in session from their dashboard, activating the geofenced lock and generating rotating cryptocodes.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.2}>
                <div className="relative pl-6 md:pl-0 space-y-3">
                  <div className="absolute -left-[9px] top-0 md:relative md:left-0 md:-top-12 h-4 w-4 bg-secondary rounded-full border-4 border-slate-950 shadow-md shadow-secondary/30 z-10 shrink-0" />
                  <span className="text-xs uppercase font-mono font-black text-secondary">Step 02</span>
                  <h3 className="text-base font-bold text-white uppercase tracking-wide">Candidate Assertion</h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-medium">
                    Students log in from their terminal, verify their geoloction is inside the bounds, and scan the dynamic rotating QR code on-screen.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.3}>
                <div className="relative pl-6 md:pl-0 space-y-3">
                  <div className="absolute -left-[9px] top-0 md:relative md:left-0 md:-top-12 h-4 w-4 bg-accent rounded-full border-4 border-slate-950 shadow-md shadow-accent/30 z-10 shrink-0" />
                  <span className="text-xs uppercase font-mono font-black text-accent">Step 03</span>
                  <h3 className="text-base font-bold text-white uppercase tracking-wide">Compliance Telemetry</h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-medium">
                    Attendance rosters are compiled live via WebSockets, fed into predictive algorithms, and translated into interactive charts.
                  </p>
                </div>
              </ScrollReveal>

            </div>
          </div>
        </section>

        {/* 7. TESTIMONIALS SECTION */}
        <section className="relative z-10 py-24 sm:py-32 border-t border-white/5 bg-slate-950">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-16">
            
            <div className="text-center max-w-xl mx-auto space-y-4">
              <ScrollReveal direction="up" delay={0.1}>
                <div className="inline-flex bg-accent/10 border border-accent/20 text-accent px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest font-mono">
                  Network Reviews
                </div>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={0.2}>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Verified Operations Feedback</h2>
                <p className="text-gray-400 text-sm">See how instructors and administrative teams are utilizing our intelligence engine.</p>
              </ScrollReveal>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <ScrollReveal direction="up" delay={0.1}>
                <GlassCard className="p-6 flex flex-col justify-between h-full hover:border-white/10 transition-colors">
                  <div className="space-y-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />)}
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed italic font-medium">
                      &ldquo;The dynamic QR codes solved proxy issues completely. Before SCAAS, students would routinely check-in for absent friends. Now, the cryptographic rotation makes it impossible.&rdquo;
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-white/5 flex items-center gap-3">
                    <div className="bg-gradient-to-tr from-primary to-secondary h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 font-mono">
                      PA
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wide">Prof. Angela</h4>
                      <p className="text-[9px] text-gray-500 font-bold uppercase font-mono">Software Eng Department</p>
                    </div>
                  </div>
                </GlassCard>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.2}>
                <GlassCard className="p-6 flex flex-col justify-between h-full hover:border-white/10 transition-colors">
                  <div className="space-y-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />)}
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed italic font-medium">
                      &ldquo;The geofencing classroom locker works beautifully. It automatically confirms coordinates without draining candidate devices, giving us total peace of mind in examinations.&rdquo;
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-white/5 flex items-center gap-3">
                    <div className="bg-gradient-to-tr from-secondary to-accent h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 font-mono">
                      RD
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wide">Dr. Robert Chen</h4>
                      <p className="text-[9px] text-gray-500 font-bold uppercase font-mono">Dean of Academic Affairs</p>
                    </div>
                  </div>
                </GlassCard>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.3}>
                <GlassCard className="p-6 flex flex-col justify-between h-full hover:border-white/10 transition-colors">
                  <div className="space-y-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />)}
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed italic font-medium">
                      &ldquo;AI deficit forecasts and alerts completely transformed student engagement. Our default rate dropped by 45% once students could see exact compliance requirements on their screens.&rdquo;
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-white/5 flex items-center gap-3">
                    <div className="bg-gradient-to-tr from-accent to-primary h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 font-mono">
                      SW
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wide">Sarah Williams</h4>
                      <p className="text-[9px] text-gray-500 font-bold uppercase font-mono">Operations HOD Coordinator</p>
                    </div>
                  </div>
                </GlassCard>
              </ScrollReveal>

            </div>
          </div>
        </section>

        {/* 8. CTA SECTION */}
        <section className="relative z-10 py-24 sm:py-32 overflow-hidden border-t border-white/5 bg-slate-950">
          
          {/* Section Gradient mesh background */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-secondary/5 to-transparent pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center space-y-8 relative z-10">
            <ScrollReveal direction="up" delay={0.1}>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight uppercase font-sans">
                Ready to Transform <br />
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Your Campus Intelligence?</span>
              </h2>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.2}>
              <p className="text-gray-400 text-sm max-w-xl mx-auto leading-relaxed">
                Connect with our deployment specialists to spin up a cryptographic attendance terminal for your department in less than 24 hours.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.3}>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <Link 
                  href="/login" 
                  className="glow-border bg-gradient-to-r from-primary to-secondary text-white text-xs font-black uppercase tracking-widest px-8 py-4.5 rounded-xl shadow-2xl shadow-primary/25 hover:shadow-primary/45 btn-elastic shimmer-effect flex items-center gap-2 cursor-pointer font-mono"
                >
                  Spin Up Free Terminal <ArrowRight className="h-4 w-4" />
                </Link>
                <Link 
                  href="/login" 
                  className="glass-panel text-white border border-white/10 hover:border-white/20 text-xs font-bold uppercase tracking-wider px-8 py-4.5 rounded-xl hover:bg-white/5 transition-all flex items-center gap-2 cursor-pointer font-mono"
                >
                  Book Demo Room
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 9. PREMIUM FOOTER */}
        <footer className="relative z-10 border-t border-white/10 bg-slate-950/80 backdrop-blur-md pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              
              <div className="space-y-4 col-span-2 md:col-span-1">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-tr from-primary to-secondary p-2 rounded-lg">
                    <UserCheck className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-extrabold tracking-wider text-white font-mono">SCAAS Engine</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed font-semibold">
                  SCAAS is a world-class cognitive SaaS solution providing time-rotating QR scan protection and telemetry calculations.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-white font-mono">Product Matrix</h4>
                <ul className="space-y-2 text-[11px] font-semibold text-gray-500">
                  <li><Link href="#features" className="hover:text-white transition-colors">Core Features</Link></li>
                  <li><Link href="#demo" className="hover:text-white transition-colors">Instructor HUD</Link></li>
                  <li><Link href="/analytics" className="hover:text-white transition-colors">ML Analytics</Link></li>
                  <li><Link href="/attendance" className="hover:text-white transition-colors">GPS Geofencing</Link></li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-white font-mono">Developer Resources</h4>
                <ul className="space-y-2 text-[11px] font-semibold text-gray-500">
                  <li><Link href="/login" className="hover:text-white transition-colors">Client Terminal</Link></li>
                  <li><Link href="/login" className="hover:text-white transition-colors">API Docs</Link></li>
                  <li><Link href="/login" className="hover:text-white transition-colors">Security Audit</Link></li>
                  <li><Link href="/login" className="hover:text-white transition-colors">Integrations</Link></li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-white font-mono">Operational Legal</h4>
                <ul className="space-y-2 text-[11px] font-semibold text-gray-500">
                  <li><Link href="#" className="hover:text-white transition-colors">Security Rules</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Privacy Lock</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">GDPR Audit</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                </ul>
              </div>

            </div>

            <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-gray-500 font-mono font-bold tracking-wider">
              <div>
                <span>© 2026 SMART CAMPUS COGNITIVE SYSTEM. ALL RIGHTS RESERVED.</span>
              </div>
              <div className="flex gap-4">
                <span>Built with ❤️ for Modern Education</span>
              </div>
            </div>

          </div>
        </footer>

      </PageTransition>
    </div>
  );
}
