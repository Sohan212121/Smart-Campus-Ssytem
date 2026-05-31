"use client";

import React from "react";
import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  accentColor?: "violet" | "cyan" | "emerald" | "amber";
  delay?: number;
}

const accentColorMap = {
  violet: {
    bg: "bg-primary/10",
    border: "border-primary/25",
    text: "text-primary",
    bar: "from-primary to-primary/40",
    glow: "rgba(139, 92, 246, 0.2)",
  },
  cyan: {
    bg: "bg-secondary/10",
    border: "border-secondary/25",
    text: "text-secondary",
    bar: "from-secondary to-secondary/40",
    glow: "rgba(6, 182, 212, 0.2)",
  },
  emerald: {
    bg: "bg-accent/10",
    border: "border-accent/25",
    text: "text-accent",
    bar: "from-accent to-accent/40",
    glow: "rgba(16, 185, 129, 0.2)",
  },
  amber: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/25",
    text: "text-yellow-500",
    bar: "from-yellow-500 to-yellow-500/40",
    glow: "rgba(245, 158, 11, 0.2)",
  },
};

export default function StatsCard({
  icon: Icon,
  label,
  value,
  suffix = "",
  prefix = "",
  accentColor = "violet",
  delay = 0,
}: StatsCardProps) {
  const colors = accentColorMap[accentColor];

  return (
    <motion.div
      className="glass-panel p-5 relative overflow-hidden group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: delay * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{
        y: -4,
        boxShadow: `0 20px 40px -10px ${colors.glow}`,
      }}
    >
      {/* Gradient bar at top */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${colors.bar}`} />
      
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[9px] uppercase font-bold tracking-widest text-gray-500 font-mono mb-2">
            {label}
          </p>
          <AnimatedCounter
            target={value}
            suffix={suffix}
            prefix={prefix}
            duration={2.5}
            className="text-3xl font-black text-white font-mono"
          />
        </div>
        <div className={`${colors.bg} border ${colors.border} p-2.5 rounded-xl`}>
          <Icon className={`h-5 w-5 ${colors.text}`} />
        </div>
      </div>
    </motion.div>
  );
}
