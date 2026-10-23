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
  { id: 1, title: "Básico", category: "Informações Básicas", description: "Nome, slug, estúdio, classificação e engine", icon: "sparkles" },
  { id: 2, title: "Mídia", category: "Imagens & Trailer", description: "Ícone, banner hero, pôster e galeria", icon: "image" },
  { id: 3, title: "Download", category: "Instalação & Requisitos", description: "Versão, plataformas, arquivos e hardware", icon: "download" },
  { id: 4, title: "Idiomas", category: "Tradução & Tags", description: "Idiomas disponíveis, status e tradutores", icon: "globe" },
  { id: 5, title: "Publicação", category: "Status & Destaque", description: "Status, datas, ordem de destaque e notas", icon: "shield" },
  { id: 6, title: "Comunidade", category: "Métricas & Prévia", description: "Preview ao vivo na loja e estatísticas", icon: "book" }
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
