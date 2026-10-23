import React from "react";
import { Icon, IconName } from "../ui/Icon";
import { Step } from "./types";

export interface StepItem {
  id: Step;
  title: string;
  category: string;
  description: string;
  icon: IconName;
}

export const stepsList: StepItem[] = [
  { id: 1, title: "Identidade", category: "Visual & GitHub", description: "Nome, banner, perfil e repo", icon: "sparkles" },
  { id: 2, title: "Informações", category: "Sobre & Sinopse", description: "História, estúdio e gênero", icon: "book" },
  { id: 3, title: "Idiomas", category: "Localização & Tags", description: "Idiomas e palavras-chave", icon: "globe" },
  { id: 4, title: "Galeria", category: "Capa & Mídia", description: "Pôster e screenshots", icon: "image" },
  { id: 5, title: "Arquivos", category: "Download & Sistemas", description: "Links e plataformas", icon: "download" },
  { id: 6, title: "Lançamento", category: "Revisão & Status", description: "Checklist e publicação", icon: "shield" }
];

interface StepNavProps {
  currentStep: Step;
  onSelectStep: (step: Step) => void;
}

export function StepNav({ currentStep, onSelectStep }: StepNavProps) {
  return (
    <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {stepsList.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelectStep(item.id)}
          className={`group rounded-2xl border p-3 text-left transition ${
            currentStep === item.id
              ? "border-[#FFDE00] bg-[#FFDE00]/10 shadow-[0_0_20px_rgba(255,222,0,0.12)]"
              : item.id < currentStep
              ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50"
              : "border-[#29292F] bg-[#12141D] hover:border-zinc-600"
          }`}
        >
          <div className="flex items-center justify-between">
            <Icon
              name={item.icon}
              className={`h-4 w-4 ${
                currentStep === item.id
                  ? "text-[#FFDE00]"
                  : item.id < currentStep
                  ? "text-emerald-400"
                  : "text-zinc-500"
              }`}
            />
            {item.id < currentStep && <Icon name="check" className="h-3.5 w-3.5 text-emerald-400" />}
            <span className="text-[10px] font-black text-zinc-500">0{item.id}</span>
          </div>
          <p className="mt-2 text-xs font-black text-white">{item.title}</p>
          <p className="mt-0.5 truncate text-[10px] text-zinc-500">{item.category}</p>
        </button>
      ))}
    </div>
  );
}
