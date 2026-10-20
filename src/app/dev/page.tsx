"use client";

import { useState } from "react";
import Link from "next/link";

export default function DevPortalPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLogged, setIsLogged] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (identifier && password) {
      setIsLogged(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a09] text-zinc-100 font-sans">
      <header className="border-b border-zinc-800/80 bg-[#0d0d0c]/90 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Logo.png" alt="RenPlay" className="h-8 w-auto object-contain" />
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-amber-400/20">
                EQUIPE & CRIADORES
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs text-zinc-400 hover:text-white transition-colors">
              Voltar ao site ↗
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {!isLogged ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/10 text-amber-400 border border-amber-400/20">
                PORTAL INTERNO
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Histórias melhores <br />
                <span className="text-amber-400">começam em equipe.</span>
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Entre com sua conta autorizada para acessar as ferramentas de desenvolvimento, tradução, revisão de pacotes e moderação de conteúdo no ecossistema RenPlay.
              </p>
            </div>

            <div className="bg-[#121211] p-6 sm:p-8 rounded-2xl border border-zinc-800 shadow-2xl">
              <div className="mb-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Acesso Restrito</span>
                <h2 className="text-xl font-bold mt-1">Entrar no portal da equipe</h2>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">E-mail ou usuário</label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    placeholder="ex: dev.equipe ou dev@renplay.com"
                    className="w-full bg-[#181817] border border-zinc-700/80 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Senha</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Sua senha corporativa"
                    className="w-full bg-[#181817] border border-zinc-700/80 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider transition-transform active:scale-95 cursor-pointer shadow-lg shadow-amber-400/20"
                >
                  Entrar no Painel →
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
                <span>Sem cadastro público</span>
                <span>•</span>
                <span>Acesso exclusivo por convite</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Espaço de Trabalho</span>
                <h1 className="text-2xl font-black mt-1">Painel do Criador</h1>
              </div>
              <button
                onClick={() => setIsLogged(false)}
                className="text-xs font-bold px-3 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
              >
                Encerrar Sessão
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: "Meus Jogos & Builds", count: "3", desc: "Upload de manifestos e arquivos executáveis" },
                { title: "Traduções Pendentes", count: "1", desc: "Pacotes tl/ em revisão para português" },
                { title: "Revisões e Moderação", count: "0", desc: "Fila limpa sem ocorrências abertas" },
              ].map((card, i) => (
                <div key={i} className="bg-[#121211] p-5 rounded-xl border border-zinc-800">
                  <span className="text-2xl font-black text-amber-400">{card.count}</span>
                  <h3 className="font-bold text-sm mt-2">{card.title}</h3>
                  <p className="text-xs text-zinc-400 mt-1">{card.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-2xl bg-[#121211] border border-zinc-800 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base">Quer publicar um novo título no RenPlay?</h3>
                <p className="text-xs text-zinc-400 mt-1">Submeta a documentação do jogo e a comprovação de direitos para aprovação.</p>
              </div>
              <Link
                href="/dashboard"
                className="btn-epic-primary text-xs py-2.5 px-5 font-black uppercase tracking-wider cursor-pointer"
              >
                Abrir Publicador
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
