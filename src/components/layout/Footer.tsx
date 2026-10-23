import React from "react";
import Link from "next/link";

interface FooterProps {
  isDark: boolean;
}

export function Footer({ isDark }: FooterProps) {
  return (
    <footer
      className={`border-t py-12 transition-colors ${
        isDark
          ? "bg-[#0a0d14] border-zinc-800/80 text-zinc-500"
          : "bg-[#f1f3f7] border-zinc-200 text-zinc-600"
      }`}
    >
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Logo.png" alt="RenPlay" className="h-8 w-auto object-contain" />
            <span className="text-xs text-zinc-400 font-semibold">
              Plataforma e Launcher oficial de Visual Novels para Windows.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-bold">
            <a href="#inicio" className="hover:text-[#FFDE00] transition-colors">Download</a>
            <a href="#descobrir" className="hover:text-[#FFDE00] transition-colors">Catálogo</a>
            <Link href="/portal" className="hover:text-[#FFDE00] transition-colors">Minha Conta</Link>
            <Link href="/dev" className="hover:text-[#FFDE00] transition-colors">Área da Equipe</Link>
            <Link href="/dashboard" className="hover:text-[#FFDE00] transition-colors">Dashboard RenPlay</Link>
            <Link href="/login" className="hover:text-[#FFDE00] transition-colors">Entrar</Link>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© 2026 RenPlay. Todos os direitos reservados. Não associado oficialmente ao Ren&apos;Py.</p>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">Termos de Serviço</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Privacidade</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
