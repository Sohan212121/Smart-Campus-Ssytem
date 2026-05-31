"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserCheck, 
  Menu, 
  X, 
  Bell, 
  ArrowRight,
  Sparkles,
  Layers,
  Cpu
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationsPanel from "./NotificationsPanel";

export default function GlassNav() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "ADMIN") return "/admin/dashboard";
    if (user.role === "TEACHER") return "/teacher/dashboard";
    if (user.role === "HOD") return "/hod/dashboard";
    if (user.role === "EVENT_COORDINATOR") return "/event-coordinator/dashboard";
    if (user.role === "PLACEMENT_OFFICER") return "/placement-officer/dashboard";
    return "/student/dashboard";
  };

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Live Demo", href: "#demo" },
    { label: "Timeline", href: "#timeline" },
    { label: "Analytics", href: "/analytics" },
    { label: "Roster Control", href: "/attendance" },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? "py-3 px-4 sm:px-6 bg-slate-950/40 backdrop-blur-2xl border-b border-white/10 shadow-lg shadow-black/20" 
            : "py-5 px-4 sm:px-8 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-tr from-primary to-secondary p-2.5 rounded-xl shadow-lg shadow-primary/20 group-hover:rotate-12 transition-all duration-300 relative">
              <UserCheck className="h-5 w-5 text-white" />
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-tr from-primary to-secondary opacity-35 blur-sm z-[-1]" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-wider text-white flex items-center gap-1.5 font-mono">
                SCAAS <span className="bg-primary/20 text-primary-glow text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-primary/30">v2.0</span>
              </span>
              <p className="text-[9px] uppercase tracking-widest text-gray-500 font-bold group-hover:text-primary transition-colors">Intelligent Campus Engine</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1.5 rounded-full backdrop-blur-md">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[11px] uppercase tracking-wider font-bold text-gray-400 hover:text-white px-4 py-2 rounded-full transition-all hover:bg-white/5 cursor-pointer"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            
            {isAuthenticated && (
              <button 
                onClick={() => setNotificationsOpen(true)}
                className="glass-panel p-2.5 text-gray-400 hover:text-white hover:border-primary/50 transition-all hover:scale-105 flex items-center justify-center cursor-pointer rounded-xl relative"
                aria-label="Open notifications"
              >
                <Bell className="h-4 w-4 text-cyan-400 animate-pulse" />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
              </button>
            )}

            {isAuthenticated ? (
              <Link 
                href={getDashboardLink()} 
                className="glow-border bg-slate-900 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-lg hover:shadow-primary/20 flex items-center gap-2 btn-elastic shimmer-effect"
              >
                Dashboard <ArrowRight className="h-4 w-4 text-secondary-glow" />
              </Link>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Terminal Access
                </Link>
                <Link 
                  href="/login" 
                  className="glow-border bg-slate-900 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-lg hover:shadow-primary/20 flex items-center gap-2 btn-elastic shimmer-effect"
                >
                  Enter Portal <ArrowRight className="h-4 w-4 text-secondary-glow" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            {isAuthenticated && (
              <button 
                onClick={() => setNotificationsOpen(true)}
                className="glass-panel p-2 text-gray-400 hover:text-white transition-all flex items-center justify-center cursor-pointer rounded-xl relative"
              >
                <Bell className="h-4 w-4 text-cyan-400" />
                <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="glass-panel p-2 text-gray-400 hover:text-white transition-all rounded-xl cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-[65px] left-0 right-0 z-30 md:hidden bg-slate-950/95 backdrop-blur-2xl border-b border-white/10 p-6 flex flex-col gap-4 shadow-2xl"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-white py-3 border-b border-white/5 transition-colors cursor-pointer"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-3 pt-2">
              {isAuthenticated ? (
                <Link
                  href={getDashboardLink()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="glow-border w-full bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold uppercase tracking-wider py-3 rounded-xl text-center shadow-lg flex items-center justify-center gap-2 shimmer-effect cursor-pointer"
                >
                  Enter Command Center <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white py-2 text-center transition-colors cursor-pointer"
                  >
                    Terminal Access
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="glow-border w-full bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold uppercase tracking-wider py-3 rounded-xl text-center shadow-lg flex items-center justify-center gap-2 shimmer-effect cursor-pointer"
                  >
                    Enter Portal <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications slide-out */}
      <NotificationsPanel 
        isOpen={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)} 
      />
    </>
  );
}
