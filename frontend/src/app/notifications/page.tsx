"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import GlassNav from "@/components/ui/GlassNav";
import PageTransition from "@/components/ui/PageTransition";
import ScrollReveal from "@/components/ui/ScrollReveal";
import GlassCard from "@/components/ui/GlassCard";
import FloatingOrb from "@/components/ui/FloatingOrb";
import { 
  Bell, 
  Check, 
  Trash2, 
  BookOpen, 
  AlertCircle, 
  Award, 
  Calendar,
  Info,
  MailOpen,
  X,
  Sparkles,
  Zap,
  CheckCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationItem } from "@/components/ui/NotificationsPanel";

const initialNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "Attendance Deficit Alert",
    message: "Your attendance in Database Systems has fallen to 64%. You need to attend the next 3 lectures to reach 75%.",
    time: "10 mins ago",
    category: "academic",
    read: false,
    priority: "high",
  },
  {
    id: "2",
    title: "Hackathon Registration Open",
    message: "Registration for the Smart Campus Hackathon 2026 is now open. Team up and submit your proposal.",
    time: "2 hours ago",
    category: "events",
    read: false,
    priority: "normal",
  },
  {
    id: "3",
    title: "Placement Drive - Google",
    message: "Google is hiring Associate Software Engineers. Eligibility criteria: CSE/IT, CGPA > 8.5. Last date to apply is June 5.",
    time: "5 hours ago",
    category: "placement",
    read: false,
    priority: "high",
  },
  {
    id: "4",
    title: "System Maintenance",
    message: "The smart campus portal will undergo scheduled maintenance on Sunday from 2:00 AM to 4:00 AM.",
    time: "1 day ago",
    category: "system",
    read: true,
    priority: "low",
  },
  {
    id: "5",
    title: "Exemption Claim Approved",
    message: "Your leave exemption claim for May 18-19 (Medical ground) has been approved by Prof. Angela.",
    time: "2 days ago",
    category: "academic",
    read: true,
    priority: "normal",
  }
];

