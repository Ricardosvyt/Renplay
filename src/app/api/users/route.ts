import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hashPassword, verifyPasswordHash } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { canManageUsers } from "@/lib/permissions";

async function requireAdmin() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
    if (!canManageUsers(user)) return NextResponse.json({ error: "Permissão insuficiente." }, { status: 403 });
    return null;
  } catch (error) {
    console.error("Falha ao validar administrador:", error);
    return NextResponse.json({ error: "Não foi possível validar a sessão administrativa." }, { status: 503 });
  }
}

const userQuery = `
  SELECT u.id, u.username, u.email, u.active, u.banned, u.banned_until, u.ban_reason, u.created_at,
         COALESCE((array_agg(ur.role ORDER BY CASE ur.role
           WHEN 'ADMIN' THEN 1 WHEN 'MODERATOR' THEN 2 WHEN 'DEVELOPER' THEN 3
           WHEN 'TRANSLATOR' THEN 4 ELSE 6 END
         ) FILTER (WHERE ur.role NOT IN ('USER','VIP')))[1], 'USER') AS role
    FROM rp_users u
    LEFT JOIN rp_user_roles ur ON ur.user_id = u.id
   GROUP BY u.id
   ORDER BY u.created_at DESC`;

function toRole(role: string) {
  const roles: Record<string, string> = { ADMIN: "admin", MODERATOR: "moderador", DEVELOPER: "desenvolvedor", TRANSLATOR: "tradutor", USER: "membro" };
  return roles[role] || "membro";
}

