import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

let pool: Pool | null = null;
function getPool() {
  if (!pool && process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

// GET /api/users - Listar usuários com filtros e etapas de verificação
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = (searchParams.get("q") || "").toLowerCase().trim();
  const role = (searchParams.get("role") || "all").toLowerCase().trim();
  const verifiedOnly = searchParams.get("verified") === "true";

  try {
    const p = getPool();
    if (!p) {
      return NextResponse.json({ error: "Banco de dados não configurado." }, { status: 500 });
    }

    let query = `
      SELECT id, username, email, role, status, 
             verification_level, email_verified, identity_verified, two_factor_verified,
             created_at, updated_at
      FROM rp_users
      WHERE 1=1
    `;
    const values: (string | number)[] = [];

    if (role && role !== "all") {
      values.push(role);
      query += ` AND LOWER(role) = $${values.length}`;
    }

    if (verifiedOnly) {
      query += ` AND verification_level = 3`;
    }

    if (q) {
      values.push(`%${q}%`);
      query += ` AND (LOWER(username) LIKE $${values.length} OR LOWER(email) LIKE $${values.length})`;
    }

    query += ` ORDER BY verification_level DESC, created_at ASC`;

    const res = await p.query(query, values);
    return NextResponse.json({ users: res.rows });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json({ error: "Falha ao consultar usuários no banco." }, { status: 500 });
  }
}

// POST /api/users - Criar novo usuário com senha criptografada e verificação inicial
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, role = "usuario", verification_level = 1 } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Nome de usuário, e-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    const p = getPool();
    if (!p) {
      return NextResponse.json({ error: "Banco de dados não conectado." }, { status: 500 });
    }

    // Hash da senha com bcrypt
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const level = Number(verification_level) || 1;
    const emailVerified = level >= 1;
    const identityVerified = level >= 2;
    const twoFactorVerified = level >= 3;

    const insertQuery = `
      INSERT INTO rp_users (username, email, password_hash, role, status, verification_level, email_verified, identity_verified, two_factor_verified)
      VALUES ($1, $2, $3, $4, 'ACTIVE', $5, $6, $7, $8)
      RETURNING id, username, email, role, status, verification_level, email_verified, identity_verified, two_factor_verified, created_at;
    `;

    const res = await p.query(insertQuery, [
      username.trim(),
      email.trim().toLowerCase(),
      passwordHash,
      role.toLowerCase(),
      level,
      emailVerified,
      identityVerified,
      twoFactorVerified,
    ]);

    return NextResponse.json({ user: res.rows[0], success: true }, { status: 201 });
  } catch (error: unknown) {
    console.error("Erro ao cadastrar usuário:", error);
    const err = error as { code?: string };
    if (err.code === "23505") {
      return NextResponse.json({ error: "E-mail ou nome de usuário já cadastrado." }, { status: 409 });
    }
    return NextResponse.json({ error: "Falha ao inserir usuário no banco." }, { status: 500 });
  }
}

// PATCH /api/users - Atualizar ficha/dados do usuário e etapas de verificação
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      username,
      email,
      role,
      status,
      password,
      verification_level,
      email_verified,
      identity_verified,
      two_factor_verified,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID do usuário não fornecido." }, { status: 400 });
    }

    const p = getPool();
    if (!p) {
      return NextResponse.json({ error: "Banco de dados não conectado." }, { status: 500 });
    }

    // Calcula o nível com base nas 3 etapas se fornecido individualmente
    let calculatedLevel = verification_level;
    if (calculatedLevel === undefined && (email_verified !== undefined || identity_verified !== undefined || two_factor_verified !== undefined)) {
      calculatedLevel = (email_verified ? 1 : 0) + (identity_verified ? 1 : 0) + (two_factor_verified ? 1 : 0);
    }

    let passwordHash: string | null = null;
    if (password && typeof password === "string" && password.trim().length >= 6) {
      passwordHash = bcrypt.hashSync(password.trim(), 10);
    }

    const updateQuery = `
      UPDATE rp_users
      SET username = COALESCE($2, username),
          email = COALESCE($3, email),
          role = COALESCE($4, role),
          status = COALESCE($5, status),
          password_hash = COALESCE($6, password_hash),
          verification_level = COALESCE($7, verification_level),
          email_verified = COALESCE($8, email_verified),
          identity_verified = COALESCE($9, identity_verified),
          two_factor_verified = COALESCE($10, two_factor_verified),
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, username, email, role, status, verification_level, email_verified, identity_verified, two_factor_verified, created_at, updated_at;
    `;

    const res = await p.query(updateQuery, [
      id,
      username?.trim() || null,
      email?.trim() || null,
      role?.trim()?.toLowerCase() || null,
      status?.trim() || null,
      passwordHash,
      calculatedLevel !== undefined ? calculatedLevel : null,
      email_verified !== undefined ? email_verified : null,
      identity_verified !== undefined ? identity_verified : null,
      two_factor_verified !== undefined ? two_factor_verified : null,
    ]);

    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ user: res.rows[0], success: true });
  } catch (error: unknown) {
    console.error("Erro ao atualizar usuário:", error);
    const err = error as { code?: string };
    if (err.code === "23505") {
      return NextResponse.json({ error: "E-mail ou nome de usuário já em uso por outra conta." }, { status: 409 });
    }
    return NextResponse.json({ error: "Falha ao atualizar dados do usuário." }, { status: 500 });
  }
}

// DELETE /api/users - Excluir usuário pelo ID
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID do usuário não fornecido." }, { status: 400 });
    }

    const p = getPool();
    if (!p) {
      return NextResponse.json({ error: "Banco de dados não conectado." }, { status: 500 });
    }

    await p.query("DELETE FROM rp_users WHERE id = $1", [id]);
    return NextResponse.json({ success: true, message: "Usuário excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    return NextResponse.json({ error: "Falha ao remover usuário." }, { status: 500 });
  }
}
