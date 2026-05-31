"use client";

import React from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover3D?: boolean;
  glowColor?: string;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className = "",
  hover3D = true,
  glowColor = "rgba(139, 92, 246, 0.25)",
  onClick,
}: GlassCardProps) {
  return (
    <motion.div
      className={`glass-panel p-6 relative overflow-hidden group ${className}`}
      whileHover={hover3D ? {
        y: -6,
        scale: 1.01,
        boxShadow: `0 24px 48px -10px ${glowColor}`,
        borderColor: "rgba(139, 92, 246, 0.4)",
      } : undefined}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
      }}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : undefined }}
    >
      {/* Shimmer sweep on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 55%, transparent 60%)",
            animation: "shimmerSweep 2s ease-in-out infinite",
          }}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
