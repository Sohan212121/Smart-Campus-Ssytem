"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

type Direction = "up" | "down" | "left" | "right" | "scale";

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  threshold?: number;
}

const getDirectionOffset = (direction: Direction) => {
  switch (direction) {
    case "up": return { y: 40, x: 0, scale: 1 };
    case "down": return { y: -40, x: 0, scale: 1 };
    case "left": return { y: 0, x: -40, scale: 1 };
    case "right": return { y: 0, x: 40, scale: 1 };
    case "scale": return { y: 0, x: 0, scale: 0.9 };
  }
};

export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  className = "",
  once = true,
  threshold = 0.15,
}: ScrollRevealProps) {
  const { ref, inView } = useInView({
    triggerOnce: once,
    threshold,
  });

  const offset = getDirectionOffset(direction);

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        y: offset.y,
        x: offset.x,
        scale: offset.scale,
      }}
      animate={inView ? {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
      } : {
        opacity: 0,
        y: offset.y,
        x: offset.x,
        scale: offset.scale,
      }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
