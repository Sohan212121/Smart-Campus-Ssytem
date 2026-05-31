"use client";

import React, { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { useMotionValue, useSpring, animate } from "framer-motion";

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  decimals?: number;
}

export default function AnimatedCounter({
  target,
  duration = 2,
  suffix = "",
  prefix = "",
  className = "",
  decimals = 0,
}: AnimatedCounterProps) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 40,
    stiffness: 100,
  });
  const displayRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (inView && !hasAnimated.current) {
      hasAnimated.current = true;
      animate(motionValue, target, {
        duration,
        ease: [0.16, 1, 0.3, 1],
      });
    }
  }, [inView, target, duration, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (displayRef.current) {
        const formatted = decimals > 0
          ? latest.toFixed(decimals)
          : Math.round(latest).toLocaleString();
        displayRef.current.textContent = `${prefix}${formatted}${suffix}`;
      }
    });
    return unsubscribe;
  }, [springValue, suffix, prefix, decimals]);

  return (
    <span ref={ref} className={className}>
      <span ref={displayRef}>{prefix}0{suffix}</span>
    </span>
  );
}