export default function NotificationsCenterPage() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [activeCategory, setActiveCategory] = useState<"all" | "academic" | "system" | "placement" | "events">("all");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    );
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all notifications from this terminal channel?")) {
      setNotifications([]);
    }
  };

  const filteredNotifications = notifications.filter(notif => 
    activeCategory === "all" ? true : notif.category === activeCategory
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  const categories = [
    { id: "all", label: "All Logs" },
    { id: "academic", label: "Academic" },
    { id: "system", label: "System" },
    { id: "placement", label: "Placement" },
    { id: "events", label: "Events" }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "academic": return <BookOpen className="h-5 w-5 text-cyan-400" />;
      case "system": return <AlertCircle className="h-5 w-5 text-amber-400" />;
      case "placement": return <Award className="h-5 w-5 text-emerald-400" />;
      case "events": return <Calendar className="h-5 w-5 text-violet-400" />;
      default: return <Info className="h-5 w-5 text-gray-400" />;
    }
  };

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case "high": return "border-l-4 border-l-red-500";
      case "normal": return "border-l-4 border-l-primary";
      default: return "border-l-4 border-l-gray-600";
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-x-hidden flex flex-col selection:bg-primary/30 selection:text-white">
      <GlassNav />
      <PageTransition className="flex-1 flex flex-col pt-24 pb-12">
        
        {/* Decorative Floating Orbs */}
        <FloatingOrb color="violet" size={350} top="-5%" left="-5%" delay={0} />
        <FloatingOrb color="cyan" size={350} bottom="-5%" right="-5%" delay={2} />

        {/* Content Container */}
        <div className="max-w-4xl w-full mx-auto px-6 sm:px-8 flex-1 space-y-8 z-10 relative">
          
          {/* Header Panel */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="inline-flex bg-primary/10 border border-primary/20 text-primary-glow px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest font-mono mb-2">
                Operations Command
              </div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white font-mono flex items-center gap-2">
                Notification Center <Bell className="h-6 w-6 text-secondary animate-pulse" />
              </h1>
              <p className="text-[10px] text-gray-500 font-mono font-bold tracking-widest uppercase mt-0.5">
                Centralized telemetry alert feed
              </p>
            </div>

            {/* Actions */}
            {notifications.length > 0 && (
              <div className="flex items-center gap-2.5 w-full md:w-auto">
                <button
                  onClick={handleMarkAllRead}
                  disabled={unreadCount === 0}
                  className="glass-panel text-gray-400 hover:text-white border border-white/5 hover:border-white/10 text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center gap-2 cursor-pointer bg-white/2"
                >
                  <CheckCheck className="h-4 w-4 text-emerald-400" /> Mark All Read
                </button>
                <button
                  onClick={handleClearAll}
                  className="bg-red-500/10 border border-red-500/30 hover:bg-red-500/25 text-red-400 text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all btn-elastic cursor-pointer shadow-lg"
                >
                  <Trash2 className="h-4 w-4" /> Clear Channel
                </button>
              </div>
            )}
          </div>

          {/* Tab Filter Links */}
          <ScrollReveal direction="up" delay={0.1}>
            <div className="glass-panel p-2 flex gap-1.5 border border-white/10 overflow-x-auto scrollbar-none bg-slate-950/80 backdrop-blur-md rounded-2xl shrink-0">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`text-[10px] uppercase font-mono font-extrabold tracking-wider px-5 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                    activeCategory === cat.id 
                      ? "bg-primary/20 text-white shadow-lg shadow-primary/35 border border-primary/20" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </ScrollReveal>

          {/* Roster alerts feed */}
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {filteredNotifications.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center py-20 text-center space-y-4 glass-panel border-white/5 bg-slate-950/50"
                >
                  <div className="bg-white/5 p-5 rounded-full border border-white/10 animate-pulse">
                    <MailOpen className="h-10 w-10 text-gray-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest font-mono">Operations Channel Empty</h4>
                    <p className="text-[11px] text-gray-500 mt-1 max-w-xs leading-relaxed font-semibold">No telemetry alerts mapped inside this category path.</p>
                  </div>
                </motion.div>
              ) : (
                filteredNotifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.2 }}
                    className={`glass-panel p-5 flex gap-4 relative overflow-hidden transition-all hover:border-white/15 ${getPriorityBorder(notif.priority)} ${
                      notif.read ? "opacity-60 bg-white/1 border-white/5" : "bg-white/5 border-primary/25 shadow-lg shadow-primary/5"
                    }`}
                  >
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/10 shrink-0 h-11 w-11 flex items-center justify-center">
                      {getCategoryIcon(notif.category)}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-4">
                        <h4 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                          {notif.title}
                          {notif.priority === "high" && (
                            <span className="bg-red-500/10 border border-red-500/30 text-red-400 text-[8px] font-mono font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                              Urgent Alert
                            </span>
                          )}
                        </h4>
                        <span className="text-[10px] text-gray-500 font-bold font-mono shrink-0 uppercase tracking-wider">{notif.time}</span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed font-medium pt-1">
                        {notif.message}
                      </p>
                      
                      <div className="flex items-center justify-end gap-3 pt-3">
                        {!notif.read && (
                          <button
                            onClick={() => handleMarkAsRead(notif.id)}
                            className="text-[9px] uppercase font-mono font-extrabold tracking-widest text-primary hover:text-primary-glow flex items-center gap-1 transition-colors cursor-pointer bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-xl"
                          >
                            <Check className="h-3 w-3" /> Mark Read
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notif.id)}
                          className="text-[9px] uppercase font-mono font-extrabold tracking-widest text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors cursor-pointer bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl"
                        >
                          <X className="h-3 w-3" /> Dismiss
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

        </div>

      </PageTransition>
    </div>
  );
}
