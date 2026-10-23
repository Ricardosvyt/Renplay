"use client";

import React from "react";

interface DashboardSettingsTabProps {
  onSave: (message: string) => void;
}

export default function DashboardSettingsTab({ onSave }: DashboardSettingsTabProps) {
  return (
    <div className="space-y-6 animate-fade-in-up max-w-2xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
          Configurações Globais
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Ajuste os parâmetros gerais da plataforma e do launcher.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-[#12141D] border border-[#29292F] space-y-4">
        <div>
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
            Nome Oficial da Plataforma
          </label>
          <input
            type="text"
            defaultValue="RenPlay Launcher"
            className="w-full px-4 py-2.5 rounded-xl border border-[#29292F] bg-[#090A0F] text-white text-xs outline-none focus:border-[#FFDE00] focus:ring-2 focus:ring-[#FFDE00]/10"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
            Versão Atual do Launcher OTA
          </label>
          <input
            type="text"
            defaultValue="1.0.0"
            className="w-full px-4 py-2.5 rounded-xl border border-[#29292F] bg-[#090A0F] text-white text-xs outline-none focus:border-[#FFDE00] focus:ring-2 focus:ring-[#FFDE00]/10"
          />
        </div>

        <div className="pt-2">
          <button
            onClick={() => onSave("Configurações salvas com sucesso!")}
            className="btn-epic-primary py-2.5 px-6 rounded-xl font-black text-xs cursor-pointer"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}
