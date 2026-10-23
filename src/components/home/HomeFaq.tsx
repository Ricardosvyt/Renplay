import React from "react";

interface FaqItem {
  q: string;
  a: string;
}

const faqList: FaqItem[] = [
  {
    q: "O RenPlay Launcher é gratuito?",
    a: "Sim, o aplicativo do RenPlay é 100% gratuito, sem planos pagos para baixar ou jogar histórias públicas da comunidade."
  },
  {
    q: "Como funcionam as traduções em português?",
    a: "Os jogos já contam com os pacotes de tradução instalados diretamente ou disponibilizados com instalador automático em game/tl."
  },
  {
    q: "Posso jogar offline sem conexão com a internet?",
    a: "Com certeza! Depois de baixar o jogo através do launcher, ele roda localmente no seu computador sem exigir conexão ativa."
  },
  {
    q: "O launcher é compatível com Windows 10 e 11?",
    a: "Sim! Desenvolvido com aceleração nativa e suporte completo a arquiteturas 64-bit para Windows 10 e Windows 11."
  },
  {
    q: "Como publico meu jogo no catálogo do RenPlay?",
    a: "Basta acessar a área de criadores no menu ou em /dev, criar sua conta de desenvolvedor e submeter a documentação do projeto."
  }
];

interface HomeFaqProps {
  isDark: boolean;
  openFaq: number | null;
  onToggleFaq: (index: number) => void;
}

export function HomeFaq({ isDark, openFaq, onToggleFaq }: HomeFaqProps) {
  return (
    <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-xs font-black uppercase tracking-widest text-[#FFDE00]">
          TIRE SUAS DÚVIDAS
        </span>
        <h2 className="text-3xl font-black uppercase">Perguntas Frequentes</h2>
      </div>

      <div className="space-y-3">
        {faqList.map((faq, idx) => (
          <div
            key={idx}
            className={`rounded-2xl border transition-all overflow-hidden ${
              isDark ? "bg-[#141a26] border-zinc-800" : "bg-white border-zinc-200"
            }`}
          >
            <button
              onClick={() => onToggleFaq(idx)}
              className="w-full p-5 text-left font-black text-sm flex items-center justify-between gap-4 cursor-pointer"
            >
              <span>{faq.q}</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  openFaq === idx ? "rotate-180 text-[#FFDE00]" : "text-zinc-500"
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {openFaq === idx && (
              <div className="px-5 pb-5 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/40 pt-3">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
