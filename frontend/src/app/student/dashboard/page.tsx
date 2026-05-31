"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import ThemeToggle from "@/components/ThemeToggle";
import AiInsightsPanel from "@/components/AiInsightsPanel";
import { 
  ArrowLeft, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  QrCode, 
  MapPin, 
  Clock, 
  Shield, 
  Wifi,
  WifiOff,
  Locate,
  Loader2,
  Calendar,
  FileText,
  Send,
  Award,
  ListTodo,
  Bell,
  Briefcase,
  BookOpen,
  Sparkles,
  Compass,
  Cpu,
  Layers,
  Zap,
  Target
} from "lucide-react";
import io, { Socket } from "socket.io-client";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";
import PageTransition from "@/components/ui/PageTransition";
import ScrollReveal from "@/components/ui/ScrollReveal";
import FloatingOrb from "@/components/ui/FloatingOrb";
import StatsCard from "@/components/ui/StatsCard";
import GlassCard from "@/components/ui/GlassCard";
import NotificationsPanel from "@/components/ui/NotificationsPanel";

interface SubjectStat {
  courseCode: string;
  courseName: string;
  rate: number;
  totalLectures: number;
  attended: number;
  status: "safe" | "warning" | "danger";
  prediction: string;
}

const trendData = [
  { name: "W1", rate: 70 },
  { name: "W2", rate: 78 },
  { name: "W3", rate: 75 },
  { name: "W4", rate: 82 },
  { name: "W5", rate: 80 },
  { name: "W6", rate: 85 },
  { name: "W7", rate: 80 },
];

const defaultSubjects: SubjectStat[] = [
  { 
    courseCode: "CS-401", 
    courseName: "Advanced Mathematics", 
    rate: 88, 
    totalLectures: 25, 
    attended: 22, 
    status: "safe", 
    prediction: "You can skip 2 lectures safely." 
  },
  { 
    courseCode: "CS-402", 
    courseName: "Data Structures & Algorithms", 
    rate: 64, 
    totalLectures: 25, 
    attended: 16, 
    status: "danger", 
    prediction: "Must attend next 3 lectures to hit 75%!" 
  },
  { 
    courseCode: "CS-403", 
    courseName: "Computer Networks", 
    rate: 76, 
    totalLectures: 25, 
    attended: 19, 
    status: "warning", 
    prediction: "Caution: Do not miss next lecture." 
  },
  { 
    courseCode: "CS-404", 
    courseName: "Software Engineering", 
    rate: 92, 
    totalLectures: 25, 
    attended: 23, 
    status: "safe", 
    prediction: "Excellent compliance." 
  },
];

const studentTimetable = [
  { time: "09:00 AM - 10:30 AM", code: "CS-401", subject: "Advanced Mathematics", room: "Room A-102" },
  { time: "11:00 AM - 12:30 PM", code: "CS-402", subject: "Data Structures & Algorithms", room: "Lab-3" },
  { time: "02:00 PM - 03:30 PM", code: "CS-404", subject: "Software Engineering", room: "Room A-104" },
];

const studentAssignments = [
  { id: "asg-1", subject: "Data Structures", task: "Red-Black Tree Insertion", daysLeft: 2, progress: 40, status: "IN_PROGRESS" },
  { id: "asg-2", subject: "Software Engineering", task: "SRS Document Draft", daysLeft: 5, progress: 90, status: "REVIEW" },
  { id: "asg-3", subject: "Computer Networks", task: "TCP/UDP Protocol Simulation", daysLeft: 7, progress: 10, status: "NOT_STARTED" },
];

const studentNotifications = [
  { id: "not-1", type: "system", message: "HOD approved your leave request for May 12.", time: "10 mins ago" },
  { id: "not-2", type: "placement", message: "Google posted SDE Intern role. Eligibility CGPA: 8.0.", time: "2 hours ago" },
  { id: "not-3", type: "event", message: "Register for CodeCraft Hackathon before May 30.", time: "1 day ago" },
];

const studentEventsAndClubs = [
  { title: "CodeCraft Hackathon", date: "June 01, 2026", location: "Seminar Hall-2", type: "Tech Event" },
  { title: "RoboWars Exhibition", date: "June 04, 2026", location: "Main Ground", type: "Club Activity" },
  { title: "AI/ML Guest Seminar", date: "June 08, 2026", location: "Auditorium", type: "Academic Event" },
];

const placementPostings = [
  { company: "Google", role: "Software Engineering Intern", ctc: "12 LPA", deadline: "May 28", status: "ELIGIBLE" },
  { company: "Microsoft", role: "Support Engineer", ctc: "9.5 LPA", deadline: "June 03", status: "ELIGIBLE" },
  { company: "Amazon", role: "Cloud Support Associate", ctc: "8 LPA", deadline: "June 10", status: "ELIGIBLE" },
];

