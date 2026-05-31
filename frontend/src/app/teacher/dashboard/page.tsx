"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import ThemeToggle from "@/components/ThemeToggle";
import { 
  QrCode, 
  MapPin, 
  Users, 
  ArrowLeft, 
  Play, 
  Square, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Check, 
  UserX,
  FileSpreadsheet,
  FileText,
  X,
  BookOpen,
  Calendar,
  AlertTriangle,
  Send,
  Sparkles,
  TrendingUp,
  BarChart4,
  Mail,
  Clock,
  Plus,
  Cpu,
  Target,
  Layers
} from "lucide-react";
import io, { Socket } from "socket.io-client";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";
import PageTransition from "@/components/ui/PageTransition";
import ScrollReveal from "@/components/ui/ScrollReveal";
import FloatingOrb from "@/components/ui/FloatingOrb";
import StatsCard from "@/components/ui/StatsCard";
import GlassCard from "@/components/ui/GlassCard";
import NotificationsPanel from "@/components/ui/NotificationsPanel";
import { Bell } from "lucide-react";

interface LoggedStudent {
  studentId: string;
  name: string;
  timestamp: string;
  method: string;
}

interface PendingLeave {
  id: string;
  studentId: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  student: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const defaultPendingLeaves: PendingLeave[] = [
  {
    id: "leave-demo-1",
    studentId: "std-1",
    type: "MEDICAL",
    startDate: "2026-05-18",
    endDate: "2026-05-19",
    reason: "High fever and flu symptoms. Doctor advised 2 days rest.",
    student: { firstName: "Devon", lastName: "Miller", email: "devon.m@campus.edu" },
  },
  {
    id: "leave-demo-2",
    studentId: "std-2",
    type: "EVENT",
    startDate: "2026-05-21",
    endDate: "2026-05-22",
    reason: "Participating in Inter-University Hackathon (with dean approval).",
    student: { firstName: "Sara", lastName: "Jenkins", email: "sara.j@campus.edu" },
  }
];

const teacherTimetable = [
  { time: "09:00 AM - 10:30 AM", code: "CS-404", subject: "Software Engineering", room: "Room A-102", status: "COMPLETED" },
  { time: "11:00 AM - 12:30 PM", code: "CS-302", subject: "Database Systems", room: "Lab-3", status: "ONGOING" },
  { time: "02:00 PM - 03:30 PM", code: "CS-404", subject: "Software Engineering", room: "Room A-104", status: "UPCOMING" },
];

const performanceData = [
  { name: "Quiz 1", avgScore: 82, attendance: 95 },
  { name: "Midterm", avgScore: 74, attendance: 92 },
  { name: "Assignment 1", avgScore: 88, attendance: 89 },
  { name: "Quiz 2", avgScore: 78, attendance: 90 },
  { name: "Project Draft", avgScore: 85, attendance: 94 },
];

const riskAlertStudents = [
  { id: "risk-1", name: "Devon Miller", rate: 64, reason: "Missed 3 labs in a row" },
  { id: "risk-2", name: "Marcus Vance", rate: 58, reason: "Consecutive absences for 2 weeks" },
  { id: "risk-3", name: "Sara Jenkins", rate: 71, reason: "Low quiz attendance" },
];

const defaultAssignments = [
  { id: "asg-1", title: "SRS Document Draft", course: "Software Engineering", deadline: "May 29, 2026", submissions: 32, total: 42, progress: 76 },
  { id: "asg-2", title: "Red-Black Tree Code", course: "Database Systems", deadline: "May 27, 2026", submissions: 18, total: 42, progress: 42 },
];

const defaultAnnouncements = [
  { id: "ann-1", text: "Please submit your Software Engineering project draft by Friday evening.", time: "1 hour ago", section: "Section A" },
  { id: "ann-2", text: "Lab 3 location shifted to Central Computing Center for this Thursday only.", time: "1 day ago", section: "Section B" },
];

function generateRandomLectureId(): string {
  return "lec-" + Math.floor(1000 + Math.random() * 9000);
}

function generateRandomSignature(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export default function TeacherDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  // New States for modules
  const [timetable] = useState(teacherTimetable);
  const [assignments, setAssignments] = useState(defaultAssignments);
  const [announcements, setAnnouncements] = useState(defaultAnnouncements);
  const [riskAlerts, setRiskAlerts] = useState(riskAlertStudents);
  const [performanceStats] = useState(performanceData);

  const [newAsgTitle, setNewAsgTitle] = useState("");
  const [newAsgCourse, setNewAsgCourse] = useState("Software Engineering");
  const [newAsgDeadline, setNewAsgDeadline] = useState("");
  const [newAnnouncementText, setNewAnnouncementText] = useState("");

  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsgTitle) return;
    const newAsg = {
      id: "asg-" + Date.now(),
      title: newAsgTitle,
      course: newAsgCourse,
      deadline: newAsgDeadline || "June 05, 2026",
      submissions: 0,
      total: totalEnrolled,
      progress: 0,
    };
    setAssignments([newAsg, ...assignments]);
    setNewAsgTitle("");
    setNewAsgDeadline("");
  };

  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncementText) return;
    const newAnn = {
      id: "ann-" + Date.now(),
      text: newAnnouncementText,
      time: "Just now",
      section: selectedSectionId ? sections.find(s => s.id === selectedSectionId)?.name || "Section A" : "Section A",
    };
    setAnnouncements([newAnn, ...announcements]);
    setNewAnnouncementText("");
  };

  const handleDismissRiskAlert = (id: string) => {
    setRiskAlerts(prev => prev.filter(r => r.id !== id));
  };

  // Active state management
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionType, setSessionType] = useState<"QR" | "GEOFENCE">("QR");
  const [lectureId, setLectureId] = useState("");
  const [topic, setTopic] = useState("Software Engineering - Lecture 14");
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [currentQR, setCurrentQR] = useState("");
  const [radius, setRadius] = useState(30);

  const [presentCount, setPresentCount] = useState(0);
  const [totalEnrolled, setTotalEnrolled] = useState(42);
  const [students, setStudents] = useState<LoggedStudent[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Section selectors
  const [sections, setSections] = useState<{ id: string; name: string; course: { code: string; name: string }; enrollments: unknown[] }[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState("");

  const [pendingLeaves, setPendingLeaves] = useState<PendingLeave[]>([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Fetch sections and pending leaves on mount / token change
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const headers = { Authorization: `Bearer ${user.token}` };

    const fetchSections = async () => {
      if (user.token.startsWith("demo-jwt-token-")) {
        const demoSec = [
          {
            id: "sec-demo-1",
            name: "Section A",
            course: { code: "CS-404", name: "Software Engineering" },
            enrollments: new Array(42).fill(null),
          },
          {
            id: "sec-demo-2",
            name: "Section B",
            course: { code: "CS-302", name: "Database Systems" },
            enrollments: new Array(35).fill(null),
          }
        ];
        setSections(demoSec);
        setSelectedSectionId(demoSec[0].id);
        setTotalEnrolled(demoSec[0].enrollments.length);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/v1/attendance/sections`, { headers });
        if (res.ok) {
          const data = await res.json();
          setSections(data.sections);
          if (data.sections.length > 0) {
            setSelectedSectionId(data.sections[0].id);
            setTotalEnrolled(data.sections[0].enrollments?.length || 0);
            setTopic(`${data.sections[0].course.name} - Section ${data.sections[0].name}`);
          }
        }
      } catch (err) {
        console.error("Failed to load instructor sections:", err);
      }
    };

    const fetchPendingLeaves = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/leaves/pending`, { headers });
        if (res.ok) {
          const data = await res.json();
          setPendingLeaves(data.leaves);
        } else {
          setPendingLeaves(defaultPendingLeaves);
        }
      } catch (err) {
        console.error("Leave fetch error:", err);
        setPendingLeaves(defaultPendingLeaves);
      }
    };

    fetchSections();
    fetchPendingLeaves();
  }, [isAuthenticated, user]);

  const handleSectionChange = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    const sec = sections.find((s) => s.id === sectionId);
    if (sec) {
      setTotalEnrolled(sec.enrollments?.length || 0);
      setTopic(`${sec.course.name} - Section ${sec.name}`);
    }
  };

  const handleReviewLeave = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      const token = user?.token;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/v1/leaves/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({ status, reviewNote: "Reviewed by instructor" }),
      });
      if (res.ok) {
        setPendingLeaves((prev) => prev.filter((l) => l.id !== id));
      } else {
        setPendingLeaves((prev) => prev.filter((l) => l.id !== id));
      }
    } catch {
      setPendingLeaves((prev) => prev.filter((l) => l.id !== id));
    }
  };

  // WebSockets and networking state
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Connect WebSockets
  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const socket = io(API_URL, {
      reconnectionAttempts: 3,
      timeout: 2000,
    });
    
    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
      console.log("Teacher Socket Connected!");
    });

    socket.on("connect_error", () => {
      setSocketConnected(false);
      console.log("WebSocket connection failed. Falling back to mock live stream.");
    });

    // Event listener when a student checks in successfully
    socket.on("student:checked_in", (data: { studentId: string; name: string; timestamp: string }) => {
      setStudents((prev) => {
        if (prev.some((s) => s.studentId === data.studentId)) return prev;
        return [
          {
            studentId: data.studentId,
            name: data.name,
            timestamp: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            method: sessionType === "QR" ? "Dynamic QR" : "Geofencing",
          },
          ...prev,
        ];
      });
      setPresentCount((c) => Math.min(totalEnrolled, c + 1));
    });

    return () => {
      socket.disconnect();
    };
  }, [sessionType, totalEnrolled]);

  // Handle countdown timers and token rotations
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSessionActive && sessionType === "QR") {
      interval = setInterval(async () => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Generate/Refresh rotating QR token in real DB or fallback mock signature
            const runQRRefresh = async () => {
              if (user && !user.token.startsWith("demo-jwt-token-")) {
                try {
                  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
                  const res = await fetch(`${API_URL}/api/v1/attendance/qr/refresh/${lectureId}`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${user.token}` },
                  });
                  if (res.ok) {
                    const data = await res.json();
                    setCurrentQR(data.qr.token);
                    if (socketRef.current && socketConnected) {
                      socketRef.current.emit("qr:freshen", { signature: data.qr.token });
                    }
                  }
                } catch (err) {
                  console.error("QR Refresh failed:", err);
                }
              } else {
                const mockSignature = generateRandomSignature();
                setCurrentQR(mockSignature);
                if (socketConnected && socketRef.current) {
                  socketRef.current.emit("qr:freshen", { signature: mockSignature });
                }
              }
            };

            runQRRefresh();
            return 5; // Reset count
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive, sessionType, socketConnected, lectureId, user]);

  const startSession = async () => {
    if (!selectedSectionId) {
      alert("Please select a course section first.");
      return;
    }

    if (user?.token.startsWith("demo-jwt-token-")) {
      const freshId = generateRandomLectureId();
      setLectureId(freshId);
      setIsSessionActive(true);
      setCurrentQR(generateRandomSignature());
      setSecondsLeft(5);
      setStudents([]);
      setPresentCount(0);
      simulateMockCheckIns();
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/v1/attendance/lectures`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          sectionId: selectedSectionId,
          topic: topic,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setLectureId(data.lecture.id);
        setIsSessionActive(true);
        if (data.qr) {
          setCurrentQR(data.qr.token);
        }
        setSecondsLeft(5);
        setStudents([]);
        setPresentCount(0);

        // Tell websocket server to broadcast the session activation
        if (socketConnected && socketRef.current) {
          socketRef.current.emit("session:start", {
            lectureId: data.lecture.id,
            radius: sessionType === "GEOFENCE" ? radius : undefined,
          });
        }
      } else {
        alert(data.error || "Failed to start lecture session.");
      }
    } catch (err) {
      console.error("Start session error:", err);
      alert("Failed to start session. Ensure the backend server is running.");
    }
  };

  const endSession = async () => {
    if (user?.token.startsWith("demo-jwt-token-")) {
      setIsSessionActive(false);
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/v1/attendance/lectures/${lectureId}/end`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (res.ok) {
        setIsSessionActive(false);
        if (socketConnected && socketRef.current) {
          socketRef.current.emit("session:end", { lectureId });
        }
      } else {
        const data = await res.json();
        alert(data.error || "Failed to terminate lecture session.");
      }
    } catch (err) {
      console.error("End session error:", err);
      alert("Failed to terminate session.");
    }
  };

  // Mock simulator when running offline for presentation wow factor
  const simulateMockCheckIns = () => {
    const mockStudents = [
      "Sohan kumar kj", "Chloe Bennett", "Elena Rostova", "Marcus Vance",
      "Devon Miller", "Rohan Gupta", "Sara Jenkins", "Li Wei"
    ];
    let index = 0;
    
    const interval = setInterval(() => {
      if (index >= mockStudents.length) {
        clearInterval(interval);
        return;
      }
      
      setStudents((prev) => {
        const studentId = `mock-std-${index}`;
        if (prev.some((s) => s.studentId === studentId)) return prev;
        
        return [
          {
            studentId,
            name: mockStudents[index],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            method: sessionType === "QR" ? "Dynamic QR" : "Geofencing",
          },
          ...prev,
        ];
      });

      setPresentCount((c) => Math.min(totalEnrolled, c + 1));
      index++;
    }, 4000);
  };

  if (!user) return null;

  return (
    <PageTransition>
      <div className="flex-1 flex flex-col p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full relative">
        {/* Background gradients */}
        <FloatingOrb color="violet" size={300} top="-10%" left="-10%" delay={0} />
        <FloatingOrb color="cyan" size={350} top="30%" right="-10%" delay={2} />
        <FloatingOrb color="emerald" size={250} bottom="10%" left="15%" delay={4} />

        {/* Roster Header */}
        <div className="sticky top-0 z-30 -mx-4 md:-mx-8 px-4 md:px-8 py-4 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <button 
              onClick={() => router.push("/")}
              className="glass-panel p-2.5 text-gray-400 hover:text-white transition-all hover:scale-105 border border-white/5 bg-white/2 cursor-pointer btn-elastic"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-wider text-white font-mono flex items-center gap-2">
                Mission HUD <Cpu className="h-5 w-5 text-secondary animate-pulse" />
              </h1>
              <p className="text-[10px] text-gray-400 font-mono font-bold tracking-widest uppercase">
                Instructor Profile: {user.firstName} {user.lastName} • CSE Dept
              </p>
            </div>
          </div>

          {/* Network & Socket status indicator */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button 
              onClick={() => setNotificationsOpen(true)}
              className="glass-panel p-2.5 text-gray-400 hover:text-white hover:border-primary/50 transition-all hover:scale-105 flex items-center justify-center cursor-pointer rounded-xl relative"
              aria-label="Open notifications"
            >
              <Bell className="h-4 w-4 text-cyan-400 animate-pulse" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
            </button>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-mono font-extrabold uppercase border ${
              socketConnected 
                ? "bg-accent/15 border-accent/25 text-accent animate-pulse-glow" 
                : "bg-yellow-500/15 border-yellow-500/25 text-yellow-500"
            }`}>
              <span className="relative flex h-2 w-2">
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${socketConnected ? "bg-accent" : "bg-yellow-500"}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${socketConnected ? "bg-accent" : "bg-yellow-500"}`}></span>
              </span>
              {socketConnected ? "Live Websocket" : "Local Simulator"}
            </div>
            <button
              onClick={() => { logout(); router.push("/login"); }}
              className="bg-red-500/10 border border-red-500/25 hover:bg-red-500/25 text-red-400 text-[10px] font-mono font-extrabold uppercase px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all btn-elastic cursor-pointer shadow-lg shadow-red-500/5 hover:shadow-red-500/20"
            >
              Logout
            </button>
          </div>
        </div>

      {/* Main Grid: left side controller, right side monitoring list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start z-10 relative w-full">
        
        {/* Left Side: Session Launch Configuration */}
        <div className="lg:col-span-5 space-y-6 w-full">
          <div className="perspective-card glass-panel p-6 border-primary/15 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent blur-md" />
            <h2 className="text-base font-black uppercase tracking-wider text-white mb-4.5 flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" /> Configuration Launch
            </h2>

            <div className="space-y-4">
              {/* Course Section Selector Dropdown */}
              <div>
                <label className="text-[9px] uppercase font-bold tracking-widest text-gray-500 block mb-2 font-mono">Assigned Matrix Section</label>
                {sections.length === 0 ? (
                  <div className="w-full bg-white/2 border border-white/5 rounded-xl py-3.5 px-4 text-xs text-gray-500 font-mono">
                    Loading assigned sections...
                  </div>
                ) : (
                  <select
                    value={selectedSectionId}
                    onChange={(e) => handleSectionChange(e.target.value)}
                    disabled={isSessionActive}
                    className="w-full bg-slate-900 border border-white/10 focus:border-primary/50 rounded-xl py-3 px-4 text-xs text-white outline-none cursor-pointer font-mono"
                  >
                    {sections.map((sec) => (
                      <option key={sec.id} value={sec.id} className="bg-gray-900 text-white font-mono">
                        {sec.course.code} - {sec.course.name} ({sec.name})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Lecture topic input */}
              <div>
                <label className="text-[9px] uppercase font-bold tracking-widest text-gray-500 block mb-2 font-mono">Roster Lecture Topic</label>
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isSessionActive}
                  className="w-full bg-slate-900 border border-white/10 focus:border-primary/50 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-600 outline-none transition-all font-mono"
                />
              </div>

              {/* Selector Tabs for QR / Geofencing */}
              <div>
                <label className="text-[9px] uppercase font-bold tracking-widest text-gray-500 block mb-2 font-mono">Assertion Parameters</label>
                <div className="grid grid-cols-2 gap-2 bg-white/2 p-1.5 rounded-xl border border-white/5 relative">
                  <button
                    disabled={isSessionActive}
                    onClick={() => setSessionType("QR")}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-mono font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                      sessionType === "QR" 
                        ? "bg-primary text-white shadow-md border border-primary/20 z-10" 
                        : "text-gray-500 hover:text-white"
                    }`}
                  >
                    <QrCode className="h-4 w-4" /> Dynamic QR
                  </button>
                  <button
                    disabled={isSessionActive}
                    onClick={() => setSessionType("GEOFENCE")}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-mono font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                      sessionType === "GEOFENCE" 
                        ? "bg-primary text-white shadow-md border border-primary/20 z-10" 
                        : "text-gray-500 hover:text-white"
                    }`}
                  >
                    <MapPin className="h-4 w-4" /> GPS Geofence
                  </button>
                </div>
              </div>

              {/* Optional Geofencing range slider */}
              {sessionType === "GEOFENCE" && (
                <div className="p-4 rounded-xl border border-white/5 bg-white/2 animate-fade-in space-y-3.5">
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase tracking-wider">
                    <span className="text-gray-400">Locator boundary:</span>
                    <span className="text-secondary">{radius} meters</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={radius} 
                    onChange={(e) => setRadius(Number(e.target.value))}
                    disabled={isSessionActive}
                    className="w-full accent-secondary cursor-pointer"
                  />
                </div>
              )}

              {/* Trigger Button: Toggle session start/end */}
              {!isSessionActive ? (
                <button
                  onClick={startSession}
                  className="glow-border w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/95 hover:to-secondary/95 text-white font-extrabold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/35 flex items-center justify-center gap-2 btn-elastic shimmer-effect cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-white text-cyan-glow" /> ACTIVATE ROSTER DISPATCH
                </button>
              ) : (
                <button
                  onClick={endSession}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 btn-elastic cursor-pointer"
                >
                  <Square className="h-4 w-4 fill-white animate-pulse" /> TERMINATE SESSION
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics display */}
          <div className="grid grid-cols-2 gap-4">
            <div className="perspective-card glass-panel p-4 flex flex-col justify-between border-white/10 bg-white/2 shadow-lg">
              <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-gray-500">Present Checked</span>
              <span className="text-3xl font-black text-white mt-2 font-mono text-secondary-glow">{presentCount}</span>
            </div>
            <div className="perspective-card glass-panel p-4 flex flex-col justify-between border-white/10 bg-white/2 shadow-lg">
              <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-gray-500">Absent Forecast</span>
              <span className="text-3xl font-black text-gray-400 mt-2 font-mono">{totalEnrolled - presentCount}</span>
            </div>
          </div>

          {/* Daily Lecture Schedule */}
          <div className="glass-panel p-6 border-white/10 space-y-4 relative overflow-hidden">
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-primary" /> Timeline Ledger
            </h3>
            <div className="space-y-3.5">
              {timetable.map((slot, idx) => (
                <div 
                  key={idx} 
                  className={`p-3.5 rounded-xl border flex justify-between items-center transition-all ${
                    slot.status === "ONGOING"
                      ? "bg-primary/10 border-primary/30 shadow-[inset_0_0_12px_rgba(139,92,246,0.03)]"
                      : slot.status === "COMPLETED"
                      ? "bg-white/2 border-white/5 opacity-50"
                      : "bg-white/2 border-white/5"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono font-extrabold text-primary-glow bg-primary/10 border border-primary/25 px-2.5 py-0.5 rounded-full">
                        {slot.code}
                      </span>
                      <h4 className="text-xs font-bold text-white tracking-wide">{slot.subject}</h4>
                    </div>
                    <p className="text-[10px] text-gray-500 font-mono mt-1.5 flex items-center gap-1 font-semibold uppercase">
                      <Clock className="h-3.5 w-3.5 text-secondary shrink-0" /> {slot.time} • {slot.room}
                    </p>
                  </div>
                  <span className={`text-[8px] font-mono font-extrabold px-2.5 py-1 rounded-xl uppercase tracking-widest border ${
                    slot.status === "ONGOING"
                      ? "bg-accent/20 text-accent border-accent/30 animate-pulse"
                      : slot.status === "COMPLETED"
                      ? "bg-gray-500/20 text-gray-400 border-white/5"
                      : "bg-secondary/20 text-secondary border-secondary/35"
                  }`}>
                    {slot.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Exemption Requests Panel */}
          <div className="glass-panel p-6 border-white/10 space-y-4 relative overflow-hidden">
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-primary" /> Pending Leave Exemption review
            </h3>
            {pendingLeaves.length === 0 ? (
              <p className="text-xs text-gray-500 py-2 font-mono uppercase tracking-wide">No pending leave claims registered.</p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {pendingLeaves.map((leave) => (
                  <div key={leave.id} className="p-4 rounded-xl border border-white/5 bg-white/2 space-y-3.5 animate-fade-in panel-interactive">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">{leave.student.firstName} {leave.student.lastName}</h4>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">{leave.student.email}</p>
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
                        {leave.startDate} to {leave.endDate}
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
                          className="p-1.5 text-accent hover:bg-accent/10 border border-accent/20 rounded-xl transition-all cursor-pointer btn-elastic"
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: dynamic visual layout displays */}
        <div className="lg:col-span-7 space-y-6 w-full">
          
          {/* Active visual layout: Dynamic QR display or Geofencing Radar */}
          {isSessionActive && (
            <div className="perspective-card glass-panel p-6 flex flex-col items-center justify-center text-center border-accent/20 bg-accent/5 animate-fade-in relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-accent/5 to-transparent blur-xl pointer-events-none" />
              
              {sessionType === "QR" ? (
                <div className="space-y-5 w-full z-10">
                  <div className="inline-flex items-center gap-1.5 bg-accent/20 border border-accent/40 px-3.5 py-1.5 rounded-full text-[9px] font-mono font-black text-accent tracking-widest uppercase animate-pulse">
                    ROTATING PROTOCOL: {currentQR}
                  </div>
                  
                  {/* Visual simulated QR graphics encased in moving border */}
                  <div className="glow-border relative p-6 bg-white rounded-2xl w-48 h-48 mx-auto shadow-2xl flex flex-col items-center justify-center border-4 border-primary">
                    <div className="w-full h-full border-4 border-dashed border-gray-900 flex items-center justify-center p-2 rounded">
                      <QrCode className="h-32 w-32 text-gray-900 animate-pulse" />
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 flex items-center justify-center gap-2 font-mono font-bold uppercase tracking-wider">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-accent" /> Regenerating in: <span className="font-extrabold text-white text-sm">{secondsLeft}s</span>
                  </p>
                </div>
              ) : (
                <div className="space-y-5 py-4 w-full z-10">
                  <div className="inline-flex items-center gap-1.5 bg-secondary/20 border border-secondary/40 px-3.5 py-1.5 rounded-full text-[9px] font-mono font-black text-secondary tracking-widest uppercase animate-pulse">
                    GPS LOCKOUT RADAR ACTIVE
                  </div>
                  
                  {/* Visual simulated conic radar mapping */}
                  <div className="relative w-48 h-48 mx-auto flex items-center justify-center border border-white/5 rounded-full radar-grid overflow-hidden">
                    <div className="absolute inset-0 border-2 border-secondary/20 rounded-full animate-ping"></div>
                    <div className="absolute w-36 h-36 border border-secondary/35 rounded-full flex items-center justify-center">
                      <div className="w-24 h-24 border border-dashed border-secondary/50 rounded-full flex items-center justify-center">
                        <MapPin className="h-8 w-8 text-secondary animate-bounce" />
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 font-mono font-bold uppercase tracking-wider leading-relaxed">
                    Instruct students to launch locator checks within {radius}m classroom parameters.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Student Performance Analytics Chart */}
          <div className="glass-panel p-6 border-white/10 space-y-6 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-secondary/5 to-transparent blur-md" />
            <div>
              <h3 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
                <BarChart4 className="h-5 w-5 text-primary" /> Course Metrics Analytics
              </h3>
              <p className="text-[10px] text-gray-500 font-mono font-bold tracking-widest uppercase mt-0.5">COMPLIANCE & QUIZ SCORES COMPARATIVE</p>
            </div>
            
            <div className="h-56 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceStats} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#4b5563" fontSize={9} tickLine={false} />
                  <YAxis stroke="#4b5563" fontSize={9} tickLine={false} domain={[0, 100]} />
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
                  <Bar name="Avg Quiz (%)" dataKey="avgScore" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar name="Attendance (%)" dataKey="attendance" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Alerts Panel */}
          <div className="glass-panel p-6 border-red-500/20 bg-red-500/5 space-y-4 relative overflow-hidden">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-wider text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5 text-red-400" /> Student Risk Warnings
              </h3>
              <span className="bg-red-500/10 border border-red-500/25 text-red-400 text-[9px] font-mono font-extrabold px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
                {riskAlerts.length} Flagged
              </span>
            </div>
            
            {riskAlerts.length === 0 ? (
              <p className="text-xs text-gray-500 font-mono uppercase tracking-wide">All student compliance parameters normal.</p>
            ) : (
              <div className="space-y-3">
                {riskAlerts.map((riskItem) => (
                  <div key={riskItem.id} className="p-3.5 rounded-xl border border-red-500/15 bg-slate-950/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-red-500/30 transition-all panel-interactive">
                    <div>
                      <h4 className="text-xs font-bold text-white tracking-wide uppercase">{riskItem.name}</h4>
                      <p className="text-[11px] text-gray-400 mt-1">{riskItem.reason}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-2.5 md:pt-0">
                      <span className="text-xs font-mono font-extrabold text-red-400 uppercase">{riskItem.rate}% INDEX</span>
                      <div className="flex gap-1.5 font-mono">
                        <button 
                          onClick={() => {
                            window.alert(`Warning notification sent to ${riskItem.name} (${riskItem.rate}% compliance).`);
                            handleDismissRiskAlert(riskItem.id);
                          }}
                          className="px-3 py-1.5 bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 text-red-400 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer btn-elastic"
                        >
                          <Mail className="h-3 w-3" /> dispatch warning
                        </button>
                        <button 
                          onClick={() => handleDismissRiskAlert(riskItem.id)}
                          className="p-1.5 text-gray-400 hover:text-white border border-white/5 bg-white/5 rounded-lg transition-all cursor-pointer"
                          title="Dismiss"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assignment Management Panel */}
          <div className="glass-panel p-6 border-white/10 space-y-6 relative overflow-hidden shadow-2xl">
            <div>
              <h3 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> Coursework Publisher
              </h3>
              <p className="text-[10px] text-gray-500 font-mono font-bold tracking-widest uppercase mt-0.5">POST ASSIGNMENTS & HOMEWORK</p>
            </div>

            {/* Posting Form */}
            <form onSubmit={handleAddAssignment} className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white/2 p-4.5 rounded-xl border border-white/5">
              <div className="md:col-span-6">
                <label className="text-[9px] uppercase font-bold tracking-widest text-gray-500 block mb-1 font-mono">Assignment Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. SRS Documentation Design" 
                  value={newAsgTitle}
                  onChange={(e) => setNewAsgTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-white/5 rounded-lg py-2 px-3 text-xs text-white placeholder-gray-600 outline-none focus:border-primary/50 transition-all font-mono"
                />
              </div>
              <div className="md:col-span-3">
                <label className="text-[9px] uppercase font-bold tracking-widest text-gray-500 block mb-1 font-mono">Deadline Date</label>
                <input 
                  type="text" 
                  placeholder="e.g. June 05, 2026" 
                  value={newAsgDeadline}
                  onChange={(e) => setNewAsgDeadline(e.target.value)}
                  className="w-full bg-slate-900 border border-white/5 rounded-lg py-2 px-3 text-xs text-white placeholder-gray-600 outline-none focus:border-primary/50 transition-all font-mono"
                />
              </div>
              <div className="md:col-span-3 flex items-end">
                <button 
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/95 text-white font-extrabold text-[10px] font-mono uppercase tracking-widest py-2.5 rounded-lg transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 cursor-pointer btn-elastic"
                >
                  <Plus className="h-3.5 w-3.5" /> Publish Task
                </button>
              </div>
            </form>

            {/* Assignments List */}
            <div className="space-y-4">
              {assignments.map((asg) => (
                <div key={asg.id} className="p-4 rounded-xl border border-white/5 bg-white/2 panel-interactive">
                  <div className="flex justify-between items-start mb-2.5">
                    <div>
                      <h4 className="text-xs font-bold text-white tracking-wide uppercase">{asg.title}</h4>
                      <p className="text-[9px] text-gray-500 uppercase font-mono font-bold mt-1 tracking-wider">{asg.course}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono font-semibold">Due: {asg.deadline}</span>
                  </div>

                  <div className="flex items-center gap-4 mt-3.5">
                    <div className="flex-1 bg-slate-900 rounded-full h-1.5">
                      <div 
                        className="h-1.5 rounded-full bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/25"
                        style={{ width: `${asg.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold text-primary-glow font-mono shrink-0">
                      {asg.submissions}/{asg.total} ({asg.progress}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Announcement Publisher Panel */}
          <div className="glass-panel p-6 border-white/10 space-y-6 relative overflow-hidden shadow-2xl">
            <div>
              <h3 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" /> Notice Broadcasting
              </h3>
              <p className="text-[10px] text-gray-500 font-mono font-bold tracking-widest uppercase mt-0.5">BROADCAST REMINDERS TO STUDENT TERMINALS</p>
            </div>

            <form onSubmit={handlePublishAnnouncement} className="space-y-3 z-10 relative">
              <textarea
                placeholder="Broadcast a new memo or class reminder..."
                value={newAnnouncementText}
                onChange={(e) => setNewAnnouncementText(e.target.value)}
                rows={3}
                className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-600 outline-none focus:border-primary/50 transition-all resize-none font-mono"
              ></textarea>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/95 text-white font-extrabold text-[10px] font-mono uppercase tracking-widest py-2 px-4 rounded-lg transition-all shadow-md shadow-primary/20 flex items-center gap-1.5 cursor-pointer btn-elastic"
                >
                  <Send className="h-3.5 w-3.5 text-cyan-glow animate-pulse" /> BROADCAST SIGNALS
                </button>
              </div>
            </form>

            <div className="space-y-3.5 border-t border-white/5 pt-4">
              <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-gray-500 block">Matrix Logs</span>
              {announcements.map((ann) => (
                <div key={ann.id} className="p-3.5 rounded-xl border border-white/5 bg-white/2 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase tracking-wider">
                    <span className="bg-primary/10 border border-primary/25 text-primary-glow font-bold px-2.5 py-0.5 rounded-full">
                      {ann.section}
                    </span>
                    <span className="text-gray-500 font-mono">{ann.time}</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed font-medium">{ann.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Student Roster Log Table */}
          <div className="glass-panel p-6 border-primary/15 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-secondary/5 to-transparent blur-md" />
            <div className="flex justify-between items-center mb-4.5 relative">
              <h3 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Roster Attendance Log
              </h3>
              <button 
                disabled={students.length === 0}
                className="text-[9px] font-mono font-bold uppercase tracking-widest text-primary hover:text-white transition-colors flex items-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4" /> Export CSV
              </button>
            </div>

            {students.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500 relative">
                <UserX className="h-12 w-12 text-gray-700 mb-3.5 animate-pulse" />
                <h4 className="text-xs font-bold font-mono tracking-widest uppercase text-gray-400">NO SECURED MATRIX RECORDS</h4>
                <p className="text-[11px] max-w-xs mt-1.5 text-gray-500 leading-relaxed">Activate dynamic parameters and instruct students to connect signatures.</p>
              </div>
            ) : (
              <div className="overflow-x-auto animate-fade-in relative">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-500 font-extrabold uppercase tracking-widest text-[9px] pb-2">
                      <th className="py-2.5">STUDENT NAME</th>
                      <th className="py-2.5">VERIFICATION</th>
                      <th className="py-2.5">TIME LOGGED</th>
                      <th className="py-2.5 text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[11px]">
                    {students.map((student, idx) => (
                      <tr key={idx} className="text-gray-300 hover:bg-white/5 transition-colors">
                        <td className="py-3 font-extrabold text-white">{student.name}</td>
                        <td className="py-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-white/5 border border-white/10 text-gray-400 uppercase tracking-wider">
                            {student.method}
                          </span>
                        </td>
                        <td className="py-3 text-gray-400 font-medium">{student.timestamp}</td>
                        <td className="py-3 text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-accent/15 text-accent border border-accent/25 uppercase tracking-wider text-shadow-glow">
                            <Check className="h-3 w-3 text-accent" /> PRESENT
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
    <NotificationsPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
  </PageTransition>
);
}
