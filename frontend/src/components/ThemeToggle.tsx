"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || (!savedTheme && typeof window !== "undefined" && document.documentElement.classList.contains("light"))) {
      setTimeout(() => {
        setTheme("light");
      }, 0);
      document.documentElement.classList.add("light");
    } else {
      setTimeout(() => {
        setTheme("dark");
      }, 0);
      document.documentElement.classList.remove("light");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="glass-panel p-2 text-gray-400 hover:text-white hover:border-primary/50 transition-all hover:scale-105 flex items-center justify-center cursor-pointer rounded-xl"
      aria-label="Toggle theme"
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-yellow-400 transition-transform duration-500 hover:rotate-95" />
      ) : (
        <Moon className="h-4 w-4 text-indigo-400 transition-transform duration-500 hover:rotate-12" />
      )}
    </button>
  );
}
