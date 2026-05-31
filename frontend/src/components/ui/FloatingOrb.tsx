"use client";

import React from "react";

interface FloatingOrbProps {
  size?: number;
  color?: "violet" | "cyan" | "emerald" | "amber";
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  delay?: number;
  blur?: number;
  opacity?: number;
}

const colorMap = {
  violet: "rgba(139, 92, 246,",
  cyan: "rgba(6, 182, 212,",
  emerald: "rgba(16, 185, 129,",
  amber: "rgba(245, 158, 11,",
};

export default function FloatingOrb({
  size = 200,
  color = "violet",
  top,
  left,
  right,
  bottom,
  delay = 0,
  blur = 60,
  opacity = 0.15,
}: FloatingOrbProps) {
  const colorBase = colorMap[color];

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        top,
        left,
        right,
        bottom,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle at center, ${colorBase} ${opacity}) 0%, ${colorBase} 0) 100%)`,
        filter: `blur(${blur}px)`,
        animation: `orbFloat ${6 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        zIndex: 0,
      }}
    />
  );
}
