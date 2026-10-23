"use client";

import React, { useState, useEffect } from "react";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthCharacterSide } from "@/components/auth/AuthCharacterSide";
import { LoginFormCard } from "@/components/auth/LoginFormCard";

export default function LoginPage() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("renplay_theme") !== "light";
    }
    return true;
  });

  // Sincroniza tema com localStorage e classe .dark
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    if (nextTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("renplay_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("renplay_theme", "light");
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 select-none overflow-x-hidden ${
        isDark ? "bg-[#090A0F] text-[#F5F5F5]" : "bg-[#F7F8FA] text-[#121212]"
      }`}
    >
      <AuthHeader isDark={isDark} onToggleTheme={toggleTheme} />

      <main className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        <AuthCharacterSide isDark={isDark} />
        <LoginFormCard isDark={isDark} />
      </main>

      <footer
        className={`py-4 text-center text-[11px] border-t transition-colors ${
          isDark ? "text-zinc-500 border-zinc-800/80 bg-[#090A0F]" : "text-zinc-600 border-zinc-200/80 bg-white"
        }`}
      >
        © 2026, Renplay Inc. Todos os direitos reservados.
      </footer>
    </div>
  );
}
