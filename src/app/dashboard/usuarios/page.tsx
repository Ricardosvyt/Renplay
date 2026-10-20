"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

/* ============================================================== */
/* TIPAGEM DO USUÁRIO COM VERIFICAÇÃO EM 3 ETAPAS                 */
/* ============================================================== */
export interface DbUser {
  id: string;
  username: string;
  email: string;
  role: "admin" | "dev" | "tradutor" | "moderador" | "usuario" | "vip";
  status: string;
  verification_level: number;
  email_verified: boolean;
  identity_verified: boolean;
  two_factor_verified: boolean;
  created_at: string;
}

/* ============================================================== */
/* ÍCONES VETORIAIS PROFISSIONAIS (SVG)                           */
/* ============================================================== */
function ShieldIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function CodeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function GlobeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function CrownIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v2H5z" />
    </svg>
  );
}

function UserIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SearchIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function TrashIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function ArrowLeftIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function CheckBadgeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
    </svg>
  );
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<DbUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal Novo Usuário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "dev" | "tradutor" | "moderador" | "usuario" | "vip">("usuario");
  const [newVerificationLevel, setNewVerificationLevel] = useState<number>(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  // Modal Gerenciamento de Verificação em 3 Etapas
  const [editingVerificationUser, setEditingVerificationUser] = useState<DbUser | null>(null);
  const [editEmailVerified, setEditEmailVerified] = useState(true);
  const [editIdentityVerified, setEditIdentityVerified] = useState(false);
  const [editTwoFactorVerified, setEditTwoFactorVerified] = useState(false);
  const [isSavingVerification, setIsSavingVerification] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Buscar usuários do banco PostgreSQL
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (roleFilter !== "all") params.set("role", roleFilter);
      if (verificationFilter === "verified3") params.set("verified", "true");

      const res = await fetch(`/api/users?${params.toString()}`);
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Falha ao carregar usuários:", err);
      showToast("Erro ao conectar com o banco de dados.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, roleFilter, verificationFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Criar Usuário
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");

    if (!newUsername.trim() || !newEmail.trim() || !newPassword.trim()) {
      setModalError("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername,
          email: newEmail,
          password: newPassword,
          role: newRole,
          verification_level: newVerificationLevel,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setModalError(data.error || "Erro ao cadastrar usuário.");
        return;
      }

      showToast(`Usuário ${newUsername} cadastrado com sucesso!`);
      setIsModalOpen(false);
      setNewUsername("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("usuario");
      setNewVerificationLevel(3);
      fetchUsers();
    } catch {
      setModalError("Erro de comunicação com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Abrir modal de edição de verificação
  const handleOpenVerificationModal = (user: DbUser) => {
    setEditingVerificationUser(user);
    setEditEmailVerified(user.email_verified ?? true);
    setEditIdentityVerified(user.identity_verified ?? false);
    setEditTwoFactorVerified(user.two_factor_verified ?? false);
  };

  // Salvar etapas de verificação via PATCH
  const handleSaveVerification = async () => {
    if (!editingVerificationUser) return;

    try {
      setIsSavingVerification(true);
      const calculatedLevel = (editEmailVerified ? 1 : 0) + (editIdentityVerified ? 1 : 0) + (editTwoFactorVerified ? 1 : 0);

      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingVerificationUser.id,
          verification_level: calculatedLevel,
          email_verified: editEmailVerified,
          identity_verified: editIdentityVerified,
          two_factor_verified: editTwoFactorVerified,
        }),
      });

      if (!res.ok) {
        showToast("Erro ao atualizar verificação.");
        return;
      }

      showToast(`Verificação de ${editingVerificationUser.username} atualizada para ${calculatedLevel}/3 etapas!`);
      setEditingVerificationUser(null);
      fetchUsers();
    } catch {
      showToast("Falha de conexão ao salvar verificação.");
    } finally {
      setIsSavingVerification(false);
    }
  };

  // Excluir Usuário
  const handleDeleteUser = async (id: string, username: string) => {
    if (!confirm(`Deseja realmente remover o usuário "${username}" do banco de dados?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast(`Usuário ${username} removido com sucesso.`);
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        showToast("Falha ao remover usuário.");
      }
    } catch {
      showToast("Erro ao conectar ao servidor.");
    }
  };

  // Badges visuais profissionais por função
  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.2)]">
            <ShieldIcon className="w-3.5 h-3.5 text-rose-400" />
            <span>Administrador</span>
          </span>
        );
      case "dev":
      case "developer":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-[0_0_12px_rgba(14,165,233,0.2)]">
            <CodeIcon className="w-3.5 h-3.5 text-sky-400" />
            <span>Desenvolvedor</span>
          </span>
        );
      case "tradutor":
      case "translator":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <GlobeIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tradutor Oficial</span>
          </span>
        );
      case "moderador":
      case "moderator":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.2)]">
            <ShieldIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Moderador</span>
          </span>
        );
      case "vip":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#FFDE00]/15 text-[#FFDE00] border border-[#FFDE00]/40 shadow-[0_0_15px_rgba(255,222,0,0.3)]">
            <CrownIcon className="w-3.5 h-3.5 text-[#FFDE00]" />
            <span>Membro VIP</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700">
            <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
            <span>Usuário</span>
          </span>
        );
    }
  };

  // Badge Visual de Verificação em 3 Etapas
  const renderVerificationBadge = (u: DbUser) => {
    const level = u.verification_level ?? 1;

    if (level === 3) {
      return (
        <button
          type="button"
          onClick={() => handleOpenVerificationModal(u)}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-xl text-[11px] font-black bg-gradient-to-r from-emerald-500/20 to-[#FFDE00]/20 text-emerald-300 border border-emerald-500/40 hover:border-[#FFDE00] transition-all cursor-pointer shadow-[0_0_14px_rgba(16,185,129,0.25)] group"
          title="Clique para gerenciar as 3 etapas de verificação"
        >
          <CheckBadgeIcon className="w-4 h-4 text-[#FFDE00] group-hover:scale-110 transition-transform" />
          <span>3/3 Verificado</span>
          <span className="flex gap-0.5 text-xs text-[#FFDE00]">✓✓✓</span>
        </button>
      );
    }

    if (level === 2) {
      return (
        <button
          type="button"
          onClick={() => handleOpenVerificationModal(u)}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-xl text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:border-amber-400 transition-all cursor-pointer shadow-sm group"
          title="Clique para gerenciar as 3 etapas de verificação"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>2/3 Em Análise</span>
          <span className="flex gap-0.5 text-xs text-amber-400">✓✓○</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => handleOpenVerificationModal(u)}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-xl text-[11px] font-semibold bg-zinc-800/80 text-zinc-300 border border-zinc-700 hover:border-zinc-500 transition-all cursor-pointer group"
        title="Clique para gerenciar as 3 etapas de verificação"
      >
        <span className="w-2 h-2 rounded-full bg-sky-400" />
        <span>1/3 E-mail</span>
        <span className="flex gap-0.5 text-xs text-zinc-500">✓○○</span>
      </button>
    );
  };

  const totalAdmins = users.filter((u) => u.role === "admin").length;
  const totalVerified3 = users.filter((u) => (u.verification_level ?? 1) === 3).length;
  const totalVips = users.filter((u) => u.role === "vip").length;

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F5F5F5] font-sans flex flex-col justify-between relative overflow-x-hidden selection:bg-[#FFDE00] selection:text-black">
      {/* ============================================================== */}
      {/* CAMADAS DE AMBIENTAÇÃO CIBERNÉTICA ESTILO LOGIN               */}
      {/* ============================================================== */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30 z-0"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255, 222, 0, 0.08) 1px, transparent 1px),
                           linear-gradient(to bottom, rgba(255, 222, 0, 0.08) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 90%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 90%)",
        }}
      />
      <div className="fixed -top-32 -right-32 w-[520px] h-[520px] rounded-full blur-[110px] pointer-events-none animate-ambient-drift-1 bg-gradient-to-br from-[#FFDE00]/15 via-amber-500/10 to-transparent z-0" />
      <div className="fixed -bottom-40 -left-28 w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none animate-ambient-drift-2 bg-gradient-to-tr from-amber-600/14 via-[#FFDE00]/10 to-transparent z-0" />

      {/* Partículas Douradas Flutuantes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <span className="absolute left-[10%] bottom-[25%] w-2 h-2 rounded-full bg-[#FFDE00] shadow-[0_0_10px_#FFDE00] animate-ember-1" />
        <span className="absolute right-[15%] top-[25%] w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B] animate-ember-3" />
        <span className="absolute left-[8%] top-[40%] text-[#FFDE00] text-sm font-black select-none drop-shadow-[0_0_8px_rgba(255,222,0,0.85)] animate-pulse">✦</span>
      </div>

      {/* ============================================================== */}
      {/* HEADER SUPERIOR                                                */}
      {/* ============================================================== */}
      <header className="border-b border-[#1B1D27] bg-[#090A0F]/90 backdrop-blur-md sticky top-0 z-40 relative">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 transition-all cursor-pointer"
            >
              <ArrowLeftIcon />
              <span>Painel</span>
            </Link>

            <span className="text-zinc-700 font-mono hidden sm:inline">/</span>

            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Logoaccount.png" alt="Renplay" className="h-7 w-auto object-contain hidden md:inline" />
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded bg-[#FFDE00]/15 text-[#FFDE00] border border-[#FFDE00]/30 shadow-[0_0_12px_rgba(255,222,0,0.15)]">
                VERIFICAÇÃO & ACESSOS
              </span>
              <h1 className="text-sm font-black text-white uppercase tracking-tight hidden lg:inline">
                Gerenciamento de Usuários
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="py-2 px-5 rounded-xl text-xs font-black uppercase tracking-wider bg-[#FFDE00] hover:bg-[#ffe53b] text-black shadow-[0_4px_16px_rgba(255,222,0,0.25)] hover:shadow-[0_4px_22px_rgba(255,222,0,0.4)] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>+ Novo Usuário</span>
            </button>
          </div>
        </div>
      </header>

      {/* TOAST FLUTUANTE */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 p-4 rounded-2xl bg-gradient-to-r from-[#FFDE00] to-amber-400 text-black font-black text-xs shadow-[0_10px_35px_rgba(255,222,0,0.4)] animate-bounce flex items-center gap-2.5 border border-black/10">
          <CheckBadgeIcon className="w-4 h-4 text-black" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* CORPO PRINCIPAL: METRICAS + FILTROS + TABELA                   */}
      {/* ============================================================== */}
      <main className="max-w-[1500px] w-full mx-auto p-4 sm:p-8 flex-1 relative z-20 space-y-8">
        {/* CARDS DE MÉTRICAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Total de Usuários", val: users.length.toString(), desc: "Cadastrados no PostgreSQL Neon", color: "text-[#FFDE00]" },
            { title: "3/3 Verificados", val: totalVerified3.toString(), desc: "E-mail + Identidade + 2FA", color: "text-emerald-400" },
            { title: "Administradores", val: totalAdmins.toString(), desc: "Acesso total à plataforma", color: "text-rose-400" },
            { title: "Membros VIP", val: totalVips.toString(), desc: "Assinantes e apoiadores", color: "text-amber-300" },
          ].map((kpi, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-[#12141D]/90 border border-[#262B3D] backdrop-blur-xl space-y-1 shadow-lg">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{kpi.title}</span>
              <div className={`text-2xl font-black ${kpi.color}`}>{loading ? "..." : kpi.val}</div>
              <p className="text-[10px] text-zinc-500 font-medium">{kpi.desc}</p>
            </div>
          ))}
        </div>

        {/* CARD PRINCIPAL DA TABELA */}
        <div className="rounded-3xl p-6 sm:p-8 relative transition-all duration-300 backdrop-blur-2xl bg-[#12141D]/95 border border-[#262B3D] shadow-[0_30px_90px_rgba(0,0,0,0.95)]">
          {/* Filete Dourado no Topo */}
          <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-[#FFDE00] to-transparent shadow-[0_2px_12px_rgba(255,222,0,0.6)]" />

          {/* BARRA DE PESQUISA & FILTROS */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
            <div>
              <h2 className="text-xl font-black uppercase text-white tracking-tight flex items-center gap-2.5">
                <span>Contas & Verificação em 3 Etapas</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Segurança Ativa
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Etapa 1: E-mail Confirmado • Etapa 2: Identidade Oficial • Etapa 3: Autenticação 2FA.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Campo de Busca */}
              <div className="relative w-full sm:w-60">
                <input
                  type="text"
                  placeholder="Buscar usuário ou e-mail..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2.5 pl-9 pr-4 rounded-xl text-xs bg-[#0C0D13] border border-[#202538] text-white placeholder-zinc-500 outline-none focus:border-[#FFDE00] transition-colors"
                />
                <SearchIcon className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-400 pointer-events-none" />
              </div>

              {/* Filtro de Verificação */}
              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
                className="py-2.5 px-3 rounded-xl text-xs bg-[#0C0D13] border border-[#202538] text-zinc-300 outline-none focus:border-[#FFDE00] cursor-pointer"
              >
                <option value="all">Todas as Etapas</option>
                <option value="verified3">Apenas 3/3 Verificados</option>
              </select>

              {/* Filtro por Função */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="py-2.5 px-3 rounded-xl text-xs bg-[#0C0D13] border border-[#202538] text-zinc-300 outline-none focus:border-[#FFDE00] cursor-pointer"
              >
                <option value="all">Todas as Funções</option>
                <option value="admin">Administrador</option>
                <option value="dev">Desenvolvedor</option>
                <option value="tradutor">Tradutor Oficial</option>
                <option value="moderador">Moderador</option>
                <option value="vip">Membro VIP</option>
                <option value="usuario">Usuário Comum</option>
              </select>
            </div>
          </div>

          {/* TABELA DE USUÁRIOS */}
          <div className="mt-6 rounded-2xl border border-zinc-800/80 bg-[#0C0D13]/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 bg-[#0B0D14] text-zinc-400 uppercase text-[10px] font-black tracking-wider">
                    <th className="p-4">Usuário</th>
                    <th className="p-4">E-mail</th>
                    <th className="p-4">Função / Cargo</th>
                    <th className="p-4">Verificação (3 Etapas)</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Data</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-semibold">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-zinc-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-6 h-6 border-2 border-[#FFDE00] border-t-transparent rounded-full animate-spin" />
                          <p className="text-xs font-bold text-zinc-400">Consultando PostgreSQL Neon...</p>
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-zinc-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <UserIcon className="w-8 h-8 text-zinc-700 stroke-1" />
                          <p className="text-sm font-bold text-zinc-400">Nenhum usuário encontrado</p>
                          <p className="text-xs text-zinc-600">Altere os filtros de busca ou crie uma nova conta.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => {
                      const initial = u.username ? u.username.charAt(0).toUpperCase() : "U";
                      const dateStr = u.created_at
                        ? new Date(u.created_at).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "—";

                      return (
                        <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FFDE00]/20 to-amber-500/20 text-[#FFDE00] font-black flex items-center justify-center border border-[#FFDE00]/30 shrink-0">
                                {initial}
                              </div>
                              <span className="font-bold text-white text-sm">{u.username}</span>
                            </div>
                          </td>
                          <td className="p-4 text-zinc-300 font-mono text-[11px]">{u.email}</td>
                          <td className="p-4">{getRoleBadge(u.role)}</td>
                          <td className="p-4">{renderVerificationBadge(u)}</td>
                          <td className="p-4">
                            <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>{u.status || "ACTIVE"}</span>
                            </span>
                          </td>
                          <td className="p-4 text-zinc-400 text-xs font-mono">{dateStr}</td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => handleOpenVerificationModal(u)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#FFDE00] hover:bg-[#FFDE00]/10 border border-[#FFDE00]/30 transition-all cursor-pointer"
                              title="Configurar Etapas de Verificação"
                            >
                              Verificação
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id, u.username)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-400 hover:text-white hover:bg-red-500/20 border border-transparent hover:border-red-500/30 transition-all cursor-pointer inline-flex items-center gap-1"
                              title="Excluir Usuário"
                            >
                              <TrashIcon />
                              <span>Excluir</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* ============================================================== */}
      {/* MODAL: GERENCIAR VERIFICAÇÃO EM 3 ETAPAS                      */}
      {/* ============================================================== */}
      {editingVerificationUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl p-6 sm:p-8 bg-[#12141D] border border-[#262B3D] shadow-[0_25px_70px_rgba(0,0,0,0.95)] relative space-y-5">
            <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-[#FFDE00] to-transparent shadow-[0_2px_12px_rgba(255,222,0,0.6)]" />

            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-base font-black uppercase text-white tracking-tight">
                  Verificação em 3 Etapas
                </h3>
                <p className="text-xs text-zinc-400">
                  Usuário: <strong className="text-[#FFDE00]">{editingVerificationUser.username}</strong>
                </p>
              </div>
              <button
                onClick={() => setEditingVerificationUser(null)}
                className="text-zinc-500 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Etapa 1: E-mail Confirmado */}
              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#0C0D13] border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={editEmailVerified}
                  onChange={(e) => setEditEmailVerified(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[#FFDE00] cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      Etapa 1: E-mail Confirmado
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400">
                      Básico
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    O link de ativação enviado para o e-mail foi validado com sucesso.
                  </p>
                </div>
              </label>

              {/* Etapa 2: Identidade / Estúdio Oficial */}
              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#0C0D13] border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={editIdentityVerified}
                  onChange={(e) => setEditIdentityVerified(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[#FFDE00] cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      Etapa 2: Identidade & Estúdio
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/15 text-amber-300">
                      Intermediário
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Comprovação de identidade oficial, estúdio de desenvolvimento ou grupo de tradução.
                  </p>
                </div>
              </label>

              {/* Etapa 3: Autenticação de 2 Fatores (2FA) */}
              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#0C0D13] border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={editTwoFactorVerified}
                  onChange={(e) => setEditTwoFactorVerified(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[#FFDE00] cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      Etapa 3: Autenticação 2FA
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FFDE00]/15 text-[#FFDE00]">
                      Segurança Máxima
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Chave TOTP ou aplicativo autenticador configurado e ativo.
                  </p>
                </div>
              </label>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-zinc-800">
              <span className="text-xs font-mono text-zinc-400">
                Total: <strong className="text-[#FFDE00]">{(editEmailVerified ? 1 : 0) + (editIdentityVerified ? 1 : 0) + (editTwoFactorVerified ? 1 : 0)}/3 etapas</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingVerificationUser(null)}
                  className="px-3.5 py-2 rounded-xl border border-zinc-800 text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveVerification}
                  disabled={isSavingVerification}
                  className="px-5 py-2 rounded-xl bg-[#FFDE00] hover:bg-[#ffe53b] text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {isSavingVerification ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CADASTRAR NOVO USUÁRIO                                  */}
      {/* ============================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl p-6 sm:p-8 bg-[#12141D] border border-[#262B3D] shadow-[0_25px_70px_rgba(0,0,0,0.95)] relative space-y-5">
            <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-[#FFDE00] to-transparent shadow-[0_2px_12px_rgba(255,222,0,0.6)]" />

            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-black uppercase text-white tracking-tight">
                Cadastrar Novo Usuário
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold text-center">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Nome de Usuário *
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Ex: IcardoGoat"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0C0D13] border border-[#202538] focus:border-[#FFDE00] text-xs text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  E-mail *
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Ex: usuario@renplay.com.br"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0C0D13] border border-[#202538] focus:border-[#FFDE00] text-xs text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Senha (Criptografada com bcrypt) *
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite uma senha forte"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0C0D13] border border-[#202538] focus:border-[#FFDE00] text-xs text-white outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                    Função / Cargo *
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as typeof newRole)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0C0D13] border border-[#202538] focus:border-[#FFDE00] text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="usuario">Usuário Comum</option>
                    <option value="vip">Membro VIP</option>
                    <option value="tradutor">Tradutor Oficial</option>
                    <option value="dev">Desenvolvedor</option>
                    <option value="moderador">Moderador</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                    Nível de Verificação
                  </label>
                  <select
                    value={newVerificationLevel}
                    onChange={(e) => setNewVerificationLevel(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0C0D13] border border-[#202538] focus:border-[#FFDE00] text-xs text-white outline-none cursor-pointer"
                  >
                    <option value={3}>3/3 Verificado Total</option>
                    <option value={2}>2/3 E-mail + Identidade</option>
                    <option value={1}>1/3 Apenas E-mail</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#FFDE00] hover:bg-[#ffe53b] text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Salvando..." : "Salvar no Banco"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