export async function GET(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const query = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() || "";
    const requestedPage = Number(request.nextUrl.searchParams.get("page") || "1");
    const requestedLimit = Number(request.nextUrl.searchParams.get("limit") || "25");
    const page = Number.isFinite(requestedPage) && requestedPage > 0 ? Math.floor(requestedPage) : 1;
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0 && requestedLimit <= 100 ? Math.floor(requestedLimit) : 25;
    const roleFilter = request.nextUrl.searchParams.get("role")?.trim().toLowerCase() || "all";
    const result = await getDb().query(userQuery);
    const allUsers = result.rows
      .filter((user) => !query || user.username.includes(query) || user.email.includes(query))
      .map((user) => ({ id: user.id, username: user.username, email: user.email, role: toRole(user.role), status: user.banned ? "BANNED" : user.active ? "ACTIVE" : "INACTIVE", banned: user.banned, banned_until: user.banned_until, ban_reason: user.ban_reason, created_at: user.created_at }))
      .filter((user) => roleFilter === "all" || user.role === roleFilter);
    const total = allUsers.length;
    const users = allUsers.slice((page - 1) * limit, page * limit);
    return NextResponse.json({ users, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json({ error: "Falha ao consultar as contas no banco." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await request.json() as { username?: string; email?: string; password?: string; role?: string };
    const username = body.username?.trim().toLowerCase() || "";
    const email = body.email?.trim().toLowerCase() || "";
    const password = body.password || "";
    const role = (body.role || "usuario").trim().toUpperCase();
    const allowed = new Set(["USER", "ADMIN", "MODERATOR", "DEVELOPER", "TRANSLATOR"]);
    if (!username || !email || password.length < 12 || !allowed.has(role)) return NextResponse.json({ error: "Preencha os dados corretamente. A senha deve ter pelo menos 12 caracteres." }, { status: 400 });
    const client = await getDb().connect();
    try {
      await client.query("BEGIN");
      const passwordHash = await hashPassword(password);
      const result = await client.query("INSERT INTO rp_users (username, email, display_name, password_hash, active, email_verified) VALUES ($1, $2, $3, $4, true, true) RETURNING id, username, email, created_at", [username, email, username, passwordHash]);
      await client.query("INSERT INTO rp_user_roles (user_id, role) VALUES ($1, 'USER') ON CONFLICT DO NOTHING", [result.rows[0].id]);
      if (role !== "USER") await client.query("INSERT INTO rp_user_roles (user_id, role) VALUES ($1, $2)", [result.rows[0].id, role]);
      await client.query("COMMIT");
      return NextResponse.json({ user: result.rows[0], success: true }, { status: 201 });
    } catch (error) { await client.query("ROLLBACK").catch(() => undefined); throw error; }
    finally { client.release(); }
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    const code = (error as { code?: string }).code;
    if (code === "23505") return NextResponse.json({ error: "E-mail ou nome de usuário já cadastrado." }, { status: 409 });
    return NextResponse.json({ error: "Falha ao criar a conta." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID da conta não fornecido." }, { status: 400 });
  try {
    const body = await request.json().catch(() => ({})) as { password?: string };
    if (!body.password) return NextResponse.json({ error: "Digite sua senha de administrador para excluir a conta." }, { status: 400 });
    const admin = await getCurrentUser();
    if (!admin) return NextResponse.json({ error: "Sessão administrativa expirada." }, { status: 401 });
    const adminResult = await getDb().query<{ password_hash: string }>("SELECT password_hash FROM rp_users WHERE id = $1 AND active = true", [admin.id]);
    const validPassword = await verifyPasswordHash(body.password, adminResult.rows[0]?.password_hash || "");
    if (!validPassword) return NextResponse.json({ error: "Senha de administrador incorreta." }, { status: 403 });
    if (id === admin.id) return NextResponse.json({ error: "Você não pode excluir a própria conta." }, { status: 400 });
    await getDb().query("DELETE FROM rp_users WHERE id = $1", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    return NextResponse.json({ error: "Falha ao remover a conta." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await request.json() as { id?: string; username?: string; email?: string; role?: string; active?: boolean; password?: string; banned?: boolean; bannedUntil?: string | null; banReason?: string };
    const id = body.id?.trim();
    const username = body.username?.trim().toLowerCase();
    const email = body.email?.trim().toLowerCase();
    const role = (body.role || "USER").trim().toUpperCase();
    const allowed = new Set(["USER", "ADMIN", "MODERATOR", "DEVELOPER", "TRANSLATOR"]);
    if (!id || !username || !email || !allowed.has(role)) return NextResponse.json({ error: "Dados de perfil inválidos." }, { status: 400 });
    if (body.password?.trim() && body.password.trim().length < 12) {
      return NextResponse.json({ error: "A nova senha deve ter pelo menos 12 caracteres." }, { status: 400 });
    }

    const client = await getDb().connect();
    try {
      await client.query("BEGIN");
      const passwordHash = body.password?.trim() ? await hashPassword(body.password.trim()) : null;
      const updated = await client.query(
        `UPDATE rp_users SET username = $2, email = $3, active = $4, password_hash = COALESCE($5, password_hash), banned = $6, banned_until = $7, ban_reason = $8, updated_at = now()
          WHERE id = $1 RETURNING id, username, email, active, created_at`,
        [id, username, email, body.active !== false, passwordHash, body.banned === true, body.banned === true ? (body.bannedUntil || null) : null, body.banned === true ? (body.banReason?.trim() || null) : null]
      );
      if (!updated.rows[0]) { await client.query("ROLLBACK"); return NextResponse.json({ error: "Conta não encontrada." }, { status: 404 }); }
      await client.query("DELETE FROM rp_user_roles WHERE user_id = $1 AND role NOT IN ('USER','VIP')", [id]);
      await client.query("INSERT INTO rp_user_roles (user_id, role) VALUES ($1, 'USER') ON CONFLICT DO NOTHING", [id]);
      if (role !== "USER") await client.query("INSERT INTO rp_user_roles (user_id, role) VALUES ($1, $2)", [id, role]);
      await client.query("COMMIT");
      return NextResponse.json({ user: updated.rows[0], success: true });
    } catch (error) { await client.query("ROLLBACK").catch(() => undefined); throw error; }
    finally { client.release(); }
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    const code = (error as { code?: string }).code;
    if (code === "23505") return NextResponse.json({ error: "E-mail ou nome de usuário já cadastrado." }, { status: 409 });
    return NextResponse.json({ error: "Falha ao atualizar o perfil." }, { status: 500 });
  }
}
