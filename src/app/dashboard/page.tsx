"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { DashboardTab, GameItem, UserItem } from "@/components/dashboard/types";
import { DashboardOverviewTab } from "@/components/dashboard/DashboardOverviewTab";
import { DashboardGamesTab } from "@/components/dashboard/DashboardGamesTab";
import DashboardUsersTab from "@/components/dashboard/DashboardUsersTab";
import DashboardSettingsTab from "@/components/dashboard/DashboardSettingsTab";
import { DashboardSavesTab } from "@/components/dashboard/DashboardSavesTab";

export default function DashboardPage() {
  const pathname = usePathname();
  const routeTab: DashboardTab =
    pathname === "/dashboard/jogos"
      ? "games"
      : pathname === "/dashboard/saves"
      ? "saves"
      : pathname === "/dashboard/usuarios"
      ? "users"
      : pathname === "/dashboard/publicidade"
      ? "advertising"
      : pathname === "/dashboard/configuracoes"
      ? "settings"
      : "overview";

  const activeTab = routeTab;
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
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-[#FFDE00] text-black font-black text-xs shadow-2xl animate-fade-in-up">
          {toastMessage}
        </div>
      )}

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

      {activeTab === "saves" && <DashboardSavesTab />}

      {activeTab === "settings" && (
        <DashboardSettingsTab onSave={showToast} />
      )}
    </div>
  );
}
