"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  UserCheck,
  ArrowRight
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("Verifying your email token...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing. Please check your verification link.");
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    fetch(`${API_URL}/api/v1/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully! You can now log in.");
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed. Token may be invalid or expired.");
        }
      })
      .catch((err) => {
        console.error("Verify email fetch error:", err);
        setStatus("error");
        setMessage("Network error: Unable to connect to campus servers.");
      });
  }, [token]);

  return (
    <div className="w-full max-w-[440px] glass-panel p-8 border-primary/20 shadow-primary/10">
      <div className="flex flex-col items-center text-center">
        {status === "verifying" && (
          <>
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-full shadow-lg shadow-primary/10 mb-6 animate-pulse">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Verifying Credentials</h2>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="bg-accent/20 border border-accent/30 p-4 rounded-full shadow-lg shadow-accent/20 mb-6 animate-bounce">
              <CheckCircle2 className="h-10 w-10 text-accent" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Verification Success</h2>
            <p className="text-xs text-accent mt-2 leading-relaxed font-semibold">{message}</p>
            <Link 
              href="/login" 
              className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold text-sm py-3.5 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/35 flex items-center justify-center gap-2 mt-6 btn-elastic shimmer-effect"
            >
              Go to Login <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="bg-red-500/20 border border-red-500/30 p-4 rounded-full shadow-lg shadow-red-500/20 mb-6 animate-wiggle">
              <AlertCircle className="h-10 w-10 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Verification Failed</h2>
            <p className="text-xs text-red-300 mt-2 leading-relaxed">{message}</p>
            <Link 
              href="/login" 
              className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 font-semibold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 mt-6 btn-elastic"
            >
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.05)_0%,transparent_40%)] pointer-events-none" />
      
      {/* Header Panel */}
      <header className="absolute top-6 left-6 right-6 flex items-center justify-between z-10 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-primary to-secondary p-2 rounded-xl shadow-lg shadow-primary/20 animate-float">
            <UserCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              SCAAS <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full font-medium border border-primary/30">v1.0</span>
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
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">Loading Verification</h2>
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
