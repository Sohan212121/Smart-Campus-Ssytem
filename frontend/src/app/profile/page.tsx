"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import ThemeToggle from "@/components/ThemeToggle";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Shield, 
  MapPin, 
  Calendar, 
  Laptop, 
  Activity, 
  Upload, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Clock,
  LogOut,
  Save,
  Fingerprint
} from "lucide-react";

interface Session {
  id: string;
  device: string;
  ipAddress: string;
  createdAt: string;
  isRevoked: boolean;
  token: string;
}

interface ActivityLog {
  id: string;
  action: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, login, logout } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"details" | "sessions" | "activity">("details");

  // Profile Form States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [departmentCode, setDepartmentCode] = useState<"CSE" | "EE" | "PHYS">("CSE");
  const [semester, setSemester] = useState<number>(1);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);

  // Status Alerts
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);

  // Session & Activity States
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setSemester(user.semester || 1);
      setAvatarBase64(user.avatarUrl || null);
      
      // Map departmentId to departmentCode for display if departmentId exists
      // Real database mapping would query codes. We fallback CSE/EE based on id
      if (user.departmentId) {
        if (user.departmentId.toLowerCase().includes("ee")) {
          setDepartmentCode("EE");
        } else if (user.departmentId.toLowerCase().includes("phys")) {
          setDepartmentCode("PHYS");
        } else {
          setDepartmentCode("CSE");
        }
      }
    }
  }, [user]);

  // Load Sessions and Activity logs
  useEffect(() => {
    if (!user || user.token.startsWith("demo-jwt-token-")) {
      // Mock data for demo mode
      setSessions([
        { id: "sess-1", device: "Chrome 125 (Windows 11)", ipAddress: "192.168.29.170", createdAt: new Date().toISOString(), isRevoked: false, token: user?.token || "" },
        { id: "sess-2", device: "Safari Mobile (iPhone 15)", ipAddress: "103.24.11.90", createdAt: new Date(Date.now() - 86400000).toISOString(), isRevoked: false, token: "other-token-1" },
        { id: "sess-3", device: "Firefox 120 (macOS Sonoma)", ipAddress: "110.42.20.15", createdAt: new Date(Date.now() - 172800000).toISOString(), isRevoked: true, token: "other-token-2" }
      ]);
      setActivities([
        { id: "act-1", action: "LOGIN", details: "Successful login from Chrome 125 (Windows 11)", ipAddress: "192.168.29.170", userAgent: "Chrome 125", createdAt: new Date().toISOString() },
        { id: "act-2", action: "UPDATE_PROFILE", details: "Updated profile details", ipAddress: "192.168.29.170", userAgent: "Chrome 125", createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: "act-3", action: "LOGIN", details: "Successful login from Safari Mobile (iPhone 15)", ipAddress: "103.24.11.90", userAgent: "Safari Mobile", createdAt: new Date(Date.now() - 86400000).toISOString() }
      ]);
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const headers = { Authorization: `Bearer ${user.token}` };

    const fetchSessions = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/sessions`, { headers });
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions);
        }
      } catch (err) {
        console.error("Failed to load sessions:", err);
      }
    };

    const fetchActivities = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/users/activity-logs`, { headers });
        if (res.ok) {
          const data = await res.json();
          setActivities(data.logs);
        }
      } catch (err) {
        console.error("Failed to load activities:", err);
      }
    };

    fetchSessions();
    fetchActivities();
  }, [user]);

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setIsLoading(true);

    if (user?.token.startsWith("demo-jwt-token-")) {
      setTimeout(() => {
        setIsLoading(false);
        const updated = {
          ...user,
          firstName,
          lastName,
          semester,
        };
        login(updated);
        setStatus({ type: "success", message: "Demo profile updated successfully! (Local state updated)" });
      }, 1000);
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/v1/users/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          semester: user?.role === "STUDENT" ? semester : null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        // Update user state
        login({
          ...user!,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          semester: data.user.semester,
        });
        setStatus({ type: "success", message: "Profile updated successfully!" });
      } else {
        setStatus({ type: "error", message: data.error || "Failed to update profile." });
      }
    } catch (err) {
      console.error("Save profile error:", err);
      setStatus({ type: "error", message: "Network error: Unable to connect to campus servers." });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Avatar Image Upload as Base64
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setStatus({ type: "error", message: "Profile image must be under 2MB." });
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setAvatarBase64(base64);
      setStatus(null);
      setIsAvatarLoading(true);

      if (user?.token.startsWith("demo-jwt-token-")) {
        setTimeout(() => {
          setIsAvatarLoading(false);
          login({ ...user, avatarUrl: base64 });
          setStatus({ type: "success", message: "Demo profile picture updated! (Local state)" });
        }, 1000);
        return;
      }

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/v1/users/avatar`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({ base64Image: base64 }),
        });

        const data = await res.json();
        if (res.ok) {
          login({ ...user!, avatarUrl: data.avatarUrl });
          setStatus({ type: "success", message: "Profile picture updated successfully!" });
        } else {
          setStatus({ type: "error", message: data.error || "Failed to upload avatar." });
        }
      } catch (err) {
        console.error("Avatar upload error:", err);
        setStatus({ type: "error", message: "Network error: Connection to avatar servers failed." });
      } finally {
        setIsAvatarLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Remove Avatar
  const handleRemoveAvatar = async () => {
    setStatus(null);
    setIsAvatarLoading(true);

    if (user?.token.startsWith("demo-jwt-token-")) {
      setTimeout(() => {
        setIsAvatarLoading(false);
        setAvatarBase64(null);
        login({ ...user, avatarUrl: undefined });
        setStatus({ type: "success", message: "Demo profile picture removed! (Local state)" });
      }, 1000);
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/v1/users/avatar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ base64Image: null }),
      });

      const data = await res.json();
      if (res.ok) {
        setAvatarBase64(null);
        login({ ...user!, avatarUrl: undefined });
        setStatus({ type: "success", message: "Profile picture removed successfully!" });
      } else {
        setStatus({ type: "error", message: data.error || "Failed to remove avatar." });
      }
    } catch (err) {
      console.error("Avatar remove error:", err);
      setStatus({ type: "error", message: "Network error: Connection to avatar servers failed." });
    } finally {
      setIsAvatarLoading(false);
    }
  };

  // Revoke Specific Session
  const handleRevokeSession = async (sessionId: string) => {
    if (user?.token.startsWith("demo-jwt-token-")) {
      setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, isRevoked: true } : s));
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/v1/auth/sessions/revoke`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ sessionId }),
      });

      if (res.ok) {
        setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, isRevoked: true } : s));
      }
    } catch (err) {
      console.error("Session revoke error:", err);
    }
  };

  // Revoke Bulk Other Sessions
  const handleRevokeOthers = async () => {
    if (user?.token.startsWith("demo-jwt-token-")) {
      setSessions((prev) => prev.map((s) => s.token !== user?.token ? { ...s, isRevoked: true } : s));
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/v1/auth/sessions/revoke-others`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (res.ok) {
        setSessions((prev) => prev.map((s) => s.token !== user?.token ? { ...s, isRevoked: true } : s));
      }
    } catch (err) {
      console.error("Session bulk revoke error:", err);
    }
  };

  // Determine Dashboard Redirection Path based on User Role
  const getDashboardPath = () => {
    if (!user) return "/";
    if (user.role === "ADMIN") return "/admin/dashboard";
    if (user.role === "TEACHER") return "/teacher/dashboard";
    if (user.role === "HOD") return "/hod/dashboard";
    if (user.role === "EVENT_COORDINATOR") return "/event-coordinator/dashboard";
    if (user.role === "PLACEMENT_OFFICER") return "/placement-officer/dashboard";
    return "/student/dashboard";
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-x-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.05)_0%,transparent_40%)] pointer-events-none" />

      {/* Header Panel */}
      <header className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push(getDashboardPath())}
            className="glass-panel p-2.5 text-gray-400 hover:text-white transition-all hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              SCAAS <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full font-medium border border-primary/30">Settings</span>
            </span>
            <p className="text-[10px] text-gray-400">Smart Campus Profile & Device Manager</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={() => { logout(); router.push("/login"); }}
            className="bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all btn-elastic"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start w-full z-10">
        
        {/* Left Side: Avatar Display and Role Tags */}
        <div className="md:col-span-4 space-y-6">
          <div className="glass-panel p-6 border-primary/20 flex flex-col items-center text-center">
            
            {/* Avatar image frame */}
            <div className="relative group w-32 h-32 mb-4">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-full p-1 shadow-2xl animate-pulse-glow" />
              <div className="relative w-full h-full rounded-full bg-slate-900 border-4 border-slate-950 overflow-hidden flex items-center justify-center">
                {avatarBase64 ? (
                  <img src={avatarBase64} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-16 w-16 text-gray-600" />
                )}
                {isAvatarLoading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
              </div>
              
              {/* File input label overlay */}
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-1 right-1 bg-primary p-2.5 rounded-full text-white cursor-pointer hover:bg-primary-glow shadow-lg transition-all hover:scale-110"
              >
                <Upload className="h-3.5 w-3.5" />
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                  className="hidden" 
                  disabled={isAvatarLoading} 
                />
              </label>

              {/* Remove avatar overlay */}
              {avatarBase64 && (
                <button 
                  type="button"
                  onClick={handleRemoveAvatar} 
                  className="absolute bottom-1 left-1 bg-red-500 hover:bg-red-600 p-2.5 rounded-full text-white cursor-pointer shadow-lg transition-all hover:scale-110 flex items-center justify-center"
                  disabled={isAvatarLoading}
                  title="Remove Profile Photo"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <h3 className="text-lg font-bold text-white leading-tight">
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="text-xs text-gray-500 font-mono mt-1 select-all">{user?.email}</p>
            
            {/* Multi-role badges */}
            <div className="flex flex-col gap-2 mt-4 w-full">
              <span className="bg-primary/10 border border-primary/20 text-primary-glow text-[10px] font-bold py-1.5 rounded-xl uppercase tracking-widest block w-full text-center">
                Role: {user?.role.replace("_", " ")}
              </span>
              
              {user?.institutionalId && (
                <span className="bg-slate-900 border border-white/5 text-gray-400 font-mono text-[10px] font-bold py-1.5 rounded-xl uppercase tracking-widest block w-full text-center flex items-center justify-center gap-1.5">
                  <Fingerprint className="h-3.5 w-3.5 text-secondary" /> {user.institutionalId}
                </span>
              )}
            </div>

          </div>
        </div>

        {/* Right Side: Configuration Tabs */}
        <div className="md:col-span-8 space-y-6">
          
          {/* Settings navigation tabs */}
          <div className="glass-panel p-1.5 flex gap-1 border-white/5">
            <button
              onClick={() => { setActiveTab("details"); setStatus(null); }}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl btn-elastic ${
                activeTab === "details" ? "bg-primary text-white shadow-md" : "text-gray-400 hover:text-white"
              }`}
            >
              Account Details
            </button>
            <button
              onClick={() => { setActiveTab("sessions"); setStatus(null); }}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl btn-elastic ${
                activeTab === "sessions" ? "bg-primary text-white shadow-md" : "text-gray-400 hover:text-white"
              }`}
            >
              Active Sessions
            </button>
            <button
              onClick={() => { setActiveTab("activity"); setStatus(null); }}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl btn-elastic ${
                activeTab === "activity" ? "bg-primary text-white shadow-md" : "text-gray-400 hover:text-white"
              }`}
            >
              Activity Log
            </button>
          </div>

          {/* Stateful feedback container */}
          {status && (
            <div className={`p-4 rounded-xl border flex items-start gap-3 animate-fade-in ${
              status.type === "success" 
                ? "bg-accent/10 border-accent/25 text-accent" 
                : "bg-red-500/10 border-red-500/25 text-red-400"
            }`}>
              {status.type === "success" ? (
                <CheckCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              )}
              <span className="text-xs font-semibold leading-relaxed">{status.message}</span>
            </div>
          )}

          {/* TAB 1: Account Details Renders */}
          {activeTab === "details" && (
            <div className="glass-panel p-6 border-primary/20 animate-fade-in">
              <h4 className="text-sm font-bold text-white mb-6 uppercase tracking-wider border-b border-white/5 pb-2.5">Edit Profile Credentials</h4>
              
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">First Name</label>
                    <input 
                      type="text" 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)} 
                      disabled={isLoading}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-gray-500 outline-none focus:border-primary/50 transition-all focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Last Name</label>
                    <input 
                      type="text" 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)} 
                      disabled={isLoading}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-gray-500 outline-none focus:border-primary/50 transition-all focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {user?.role !== "ADMIN" && (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Department</label>
                      <input 
                        type="text" 
                        value={departmentCode === "CSE" ? "Computer Science (CSE)" : departmentCode === "EE" ? "Electrical (EE)" : "Physics (PHYS)"} 
                        disabled
                        className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 px-4 text-sm text-gray-500 font-medium outline-none cursor-not-allowed select-none"
                      />
                    </div>
                    {user?.role === "STUDENT" && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Semester</label>
                        <select 
                          value={semester} 
                          onChange={(e) => setSemester(Number(e.target.value))}
                          disabled={isLoading}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-primary/50 cursor-pointer"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                            <option key={sem} value={sem} className="bg-gray-900 text-white">Semester {sem}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold text-sm py-3.5 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/35 flex items-center justify-center gap-2 pt-3.5 mt-4 btn-elastic shimmer-effect"
                >
                  {isLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Saving Changes...</>
                  ) : (
                    <><Save className="h-4 w-4" /> Save Profile Details</>
                  )}
                </button>

              </form>
            </div>
          )}

          {/* TAB 2: Active Sessions Renders */}
          {activeTab === "sessions" && (
            <div className="glass-panel p-6 border-primary/20 animate-fade-in space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Device Sign-in Sessions</h4>
                <button
                  onClick={handleRevokeOthers}
                  disabled={sessions.filter((s) => s.token !== user?.token && !s.isRevoked).length === 0}
                  className="text-[9px] uppercase font-extrabold tracking-widest text-red-400 hover:text-white border border-red-500/20 hover:bg-red-500/10 px-3 py-1.5 rounded-xl transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  Revoke Other Logins
                </button>
              </div>

              <div className="space-y-3">
                {sessions.map((sess) => {
                  const isCurrent = sess.token === user?.token;
                  return (
                    <div 
                      key={sess.id} 
                      className={`p-4 rounded-xl border flex justify-between items-center transition-all ${
                        isCurrent 
                          ? "bg-accent/5 border-accent/30" 
                          : sess.isRevoked 
                          ? "bg-white/2 border-white/5 opacity-50" 
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl ${isCurrent ? "bg-accent/15" : "bg-white/5"}`}>
                          <Laptop className={`h-5 w-5 ${isCurrent ? "text-accent" : "text-gray-400"}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-bold text-white">{sess.device}</h5>
                            {isCurrent && (
                              <span className="bg-accent/15 border border-accent/25 text-accent text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Current
                              </span>
                            )}
                            {sess.isRevoked && (
                              <span className="bg-white/5 border border-white/10 text-gray-500 text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Revoked
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-500 font-mono mt-1 select-all">{sess.ipAddress} • {new Date(sess.createdAt).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>

                      {!isCurrent && !sess.isRevoked && (
                        <button
                          onClick={() => handleRevokeSession(sess.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-xl transition-all"
                          title="Terminate Device Login"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Activity Log Timeline Renders */}
          {activeTab === "activity" && (
            <div className="glass-panel p-6 border-primary/20 animate-fade-in space-y-6">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2.5">User Audit Timeline</h4>
              
              {activities.length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">No recent security activities logged.</p>
              ) : (
                <div className="relative pl-6 border-l border-white/5 space-y-6 max-h-[400px] overflow-y-auto pr-2">
                  {activities.map((act) => (
                    <div key={act.id} className="relative animate-fade-in">
                      {/* Timeline dot */}
                      <span className="absolute -left-8.5 top-0.5 bg-slate-950 border-2 border-primary rounded-full p-1">
                        <Activity className="h-3 w-3 text-primary" />
                      </span>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            {act.action.replace(/_/g, " ")}
                          </h5>
                          <span className="text-[9px] text-gray-500 font-mono flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {new Date(act.createdAt).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">{act.details}</p>
                        <p className="text-[9px] text-gray-500 font-mono">Verified IP: {act.ipAddress} • UserAgent: {act.userAgent}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
