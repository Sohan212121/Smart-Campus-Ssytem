"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import ThemeToggle from "@/components/ThemeToggle";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Sparkles, 
  Bookmark, 
  Star, 
  Ticket, 
  Users, 
  Award, 
  Search, 
  Filter, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  UserPlus, 
  X, 
  MessageSquare, 
  TrendingUp, 
  Briefcase, 
  Flame, 
  BookOpen, 
  ShieldAlert,
  Send,
  Check
} from "lucide-react";

// Mock Database of Campus Events
const initialEvents = [
  {
    id: "evt-101",
    title: "CodeCraft National Hackathon",
    category: "HACKATHON",
    club: "Coding Club",
    date: "2026-06-01",
    time: "09:00 AM",
    location: "Main Gymnasium & Lab-3",
    speaker: "Dr. Amanda Ross (Google AI)",
    speakerBio: "Principal AI Research Scientist with 15+ years of experience in distributed neural networks.",
    capacity: 200,
    registered: 142,
    description: "A 36-hour sprint to build AI-powered solutions addressing Smart City infrastructure. Food and premium merchandise will be provided.",
    status: "UPCOMING",
    rating: 4.8,
    reviewsCount: 32,
    clashLectures: ["CS-401 (Advanced Mathematics)"]
  },
  {
    id: "evt-102",
    title: "Data Structures Crash Workshop",
    category: "WORKSHOP",
    club: "IEEE Student Branch",
    date: "2026-05-28",
    time: "02:00 PM",
    location: "Seminar Hall-2",
    speaker: "Prof. Rajesh Sharma",
    speakerBio: "Lead Instructor of Algorithms at SCAAS, ex-IIT research scientist.",
    capacity: 80,
    registered: 65,
    description: "Hands-on coding session covering Trees, Graphs, and Dynamic Programming templates to prepare students for core technical screening tests.",
    status: "UPCOMING",
    rating: 4.6,
    reviewsCount: 18,
    clashLectures: ["CS-402 (Data Structures & Algorithms)"]
  },
  {
    id: "evt-103",
    title: "AI/ML Innovations Seminar",
    category: "SEMINAR",
    club: "AI Society",
    date: "2026-06-08",
    time: "11:00 AM",
    location: "Main Auditorium",
    speaker: "Yann LeCun (Virtual Special Guest)",
    speakerBio: "Turing Award Laureate & Chief AI Scientist at Meta.",
    capacity: 500,
    registered: 412,
    description: "Exploring the next frontier of self-supervised learning models and autonomous agent architectures in robotic controls.",
    status: "UPCOMING",
    rating: 4.9,
    reviewsCount: 154,
    clashLectures: []
  },
  {
    id: "evt-104",
    title: "RoboWars Arena Clash",
    category: "TECHNICAL",
    club: "Robotics Club",
    date: "2026-06-04",
    time: "03:00 PM",
    location: "Main Campus Plaza",
    speaker: "Eng. Victor Stone",
    speakerBio: "Founder of HeavyMetal Robotics, robot designer.",
    capacity: 150,
    registered: 80,
    description: "Spectator arena showdown for student-designed combat robots under 15kg. Prizes for the most robust defenses and structural designs.",
    status: "UPCOMING",
    rating: 4.7,
    reviewsCount: 22,
    clashLectures: ["CS-404 (Software Engineering)"]
  },
  {
    id: "evt-105",
    title: "Cultural Fusion Beats Fest",
    category: "NON_TECHNICAL",
    club: "Music & Cultural Council",
    date: "2026-06-12",
    time: "06:00 PM",
    location: "Open Air Theatre",
    speaker: "SCAAS Fusion Band",
    speakerBio: "In-house award-winning instrumental and percussion orchestra.",
    capacity: 1000,
    registered: 620,
    description: "Annual cultural night featuring collaborative performances, fusion music, open-mic slots, and regional street food stalls.",
    status: "UPCOMING",
    rating: 4.5,
    reviewsCount: 88,
    clashLectures: []
  },
  {
    id: "evt-106",
    title: "Cyber Security CTF Contest",
    category: "HACKATHON",
    club: "WhiteHat Hackers Hub",
    date: "2026-05-18",
    time: "10:00 AM",
    location: "Cyber Lab-1",
    speaker: "Sarah Connor (Ethical Hacker)",
    speakerBio: "Red-team lead at CyberDyne Systems.",
    capacity: 60,
    registered: 60,
    description: "Jeopardy-style Capture The Flag competition covering cryptography, reverse engineering, and buffer overflow exploits.",
    status: "COMPLETED",
    rating: 4.9,
    reviewsCount: 45,
    clashLectures: []
  }
];