export default function StudentDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  // Active checking status
  const [activeLecture, setActiveLecture] = useState<{
    lectureId: string;
    topic: string;
    instructor: string;
    method: "QR" | "GEOFENCE";
  } | null>(null);

  // States
  const [overallRate, setOverallRate] = useState(80);
  const [subjects, setSubjects] = useState<SubjectStat[]>(defaultSubjects);
  const [socketConnected, setSocketConnected] = useState(false);
  const [geolocationCoords, setGeolocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Interactive scanning simulation states
  const [checkinStep, setCheckinStep] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [scannedCode, setScannedCode] = useState("");
  const [distanceCalculated, setDistanceCalculated] = useState<number | null>(null);
  const [latestQR, setLatestQR] = useState<{ token: string; timestamp: number } | null>(null);
  const [gamificationReward, setGamificationReward] = useState<{
    xpAwarded: number;
    newBadges: string[];
    newAchievements: string[];
  } | null>(null);

  // Leave request state
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveType, setLeaveType] = useState("MEDICAL");
  const [leaveStartDate, setLeaveStartDate] = useState("");
  const [leaveEndDate, setLeaveEndDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveHistory, setLeaveHistory] = useState<Array<{
    id: string; type: string; startDate: string; endDate: string; reason: string; status: string;
  }>>([
    { id: "lv-1", type: "MEDICAL", startDate: "2026-05-12", endDate: "2026-05-13", reason: "High fever - doctor advised rest.", status: "APPROVED" },
    { id: "lv-2", type: "EVENT", startDate: "2026-05-18", endDate: "2026-05-18", reason: "Inter-college coding competition.", status: "PENDING" },
  ]);

  // Event Registration States
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);
  const [registeringEvent, setRegisteringEvent] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(studentNotifications);

  const handleRegisterEvent = (eventTitle: string) => {
    if (registeredEvents.includes(eventTitle)) {
      // Unregister
      setRegisteredEvents(prev => prev.filter(title => title !== eventTitle));
      setNotifications(prev => [
        {
          id: `not-${Date.now()}`,
          type: "event",
          message: `Cancelled registration for ${eventTitle}.`,
          time: "Just now"
        },
        ...prev
      ]);
      return;
    }

    setRegisteringEvent(eventTitle);
    setTimeout(() => {
      setRegisteredEvents(prev => [...prev, eventTitle]);
      setRegisteringEvent(null);
      const ev = studentEventsAndClubs.find(e => e.title === eventTitle);
      setNotifications(prev => [
        {
          id: `not-${Date.now()}`,
          type: "event",
          message: `Successfully registered for ${eventTitle}! Location: ${ev?.location || 'Seminar Hall-2'}.`,
          time: "Just now"
        },
        ...prev
      ]);
    }, 800);
  };

  const socketRef = useRef<Socket | null>(null);

  // Enable rendering client-side UI
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Authentication check and redirect
  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      router.push("/login");
    }
  }, [isMounted, isAuthenticated, router]);

  // Fetch student stats, leave history and active lecture on mount / credentials load
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    if (user.token.startsWith("demo-jwt-token-")) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const headers = {
      Authorization: `Bearer ${user.token}`,
    };

    const fetchStudentStats = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/attendance/student/stats`, { headers });
        if (res.ok) {
          const data = await res.json();
          setOverallRate(data.overallRate);
          setSubjects(data.subjects);
        }
      } catch (err) {
        console.error("Failed to load student compliance stats:", err);
      }
    };

    const fetchLeaveHistory = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/leaves/student`, { headers });
        if (res.ok) {
          const data = await res.json();
          const formattedHistory = data.leaves.map((l: { id: string; type?: string; startDate: string; endDate: string; reason: string; status: string }) => ({
            id: l.id,
            type: l.type || "OTHER",
            startDate: new Date(l.startDate).toISOString().split("T")[0],
            endDate: new Date(l.endDate).toISOString().split("T")[0],
            reason: l.reason,
            status: l.status,
          }));
          setLeaveHistory(formattedHistory);
        }
      } catch (err) {
        console.error("Failed to load student leave requests:", err);
      }
    };

    fetchStudentStats();
    fetchLeaveHistory();
  }, [isAuthenticated, user]);

  // Helper to fetch active ongoing lecture details from DB
  const fetchActiveLecture = useCallback(async () => {
    if (!user) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/v1/attendance/lectures/active`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.lectures && data.lectures.length > 0) {
          const active = data.lectures[0];
          setActiveLecture({
            lectureId: active.id,
            topic: active.topic || `${active.section.course.name} - Section ${active.section.name}`,
            instructor: `Dr. ${active.section.instructor.firstName} ${active.section.instructor.lastName}`,
            method: active.radius ? "GEOFENCE" : "QR",
          });
          // Join room
          if (socketRef.current) {
            socketRef.current.emit("session:join", { lectureId: active.id });
          }
        } else {
          setActiveLecture(null);
        }
      }
    } catch (err) {
      console.error("Failed to fetch active lectures:", err);
    }
  }, [user]);

  // WebSockets setup
  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const socket = io(API_URL, {
      reconnectionAttempts: 3,
      timeout: 2000,
    });
    
    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
      console.log("Student Socket Connected!");
      if (isAuthenticated && user && !user.token.startsWith("demo-jwt-token-")) {
        fetchActiveLecture();
      }
    });

    socket.on("connect_error", () => {
      setSocketConnected(false);
      console.log("WebSocket connection failed. Falling back to offline check-in simulation.");
    });

    // Listen to session broadcast triggers
    socket.on("session:broadcast", (data: { lectureId: string; radius?: number; qr?: { token: string; timestamp: number } }) => {
      if (data.qr) {
        setLatestQR({ token: data.qr.token, timestamp: data.qr.timestamp });
      }
      if (isAuthenticated && user && !user.token.startsWith("demo-jwt-token-")) {
        fetchActiveLecture();
      } else {
        setActiveLecture({
          lectureId: data.lectureId,
          topic: "Software Engineering - Room A-102",
          instructor: "Dr. Priya Sharma",
          method: data.radius ? "GEOFENCE" : "QR",
        });
      }
    });

    socket.on("qr:refresh", (data: { qr: { token: string; timestamp: number } }) => {
      if (data.qr) {
        setLatestQR({ token: data.qr.token, timestamp: data.qr.timestamp });
      }
    });

    socket.on("session:ended", () => {
      setActiveLecture(null);
      setCheckinStep("idle");
      setGamificationReward(null);
      setLatestQR(null);
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, user, fetchActiveLecture]);

  // Simulated browser trigger to mock receiving a live session broadcast for offline demo testing
  const triggerMockSession = (type: "QR" | "GEOFENCE") => {
    setActiveLecture({
      lectureId: "mock-session-id-999",
      topic: "Software Engineering - Room A-102",
      instructor: "Dr. Priya Sharma",
      method: type,
    });
  };

  // Perform Location Check using browser API
  const handleLocationVerification = () => {
    setGamificationReward(null);
    setCheckinStep("verifying");
    
    if (!navigator.geolocation) {
      setErrorMessage("Geolocation is not supported by your browser.");
      setCheckinStep("error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setGeolocationCoords({ lat: latitude, lng: longitude });

        if (user?.token.startsWith("demo-jwt-token-")) {
          setTimeout(() => {
            if (socketRef.current && socketConnected && activeLecture) {
              socketRef.current.emit("check_in:success", {
                lectureId: activeLecture.lectureId,
                studentId: user?.id || "student-demo-001",
                name: `${user?.firstName} ${user?.lastName}`,
              });
            }
            setDistanceCalculated(12);
            setCheckinStep("success");
            setGamificationReward({
              xpAwarded: 20,
              newBadges: ["Perfect Week"],
              newAchievements: ["Streak Pioneer"]
            });
          }, 1500);
          return;
        }

        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
          const res = await fetch(`${API_URL}/api/v1/attendance/verify-checkin`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user?.token}`,
            },
            body: JSON.stringify({
              lectureId: activeLecture?.lectureId,
              latitude: 28.6139,
              longitude: 77.209,
              qrToken: latestQR?.token || "mock-token",
              qrTimestamp: latestQR?.timestamp || Date.now(),
            }),
          });

          const data = await res.json();
          if (res.ok) {
            setDistanceCalculated(12);
            setCheckinStep("success");
            setGamificationReward(data.gamification || null);
            
            if (socketRef.current && socketConnected && activeLecture) {
              socketRef.current.emit("check_in:success", {
                lectureId: activeLecture.lectureId,
                studentId: user?.id || "student-demo-001",
                name: `${user?.firstName} ${user?.lastName}`,
              });
            }

            // Reload stats
            const statsRes = await fetch(`${API_URL}/api/v1/attendance/student/stats`, {
              headers: { Authorization: `Bearer ${user?.token}` },
            });
            if (statsRes.ok) {
              const statsData = await statsRes.json();
              setOverallRate(statsData.overallRate);
              setSubjects(statsData.subjects);
            }
          } else {
            setErrorMessage(data.error || "Location verification failed.");
            setCheckinStep("error");
          }
        } catch (err) {
          console.error("Geofence check-in error:", err);
          setErrorMessage("Failed to connect to verification servers.");
          setCheckinStep("error");
        }
      },
      async () => {
        if (user?.token.startsWith("demo-jwt-token-")) {
          setTimeout(() => {
            setDistanceCalculated(8);
            setCheckinStep("success");
            setGamificationReward({
              xpAwarded: 20,
              newBadges: ["Perfect Week"],
              newAchievements: ["Streak Pioneer"]
            });
          }, 1500);
          return;
        }

        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
          const res = await fetch(`${API_URL}/api/v1/attendance/verify-checkin`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user?.token}`,
            },
            body: JSON.stringify({
              lectureId: activeLecture?.lectureId,
              latitude: 28.6139,
              longitude: 77.209,
              qrToken: latestQR?.token || "mock-token",
              qrTimestamp: latestQR?.timestamp || Date.now(),
            }),
          });
          const data = await res.json();
          if (res.ok) {
            setDistanceCalculated(5);
            setCheckinStep("success");
            setGamificationReward(data.gamification || null);
            
            if (socketRef.current && socketConnected && activeLecture) {
              socketRef.current.emit("check_in:success", {
                lectureId: activeLecture.lectureId,
                studentId: user?.id || "student-demo-001",
                name: `${user?.firstName} ${user?.lastName}`,
              });
            }

            const statsRes = await fetch(`${API_URL}/api/v1/attendance/student/stats`, {
              headers: { Authorization: `Bearer ${user?.token}` },
            });
            if (statsRes.ok) {
              const statsData = await statsRes.json();
              setOverallRate(statsData.overallRate);
              setSubjects(statsData.subjects);
            }
          } else {
            setErrorMessage(data.error || "Location verification failed.");
            setCheckinStep("error");
          }
        } catch {
          setErrorMessage("Location blocked and verification servers offline.");
          setCheckinStep("error");
        }
      }
    );
  };

  const handleQRScanSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedCode) return;

    setGamificationReward(null);
    setCheckinStep("verifying");

    if (user?.token.startsWith("demo-jwt-token-")) {
      setTimeout(() => {
        setCheckinStep("success");
        setGamificationReward({
          xpAwarded: 20,
          newBadges: ["Perfect Week"],
          newAchievements: ["Streak Pioneer"]
        });
      }, 1500);
      return;
    }

    let token = scannedCode;
    let timestamp = Date.now();

    try {
      const parsed = JSON.parse(scannedCode);
      if (parsed.token) {
        token = parsed.token;
        timestamp = parsed.timestamp || Date.now();
      }
    } catch {
      // scannedCode is raw string
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/v1/attendance/verify-checkin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          lectureId: activeLecture?.lectureId,
          latitude: 28.6139,
          longitude: 77.209,
          qrToken: token,
          qrTimestamp: timestamp,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCheckinStep("success");
        setGamificationReward(data.gamification || null);
        
        if (socketRef.current && socketConnected && activeLecture) {
          socketRef.current.emit("check_in:success", {
            lectureId: activeLecture.lectureId,
            studentId: user?.id || "student-demo-001",
            name: `${user?.firstName} ${user?.lastName}`,
          });
        }

        const statsRes = await fetch(`${API_URL}/api/v1/attendance/student/stats`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setOverallRate(statsData.overallRate);
          setSubjects(statsData.subjects);
        }
      } else {
        setStatus({ type: "error", message: data.error || "QR signature verification failed." });
        setCheckinStep("error");
      }
    } catch (err) {
      console.error("QR verification error:", err);
      setErrorMessage("Failed to connect to verification servers.");
      setCheckinStep("error");
    }
  };

  const setStatus = (st: { type: "success" | "error"; message: string } | null) => {
    if (st && st.type === "error") {
      setErrorMessage(st.message);
    }
  };

  if (!isMounted || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="flex-1 flex flex-col p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full relative">
        {/* Background gradients */}
        <FloatingOrb color="violet" size={300} top="-10%" left="-10%" delay={0} />
        <FloatingOrb color="cyan" size={350} top="30%" right="-10%" delay={2} />
        <FloatingOrb color="emerald" size={250} bottom="10%" left="15%" delay={4} />

        {/* Sticky Header & Nav Wrapper */}
        <div className="sticky top-0 z-30 -mx-4 md:-mx-8 px-4 md:px-8 py-4 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 space-y-4">
          {/* Roster Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative">
            <div className="flex items-center gap-3.5">
              <button 
                onClick={() => router.push("/")}
                className="glass-panel p-2.5 text-gray-400 hover:text-white transition-all hover:scale-105 border border-white/5 bg-white/2 cursor-pointer btn-elastic"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h1 className="text-2xl font-black uppercase tracking-wider text-white font-mono flex items-center gap-2">
                  Student HUD <Cpu className="h-5 w-5 text-secondary animate-pulse" />
                </h1>
                <p className="text-[10px] text-gray-400 font-mono font-bold tracking-widest uppercase">
                  {user.firstName} {user.lastName} • Roll: {user.institutionalId || "CS-2026-44"}
                </p>
              </div>
            </div>

            {/* Network & Socket status indicator */}
            <div className="flex items-center gap-3">
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
                {socketConnected ? "Link Sync Active" : "Simulated Core"}
              </div>
              <button
                onClick={() => { logout(); router.push("/login"); }}
                className="bg-red-500/10 border border-red-500/30 hover:bg-red-500/25 text-red-400 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all btn-elastic cursor-pointer shadow-lg shadow-red-500/5 hover:shadow-red-500/20"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2.5 relative">
            <button
              onClick={() => router.push("/student/dashboard")}
              className="bg-primary text-white border border-primary/30 flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-mono font-extrabold uppercase shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <TrendingUp className="h-4 w-4 text-cyan-glow" /> Analytics Board
            </button>
            <button
              onClick={() => router.push("/student/attendance")}
              className="bg-white/2 border border-white/5 text-gray-400 hover:text-white hover:bg-white/5 flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-mono font-extrabold uppercase transition-all hover:scale-[1.02] cursor-pointer hover:border-accent/25"
            >
              <ListTodo className="h-4 w-4" /> Attendance Log
            </button>
            <button
              onClick={() => router.push("/student/events")}
              className="bg-white/2 border border-white/5 text-gray-400 hover:text-white hover:bg-white/5 flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-mono font-extrabold uppercase transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Calendar className="h-4 w-4" /> Events Hub
            </button>
            <button
              onClick={() => router.push("/student/gamification")}
              className="bg-white/2 border border-white/5 text-gray-400 hover:text-white hover:bg-white/5 flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-mono font-extrabold uppercase transition-all hover:scale-[1.02] bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10 cursor-pointer"
            >
              <Award className="h-4 w-4 text-yellow-400 animate-pulse" /> Gamification Core
            </button>
          </div>
        </div>

      {/* Main Grid Layout: Left side cards, Right side scanner panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start z-10 relative w-full">
        
        {/* Left Side: Subject-wise Analytics Card Grid */}
        <div className="lg:col-span-7 space-y-6 w-full">
          <div className="perspective-card glass-panel p-6 border-primary/15 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-secondary/5 to-transparent blur-md" />
            <div className="flex justify-between items-center mb-6 relative">
              <div>
                <h3 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
                  Academic Compliance <TrendingUp className="h-4.5 w-4.5 text-secondary" />
                </h3>
                <p className="text-[10px] text-gray-500 font-mono font-bold tracking-widest uppercase">AUTUMN SEMESTER CYCLE</p>
              </div>
              <div className="text-right flex flex-col items-end gap-1.5">
                <span className="text-3xl font-black bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent text-secondary-glow">{overallRate}%</span>
                <p className="text-[9px] text-gray-500 uppercase tracking-widest font-extrabold font-mono">GLOBAL INDEX</p>
                <button
                  onClick={() => router.push("/student/attendance")}
                  className="text-[9px] font-bold text-primary hover:text-white border border-primary/20 hover:border-primary/50 bg-primary/5 hover:bg-primary/15 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                >
                  <ListTodo className="h-3 w-3" /> Full History
                </button>
              </div>
            </div>

            {/* Recharts Analytics Compliance History */}
            <div className="mb-6 p-4 rounded-xl border border-white/5 bg-white/2 space-y-3 relative overflow-hidden">
              <span className="text-[9px] uppercase font-bold tracking-widest text-gray-400 flex items-center gap-1.5 font-mono">
                <Calendar className="h-3.5 w-3.5 text-primary" /> WEEKLY MATRIX RECORD
              </span>
              <div className="h-40 w-full flex items-center justify-center">
                {isMounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#4b5563" fontSize={9} tickLine={false} />
                      <YAxis stroke="#4b5563" fontSize={9} tickLine={false} domain={[50, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(13, 10, 24, 0.95)",
                          border: "1px solid rgba(139, 92, 246, 0.2)",
                          borderRadius: "12px",
                          fontSize: "10px",
                          color: "#fff",
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="rate" 
                        stroke="#06b6d4" 
                        fillOpacity={1} 
                        fill="url(#colorRate)" 
                        strokeWidth={2.5}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <span className="text-[10px] text-gray-500 font-mono">Loading data feeds...</span>
                )}
              </div>
            </div>

            {/* Subjects Lists */}
            <div className="space-y-4">
              {subjects.map((sub, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between md:items-center gap-4 panel-interactive ${
                    sub.status === "danger" 
                      ? "bg-red-500/5 border-red-500/25 shadow-[inset_0_0_12px_rgba(239,68,68,0.03)]" 
                      : sub.status === "warning"
                      ? "bg-yellow-500/5 border-yellow-500/25 shadow-[inset_0_0_12px_rgba(245,158,11,0.03)]"
                      : "bg-white/2 border-white/5"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between md:justify-start gap-4 mb-2">
                      <span className="text-[9px] font-mono font-extrabold text-primary-glow bg-primary/10 border border-primary/30 px-3 py-1 rounded-full">{sub.courseCode}</span>
                      <h4 className="text-xs font-bold text-gray-200 tracking-wide">{sub.courseName}</h4>
                    </div>
                    
                    {/* Micro Progress Bar */}
                    <div className="flex items-center gap-4 mt-3.5">
                      <div className="flex-1 bg-white/5 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${
                            sub.status === "danger" 
                              ? "bg-red-500 shadow-lg shadow-red-500/40 animate-pulse" 
                              : sub.status === "warning" 
                              ? "bg-yellow-500 shadow-lg shadow-yellow-500/40" 
                              : "bg-accent shadow-lg shadow-accent/40"
                          }`}
                          style={{ width: `${sub.rate}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs font-black shrink-0 ${
                        sub.status === "danger" 
                          ? "text-red-400 text-shadow-glow" 
                          : sub.status === "warning" 
                          ? "text-yellow-400" 
                          : "text-accent"
                      }`}>{sub.rate}%</span>
                    </div>
                  </div>

                  <div className="md:w-56 text-left md:text-right flex items-center md:justify-end gap-2 border-t md:border-t-0 border-white/5 pt-2.5 md:pt-0">
                    <span className="text-[10px] text-gray-400 flex items-center gap-1.5 font-mono font-bold tracking-wide leading-relaxed">
                      {sub.status === "danger" ? (
                        <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                      ) : sub.status === "warning" ? (
                        <AlertTriangle className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5 text-accent shrink-0" />
                      )}
                      <span className={sub.status === "danger" ? "text-red-300" : sub.status === "warning" ? "text-yellow-300" : "text-gray-400"}>{sub.prediction}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: AI-Powered Insights & Recommendations */}
          <AiInsightsPanel />

          {/* Section 3: Upcoming Events & Club Activities */}
          <div className="glass-panel p-6 border-white/5 space-y-4">
            <div>
              <h3 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Compass className="h-4.5 w-4.5 text-secondary animate-pulse" /> Events Bulletin
              </h3>
              <p className="text-[10px] text-gray-400 font-mono font-bold tracking-widest uppercase mt-0.5">CAMPUS EXTRACURRICULAR MATRIX</p>
            </div>

            <div className="space-y-3.5">
              {studentEventsAndClubs.map((ev, idx) => {
                const isRegistered = registeredEvents.includes(ev.title);
                const isRegistering = registeringEvent === ev.title;
                return (
                  <div key={idx} className="p-4 rounded-xl border border-white/5 bg-white/2 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-white/15 transition-all">
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="text-xs font-extrabold text-white">{ev.title}</h4>
                        <span className="bg-secondary/15 border border-secondary/30 text-secondary-glow text-[8px] font-mono font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {ev.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-mono font-semibold mt-1.5 flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-secondary" /> {ev.location}</span>
                        <span className="text-gray-700">•</span>
                        <span className="text-gray-400 font-mono">{ev.date}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3 justify-end shrink-0">
                      {isRegistering ? (
                        <button disabled className="bg-primary/10 border border-primary/20 text-primary-glow text-[10px] font-mono font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-not-allowed">
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> Log...
                        </button>
                      ) : isRegistered ? (
                        <button 
                          onClick={() => handleRegisterEvent(ev.title)} 
                          className="group relative bg-emerald-500/10 hover:bg-red-500/15 border border-emerald-500/25 hover:border-red-500/30 text-emerald-400 hover:text-red-400 text-[10px] font-mono font-extrabold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all duration-200 cursor-pointer"
                        >
                          <span className="group-hover:hidden flex items-center gap-1.5">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> Registered
                          </span>
                          <span className="hidden group-hover:flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-red-400" /> Unregister
                          </span>
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleRegisterEvent(ev.title)} 
                          className="bg-primary hover:bg-primary/95 text-white text-[10px] font-mono font-extrabold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-primary/10 hover:shadow-primary/25 border border-primary/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                        >
                          Register
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Live active check-in widget */}
        <div className="lg:col-span-5 space-y-6 w-full">
          
          {/* Active session trigger simulator widgets (For easy offline demo) */}
          {!socketConnected && !activeLecture && (
            <div className="glass-panel p-4 border-dashed border-white/10 text-center space-y-3 relative overflow-hidden">
              <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-gray-500 block">Offline Simulation Triggers</span>
              <div className="flex gap-2.5">
                <button 
                  onClick={() => triggerMockSession("QR")}
                  className="flex-1 bg-primary/10 border border-primary/25 hover:bg-primary/20 text-primary-glow text-[10px] font-mono font-extrabold py-2.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer"
                >
                  Mock Live QR
                </button>
                <button 
                  onClick={() => triggerMockSession("GEOFENCE")}
                  className="flex-1 bg-secondary/10 border border-secondary/25 hover:bg-secondary/20 text-secondary-glow text-[10px] font-mono font-extrabold py-2.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer"
                >
                  Mock GPS
                </button>
              </div>
            </div>
          )}

          {activeLecture ? (
            <div className="glass-panel p-6 border-accent/20 bg-accent/5 animate-fade-in space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-accent/10 to-transparent blur-md" />
              
              {/* Dynamic Header details */}
              <div className="flex justify-between items-start gap-4 z-10 relative">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-accent/20 border border-accent/40 px-3 py-1 rounded-full text-[9px] font-mono font-black text-accent tracking-widest uppercase mb-2.5 animate-pulse">
                    Live Check-in Open
                  </div>
                  <h3 className="text-base font-extrabold text-white tracking-wide">{activeLecture.topic}</h3>
                  <p className="text-xs text-gray-400 font-medium">Instructor: {activeLecture.instructor}</p>
                </div>
                <div className="bg-white/5 border border-white/15 p-3 rounded-xl relative">
                  {activeLecture.method === "QR" ? (
                    <QrCode className="h-5 w-5 text-primary" />
                  ) : (
                    <MapPin className="h-5 w-5 text-secondary" />
                  )}
                  <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-tr from-primary to-secondary opacity-30 blur-sm z-[-1]" />
                </div>
              </div>

              {/* Attendance Marking flow controller card */}
              {checkinStep === "idle" && (
                <div className="space-y-4 z-10 relative">
                  {activeLecture.method === "QR" ? (
                    <form onSubmit={handleQRScanSimulation} className="space-y-4">
                      <p className="text-[11px] text-gray-500 leading-snug">
                        Input the dynamic cryptographic signature code displayed on the classroom projection screen to complete authentication.
                      </p>
                      
                      {/* Interactive Rotating Target Frame */}
                      <div className="relative flex justify-center py-4">
                        <div className="w-24 h-24 rounded-full border border-primary/20 flex items-center justify-center relative animate-spin-slow">
                          <Target className="h-10 w-10 text-primary/45" />
                          <div className="absolute inset-0 rounded-full border-t border-b border-primary/60" />
                          <div className="absolute -inset-1 rounded-full border-l border-r border-secondary/35 animate-reverse-spin" />
                        </div>
                      </div>

                      <input 
                        type="text" 
                        placeholder="Enter Token (e.g. A3F9B2C4)"
                        value={scannedCode}
                        onChange={(e) => setScannedCode(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 focus:border-primary/50 rounded-xl py-3.5 px-4 text-xs text-center text-white placeholder-gray-600 uppercase tracking-widest outline-none transition-all font-mono font-extrabold shadow-inner"
                      />
                      <button
                        type="submit"
                        disabled={!scannedCode}
                        className="glow-border w-full bg-gradient-to-r from-primary to-secondary text-white font-extrabold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-lg disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2 btn-elastic shimmer-effect cursor-pointer"
                      >
                        Verify QR Scan Code <QrCode className="h-4 w-4 text-cyan-glow" />
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-[11px] text-gray-500 leading-snug">
                        Trigger localized GPS coordinate checks to verify physical proximity with classroom geofence boundaries.
                      </p>

                      {/* Tactical Conic Radar Screen */}
                      <div className="w-full h-36 rounded-xl border border-white/5 overflow-hidden relative radar-grid">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full border border-secondary/20 flex items-center justify-center relative">
                            <Locate className="h-6 w-6 text-secondary/50 animate-pulse" />
                            <div className="absolute -inset-3 rounded-full border border-secondary/10" />
                            <div className="absolute -inset-6 rounded-full border border-secondary/5" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-3 text-[8px] font-mono text-gray-500 font-bold uppercase">GPS RANGE LOCKER ACTIVE</div>
                      </div>

                      <button
                        onClick={handleLocationVerification}
                        className="glow-border w-full bg-gradient-to-r from-secondary to-accent text-white font-extrabold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 btn-elastic shimmer-effect cursor-pointer"
                      >
                        Verify GPS Proximity <Locate className="h-4 w-4 text-cyan-glow animate-pulse" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {checkinStep === "verifying" && (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 z-10 relative">
                  <div className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin flex items-center justify-center">
                    <Cpu className="h-6 w-6 text-primary animate-pulse" />
                  </div>
                  <h4 className="text-xs font-bold font-mono tracking-widest uppercase text-white">Asserting Session Credentials</h4>
                  <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Syncing geolocation descriptors and cryptographic seals...</p>
                </div>
              )}

              {checkinStep === "success" && (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-5 animate-fade-in z-10 relative">
                  <div className="bg-accent/20 border border-accent/40 p-4.5 rounded-full shadow-lg shadow-accent/25 relative animate-float">
                    <CheckCircle className="h-9 w-9 text-accent animate-bounce" />
                    <div className="absolute -inset-1 rounded-full bg-accent opacity-20 blur-sm z-[-1]" />
                  </div>
                  <div>
                    <h4 className="text-base font-black uppercase tracking-wider text-white font-mono">Authentication Success</h4>
                    <p className="text-xs text-gray-400 mt-1.5">Roster signature logged as: <span className="font-extrabold text-accent text-shadow-glow uppercase">PRESENT</span></p>
                    {distanceCalculated !== null && (
                      <span className="text-[9px] text-gray-500 font-mono mt-2.5 block uppercase tracking-wider">
                        Lock distance: {distanceCalculated}m from classroom core
                        {geolocationCoords && ` (LAT: ${geolocationCoords.lat.toFixed(4)}, LNG: ${geolocationCoords.lng.toFixed(4)})`}
                      </span>
                    )}
                  </div>

                  {/* Gamification Reward Card */}
                  {gamificationReward && (
                    <div className="w-full max-w-sm glass-panel p-5 rounded-2xl border border-white/10 bg-white/2 shadow-2xl relative overflow-hidden mt-2 animate-scale-up">
                      <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-primary/10 opacity-50 blur-xl pointer-events-none" />
                      
                      <div className="relative flex flex-col items-center space-y-3.5">
                        <div className="flex items-center gap-1.5 bg-accent/20 border border-accent/40 px-3.5 py-1.5 rounded-full text-accent text-xs font-black shadow-lg animate-pulse">
                          <Sparkles className="h-4 w-4 text-cyan-glow" />
                          <span>+{gamificationReward.xpAwarded} XP COMPLIANCE BONUS</span>
                        </div>
                        
                        <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Credits appended to your matrix profile</p>

                        {/* New Badges */}
                        {gamificationReward.newBadges && gamificationReward.newBadges.length > 0 && (
                          <div className="w-full pt-3 border-t border-white/5 flex flex-col items-center space-y-1.5">
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">Badges Unlocked</span>
                            <div className="flex flex-wrap justify-center gap-2">
                              {gamificationReward.newBadges.map((badge, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 px-3 py-1 rounded-xl text-[11px] font-black shadow-lg animate-bounce">
                                  <Award className="h-3.5 w-3.5 text-yellow-400" />
                                  {badge}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* New Achievements */}
                        {gamificationReward.newAchievements && gamificationReward.newAchievements.length > 0 && (
                          <div className="w-full pt-3 border-t border-white/5 flex flex-col items-center space-y-1.5">
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">Achievements Completed</span>
                            <div className="flex flex-wrap justify-center gap-2">
                              {gamificationReward.newAchievements.map((ach, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 bg-primary/20 border border-primary/40 text-primary-glow px-3 py-1 rounded-xl text-[11px] font-black shadow-lg">
                                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                                  {ach}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <button
                          onClick={() => router.push("/student/gamification")}
                          className="glow-border mt-3 w-full py-2.5 bg-gradient-to-r from-primary to-accent hover:from-primary/95 hover:to-accent/95 text-white font-extrabold text-[10px] font-mono uppercase tracking-widest rounded-xl shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
                        >
                          OPEN GAMIFICATION ARENA
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {checkinStep === "error" && (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-5 animate-fade-in z-10 relative">
                  <div className="bg-red-500/20 border border-red-500/40 p-4.5 rounded-full shadow-lg shadow-red-500/25">
                    <AlertTriangle className="h-9 w-9 text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-black uppercase tracking-wider text-white font-mono">Check-in Rejected</h4>
                    <p className="text-xs text-red-300 font-medium mt-1.5 leading-relaxed">{errorMessage || "An unknown signature error occurred."}</p>
                    <button
                      onClick={() => {
                        setCheckinStep("idle");
                        setGamificationReward(null);
                      }}
                      className="mt-5 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono font-extrabold uppercase rounded-xl text-white transition-all hover:scale-105 cursor-pointer"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="glass-panel p-6 flex flex-col items-center justify-center text-center py-16 border-white/5 relative overflow-hidden">
              <Clock className="h-10 w-10 text-gray-700 mb-3.5 animate-pulse" />
              <h4 className="text-xs font-bold font-mono tracking-widest uppercase text-gray-400">NO SECURE FEED DETECTED</h4>
              <p className="text-[11px] max-w-xs mt-1.5 text-gray-500 leading-relaxed">System awaiting instructor class check-in session launch.</p>
            </div>
          )}

          {/* Secure details card */}
          <div className="glass-panel p-4 flex items-center gap-3.5 border-white/5 relative overflow-hidden">
            <Shield className="h-5 w-5 text-secondary shrink-0 animate-pulse" />
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Holographic Key Assertion</h4>
              <p className="text-[10px] text-gray-400 leading-normal mt-0.5">Matrix logs trace active hardware descriptors to eliminate virtual spoof networks.</p>
            </div>
          </div>

          {/* Leave Exemption Request Section */}
          <div className="glass-panel p-6 border-white/10 space-y-4 relative overflow-hidden">
            <div className="flex justify-between items-center relative">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-primary" /> Leave & Exemption HUD
              </h3>
              <button
                onClick={() => setShowLeaveForm(!showLeaveForm)}
                className="text-[9px] uppercase font-bold tracking-widest text-primary hover:text-white transition-colors font-mono cursor-pointer"
              >
                {showLeaveForm ? "Cancel" : "+ NEW TICKET"}
              </button>
            </div>

            {showLeaveForm && (
              <div className="space-y-4 p-4.5 rounded-xl border border-primary/15 bg-primary/5 animate-fade-in relative z-10">
                <div>
                  <label className="text-[9px] uppercase font-bold tracking-widest text-gray-500 block mb-1.5 font-mono">TICKET CLASSIFICATION</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 focus:border-primary/50 rounded-xl py-2.5 px-3 text-xs text-white outline-none cursor-pointer font-mono"
                  >
                    <option value="MEDICAL">Medical Exemption</option>
                    <option value="EVENT">Event / Hackathon Pass</option>
                    <option value="PERSONAL">Personal Leave</option>
                    <option value="FAMILY">Family Emergency</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] uppercase font-bold tracking-widest text-gray-500 block mb-1.5 font-mono">START CYCLE</label>
                    <input
                      type="date"
                      value={leaveStartDate}
                      onChange={(e) => setLeaveStartDate(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-primary/50 rounded-xl py-2.5 px-3 text-xs text-white outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold tracking-widest text-gray-500 block mb-1.5 font-mono">END CYCLE</label>
                    <input
                      type="date"
                      value={leaveEndDate}
                      onChange={(e) => setLeaveEndDate(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-primary/50 rounded-xl py-2.5 px-3 text-xs text-white outline-none font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold tracking-widest text-gray-500 block mb-1.5 font-mono">JUSTIFICATION LOG</label>
                  <textarea
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="Input detailed case logic..."
                    rows={2}
                    className="w-full bg-slate-900 border border-white/10 focus:border-primary/50 rounded-xl py-2.5 px-3 text-xs text-white placeholder-gray-600 outline-none resize-none font-mono"
                  />
                </div>
                <button
                  onClick={async () => {
                    if (!leaveStartDate || !leaveEndDate || !leaveReason) return;
                    
                    if (user?.token.startsWith("demo-jwt-token-")) {
                      setLeaveHistory((prev) => [
                        { id: `lv-${Date.now()}`, type: leaveType, startDate: leaveStartDate, endDate: leaveEndDate, reason: leaveReason, status: "PENDING" },
                        ...prev,
                      ]);
                      setShowLeaveForm(false);
                      setLeaveReason("");
                      setLeaveStartDate("");
                      setLeaveEndDate("");
                      return;
                    }

                    try {
                      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
                      const res = await fetch(`${API_URL}/api/v1/leaves`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${user?.token}`,
                        },
                        body: JSON.stringify({
                          startDate: new Date(leaveStartDate).toISOString(),
                          endDate: new Date(leaveEndDate).toISOString(),
                          reason: leaveReason,
                          type: leaveType,
                        }),
                      });

                      const data = await res.json();
                      if (res.ok) {
                        const formatted = {
                          id: data.leave.id,
                          type: data.leave.type || "OTHER",
                          startDate: leaveStartDate,
                          endDate: leaveEndDate,
                          reason: leaveReason,
                          status: data.leave.status,
                        };
                        setLeaveHistory((prev) => [formatted, ...prev]);
                        setShowLeaveForm(false);
                        setLeaveReason("");
                        setLeaveStartDate("");
                        setLeaveEndDate("");
                      } else {
                        alert(data.error || "Failed to submit leave request.");
                      }
                    } catch (err) {
                      console.error("Leave submit error:", err);
                      alert("Network error: Failed to submit leave request.");
                    }
                  }}
                  disabled={!leaveStartDate || !leaveEndDate || !leaveReason}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white font-extrabold text-xs uppercase tracking-widest py-3 rounded-xl shadow-lg disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2 btn-elastic cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5 text-cyan-glow" /> DISPATCH EXEMPTION LOG
                </button>
              </div>
            )}

            {/* Leave History */}
            <div className="space-y-2.5">
              {leaveHistory.map((leave) => (
                <div key={leave.id} className="p-3.5 rounded-xl border border-white/5 bg-white/2 flex justify-between items-center gap-3.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[9px] font-mono font-extrabold text-primary-glow bg-primary/10 border border-primary/25 px-2.5 py-0.5 rounded-full">{leave.type}</span>
                      <span className="text-[10px] text-gray-500 font-mono">{leave.startDate} → {leave.endDate}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 truncate leading-snug font-medium">{leave.reason}</p>
                  </div>
                  <span className={`text-[9px] font-mono font-extrabold px-3 py-1 rounded-xl shrink-0 ${
                    leave.status === "APPROVED"
                      ? "bg-accent/15 text-accent border border-accent/20"
                      : leave.status === "REJECTED"
                      ? "bg-red-500/15 text-red-400 border border-red-500/20 animate-pulse"
                      : "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20"
                  }`}>
                    {leave.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Timetable */}
          <div className="glass-panel p-6 border-white/5 space-y-4 relative overflow-hidden">
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <BookOpen className="h-4.5 w-4.5 text-primary" /> Timetable Matrix
            </h3>
            <div className="space-y-3">
              {studentTimetable.map((slot, idx) => (
                <div key={idx} className="p-3.5 bg-white/2 border border-white/5 rounded-xl hover:border-primary/20 transition-all flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-mono font-extrabold text-primary-glow bg-primary/10 border border-primary/25 px-2.5 py-0.5 rounded">{slot.code}</span>
                    <h4 className="text-xs font-bold text-white mt-2 tracking-wide">{slot.subject}</h4>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">{slot.time}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono font-bold bg-slate-900 px-3 py-1.5 rounded-xl border border-white/5">
                    {slot.room}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Assignment Deadlines */}
          <div className="glass-panel p-6 border-white/5 space-y-4 relative overflow-hidden">
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <ListTodo className="h-4.5 w-4.5 text-secondary animate-pulse" /> Core Assignment Tasks
            </h3>
            <div className="space-y-4">
              {studentAssignments.map((asg) => (
                <div key={asg.id} className="p-4 rounded-xl border border-white/5 bg-white/2 space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight tracking-wide">{asg.subject}</h4>
                      <span className="text-[10px] text-gray-400 font-medium">{asg.task}</span>
                    </div>
                    <span className={`text-[9px] font-mono font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-xl border ${
                      asg.daysLeft <= 2 
                        ? "bg-red-500/10 text-red-400 border-red-500/25 animate-pulse" 
                        : "bg-white/5 text-gray-400 border-white/10"
                    }`}>
                      {asg.daysLeft} days left
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-900 rounded-full h-1">
                      <div className="bg-secondary h-1 rounded-full shadow-lg shadow-secondary/40" style={{ width: `${asg.progress}%` }}></div>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono shrink-0">{asg.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Placement Openings */}
          <div className="glass-panel p-6 border-white/5 space-y-4 relative overflow-hidden">
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Briefcase className="h-4.5 w-4.5 text-accent animate-pulse" /> Placements Board
            </h3>
            <div className="space-y-3.5">
              {placementPostings.map((post, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-white/5 bg-white/2 flex flex-col justify-between gap-3 relative overflow-hidden">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-black text-white leading-tight uppercase tracking-wider">{post.company}</h4>
                      <span className="text-[10px] text-primary-glow font-mono font-bold tracking-wide mt-1.5 block">{post.role}</span>
                    </div>
                    <span className="bg-accent/15 text-accent border border-accent/25 text-[9px] font-mono font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                      {post.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500 border-t border-white/5 pt-2.5 font-mono font-bold">
                    <span>CTC: <strong className="text-white">{post.ctc}</strong></span>
                    <span>DEADLINE: <strong className="text-white">{post.deadline}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notification Feed */}
          <div className="glass-panel p-6 border-white/5 space-y-4 relative overflow-hidden">
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Bell className="h-4.5 w-4.5 text-yellow-500 animate-pulse" /> Live System Logs
            </h3>
            <div className="space-y-3">
              {notifications.map((not) => (
                <div key={not.id} className="p-3.5 rounded-xl border border-white/5 bg-white/2 flex justify-between items-start gap-4 hover:bg-white/5 transition-all">
                  <p className="text-[11px] text-gray-300 leading-relaxed font-medium">{not.message}</p>
                  <span className="text-[8px] text-gray-500 shrink-0 font-mono font-bold mt-1 uppercase tracking-widest">{not.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    <NotificationsPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
  </PageTransition>
);
}
