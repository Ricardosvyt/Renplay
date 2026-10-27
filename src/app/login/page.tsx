"use client";

import React, { useEffect } from "react";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthCharacterSide } from "@/components/auth/AuthCharacterSide";
import { LoginFormCard } from "@/components/auth/LoginFormCard";

export default function LoginPage() {
  // Garante o tema escuro fixo em todo o ecossistema RenPlay
  useEffect(() => {
    document.documentElement.classList.add("dark");
    if (typeof window !== "undefined") {
      localStorage.setItem("renplay_theme", "dark");
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans select-none overflow-x-hidden bg-[#090A0F] text-[#F5F5F5]">
      <AuthHeader isDark={true} />

      <main className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        <AuthCharacterSide isDark={true} />
        <LoginFormCard isDark={true} />
      </main>

      <footer className="py-4 text-center text-[11px] border-t border-zinc-800/80 bg-[#090A0F] text-zinc-500">
        © 2026, Renplay Inc. Todos os direitos reservados.
      </footer>
    </div>
  );
}
