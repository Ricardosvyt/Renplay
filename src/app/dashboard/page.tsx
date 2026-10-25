"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardTab, GameItem, UserItem } from "@/components/dashboard/types";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardOverviewTab } from "@/components/dashboard/DashboardOverviewTab";
import { DashboardGamesTab } from "@/components/dashboard/DashboardGamesTab";
import DashboardUsersTab from "@/components/dashboard/DashboardUsersTab";
import DashboardSettingsTab from "@/components/dashboard/DashboardSettingsTab";

export default function DashboardPage() {
  const pathname = usePathname();
  const routeTab: DashboardTab =
    pathname === "/dashboard/jogos"
      ? "games"
      : pathname === "/dashboard/usuarios"
      ? "users"
      : pathname === "/dashboard/configuracoes"
      ? "settings"
      : "overview";

  const [activeTab] = useState<DashboardTab>(routeTab);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Jogos carregados do catálogo persistido no banco Neon
  const [games, setGames] = useState<GameItem[]>([]);

  // Lista de Membros da Equipe sincronizada com o banco
  const [users, setUsers] = useState<UserItem[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.users && Array.isArray(data.users)) {
          setUsers(
            data.users.map((u: { id: string; username: string; email: string; role: string; status: string; created_at: string; verification_level?: number }) => ({
              id: u.id,
              name: u.username,
              email: u.email,
              role: (u.role?.toUpperCase() as UserItem["role"]) || "USUARIO",
              status: "ACTIVE",
              joinedDate: new Date(u.created_at).toLocaleDateString("pt-BR"),
              verificationLevel: u.verification_level ?? 1,
            }))
          );
        }
      })
      .catch((err) => console.error("Erro ao sincronizar usuários:", err));

    fetch("/api/games?includeAll=true")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data.games)) return;
        setGames(
          data.games.map((game: { id: string; name: string; developer?: string; category?: string; genre?: string; version?: string; coverImage?: string; mainCover?: string; horizontalBanner?: string; downloadUrl?: string; status?: string; updated_at?: string; created_at?: string }) => ({
            id: game.id,
            title: game.name,
            developer: game.developer || "Desenvolvedor não informado",
            category: game.category || "Geral",
            genre: game.genre || "Visual Novel",
            version: game.version || "1.0.0",
            engine: "Ren'Py",
            adult: false,
            coverUrl: game.coverImage || game.mainCover || game.horizontalBanner || "/images/so-much-to-love-cover.jpg",
            downloadUrl: game.downloadUrl || "",
            downloads: 0,
            status: game.status === "PUBLISHED" ? "PUBLISHED" : game.status === "PENDING_REVIEW" ? "PENDING_REVIEW" : "DRAFT",
            lastUpdate: new Date(game.updated_at || game.created_at || Date.now()).toLocaleDateString("pt-BR"),
          }))
        );
      })
      .catch((err) => console.error("Erro ao sincronizar jogos:", err));
  }, []);

  const handleDeleteGame = async (id: string, name: string) => {
    if (!confirm(`Deseja remover "${name}" do catálogo?`)) return;
    const response = await fetch(`/api/games?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      showToast(data.error || "Não foi possível excluir o jogo.");
      return;
    }
    setGames((current) => current.filter((g) => g.id !== id));
    showToast("Jogo removido com sucesso.");
  };

  const handleUpdateStatus = async (id: string, newStatus: "PUBLISHED" | "DRAFT" | "SUSPENDED" | "ARCHIVED") => {
    try {
      const res = await fetch("/api/games", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!res.ok) {
        showToast("Falha ao atualizar status do jogo.");
        return;
      }
      setGames((prev) =>
        prev.map((g) => (g.id === id ? { ...g, status: newStatus } : g))
      );
      showToast(`Status atualizado para ${newStatus === "PUBLISHED" ? "Publicado" : newStatus === "DRAFT" ? "Rascunho" : newStatus}.`);
    } catch {
      showToast("Erro ao conectar ao servidor.");
    }
  };

  const handleBatchUpdateStatus = async (ids: string[], newStatus: "PUBLISHED" | "DRAFT" | "SUSPENDED" | "ARCHIVED") => {
    try {
      await Promise.all(
        ids.map((id) =>
          fetch("/api/games", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status: newStatus }),
          })
        )
      );
      setGames((prev) =>
        prev.map((g) => (ids.includes(g.id) ? { ...g, status: newStatus } : g))
      );
      showToast(`${ids.length} jogos atualizados para ${newStatus === "PUBLISHED" ? "Publicados" : newStatus === "DRAFT" ? "Rascunho" : newStatus}.`);
    } catch {
      showToast("Erro ao atualizar lote de jogos.");
    }
  };

  const handleBatchDelete = async (ids: string[]) => {
    if (!confirm(`Deseja remover do catálogo os ${ids.length} jogos selecionados? Os saves dos usuários serão preservados.`)) return;
    try {
      const responses = await Promise.all(
        ids.map((id) => fetch(`/api/games?id=${encodeURIComponent(id)}`, { method: "DELETE" }))
      );
      const removed = ids.filter((_, index) => responses[index].ok);
      setGames((current) => current.filter((g) => !removed.includes(g.id)));
      showToast(removed.length === ids.length
        ? `${removed.length} jogos removidos do catálogo.`
        : `${removed.length} de ${ids.length} jogos removidos do catálogo.`);
    } catch {
      showToast("Erro ao excluir lote de jogos.");
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F5F5F5] font-sans flex flex-col justify-between">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-[#FFDE00] text-black font-black text-xs shadow-2xl animate-fade-in-up">
          {toastMessage}
        </div>
      )}

      {/* HEADER PRINCIPAL */}
      <header className="border-b border-[#29292F] bg-[#090A0F]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Logo.png" alt="RenPlay" className="h-8 w-auto object-contain" />
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-[#FFDE00]/15 text-[#FFDE00] border border-[#FFDE00]/30">
                PAINEL DE CONTROLE
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs font-bold text-zinc-400 hover:text-[#FFDE00] transition-colors"
            >
              ← Ir ao Site
            </Link>
            <Link
              href="/portal"
              className="text-xs font-bold px-3 py-2 rounded-lg border border-[#29292F] bg-[#12141D] hover:border-[#FFDE00]/60 text-zinc-300 transition-colors"
            >
              Minha Conta
            </Link>
          </div>
        </div>
      </header>

      {/* CORPO DO DASHBOARD */}
      <div className="flex-1 max-w-[1500px] w-full mx-auto flex flex-col md:flex-row">
        {/* SIDEBAR MODULAR */}
        <DashboardSidebar
          activeTab={activeTab}
          gamesCount={games.length}
          usersCount={users.length}
        />

        {/* ÁREA DE CONTEÚDO MODULAR */}
        <main className="flex-1 p-6 md:p-8 bg-[#090A0F]">
          {activeTab === "overview" && (
            <DashboardOverviewTab games={games} users={users} />
          )}

          {activeTab === "games" && (
            <DashboardGamesTab
              games={games}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              onSearchChange={setSearchQuery}
              onStatusFilterChange={setStatusFilter}
              onUpdateStatus={handleUpdateStatus}
              onDeleteGame={handleDeleteGame}
              onBatchUpdateStatus={handleBatchUpdateStatus}
              onBatchDelete={handleBatchDelete}
            />
          )}

          {activeTab === "users" && (
            <DashboardUsersTab users={users} />
          )}

          {activeTab === "settings" && (
            <DashboardSettingsTab onSave={showToast} />
          )}
        </main>
      </div>

      {/* FOOTER */}
      <footer className="py-4 text-center text-[11px] font-semibold border-t border-[#29292F] bg-[#090A0F] text-zinc-500">
        © 2026 RenPlay Studios. Painel de Controle e Distribuição Oficial.
      </footer>
    </div>
  );
}
