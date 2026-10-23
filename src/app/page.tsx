"use client";

import { useState, useEffect, useMemo } from "react";
import { Game, LauncherInfo } from "@/types/game";
import { RenPlayStorefront } from "@/components/home/RenPlayStorefront";
import { GameDetailsModal } from "@/components/catalog/GameDetailsModal";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [userLibraryIds, setUserLibraryIds] = useState<string[]>([]);
  const [libraryActionLoading, setLibraryActionLoading] = useState(false);

  const [games, setGames] = useState<Game[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);

  const [launcherInfo, setLauncherInfo] = useState<LauncherInfo>({
    version: "0.1.0",
    channel: "stable",
    downloadUrl: null,
    notes: "Acesso antecipado oficial"
  });

  useEffect(() => {
    fetch("/api/games")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setGames(data);
        } else if (data && Array.isArray(data.games)) {
          setGames(data.games);
        }
      })
      .catch((err) => console.error("Erro ao carregar catálogo:", err))
      .finally(() => setLoadingGames(false));

    fetch("/api/launcher")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.version) {
          setLauncherInfo(data);
        }
      })
      .catch((err) => console.error("Erro ao carregar dados do launcher:", err));

    fetch("/api/users/library")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.items)) {
          setUserLibraryIds(data.items.map((i: { id: string }) => i.id));
        } else if (Array.isArray(data)) {
          setUserLibraryIds(data.map((i: { id: string }) => i.id));
        }
      })
      .catch(() => {});
  }, []);

  const handleToggleLibrary = async (gameId: string) => {
    setLibraryActionLoading(true);
    try {
      const isInLibrary = userLibraryIds.includes(gameId);
      const res = await fetch("/api/users/library", {
        method: isInLibrary ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId })
      });
      if (res.ok) {
        if (isInLibrary) {
          setUserLibraryIds((prev) => prev.filter((id) => id !== gameId));
        } else {
          setUserLibraryIds((prev) => [...prev, gameId]);
        }
      }
    } catch (err) {
      console.error("Erro ao alterar biblioteca:", err);
    } finally {
      setLibraryActionLoading(false);
    }
  };

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        game.name.toLowerCase().includes(q) ||
        game.developer.toLowerCase().includes(q) ||
        (game.description && game.description.toLowerCase().includes(q)) ||
        (game.genre && game.genre.toLowerCase().includes(q)) ||
        (game.category && game.category.toLowerCase().includes(q));

      const matchesGenre =
        selectedGenre === "all" ||
        (game.genre && game.genre.toLowerCase() === selectedGenre.toLowerCase()) ||
        (game.category && game.category.toLowerCase() === selectedGenre.toLowerCase());

      return matchesSearch && matchesGenre;
    });
  }, [games, searchQuery, selectedGenre]);

  const handleDownload = () => {
    if (launcherInfo.downloadUrl) {
      window.open(launcherInfo.downloadUrl, "_blank");
    } else {
      setTimeout(() => {
        alert("Iniciando download do RenPlay-Launcher-Setup para Windows (64-bit)!");
      }, 300);
    }
  };

  const openGameModal = (game: Game) => {
    setSelectedGame(game);
    setActiveImageIndex(0);
  };

  return (
    <>
      <RenPlayStorefront
        games={filteredGames}
        loadingGames={loadingGames}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedGenre={selectedGenre}
        onSelectGenre={setSelectedGenre}
        libraryIds={userLibraryIds}
        launcherInfo={launcherInfo}
        onOpenGame={openGameModal}
        onDownload={handleDownload}
      />
      <GameDetailsModal
        game={selectedGame}
        isDark
        activeImageIndex={activeImageIndex}
        userLibraryIds={userLibraryIds}
        libraryActionLoading={libraryActionLoading}
        onClose={() => setSelectedGame(null)}
        onSetActiveImageIndex={setActiveImageIndex}
        onToggleLibrary={handleToggleLibrary}
      />
    </>
  );
}
