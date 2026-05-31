"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Bell, 
  Check, 
  Info, 
  BookOpen, 
  Award, 
  Calendar,
  AlertCircle,
  MailOpen
} from "lucide-react";
import Link from "next/link";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  category: "academic" | "system" | "placement" | "events";
  read: boolean;
  priority: "high" | "normal" | "low";
}

const mockNotifications: NotificationItem[] = [
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

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const [activeCategory, setActiveCategory] = useState<"all" | "academic" | "system" | "placement" | "events">("all");

  const categories = [
    { id: "all", label: "All" },
    { id: "academic", label: "Academic" },
    { id: "system", label: "System" },
    { id: "placement", label: "Placement" },
    { id: "events", label: "Events" }
  ];

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

  const filteredNotifications = notifications.filter(notif => 
    activeCategory === "all" ? true : notif.category === activeCategory
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "academic": return <BookOpen className="h-4 w-4 text-cyan-400" />;
      case "system": return <AlertCircle className="h-4 w-4 text-amber-400" />;
      case "placement": return <Award className="h-4 w-4 text-emerald-400" />;
      case "events": return <Calendar className="h-4 w-4 text-violet-400" />;
      default: return <Info className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case "high": return "border-l-4 border-l-red-500";
      case "normal": return "border-l-4 border-l-primary";
      default: return "border-l-4 border-l-gray-600";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 cursor-pointer"
          />

          {/* Panel */}
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[450px] bg-slate-950/80 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 flex flex-col h-full"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-2.5 rounded-xl border border-primary/30 relative">
                  <Bell className="h-5 w-5 text-primary" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-white tracking-wide uppercase font-mono">Notification HUD</h2>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">System & campus feed</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="p-2 text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer"
                    title="Mark all as read"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">All Read</span>
                  </button>
                )}
                <button 
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 hover:rotate-90 rounded-lg cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Category Filter Tab Bar */}
            <div className="px-6 py-3 border-b border-white/5 flex gap-1 overflow-x-auto scrollbar-none shrink-0 bg-white/1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    activeCategory === cat.id 
                      ? "bg-primary/20 border-primary text-white" 
                      : "text-gray-500 border-transparent hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
              <AnimatePresence initial={false}>
                {filteredNotifications.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center justify-center py-16 text-center space-y-4"
                  >
                    <div className="bg-white/5 p-4 rounded-full border border-white/10">
                      <MailOpen className="h-8 w-8 text-gray-500" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest font-mono">No Logs Registered</h4>
                      <p className="text-[10px] text-gray-500 mt-1 max-w-[200px] leading-relaxed">No new alerts found in this terminal channel.</p>
                    </div>
                  </motion.div>
                ) : (
                  filteredNotifications.map((notif) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      transition={{ duration: 0.2 }}
                      className={`glass-panel p-4 flex gap-3.5 relative overflow-hidden transition-all hover:border-white/15 ${getPriorityBorder(notif.priority)} ${
                        notif.read ? "opacity-60 bg-white/1 border-white/5" : "bg-white/5 border-primary/20"
                      }`}
                    >
                      <div className="bg-white/5 p-2 rounded-xl border border-white/10 shrink-0 h-9 w-9 flex items-center justify-center">
                        {getCategoryIcon(notif.category)}
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white tracking-wide">{notif.title}</h4>
                          <span className="text-[9px] text-gray-500 font-medium shrink-0">{notif.time}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                          {notif.message}
                        </p>
                        
                        <div className="flex items-center justify-end gap-2 pt-2">
                          {!notif.read && (
                            <button
                              onClick={() => handleMarkAsRead(notif.id)}
                              className="text-[9px] uppercase font-bold tracking-wider text-primary hover:text-primary-glow flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Check className="h-3 w-3" /> Mark Read
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notif.id)}
                            className="text-[9px] uppercase font-bold tracking-wider text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors cursor-pointer"
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

            {/* Footer link to full notification center */}
            <div className="p-4 border-t border-white/10 bg-slate-950 shrink-0">
              <Link 
                href="/notifications" 
                onClick={onClose}
                className="flex items-center justify-center w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/95 hover:to-secondary/95 text-white font-extrabold text-xs uppercase tracking-widest py-3 rounded-xl shadow-lg transition-all text-center cursor-pointer font-mono"
              >
                Expand Operations Control
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
