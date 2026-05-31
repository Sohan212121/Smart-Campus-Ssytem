"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  ArrowRight
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus({ type: "error", message: "Password reset token is missing. Please check your reset link or generate a new one." });
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!token) {
      setStatus({ type: "error", message: "Password reset token is missing." });
      return;
    }

    if (!password || !confirmPassword) {
      setStatus({ type: "error", message: "Please fill in all password fields." });
      return;
    }

    if (password.length < 6) {
      setStatus({ type: "error", message: "Password must be at least 6 characters." });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match. Please re-enter." });
      return;
    }

    setIsLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/v1/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus({ type: "success", message: data.message || "Password reset successful!" });
      } else {
        setStatus({ type: "error", message: data.error || "Password reset failed. Token may be expired." });
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setStatus({ type: "error", message: "Network error: Unable to connect to campus servers." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] glass-panel p-8 border-primary/20 shadow-primary/10">
      
      {/* Recovery Branding Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="bg-gradient-to-tr from-amber-500 to-orange-500 p-3 rounded-2xl shadow-xl shadow-amber-500/25 mb-4">
          <KeyRound className="h-7 w-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Create New Password</h2>
        <p className="text-xs text-gray-400 mt-1.5">Enter and confirm your new secure campus password.</p>
      </div>

      {status && (
        <div className={`mb-6 p-3.5 rounded-xl border flex items-start gap-3 animate-fade-in ${
          status.type === "success" 
            ? "bg-accent/10 border-accent/25 text-accent" 
            : "bg-red-500/10 border-red-500/25 text-red-400"
        }`}>
          {status.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          )}
          <span className="text-xs font-semibold leading-relaxed">{status.message}</span>
        </div>
      )}

      {status?.type === "success" ? (
        <Link 
          href="/login" 
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm py-3.5 rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/35 flex items-center justify-center gap-2 mt-2 btn-elastic shimmer-effect"
        >
          Proceed to Login <ArrowRight className="h-4 w-4" />
        </Link>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password input */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 block">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || !token}
                className="w-full bg-white/5 border border-white/10 focus:border-amber-500/50 rounded-xl py-3 pl-11 pr-12 text-sm text-white placeholder-gray-500 outline-none transition-all focus:ring-1 focus:ring-amber-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password input */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 block">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading || !token}
                className="w-full bg-white/5 border border-white/10 focus:border-amber-500/50 rounded-xl py-3 pl-11 pr-12 text-sm text-white placeholder-gray-500 outline-none transition-all focus:ring-1 focus:ring-amber-500/20"
              />
            </div>
          </div>

          {/* Action trigger button */}
          <button
            type="submit"
            disabled={isLoading || !token}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm py-3 rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/35 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 mt-2 btn-elastic shimmer-effect"
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Updating Credentials...</>
            ) : (
              <>Save New Password <CheckCircle2 className="h-4 w-4" /></>
            )}
          </button>
        </form>
      )}

      {status?.type !== "success" && (
        <div className="mt-6 text-center border-t border-white/5 pt-5">
          <Link 
            href="/login" 
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Back to Login Portal
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ResetPassword() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.05)_0%,transparent_40%)] pointer-events-none" />

      {/* Header Panel */}
      <header className="absolute top-6 left-6 right-6 flex items-center justify-between z-10 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-amber-500 to-orange-500 p-2 rounded-xl shadow-lg shadow-amber-500/20 animate-float">
            <KeyRound className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              SCAAS <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full font-medium border border-primary/30">Security</span>
            </span>
          </div>
        </div>
        <div className="pointer-events-auto">
          <ThemeToggle />
        </div>
      </header>

      <Suspense fallback={
        <div className="w-full max-w-[440px] glass-panel p-8 border-primary/20 shadow-primary/10 flex flex-col items-center justify-center py-16 text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">Loading Recovery Form</h2>
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
