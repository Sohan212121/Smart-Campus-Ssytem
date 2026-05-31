"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  Sparkles,
  User,
  Bot,
  Trash2,
  ArrowDown,
  WifiOff
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

// Helper outside the component to generate unique message IDs without purity rule violations
let messageCounter = 0;
const generateMessageId = (sender: "user" | "bot" | "err" | "system") => {
  messageCounter++;
  return `msg-${sender}-${Date.now()}-${messageCounter}`;
};

// Quick action chips definition
const QUICK_CHIPS = [
  { label: "My Attendance", query: "What is my attendance rate and prediction?" },
  { label: "Class Timetable", query: "Show my class schedule today" },
  { label: "Risk Profile", query: "Am I at risk of low attendance?" },
  { label: "Events Guide", query: "Recommend some campus events for me" },
  { label: "Academic Grade Insights", query: "Show my academic performance insights" },
  { label: "Campus Wi-Fi Help", query: "How to connect to the campus Wi-Fi?" },
  { label: "Library Timings", query: "What are the Central Library hours?" },
];

// Fallback responses when the backend is unavailable
const OFFLINE_RESPONSES: Record<string, string> = {
  attendance: "### 📊 Attendance Status (Offline Mode)\n\nI'm currently unable to connect to the live server. Based on cached data:\n\n- Your overall attendance is approximately **80%** across enrolled courses.\n- **Tip:** Maintain at least 75% to avoid debarment.\n\n*Connect the backend server for real-time data.*",
  schedule: "### 📅 Schedule (Offline Mode)\n\nI'm currently unable to fetch your live timetable. Please check the **Schedules** section on your dashboard.\n\n*Start the Express backend on port 5000 for live data.*",
  risk: "### 🚨 Risk Assessment (Offline Mode)\n\nI can't reach the analytics engine right now. General guidance:\n\n- Keep attendance above **75%** in all subjects\n- Submit pending assignments before deadlines\n- Attend upcoming labs to maintain compliance\n\n*Start the backend server for a personalized risk score.*",
  events: "### 🏆 Event Recommendations (Offline Mode)\n\nI can't fetch personalized event recommendations right now. Check the **Events** page on your portal for upcoming hackathons, workshops, and cultural activities.\n\n*Connect the backend for AI-matched event suggestions.*",
  academic: "### 🎓 Academic Insights (Offline Mode)\n\nI'm unable to generate live academic insights. General tips:\n\n- Focus on subjects where your attendance is lowest\n- Use the AI Study Planner when the server is back online\n- Review previous semester performance trends\n\n*Start the backend for personalized grade analytics.*",
  default: "### 🤖 Smart Campus AI Assistant (Offline Mode)\n\nI'm currently running in **offline mode** because the backend server isn't reachable.\n\nI can help you with:\n- **📊 Attendance** — rates, predictions, compliance\n- **📅 Schedule** — timetable, room assignments\n- **🚨 Risk Score** — analytical risk calculations\n- **🏆 Events** — personalized recommendations\n- **🎓 Performance** — grades, percentile rankings\n- **📝 Leaves** — track leave requests\n- **❓ FAQ** — Wi-Fi, library, canteen, fees, parking\n\n*Please start the Express backend server on port 5000 for live AI responses, or try one of the suggested quick chips below!*"
};

function getOfflineResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("attendance") || q.includes("present") || q.includes("absent")) return OFFLINE_RESPONSES.attendance;
  if (q.includes("schedule") || q.includes("timetable") || q.includes("class")) return OFFLINE_RESPONSES.schedule;
  if (q.includes("risk") || q.includes("failing") || q.includes("critical")) return OFFLINE_RESPONSES.risk;
  if (q.includes("event") || q.includes("hackathon") || q.includes("workshop")) return OFFLINE_RESPONSES.events;
  if (q.includes("academic") || q.includes("grade") || q.includes("performance")) return OFFLINE_RESPONSES.academic;
  return OFFLINE_RESPONSES.default;
}