export default function StudentEventsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  
  // States
  const [activeTab, setActiveTab] = useState<"explore" | "passes" | "teams" | "history">("explore");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [eventsList, setEventsList] = useState(initialEvents);
  
  // Registration and Bookmark State (Simulated Persistent Store)
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
  const [bookmarkedEventIds, setBookmarkedEventIds] = useState<string[]>([]);
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  
  // Pass Modal State
  const [activePassEvent, setActivePassEvent] = useState<any | null>(null);
  
  // Feedback Modal State
  const [feedbackEvent, setFeedbackEvent] = useState<any | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [completedFeedbacks, setCompletedFeedbacks] = useState<string[]>([]);

  // Team Formation State
  const [teams, setTeams] = useState<Array<{ id: string; eventTitle: string; name: string; leader: string; members: string[]; slots: number }>>([
    { id: "tm-1", eventTitle: "CodeCraft National Hackathon", name: "Null Pointers", leader: "Sohan kumar kj", members: ["Sohan kumar kj", "Chloe Bennett"], slots: 2 },
    { id: "tm-2", eventTitle: "CodeCraft National Hackathon", name: "AI Autonomers", leader: "Elena Rostova", members: ["Elena Rostova", "Alex Mercer", "Diana Prince"], slots: 1 },
    { id: "tm-3", eventTitle: "RoboWars Arena Clash", name: "Steel Sparklers", leader: "Victor Stone", members: ["Victor Stone"], slots: 3 },
  ]);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamEvent, setNewTeamEvent] = useState("CodeCraft National Hackathon");
  const [newTeamSlots, setNewTeamSlots] = useState(3);
  const [showCreateTeam, setShowCreateTeam] = useState(false);

  // Exemption / Grade reference checks for AI recommendations
  // Student Roll No: CS-2026-44, has warning in DSA (CS-402)
  const recommendedAI = [
    {
      eventId: "evt-102",
      reason: "Attendance in Data Structures (CS-402) is at 64% (Deficit Warning). Attending this IEEE Data Structures Crash Workshop qualifies you for a participation leave waiver to restore your term balance!",
      type: "ACADEMIC_WAVE",
      badge: "Deficit Savior"
    },
    {
      eventId: "evt-101",
      reason: "Your high grades in Software Engineering (CS-404) match the Google CodeCraft Hackathon skill indicators. Competing will boost your placement board ranking by +15%!",
      type: "CAREER_BOOST",
      badge: "Placement Match"
    }
  ];

  // Auth Guard
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Load state from localStorage where available
  useEffect(() => {
    const savedReg = localStorage.getItem("registered_events_demo");
    const savedBook = localStorage.getItem("bookmarked_events_demo");
    if (savedReg) setRegisteredEventIds(JSON.parse(savedReg));
    if (savedBook) setBookmarkedEventIds(JSON.parse(savedBook));
  }, []);

  const saveToLocal = (reg: string[], book: string[]) => {
    localStorage.setItem("registered_events_demo", JSON.stringify(reg));
    localStorage.setItem("bookmarked_events_demo", JSON.stringify(book));
  };

  // Handlers
  const toggleBookmark = (id: string) => {
    let updated;
    if (bookmarkedEventIds.includes(id)) {
      updated = bookmarkedEventIds.filter(x => x !== id);
    } else {
      updated = [...bookmarkedEventIds, id];
    }
    setBookmarkedEventIds(updated);
    saveToLocal(registeredEventIds, updated);
  };

  const handleRegister = (eventId: string) => {
    if (registeredEventIds.includes(eventId)) {
      // Unregister
      const updated = registeredEventIds.filter(x => x !== eventId);
      setRegisteredEventIds(updated);
      saveToLocal(updated, bookmarkedEventIds);
      // Remove student from any created teams matching this event
      const event = eventsList.find(e => e.id === eventId);
      if (event) {
        setTeams(prev => prev.filter(t => t.eventTitle !== event.title || t.leader !== "Sohan kumar kj"));
      }
      return;
    }

    setRegisteringId(eventId);
    // Dynamic simulated latency for premium feel
    setTimeout(() => {
      const updated = [...registeredEventIds, eventId];
      setRegisteredEventIds(updated);
      setRegisteringId(null);
      saveToLocal(updated, bookmarkedEventIds);
    }, 850);
  };

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    const newTeam = {
      id: `tm-${Date.now()}`,
      eventTitle: newTeamEvent,
      name: newTeamName,
      leader: "Sohan kumar kj",
      members: ["Sohan kumar kj"],
      slots: newTeamSlots
    };

    setTeams(prev => [newTeam, ...prev]);
    setNewTeamName("");
    setShowCreateTeam(false);
  };

  const handleJoinTeam = (teamId: string) => {
    setTeams(prev => prev.map(t => {
      if (t.id === teamId && t.slots > 0 && !t.members.includes("Sohan kumar kj")) {
        return {
          ...t,
          members: [...t.members, "Sohan kumar kj"],
          slots: t.slots - 1
        };
      }
      return t;
    }));
  };

  const submitFeedback = () => {
    if (!feedbackEvent) return;
    setCompletedFeedbacks(prev => [...prev, feedbackEvent.id]);
    setFeedbackEvent(null);
    setFeedbackText("");
  };

  // Filter Events
  const filteredEvents = eventsList.filter(ev => {
    const matchesSearch = ev.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ev.club.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ev.speaker.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "ALL" || ev.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-x-hidden text-gray-100">
      {/* Background neon glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.06)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.04)_0%,transparent_40%)] pointer-events-none" />

      {/* Header Panel */}
      <header className="sticky top-0 z-30 w-full border-b border-white/5 bg-slate-950/40 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/student/dashboard")}
            className="glass-panel p-2.5 text-gray-400 hover:text-white transition-all hover:scale-105 cursor-pointer"
            title="Back to Main Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              SCAAS <span className="bg-gradient-to-r from-secondary to-accent text-transparent bg-clip-text text-xs px-2 py-0.5 rounded-full font-extrabold border border-accent/20">Events Hub</span>
            </span>
            <p className="text-[10px] text-gray-400">Advanced Event Management & Exemption Gateway</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-white block">Sohan kumar kj</span>
            <span className="text-[9px] text-gray-500 font-mono">Roll: CS-2026-44</span>
          </div>
        </div>
      </header>

      {/* Page Navigation Tabs */}
      <div className="mx-4 mt-6 flex flex-wrap gap-2 pb-2 border-b border-white/5 z-10">
        <button
          onClick={() => router.push("/student/dashboard")}
          className="bg-white/5 border border-transparent text-gray-400 hover:text-white hover:bg-white/10 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
        >
          <TrendingUp className="h-4 w-4" /> Academic Dashboard
        </button>
        <button
          onClick={() => router.push("/student/events")}
          className="bg-primary border border-primary/30 text-white flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
        >
          <Calendar className="h-4 w-4" /> Events Hub
        </button>
        <button
          onClick={() => router.push("/student/gamification")}
          className="bg-white/5 border border-transparent text-gray-400 hover:text-white hover:bg-white/10 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10"
        >
          <Award className="h-4 w-4 text-yellow-500 animate-pulse" /> Gamification & Rewards
        </button>
      </div>

      {/* Navigation tabs */}
      <div className="mx-4 mt-6 flex gap-1.5 overflow-x-auto pb-1.5 border-b border-white/5 z-10 scrollbar-thin">
        {[
          { id: "explore", name: "Explore Events", icon: Calendar },
          { id: "passes", name: "My Digital Passes", icon: Ticket, count: registeredEventIds.length },
          { id: "teams", name: "Team Formation", icon: Users },
          { id: "history", name: "History & Certificates", icon: Award },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive 
                  ? "bg-primary border border-primary/30 text-white shadow-lg shadow-primary/20" 
                  : "bg-white/5 border border-transparent text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.name}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-white/20 text-white text-[9px] px-1.5 py-0.2 rounded-full font-extrabold animate-pulse">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main portal contents */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full z-10 space-y-6">

        {/* ==================== EXPLORE TAB ==================== */}
        {activeTab === "explore" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left side filters and events list */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Filter bar card */}
              <div className="glass-panel p-4 flex flex-col md:flex-row justify-between gap-4 border-white/5">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search events, speakers, organizing clubs..."
                    className="w-full bg-slate-900/50 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-primary/50 transition-all"
                  />
                </div>
                
                {/* Category tags selector */}
                <div className="flex gap-1.5 overflow-x-auto scrollbar-thin">
                  {["ALL", "HACKATHON", "WORKSHOP", "SEMINAR", "TECHNICAL", "NON_TECHNICAL"].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
                        selectedCategory === cat 
                          ? "bg-accent/10 border border-accent/30 text-accent" 
                          : "bg-white/5 border border-white/5 text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      {cat.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Event card grid */}
              <div className="space-y-4">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((ev) => {
                    const isRegistered = registeredEventIds.includes(ev.id);
                    const isBookmarked = bookmarkedEventIds.includes(ev.id);
                    const isRegistering = registeringId === ev.id;
                    const clash = ev.clashLectures && ev.clashLectures.length > 0;
                    
                    return (
                      <div 
                        key={ev.id} 
                        className={`glass-panel p-5 border-white/5 hover:border-white/10 transition-all flex flex-col md:flex-row gap-5 relative group overflow-hidden ${
                          ev.status === "COMPLETED" ? "opacity-75" : ""
                        }`}
                      >
                        {/* Background subtle indicator color */}
                        <div className={`absolute top-0 left-0 bottom-0 w-1 ${
                          ev.category === "HACKATHON" ? "bg-red-500" :
                          ev.category === "WORKSHOP" ? "bg-yellow-500" :
                          ev.category === "SEMINAR" ? "bg-primary" :
                          ev.category === "TECHNICAL" ? "bg-accent" : "bg-purple-500"
                        }`} />

                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                              ev.category === "HACKATHON" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                              ev.category === "WORKSHOP" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                              ev.category === "SEMINAR" ? "bg-primary/10 text-primary border-primary/20" :
                              ev.category === "TECHNICAL" ? "bg-accent/10 text-accent border-accent/20" : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                            }`}>
                              {ev.category}
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium">{ev.club}</span>
                            
                            {/* Stars rating */}
                            <span className="flex items-center gap-1 text-[10px] text-yellow-500">
                              <Star className="h-3 w-3 fill-yellow-500" /> {ev.rating}
                            </span>
                          </div>

                          <div>
                            <h3 className="text-sm md:text-base font-bold text-white">{ev.title}</h3>
                            <p className="text-xs text-gray-400 mt-1.5 leading-relaxed line-clamp-2">{ev.description}</p>
                          </div>

                          {/* Logistics metadata grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 border-t border-white/5 pt-3 text-[10px] text-gray-500">
                            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-secondary shrink-0" /> {ev.date} at {ev.time}</span>
                            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-accent shrink-0" /> {ev.location}</span>
                            <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-purple-400 shrink-0" /> {ev.registered} / {ev.capacity} Seats</span>
                          </div>

                          {/* Guest speaker info */}
                          <div className="bg-slate-900/50 p-2.5 rounded-lg border border-white/5 flex gap-2 items-center text-[10px]">
                            <Briefcase className="h-3.5 w-3.5 text-primary shrink-0" />
                            <p className="text-gray-400"><strong className="text-gray-200">Speaker:</strong> {ev.speaker} ({ev.speakerBio.split(".")[0]})</p>
                          </div>

                          {/* Clash Warnings */}
                          {clash && ev.status !== "COMPLETED" && (
                            <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 p-2 rounded-lg text-[9px] text-yellow-400">
                              <ShieldAlert className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
                              <span>Clashes with your Lecture Schedule: {ev.clashLectures.join(", ")}. Attending automatically raises a mock attendance leave request.</span>
                            </div>
                          )}
                        </div>

                        {/* Right side Actions */}
                        <div className="flex md:flex-col justify-between items-end md:justify-center gap-4 border-t md:border-t-0 md:border-l border-white/5 pt-3.5 md:pt-0 md:pl-5 shrink-0 min-w-[120px]">
                          <div className="flex gap-2">
                            {/* Bookmark Toggle */}
                            <button
                              onClick={() => toggleBookmark(ev.id)}
                              className={`p-2.5 rounded-lg border transition-all ${
                                isBookmarked 
                                  ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400 scale-105" 
                                  : "bg-white/5 border-white/5 text-gray-500 hover:text-white"
                              }`}
                            >
                              <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-yellow-400" : ""}`} />
                            </button>
                          </div>

                          {/* Registration State Controller */}
                          {ev.status === "COMPLETED" ? (
                            <button 
                              disabled 
                              className="w-full bg-white/5 border border-white/10 text-gray-500 text-[10px] font-bold py-2 rounded-lg cursor-not-allowed uppercase tracking-wider"
                            >
                              Completed
                            </button>
                          ) : isRegistering ? (
                            <button 
                              disabled 
                              className="w-full bg-primary/10 border border-primary/20 text-primary-glow text-[10px] font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 cursor-not-allowed"
                            >
                              <Loader2 className="h-3 w-3 animate-spin" /> Pending...
                            </button>
                          ) : isRegistered ? (
                            <button
                              onClick={() => handleRegister(ev.id)}
                              className="w-full bg-emerald-500/10 hover:bg-red-500/10 border border-emerald-500/25 hover:border-red-500/25 text-emerald-400 hover:text-red-400 text-[10px] font-bold py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1 uppercase tracking-wider group"
                            >
                              <span className="group-hover:hidden flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Enrolled</span>
                              <span className="hidden group-hover:flex items-center gap-1"><X className="h-3.5 w-3.5" /> Cancel</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRegister(ev.id)}
                              className="w-full bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-bold py-2 px-3 rounded-lg transition-all text-center flex items-center justify-center gap-1 shadow-md shadow-primary/15 hover:scale-[1.03] active:scale-[0.97]"
                            >
                              Register Now
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="glass-panel p-12 text-center border-white/5">
                    <Search className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                    <h4 className="text-sm font-bold text-gray-400">No events matched your search query</h4>
                    <p className="text-xs text-gray-500 mt-1">Try refining your keyword query or choosing a different category filter.</p>
                  </div>
                )}
              </div>

            </div>

            {/* Right side AI Recommendation Panel */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Premium AI Recommendation Panel */}
              <div className="glass-panel p-6 border-accent/25 bg-accent/2 shadow-lg shadow-accent/2 animate-float space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] uppercase font-extrabold tracking-widest text-accent flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" /> Advanced recommendation Engine
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1">AI Smart Exemption Advisor</h3>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs">
                  {recommendedAI.map((rec, idx) => {
                    const matchedEvent = eventsList.find(e => e.id === rec.eventId);
                    if (!matchedEvent) return null;
                    return (
                      <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2 hover:border-accent/35 transition-all">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-white">{matchedEvent.title}</h4>
                          <span className="bg-accent/15 border border-accent/25 text-accent text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {rec.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 leading-normal">{rec.reason}</p>
                        
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-[9px] text-gray-500 font-mono">{matchedEvent.date}</span>
                          {!registeredEventIds.includes(matchedEvent.id) ? (
                            <button
                              onClick={() => handleRegister(matchedEvent.id)}
                              className="text-[9px] font-bold text-accent hover:text-white flex items-center gap-1 transition-colors"
                            >
                              Register & Exemp <Plus className="h-3 w-3" />
                            </button>
                          ) : (
                            <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Enrolled
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bookmark quick access */}
              <div className="glass-panel p-6 border-white/5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-yellow-500" /> Bookmarked Events ({bookmarkedEventIds.length})
                </h3>

                <div className="space-y-2.5">
                  {bookmarkedEventIds.length > 0 ? (
                    bookmarkedEventIds.map(id => {
                      const ev = eventsList.find(e => e.id === id);
                      if (!ev) return null;
                      return (
                        <div key={id} className="p-3 bg-white/5 rounded-lg border border-white/5 flex justify-between items-center gap-3">
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">{ev.title}</h4>
                            <span className="text-[9px] text-gray-500 font-mono mt-0.5 block">{ev.date}</span>
                          </div>
                          
                          <button
                            onClick={() => toggleBookmark(ev.id)}
                            className="text-gray-500 hover:text-red-400 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-[10px] text-gray-500 text-center py-4">Starred items appear here for quick access.</p>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==================== PASSES TAB ==================== */}
        {activeTab === "passes" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Ticket className="h-5 w-5 text-secondary animate-float" /> Digital Event Passes
              </h3>
              <p className="text-xs text-gray-400">One-click passes mapped with cryptographic QR code validation entry keys.</p>
            </div>

            {registeredEventIds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {registeredEventIds.map(id => {
                  const ev = eventsList.find(e => e.id === id);
                  if (!ev) return null;
                  return (
                    <div 
                      key={id} 
                      onClick={() => setActivePassEvent(ev)}
                      className="group relative cursor-pointer overflow-hidden p-6 rounded-2xl border border-white/10 bg-slate-900 hover:border-secondary/50 shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                    >
                      {/* Ticket layout decoration */}
                      <div className="absolute top-0 right-0 bottom-0 w-1.5 bg-gradient-to-b from-secondary to-accent" />
                      <div className="absolute top-1/2 -left-3 h-6 w-6 rounded-full bg-slate-950 border-r border-white/10 -translate-y-1/2" />
                      <div className="absolute top-1/2 -right-3 h-6 w-6 rounded-full bg-slate-950 border-l border-white/10 -translate-y-1/2" />

                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[8px] font-extrabold uppercase bg-secondary/15 text-secondary border border-secondary/20 px-2 py-0.5 rounded-full">
                              {ev.category}
                            </span>
                            <h4 className="text-sm font-extrabold text-white mt-2 leading-tight truncate max-w-[200px]">{ev.title}</h4>
                            <span className="text-[9px] text-gray-500 font-mono block mt-1">{ev.club}</span>
                          </div>
                          
                          {/* Mini QR Mock icon */}
                          <div className="p-1.5 bg-white/5 border border-white/10 rounded-lg group-hover:border-secondary/35 transition-colors">
                            <Ticket className="h-4.5 w-4.5 text-secondary" />
                          </div>
                        </div>

                        <div className="border-t border-dashed border-white/10 pt-3 space-y-2 text-[10px] text-gray-400">
                          <p><strong className="text-gray-300">Venue:</strong> {ev.location}</p>
                          <p><strong className="text-gray-300">Time:</strong> {ev.date} • {ev.time}</p>
                          <p><strong className="text-gray-300">Pass ID:</strong> <span className="font-mono text-secondary-glow">SCAAS-{ev.id.toUpperCase()}</span></p>
                        </div>

                        <div className="w-full bg-white/5 hover:bg-secondary/10 text-center py-2.5 rounded-xl border border-white/5 hover:border-secondary/20 transition-all font-bold text-[10px] text-secondary-glow flex items-center justify-center gap-1.5">
                          View Entrance Ticket Pass <Sparkles className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-panel p-16 text-center border-white/5 space-y-3">
                <Ticket className="h-12 w-12 text-gray-600 mx-auto" />
                <h4 className="text-sm font-bold text-gray-400">No active passes detected</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">Register for upcoming campus seminars, workshops, or hackathons to automatically generate your cryptographic pass.</p>
                <button
                  onClick={() => setActiveTab("explore")}
                  className="mt-4 bg-primary hover:bg-primary/95 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
                >
                  Explore Events Catalog
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================== TEAMS TAB ==================== */}
        {activeTab === "teams" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-accent animate-float" /> Collaborative Team Formation
                </h3>
                <p className="text-xs text-gray-400">Form squads, fill vacancies, or request invitations for Hackathons.</p>
              </div>
              
              <button
                onClick={() => setShowCreateTeam(!showCreateTeam)}
                className="bg-accent hover:bg-accent/90 text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-accent/15"
              >
                {showCreateTeam ? "Cancel" : <><Plus className="h-4 w-4" /> Assemble New Squad</>}
              </button>
            </div>

            {/* Create Team Form Drawer */}
            {showCreateTeam && (
              <form onSubmit={handleCreateTeam} className="glass-panel p-5 border-accent/20 bg-accent/2 max-w-xl space-y-4 animate-fade-in">
                <h3 className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Initialize Team
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Squad Name</label>
                    <input
                      type="text"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      placeholder="e.g. Lambda Hackers"
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-accent/50 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Select Event</label>
                    <select
                      value={newTeamEvent}
                      onChange={(e) => setNewTeamEvent(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-accent/50 transition-all"
                    >
                      {eventsList.filter(e => e.category === "HACKATHON" || e.category === "TECHNICAL").map(ev => (
                        <option key={ev.id} value={ev.title}>{ev.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Vacancy Slots (excluding Leader)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={newTeamSlots}
                    onChange={(e) => setNewTeamSlots(parseInt(e.target.value) || 2)}
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-accent/50 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-accent text-white font-bold text-xs py-2 px-4 rounded-xl transition-all shadow-lg hover:scale-105"
                >
                  Create Squad
                </button>
              </form>
            )}

            {/* Teams Roster Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map(team => {
                const isLeader = team.leader === "Sohan kumar kj";
                const isMember = team.members.includes("Sohan kumar kj");
                const hasVacancies = team.slots > 0;
                
                return (
                  <div key={team.id} className="glass-panel p-5 border-white/5 hover:border-white/10 transition-all flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <h4 className="text-sm font-bold text-white">{team.name}</h4>
                          <span className="text-[9px] text-accent font-semibold block mt-0.5">{team.eventTitle}</span>
                        </div>
                        
                        <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                          hasVacancies 
                            ? "bg-accent/15 text-accent border-accent/20 animate-pulse" 
                            : "bg-slate-900 text-gray-500 border-white/5"
                        }`}>
                          {hasVacancies ? `${team.slots} Vacancies` : "Full"}
                        </span>
                      </div>

                      {/* Members lists */}
                      <div className="mt-4 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Squad Members</span>
                        {team.members.map((m, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[10px] text-gray-300 bg-white/2 p-2 rounded-lg border border-white/5">
                            <span>{m}</span>
                            {m === team.leader && <span className="text-[8px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.2 rounded font-extrabold">LEADER</span>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Join Controller */}
                    <div className="border-t border-white/5 pt-3">
                      {isLeader ? (
                        <div className="text-[10px] text-gray-500 font-mono text-center">
                          ★ You are the leader of this squad
                        </div>
                      ) : isMember ? (
                        <div className="text-[10px] text-emerald-400 font-mono text-center flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Enrolled Member
                        </div>
                      ) : hasVacancies ? (
                        <button
                          onClick={() => handleJoinTeam(team.id)}
                          className="w-full bg-white/5 hover:bg-accent/10 border border-white/5 hover:border-accent/20 text-gray-300 hover:text-accent font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1.5"
                        >
                          <UserPlus className="h-3.5 w-3.5" /> Join Squad
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full bg-slate-900 border border-white/5 text-gray-600 font-bold text-xs py-2 rounded-xl cursor-not-allowed text-center"
                        >
                          Full Squad
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== HISTORY TAB ==================== */}
        {activeTab === "history" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500 animate-float" /> Event History & Certificates Vault
              </h3>
              <p className="text-xs text-gray-400">View your past academic event logs, feedback profiles, and download credentials.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* History events checklist */}
              <div className="lg:col-span-8 space-y-4">
                {eventsList.filter(e => e.status === "COMPLETED").map(ev => {
                  const hasReviewed = completedFeedbacks.includes(ev.id);
                  return (
                    <div key={ev.id} className="glass-panel p-5 border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-900 text-gray-400 border border-white/5 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {ev.category}
                          </span>
                          <h4 className="text-sm font-bold text-white">{ev.title}</h4>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">Organized by {ev.club} • Completed: {ev.date}</p>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                        {/* Feedback Submission button */}
                        {!hasReviewed ? (
                          <button
                            onClick={() => setFeedbackEvent(ev)}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/15 text-gray-300 text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all"
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-yellow-500" /> Share Feedback
                          </button>
                        ) : (
                          <span className="text-[10px] text-yellow-500 font-bold flex items-center gap-1 px-3.5 py-2">
                            ★ Feedback Submitted
                          </span>
                        )}

                        {/* Certificate download */}
                        <button
                          onClick={() => {
                            // Open mock certificate download
                            alert(`Downloading Certification of Participation for:\n"${ev.title}"\nCredential Hash: sha256-a94f3bc28ea714e...`);
                          }}
                          className="bg-gradient-to-r from-yellow-600/10 to-yellow-500/20 border border-yellow-500/30 hover:border-yellow-500/40 text-yellow-400 text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-yellow-500/5 hover:scale-105"
                        >
                          <Award className="h-4 w-4" /> Download Certificate
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Performance snapshot summaries */}
              <div className="lg:col-span-4 glass-panel p-6 border-white/5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Exemption exemptions Summary</h3>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Total Events Attended</span>
                    <strong className="text-white font-mono">3</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Waiver Hours Accrued</span>
                    <strong className="text-accent font-mono">14.5 hrs</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Academic Leave Compliance</span>
                    <strong className="text-secondary font-mono">100% Verified</strong>
                  </div>
                </div>
                
                <div className="bg-yellow-500/5 border border-yellow-500/10 p-3.5 rounded-xl text-[10px] text-yellow-400 leading-normal flex gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Leaves and event participation exemptions are subject to approval by HOD. Verify approval status in your main student dashboard.</span>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* ==================== TICKETS / ENTRY PASS MODAL ==================== */}
      {activePassEvent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel max-w-sm w-full border-secondary/35 p-6 relative overflow-hidden space-y-6">
            <button
              onClick={() => setActivePassEvent(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Neon glowing pass details */}
            <div className="text-center space-y-2 border-b border-white/5 pb-4">
              <span className="text-[8px] font-extrabold uppercase bg-secondary/10 border border-secondary/20 px-2 py-0.5 rounded-full text-secondary tracking-widest">
                {activePassEvent.category} Pass
              </span>
              <h3 className="text-base font-extrabold text-white leading-tight mt-2">{activePassEvent.title}</h3>
              <p className="text-[10px] text-gray-400">{activePassEvent.club}</p>
            </div>

            {/* Simulated QR Code container */}
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl max-w-[160px] mx-auto shadow-2xl relative">
              <div className="h-32 w-32 bg-slate-950 flex flex-col items-center justify-center p-2 rounded-xl text-center space-y-1">
                <Ticket className="h-10 w-10 text-secondary animate-pulse" />
                <span className="text-[8px] font-mono text-gray-400">SECURE PASSPORT</span>
                <span className="text-[7px] font-mono text-secondary-glow">SCAAS-T-{activePassEvent.id.toUpperCase()}</span>
              </div>
              <span className="text-[8px] text-slate-950 font-bold tracking-widest uppercase mt-2 font-mono">CS-2026-44</span>
            </div>

            {/* Pass Metadata */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 text-[10px] space-y-1.5 text-gray-400">
              <div className="flex justify-between"><span className="text-gray-500">Holder:</span> <strong className="text-white">Sohan kumar kj</strong></div>
              <div className="flex justify-between"><span className="text-gray-500">Roll Number:</span> <strong className="text-white">CS-2026-44</strong></div>
              <div className="flex justify-between"><span className="text-gray-500">Location:</span> <strong className="text-white truncate max-w-[160px]">{activePassEvent.location}</strong></div>
              <div className="flex justify-between"><span className="text-gray-500">Time:</span> <strong className="text-white">{activePassEvent.date} @ {activePassEvent.time}</strong></div>
            </div>

            <div className="text-[9px] text-center text-gray-500 leading-normal border-t border-white/5 pt-3">
              Present this code at the gate venue scanner for instant QR-based event entry registration logs.
            </div>
          </div>
        </div>
      )}

      {/* ==================== SHARE FEEDBACK MODAL ==================== */}
      {feedbackEvent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel max-w-md w-full border-yellow-500/30 p-6 relative space-y-5">
            <button
              onClick={() => setFeedbackEvent(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <MessageSquare className="h-4.5 w-4.5 text-yellow-500" /> Share Event Feedback
              </h3>
              <p className="text-[11px] text-gray-400 mt-1">Submit your rating for: <strong className="text-white">{feedbackEvent.title}</strong></p>
            </div>

            {/* Glowing Interactive Stars */}
            <div className="flex justify-center gap-2.5 py-4 border-y border-white/5">
              {[1, 2, 3, 4, 5].map(star => {
                const active = feedbackRating >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackRating(star)}
                    className="transition-transform active:scale-95"
                  >
                    <Star className={`h-8 w-8 transition-colors ${
                      active ? "fill-yellow-500 text-yellow-500 shadow-lg" : "text-gray-600 hover:text-yellow-500/50"
                    }`} />
                  </button>
                );
              })}
            </div>

            {/* Feedback input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Written Review (Optional)</label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="What did you learn? How can this event or workshop be improved?"
                rows={3}
                className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-xs text-white placeholder-gray-500 outline-none focus:border-yellow-500/50 transition-all resize-none"
              />
            </div>

            <button
              onClick={submitFeedback}
              className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-lg shadow-yellow-500/10 flex items-center justify-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" /> Submit Event Ratings
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
