"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore, UserRole } from "@/store/authStore";
import { 
  UserCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  UserPlus,
  X,
  KeyRound,
  User,
  Fingerprint,
  Radio,
  Cpu
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Login() {
  const router = useRouter();
  const loginStore = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("STUDENT");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Forgot Password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Create Account state
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<UserRole>("STUDENT");
  const [regInstitutionalId, setRegInstitutionalId] = useState("");
  const [regDepartmentCode, setRegDepartmentCode] = useState<"CSE" | "EE" | "PHYS">("CSE");
  const [regSemester, setRegSemester] = useState<number>(1);
  const [regLoading, setRegLoading] = useState(false);
  const [regStatus, setRegStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showRegPassword, setShowRegPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    // Dynamic field validation
    if (!email || !password) {
      setStatus({ type: "error", message: "Please fill in all credentials." });
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setStatus({ type: "error", message: "Please enter a valid campus email address." });
      return;
    }

    setIsLoading(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    fetch(`${API_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus({
            type: "success",
            message: `Authentication successful. Access granted to smart ecosystem.`,
          });
          
          // Verify that returned user matches the selected role for security
          if (data.user.role !== role) {
            setStatus({
              type: "error",
              message: `Security Lock: Account is mapped as ${data.user.role}. Login with correct selection.`,
            });
            return;
          }

          loginStore.login({
            id: data.user.id,
            email: data.user.email,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            role: data.user.role,
            token: data.token,
            isEmailVerified: data.user.isEmailVerified,
            institutionalId: data.user.institutionalId,
            avatarUrl: data.user.avatarUrl,
            departmentId: data.user.departmentId,
            semester: data.user.semester,
            accountStatus: data.user.accountStatus,
          });

          // Wait a short moment to display success status before redirect
          setTimeout(() => {
            if (data.user.role === "ADMIN") {
              router.push("/admin/dashboard");
            } else if (data.user.role === "TEACHER") {
              router.push("/teacher/dashboard");
            } else if (data.user.role === "HOD") {
              router.push("/hod/dashboard");
            } else if (data.user.role === "EVENT_COORDINATOR") {
              router.push("/event-coordinator/dashboard");
            } else if (data.user.role === "PLACEMENT_OFFICER") {
              router.push("/placement-officer/dashboard");
            } else {
              router.push("/student/dashboard");
            }
          }, 800);
        } else {
          setStatus({ type: "error", message: data.error || "Access Denied: Invalid credentials." });
        }
      })
      .catch((err) => {
        console.error("Login fetch error:", err);
        setStatus({ type: "error", message: "Security Link Failure: Local core unable to reach campus server." });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Forgot Password handler
  const handleForgotPassword = () => {
    if (!forgotEmail || !forgotEmail.includes("@")) {
      setForgotStatus({ type: "error", message: "Please enter a valid campus email address." });
      return;
    }
    setForgotLoading(true);
    // Simulate a password reset request (no real email service configured)
    setTimeout(() => {
      setForgotLoading(false);
      setForgotStatus({
        type: "success",
        message: `Temporary credentials link dispatched to ${forgotEmail}. Check inbox core logs.`,
      });
    }, 1500);
  };

  // Create Account handler
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegStatus(null);

    if (!regFirstName || !regLastName || !regEmail || !regPassword) {
      setRegStatus({ type: "error", message: "Please fill in all fields." });
      return;
    }
    if (!regEmail.includes("@") || !regEmail.includes(".")) {
      setRegStatus({ type: "error", message: "Please enter a valid campus email address." });
      return;
    }
    if (regPassword.length < 6) {
      setRegStatus({ type: "error", message: "Password must be at least 6 characters." });
      return;
    }

    // ID Validation in UI
    if (regRole !== "ADMIN" && !regInstitutionalId) {
      setRegStatus({ type: "error", message: "Institutional ID is required." });
      return;
    }
    if (regRole === "STUDENT" && !regInstitutionalId.startsWith("STU-")) {
      setRegStatus({ type: "error", message: "Student ID must start with 'STU-' (e.g., STU-2026-44)" });
      return;
    }
    if (regRole !== "STUDENT" && regRole !== "ADMIN" && !regInstitutionalId.startsWith("FAC-")) {
      setRegStatus({ type: "error", message: "Faculty / HOD ID must start with 'FAC-' (e.g., FAC-2026-10)" });
      return;
    }

    setRegLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    fetch(`${API_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: regEmail,
        password: regPassword,
        firstName: regFirstName,
        lastName: regLastName,
        role: regRole,
        institutionalId: regInstitutionalId || undefined,
        departmentCode: regRole !== "ADMIN" ? regDepartmentCode : null,
        semester: regRole === "STUDENT" ? regSemester : null,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setRegStatus({
            type: "success",
            message: "Quantum account configured! Switch triggered to access link.",
          });
          // Auto-switch to login mode after 2 seconds
          setTimeout(() => {
            setIsRegisterMode(false);
            setEmail(regEmail);
            setPassword("");
            setRole(regRole);
            setRegStatus(null);
            setStatus({ type: "success", message: "Quantum account ready. Access key loaded." });
          }, 2000);
        } else {
          setRegStatus({ type: "error", message: data.error || "Configuration failure." });
        }
      })
      .catch((err) => {
        console.error("Register fetch error:", err);
        setRegStatus({ type: "error", message: "Security Link Failure: Local core unable to register." });
      })
      .finally(() => {
        setRegLoading(false);
      });
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 relative min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.06)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.04)_0%,transparent_50%)] pointer-events-none" />
      
      {/* Absolute Back Button */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 hover:text-white flex items-center gap-1.5 bg-white/5 px-4 py-2.5 rounded-xl border border-white/10 glass-panel btn-elastic z-50"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Terminal Core
      </Link>

      {/* Absolute Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[460px] glass-panel p-8 border-primary/20 shadow-2xl shadow-primary/10 relative overflow-hidden z-10">
        {/* Visual corner cut highlights */}
        <div className="absolute top-0 right-0 w-8 h-8 bg-primary/20 rounded-bl-xl border-b border-l border-primary/30 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-8 h-8 bg-secondary/10 rounded-tr-xl border-t border-r border-secondary/20 pointer-events-none" />

        {/* Branding header inside panel */}
        <div className="flex flex-col items-center text-center mb-8 relative">
          <div className="bg-gradient-to-tr from-primary via-secondary to-accent p-3.5 rounded-2xl shadow-xl shadow-primary/25 mb-4 relative animate-float">
            <Fingerprint className="h-6 w-6 text-white" />
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-tr from-primary to-secondary opacity-35 blur-sm z-[-1]" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-wider text-white font-mono">Quantum Chamber</h2>
          <p className="text-[10px] text-gray-400 font-mono font-bold tracking-wider mt-1.5 uppercase">AUTHENTICATE SYSTEM CRITERIA</p>
        </div>

        {/* Stateful status indicators */}
        {status && (
          <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 animate-fade-in ${
            status.type === "success" 
              ? "bg-accent/15 border-accent/25 text-accent" 
              : "bg-red-500/15 border-red-500/25 text-red-400"
          }`}>
            {status.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            )}
            <span className="text-[11px] font-bold font-mono tracking-wide leading-relaxed uppercase">{status.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role selector tab grids */}
          <div>
            <label className="text-[9px] uppercase font-bold tracking-widest text-gray-500 block mb-2 font-mono">Ecosystem Matrix Role</label>
            <div className="grid grid-cols-3 gap-1 bg-white/2 p-1.5 rounded-xl border border-white/5 relative">
              {(["STUDENT", "TEACHER", "ADMIN", "HOD", "EVENT_COORDINATOR", "PLACEMENT_OFFICER"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRole(r);
                    setStatus(null);
                  }}
                  className={`text-[10.5px] font-mono font-bold py-2.5 px-0.5 rounded-lg uppercase tracking-wider transition-all relative ${
                    role === r 
                      ? "bg-primary text-white shadow-md shadow-primary/35 border border-primary/20 z-10 font-extrabold" 
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                  title={r}
                >
                  {r === "EVENT_COORDINATOR" ? "Events" : r === "PLACEMENT_OFFICER" ? "Careers" : r.toLowerCase()}
                  {role === r && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-secondary-glow rounded-full animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Email input field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-[9px] uppercase font-bold tracking-widest text-gray-500 block font-mono">Digital Signature Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 transition-colors group-focus-within:text-primary" />
              <input
                id="email"
                type="email"
                placeholder="signature@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full bg-white/2 border border-white/5 focus:border-primary/50 focus:bg-white/5 rounded-xl py-3.5 pl-12 pr-4 text-xs text-white placeholder-gray-600 outline-none transition-all focus:ring-1 focus:ring-primary/25 font-mono shadow-inner"
              />
            </div>
          </div>

          {/* Password input field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-[9px] uppercase font-bold tracking-widest text-gray-500 block font-mono">Chamber Key</label>
              <button 
                type="button" 
                onClick={() => { setShowForgotModal(true); setForgotEmail(email); setForgotStatus(null); }} 
                className="text-[9px] text-primary hover:text-primary-glow font-bold uppercase tracking-widest transition-colors font-mono"
              >
                Reset Key
              </button>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 transition-colors group-focus-within:text-primary" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full bg-white/2 border border-white/5 focus:border-primary/50 focus:bg-white/5 rounded-xl py-3.5 pl-12 pr-12 text-xs text-white placeholder-gray-600 outline-none transition-all focus:ring-1 focus:ring-primary/25 font-mono shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          {/* Form signin trigger button */}
          <button
            type="submit"
            disabled={isLoading}
            className="glow-border w-full bg-gradient-to-r from-primary to-secondary text-white font-extrabold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/35 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 mt-2 btn-elastic shimmer-effect cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" /> Accessing core...
              </>
            ) : (
              <>
                Open Chamber <Cpu className="h-4 w-4 text-cyan-glow" />
              </>
            )}
          </button>

          {/* Demo Mode Button */}
          <button
            type="button"
            onClick={() => {
              loginStore.setDemoUser(role);
              setStatus({
                type: "success",
                message: `Session initialized as offline ${role.toLowerCase()}. Loading...`,
              });
              setTimeout(() => {
                if (role === "ADMIN") {
                  router.push("/admin/dashboard");
                } else if (role === "TEACHER") {
                  router.push("/teacher/dashboard");
                } else if (role === "HOD") {
                  router.push("/hod/dashboard");
                } else if (role === "EVENT_COORDINATOR") {
                  router.push("/event-coordinator/dashboard");
                } else if (role === "PLACEMENT_OFFICER") {
                  router.push("/placement-officer/dashboard");
                } else {
                  router.push("/student/dashboard");
                }
              }, 800);
            }}
            className="w-full bg-white/2 border border-white/5 hover:bg-white/5 text-gray-400 hover:text-white font-extrabold text-[10px] font-mono uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 mt-2 btn-elastic cursor-pointer"
          >
            <Radio className="h-4 w-4 text-secondary animate-pulse" /> Launch Demo Mode
          </button>
        </form>

        <div className="mt-6 text-center border-t border-white/5 pt-5 relative">
          <p className="text-[10px] text-gray-500 font-mono font-bold tracking-wider uppercase mb-3">No active biometric key?</p>
          <button
            onClick={() => { setIsRegisterMode(true); setRegStatus(null); }}
            className="w-full bg-white/2 border border-primary/20 hover:bg-primary/10 text-primary-glow font-extrabold text-[10px] font-mono uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 btn-elastic transition-all cursor-pointer"
          >
            <UserPlus className="h-4 w-4 text-primary" /> Configuration Request
          </button>
        </div>

      </div>

      {/* ===== FORGOT PASSWORD MODAL ===== */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md animate-fade-in" onClick={() => setShowForgotModal(false)}>
          <div className="w-full max-w-[440px] glass-panel p-8 border-primary/20 shadow-2xl shadow-primary/20 mx-4 relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors p-1 btn-elastic cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center mb-6">
              <div className="bg-gradient-to-tr from-amber-500 to-orange-500 p-3.5 rounded-2xl shadow-xl shadow-amber-500/25 mb-4">
                <KeyRound className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-wider text-white font-mono">Displace Access Key</h3>
              <p className="text-[10px] text-gray-400 font-mono font-bold tracking-wider uppercase mt-1">Generate temporary signature access link.</p>
            </div>

            {forgotStatus && (
              <div className={`mb-5 p-4 rounded-xl border flex items-start gap-3 animate-fade-in ${
                forgotStatus.type === "success"
                  ? "bg-accent/15 border-accent/25 text-accent"
                  : "bg-red-500/15 border-red-500/25 text-red-400"
              }`}>
                {forgotStatus.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                )}
                <span className="text-[11px] font-bold font-mono tracking-wide leading-relaxed uppercase">{forgotStatus.message}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 transition-colors group-focus-within:text-amber-500" />
                <input
                  type="email"
                  placeholder="signature@campus.edu"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  disabled={forgotLoading}
                  className="w-full bg-white/2 border border-white/5 focus:border-amber-500/50 rounded-xl py-3.5 pl-12 pr-4 text-xs text-white placeholder-gray-600 outline-none transition-all focus:ring-1 focus:ring-amber-500/25 font-mono shadow-inner"
                />
              </div>
              <button
                onClick={handleForgotPassword}
                disabled={forgotLoading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 btn-elastic shimmer-effect cursor-pointer"
              >
                {forgotLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Emitting Signal...</>
                ) : (
                  <>Dispatched Signal <Mail className="h-4 w-4 text-orange-200" /></>
                )}
              </button>
            </div>

            <p className="text-center text-[10px] font-mono font-bold tracking-wider uppercase mt-5">
              Key remembered?{" "}
              <button onClick={() => setShowForgotModal(false)} className="text-primary hover:text-primary-glow font-bold transition-colors cursor-pointer">
                Unlock Chamber
              </button>
            </p>
          </div>
        </div>
      )}

      {/* ===== CREATE ACCOUNT MODAL ===== */}
      {isRegisterMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md animate-fade-in" onClick={() => setIsRegisterMode(false)}>
          <div className="w-full max-w-[480px] glass-panel p-8 border-primary/20 shadow-2xl shadow-primary/20 mx-4 relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsRegisterMode(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors p-1 btn-elastic cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center mb-6">
              <div className="bg-gradient-to-tr from-primary to-secondary p-3.5 rounded-2xl shadow-xl shadow-primary/25 mb-4 animate-float">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-wider text-white font-mono">Chamber Configure</h3>
              <p className="text-[10px] text-gray-400 font-mono font-bold tracking-wider uppercase mt-1">Configure signature record with quantum core.</p>
            </div>

            {regStatus && (
              <div className={`mb-5 p-4 rounded-xl border flex items-start gap-3 animate-fade-in ${
                regStatus.type === "success"
                  ? "bg-accent/15 border-accent/25 text-accent"
                  : "bg-red-500/15 border-red-500/25 text-red-400"
              }`}>
                {regStatus.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                )}
                <span className="text-[11px] font-bold font-mono tracking-wide leading-relaxed uppercase">{regStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Role selector */}
              <div>
                <label className="text-[9px] uppercase font-bold tracking-widest text-gray-500 block mb-2 font-mono">Chamber Class Role</label>
                <div className="grid grid-cols-3 gap-1 bg-white/2 p-1.5 rounded-xl border border-white/5">
                  {(["STUDENT", "TEACHER", "ADMIN", "HOD", "EVENT_COORDINATOR", "PLACEMENT_OFFICER"] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRegRole(r)}
                      className={`text-[10.5px] font-mono font-bold py-2.5 px-0.5 rounded-lg uppercase tracking-wider transition-all relative truncate ${
                        regRole === r
                          ? "bg-primary text-white shadow-md shadow-primary/25 border border-primary/20 z-10 font-extrabold"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                      title={r}
                    >
                      {r === "EVENT_COORDINATOR" ? "Events" : r === "PLACEMENT_OFFICER" ? "Careers" : r.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-bold tracking-widest text-gray-500 block font-mono">First Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 transition-colors group-focus-within:text-primary" />
                    <input
                      type="text"
                      placeholder="Sohan"
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      disabled={regLoading}
                      className="w-full bg-white/2 border border-white/5 focus:border-primary/50 rounded-xl py-3 pl-11 pr-3 text-xs text-white placeholder-gray-600 outline-none transition-all focus:ring-1 focus:ring-primary/25 font-mono shadow-inner"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-bold tracking-widest text-gray-500 block font-mono">Last Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 transition-colors group-focus-within:text-primary" />
                    <input
                      type="text"
                      placeholder="kumar kj"
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                      disabled={regLoading}
                      className="w-full bg-white/2 border border-white/5 focus:border-primary/50 rounded-xl py-3 pl-11 pr-3 text-xs text-white placeholder-gray-600 outline-none transition-all focus:ring-1 focus:ring-primary/25 font-mono shadow-inner"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-bold tracking-widest text-gray-500 block font-mono">Signature Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 transition-colors group-focus-within:text-primary" />
                  <input
                    type="email"
                    placeholder="signature@campus.edu"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    disabled={regLoading}
                    className="w-full bg-white/2 border border-white/5 focus:border-primary/50 rounded-xl py-3 pl-11 pr-4 text-xs text-white placeholder-gray-600 outline-none transition-all focus:ring-1 focus:ring-primary/25 font-mono shadow-inner"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-bold tracking-widest text-gray-500 block font-mono">Secret Key</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 transition-colors group-focus-within:text-primary" />
                  <input
                    type={showRegPassword ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    disabled={regLoading}
                    className="w-full bg-white/2 border border-white/5 focus:border-primary/50 rounded-xl py-3 pl-11 pr-12 text-xs text-white placeholder-gray-600 outline-none transition-all focus:ring-1 focus:ring-primary/25 font-mono shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Institutional ID Field */}
              {regRole !== "ADMIN" && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-[9px] uppercase font-bold tracking-widest text-gray-500 block font-mono font-bold">Campus Matrix Code (ID)</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 transition-colors group-focus-within:text-primary" />
                    <input
                      type="text"
                      placeholder={regRole === "STUDENT" ? "e.g., STU-2026-44" : "e.g., FAC-2026-10"}
                      value={regInstitutionalId}
                      onChange={(e) => setRegInstitutionalId(e.target.value)}
                      disabled={regLoading}
                      className="w-full bg-white/2 border border-white/5 focus:border-primary/50 rounded-xl py-3 pl-11 pr-4 text-xs text-white placeholder-gray-600 outline-none transition-all focus:ring-1 focus:ring-primary/25 font-mono uppercase"
                    />
                  </div>
                </div>
              )}

              {/* Department Mapping Field */}
              {regRole !== "ADMIN" && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-[9px] uppercase font-bold tracking-widest text-gray-500 block font-mono">Department Core Link</label>
                  <select
                    value={regDepartmentCode}
                    onChange={(e) => setRegDepartmentCode(e.target.value as any)}
                    disabled={regLoading}
                    className="w-full bg-slate-900 border border-white/15 focus:border-primary/50 rounded-xl py-3 px-4 text-xs text-white outline-none focus:ring-1 focus:ring-primary/25 cursor-pointer font-mono"
                  >
                    <option value="CSE" className="bg-gray-900 text-white font-mono">Computer Science & Engineering (CSE)</option>
                    <option value="EE" className="bg-gray-900 text-white font-mono">Electrical Engineering (EE)</option>
                    <option value="PHYS" className="bg-gray-900 text-white font-mono">Applied Physics (PHYS)</option>
                  </select>
                </div>
              )}

              {/* Semester Mapping Field */}
              {regRole === "STUDENT" && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-[9px] uppercase font-bold tracking-widest text-gray-500 block font-mono font-bold">Academic Cycle (Semester)</label>
                  <select
                    value={regSemester}
                    onChange={(e) => setRegSemester(Number(e.target.value))}
                    disabled={regLoading}
                    className="w-full bg-slate-900 border border-white/15 focus:border-primary/50 rounded-xl py-3 px-4 text-xs text-white outline-none focus:ring-1 focus:ring-primary/25 cursor-pointer font-mono"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem} className="bg-gray-900 text-white font-mono">Semester {sem}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={regLoading}
                className="glow-border w-full bg-gradient-to-r from-primary to-secondary text-white font-extrabold text-xs uppercase tracking-widest py-3.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/35 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 mt-2 btn-elastic shimmer-effect cursor-pointer"
              >
                {regLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Configuring Node...</>
                ) : (
                  <><UserPlus className="h-4 w-4 text-cyan-glow" /> Configure Node</>
                )}
              </button>
            </form>

            <p className="text-center text-[10px] font-mono font-bold tracking-wider uppercase mt-5">
              Configured?{" "}
              <button onClick={() => setIsRegisterMode(false)} className="text-primary hover:text-primary-glow font-bold transition-colors cursor-pointer">
                Access Chamber
              </button>
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