export default function AiChatbot() {
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Use a ref to always read the latest messages (fixes stale closure in quick chips)
  const messagesRef = useRef<Message[]>(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Load chat history from Session Storage on mount
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const timer = setTimeout(() => {
      try {
        const history = sessionStorage.getItem(`scaas_chat_${user.id}`);
        if (history) {
          setMessages(JSON.parse(history));
        } else {
          // First greeting
          const hr = new Date().getHours();
          const greeting = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";
          const initialText = `### 🤖 Smart Campus AI Co-Pilot\n\n${greeting}, **${user.firstName}**! I am your AI campus assistant.\n\nI can retrieve your live attendance compliance trends, timetables, active leaves, academic insights, and answer 50+ FAQs regarding housing, canteens, fees, and more.\n\n*Choose a suggested chip or type a question below to start!*`;
          
          const firstMsg: Message = {
            id: "msg-first",
            sender: "bot",
            text: initialText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages([firstMsg]);
          sessionStorage.setItem(`scaas_chat_${user.id}`, JSON.stringify([firstMsg]));
        }
      } catch (err) {
        console.error("Chat history load error:", err);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user]);

  // Scroll to bottom helper
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 50);
    }
  }, [messages, isOpen, scrollToBottom]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Monitor scroll height to show scroll-down button
  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isFar = scrollHeight - scrollTop - clientHeight > 100;
    setShowScrollDown(isFar);
  }, []);

  // Clear chat history
  const handleClearHistory = useCallback(() => {
    if (!user) return;
    try {
      sessionStorage.removeItem(`scaas_chat_${user.id}`);
      const resetMsg: Message = {
        id: generateMessageId("system"),
        sender: "bot",
        text: `### 🤖 Assistant Reset\n\nChat history cleared. How can I assist you with your Smart Campus schedule or analytics today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([resetMsg]);
      setIsOffline(false);
      sessionStorage.setItem(`scaas_chat_${user.id}`, JSON.stringify([resetMsg]));
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  // Submit chat queries — uses messagesRef to avoid stale closures
  const handleSendMessage = useCallback(async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || !user) return;
    if (isLoading) return; // Prevent double-sends

    // 1. Add User Message (read latest from ref)
    const userMsg: Message = {
      id: generateMessageId("user"),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const currentMessages = messagesRef.current;
    const updatedMessages = [...currentMessages, userMsg];
    setMessages(updatedMessages);
    setInputMessage("");
    setIsLoading(true);

    try {
      sessionStorage.setItem(`scaas_chat_${user.id}`, JSON.stringify(updatedMessages));

      // 2. Fetch AI Response from backend with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second timeout

      const res = await fetch(`${API_URL}/api/v1/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ message: text }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        setIsOffline(false);
        const botMsg: Message = {
          id: generateMessageId("bot"),
          sender: "bot",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        const finalMessages = [...updatedMessages, botMsg];
        setMessages(finalMessages);
        sessionStorage.setItem(`scaas_chat_${user.id}`, JSON.stringify(finalMessages));
      } else {
        throw new Error(`Server returned ${res.status}`);
      }
    } catch (err) {
      // Provide intelligent offline response instead of generic error
      setIsOffline(true);
      const offlineReply = getOfflineResponse(text);
      const errorMsg: Message = {
        id: generateMessageId("err"),
        sender: "bot",
        text: offlineReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const finalMessages = [...updatedMessages, errorMsg];
      setMessages(finalMessages);
      sessionStorage.setItem(`scaas_chat_${user.id}`, JSON.stringify(finalMessages));
    } finally {
      setIsLoading(false);
    }
  }, [user, isLoading, API_URL]);

  // Lightweight Regex Markdown-to-JSX compiler
  const parseMarkdownToJSX = (text: string) => {
    const lines = text.split("\n");
    let inTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];

    const parsedElements = lines.map((line, idx) => {
      const trimmed = line.trim();

      // 1. Table Handling
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        // Divider line check
        if (trimmed.includes("---") || trimmed.includes(":---")) {
          return null; // Skip table header dividers
        }

        const cells = trimmed.split("|").slice(1, -1).map(c => c.trim());
        if (!inTable) {
          inTable = true;
          tableHeaders = cells;
          return null;
        } else {
          tableRows.push(cells);
          return null;
        }
      }

      // End of table trigger
      if (inTable && !trimmed.startsWith("|")) {
        inTable = false;
        const currentHeaders = [...tableHeaders];
        const currentRows = [...tableRows];
        tableHeaders = [];
        tableRows = [];

        return (
          <div key={`table-${idx}`} className="overflow-x-auto my-3 border border-white/10 rounded-xl bg-slate-950/40 max-w-full">
            <table className="w-full text-[10px] text-left text-gray-300 border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  {currentHeaders.map((h, hIdx) => (
                    <th key={hIdx} className="px-3 py-2 font-bold text-white uppercase tracking-wider">{renderInlines(h)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {currentRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-white/5">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3 py-2 font-medium font-sans whitespace-nowrap">{renderInlines(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      if (inTable) return null; // Wait until end of table to group and render

      // 2. Headings (###)
      if (trimmed.startsWith("###")) {
        return (
          <h4 key={idx} className="text-xs font-black text-white mt-4 mb-2 tracking-wide uppercase flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> {renderInlines(trimmed.substring(3).trim())}
          </h4>
        );
      }

      // 3. Heading (####)
      if (trimmed.startsWith("####")) {
        return (
          <h5 key={idx} className="text-[11px] font-extrabold text-white mt-3 mb-1.5">
            {renderInlines(trimmed.substring(4).trim())}
          </h5>
        );
      }

      // 4. Bullet points (- or *)
      if (trimmed.startsWith("- [ ]")) {
        return (
          <div key={idx} className="text-[10px] text-gray-300 ml-4 my-1 flex items-start gap-1.5">
            <span className="mt-0.5 h-3 w-3 border border-primary/40 rounded-[3px] shrink-0" />
            <p>{renderInlines(trimmed.substring(5).trim())}</p>
          </div>
        );
      }

      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return (
          <div key={idx} className="text-[10px] text-gray-300 ml-4 my-1 flex items-start gap-1">
            <span className="text-primary mt-0.5">•</span>
            <p>{renderInlines(trimmed.substring(1).trim())}</p>
          </div>
        );
      }

      // 5. Numbered list (1. 2. etc.)
      const numberedMatch = trimmed.match(/^(\d+)\.\s(.+)/);
      if (numberedMatch) {
        return (
          <div key={idx} className="text-[10px] text-gray-300 ml-4 my-1 flex items-start gap-1.5">
            <span className="text-primary font-bold mt-0.5 shrink-0">{numberedMatch[1]}.</span>
            <p>{renderInlines(numberedMatch[2])}</p>
          </div>
        );
      }

      // 6. Standard Paragraph
      if (trimmed === "") return <div key={idx} className="h-2" />;

      return (
        <p key={idx} className="text-[10.5px] leading-relaxed text-gray-300 my-1.5 font-medium">
          {renderInlines(trimmed)}
        </p>
      );
    });

    // Cleanup lingering tables
    if (inTable) {
      const currentHeaders = [...tableHeaders];
      const currentRows = [...tableRows];
      parsedElements.push(
        <div key="table-lingering" className="overflow-x-auto my-3 border border-white/10 rounded-xl bg-slate-950/40 max-w-full">
          <table className="w-full text-[10px] text-left text-gray-300 border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {currentHeaders.map((h, hIdx) => (
                  <th key={hIdx} className="px-3 py-2 font-bold text-white uppercase tracking-wider">{renderInlines(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {currentRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-white/5">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 font-medium font-sans">{renderInlines(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return parsedElements;
  };

  // Inlines helper (bold **, italics *, emojis, monospace `code`)
  const renderInlines = (text: string) => {
    // Simplified parsing: find all instances of **text** or `code` or *italic*
    let remaining = text;
    const elements: React.ReactNode[] = [];
    let keyIdx = 0;

    while (remaining.length > 0) {
      // Find bold or code index
      const boldStart = remaining.indexOf("**");
      const codeStart = remaining.indexOf("`");
      const italicStart = remaining.indexOf("*");

      // Determine which marker comes first (excluding ** detected as italic)
      const candidates: { type: string; pos: number }[] = [];
      if (boldStart !== -1) candidates.push({ type: "bold", pos: boldStart });
      if (codeStart !== -1) candidates.push({ type: "code", pos: codeStart });
      // Only match single * if it's NOT a ** bold marker
      if (italicStart !== -1 && italicStart !== boldStart) {
        candidates.push({ type: "italic", pos: italicStart });
      }

      if (candidates.length === 0) {
        elements.push(remaining);
        break;
      }

      // Sort by position and process the first one
      candidates.sort((a, b) => a.pos - b.pos);
      const first = candidates[0];

      if (first.type === "bold") {
        // Push prefix
        if (first.pos > 0) {
          elements.push(remaining.substring(0, first.pos));
        }
        const boldEnd = remaining.indexOf("**", first.pos + 2);
        if (boldEnd !== -1) {
          const boldText = remaining.substring(first.pos + 2, boldEnd);
          elements.push(<strong key={`b-${keyIdx++}`} className="font-extrabold text-white">{boldText}</strong>);
          remaining = remaining.substring(boldEnd + 2);
        } else {
          elements.push(remaining.substring(first.pos));
          break;
        }
      } else if (first.type === "code") {
        // Push prefix
        if (first.pos > 0) {
          elements.push(remaining.substring(0, first.pos));
        }
        const codeEnd = remaining.indexOf("`", first.pos + 1);
        if (codeEnd !== -1) {
          const codeText = remaining.substring(first.pos + 1, codeEnd);
          elements.push(<code key={`c-${keyIdx++}`} className="bg-slate-950 px-1.5 py-0.5 rounded font-mono text-[9.5px] border border-white/5 text-primary font-bold">{codeText}</code>);
          remaining = remaining.substring(codeEnd + 1);
        } else {
          elements.push(remaining.substring(first.pos));
          break;
        }
      } else {
        // Italic *text*
        if (first.pos > 0) {
          elements.push(remaining.substring(0, first.pos));
        }
        const italicEnd = remaining.indexOf("*", first.pos + 1);
        if (italicEnd !== -1) {
          const italicText = remaining.substring(first.pos + 1, italicEnd);
          elements.push(<em key={`i-${keyIdx++}`} className="text-gray-400 italic">{italicText}</em>);
          remaining = remaining.substring(italicEnd + 1);
        } else {
          elements.push(remaining.substring(first.pos));
          break;
        }
      }
    }

    return <>{elements}</>;
  };

  // Handle form submit
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputMessage);
  }, [handleSendMessage, inputMessage]);

  if (!mounted || !isAuthenticated || !user) return null;

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end" style={{ zIndex: 9999 }}>
      
      {/* 1. Expandable Chat Panel */}
      {isOpen && (
        <div
          className="glass-panel mb-4 border-white/10 flex flex-col shadow-2xl animate-chat-slide overflow-hidden"
          style={{ width: "min(400px, calc(100vw - 48px))", height: "520px", zIndex: 9999 }}
        >
          
          {/* Header */}
          <div className="bg-slate-900 border-b border-white/5 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  SCAAS Smart Assistant <Sparkles className="h-3 w-3 text-primary" />
                </h4>
                <div className="flex items-center gap-1">
                  {isOffline ? (
                    <>
                      <WifiOff className="h-2.5 w-2.5 text-amber-500" />
                      <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider">Offline Mode</span>
                    </>
                  ) : (
                    <>
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Local AI Core Active</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClearHistory}
                title="Clear Chat History"
                className="p-1.5 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto relative bg-slate-950/10 chatbot-scrollbar"
          >
            <div className="p-4 space-y-4 flex flex-col min-h-full">
              {messages.map((msg) => {
                const isBot = msg.sender === "bot";
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 max-w-[85%] ${isBot ? "self-start" : "self-end flex-row-reverse ml-auto"}`}
                  >
                    <div className={`h-6 w-6 shrink-0 rounded-full flex items-center justify-center border text-[10px] ${
                      isBot 
                        ? "bg-primary/10 border-primary/20 text-primary" 
                        : "bg-white/5 border-white/10 text-white"
                    }`}>
                      {isBot ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                    </div>

                    <div className={`p-3 rounded-2xl border text-xs shadow ${
                      isBot 
                        ? "bg-white/5 border-white/5 text-gray-200 rounded-tl-none" 
                        : "bg-primary text-white border-primary/20 rounded-tr-none"
                    }`}>
                      {isBot ? parseMarkdownToJSX(msg.text) : <p className="font-semibold">{msg.text}</p>}
                      <span className="block text-[8px] text-gray-500 font-bold text-right mt-1 font-mono uppercase tracking-wider">{msg.timestamp}</span>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex gap-2.5 max-w-[85%] self-start">
                  <div className="h-6 w-6 shrink-0 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="p-3 bg-white/5 border border-white/5 rounded-2xl rounded-tl-none text-xs flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                    <span className="text-[10px] text-gray-400 font-bold">Copilot is thinking...</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Suggested Quick Actions */}
          <div className="px-4 py-2 bg-slate-900/60 border-t border-white/5 flex gap-1.5 overflow-x-auto chatbot-scrollbar-hidden shrink-0">
            {QUICK_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                disabled={isLoading}
                onClick={() => handleSendMessage(chip.query)}
                className="px-2.5 py-1 bg-white/5 hover:bg-primary/20 border border-white/5 hover:border-primary/30 text-gray-300 hover:text-white rounded-full text-[9px] font-bold whitespace-nowrap transition-all select-none disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Message Input Box */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-slate-900 border-t border-white/5 flex gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything about attendance, schedules, canteens, grades..."
              className="flex-1 bg-white/5 border border-white/5 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 rounded-xl px-3 py-2 text-xs font-semibold text-white placeholder-gray-500 outline-none transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="rounded-xl bg-primary hover:bg-primary/80 text-white shadow-lg shadow-primary/20 flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ height: "34px", width: "34px" }}
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>

          {/* Floating scroll down assistant */}
          {showScrollDown && (
            <button
              onClick={scrollToBottom}
              className="absolute right-4 p-1.5 bg-primary text-white border border-primary/25 rounded-full shadow-lg flex items-center justify-center animate-bounce hover:scale-105 transition-all"
              style={{ bottom: "128px", zIndex: 10 }}
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* 2. Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`rounded-full flex items-center justify-center shadow-2xl relative select-none hover:scale-105 transition-all outline-none border focus:ring-2 focus:ring-primary/40 ${
          isOpen
            ? "bg-slate-900 border-white/10 text-white"
            : "bg-primary border-primary/20 text-white animate-fab-glow"
        }`}
        style={{ height: "52px", width: "52px" }}
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <div className="relative">
            <MessageSquare className="h-5 w-5" />
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 h-2 w-2 rounded-full animate-ping" />
          </div>
        )}
      </button>
    </div>
  );
}
