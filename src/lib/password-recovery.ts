import crypto from "node:crypto";
import { getDb } from "@/lib/db";
import { hashToken, hashPassword } from "@/lib/auth";
import { validateEmailFormat, validatePasswordFormat, checkPwnedPassword } from "@/lib/registration";
import { Resend } from "resend";

const CODE_EXPIRY_MINUTES = 10;
const RESET_TOKEN_EXPIRY_MINUTES = 15;
const MAX_FAILED_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

// Type for injected/mocked email sender (for tests)
type EmailSender = (params: { to: string; code: string }) => Promise<{ success: boolean; error?: string }>;
let mockEmailSender: EmailSender | null = null;

export function setMockEmailSender(sender: EmailSender | null) {
  mockEmailSender = sender;
}

export function getHmacSecret(): string {
  return process.env.PASSWORD_RESET_HMAC_SECRET || process.env.AUTH_ENCRYPTION_KEY || "renplay-password-reset-secret-fallback-key";
}

export function computeCodeHmac(userId: string, code: string): string {
  const secret = getHmacSecret();
  return crypto.createHmac("sha256", secret).update(`${userId}:${code}`).digest("hex");
}

export function generateRecoveryCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export async function checkRateLimit(key: string, limit: number, windowMinutes: number): Promise<boolean> {
  const db = getDb();
  const result = await db.query<{ hits: number }>(
    `INSERT INTO rp_limits (key, hits, resets_at)
     VALUES ($1, 1, now() + ($2 || ' minutes')::interval)
     ON CONFLICT (key) DO UPDATE SET
       hits = CASE WHEN rp_limits.resets_at <= now() THEN 1 ELSE rp_limits.hits + 1 END,
       resets_at = CASE WHEN rp_limits.resets_at <= now() THEN now() + ($2 || ' minutes')::interval ELSE rp_limits.resets_at END
     RETURNING hits`,
    [key, windowMinutes.toString()]
  );
  return result.rows[0].hits <= limit;
}

export function buildRecoveryEmailHtml(code: string, email: string = ""): string {
  const recoveryUrl = `https://renplay.site/recuperar?code=${code}${email ? `&email=${encodeURIComponent(email)}` : ""}`;
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RenPlay — Recuperação de Conta</title>
  <style>
    @media only screen and (max-width: 600px) {
      .email-card {
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 16px !important;
      }
      .email-padding {
        padding: 28px 20px !important;
      }
      .code-display {
        font-size: 34px !important;
        letter-spacing: 7px !important;
        padding-left: 7px !important;
      }
      .btn-launcher {
        display: block !important;
        width: 100% !important;
        padding: 14px 16px !important;
        box-sizing: border-box !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #07080B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #07080B; padding: 40px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Card -->
        <table role="presentation" class="email-card" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #11131C; border-radius: 20px; border: 1px solid #202434; overflow: hidden; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);">
          <!-- Top Gold Accent Bar -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #FFE54D 0%, #FFDE00 50%, #D4A000 100%);"></td>
          </tr>

          <!-- Header & Content -->
          <tr>
            <td class="email-padding" style="padding: 36px 36px 30px 36px; text-align: center;">
              <!-- Official Logo -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <a href="https://renplay.site" style="text-decoration: none; display: inline-block;">
                      <img src="https://renplay.site/Logo.png" alt="RenPlay" width="180" style="display: block; width: 180px; max-width: 100%; height: auto; border: 0; outline: none; margin: 0 auto;" />
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Title & Message -->
              <h1 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px; line-height: 32px;">
                Recuperar sua conta
              </h1>
              <p style="margin: 0 auto; max-width: 420px; font-size: 14px; color: #94A3B8; line-height: 22px;">
                Recebemos uma solicitação para redefinir a senha da sua conta RenPlay. Você pode abrir direto no launcher ou usar o código manual:
              </p>

              <!-- CTA Button to open launcher directly -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0 14px 0;">
                <tr>
                  <td align="center">
                    <a class="btn-launcher" href="${recoveryUrl}" target="_blank" style="display: inline-block; background: linear-gradient(180deg, #FFE54D 0%, #FFDE00 50%, #D4A000 100%); color: #080A0F; font-size: 13px; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 12px; letter-spacing: 0.5px; text-transform: uppercase; box-shadow: 0 4px 18px rgba(255, 222, 0, 0.35);">
                      Abrir no RenPlay Launcher
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 16px 0 8px 0; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 1.5px;">
                Ou digite o código de 6 dígitos:
              </p>

              <!-- Code Box -->
              <div style="background: linear-gradient(180deg, #0A0C14 0%, #07080D 100%); border: 1.5px solid #FFDE00; border-radius: 16px; padding: 18px 16px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 222, 0, 0.1);">
                <div style="display: inline-block; background-color: rgba(255, 222, 0, 0.12); border: 1px solid rgba(255, 222, 0, 0.4); border-radius: 20px; padding: 3px 12px; margin-bottom: 8px;">
                  <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.8px; color: #FFDE00;">CÓDIGO DE RECUPERAÇÃO</span>
                </div>
                <div class="code-display" style="font-size: 40px; font-weight: 900; letter-spacing: 10px; color: #FFFFFF; font-family: 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace; padding-left: 10px; text-shadow: 0 0 18px rgba(255, 222, 0, 0.4);">
                  ${code}
                </div>
              </div>

              <!-- Expiration & Security Advice -->
              <div style="margin-top: 20px; padding: 14px 16px; background-color: rgba(255, 222, 0, 0.04); border: 1px solid rgba(255, 222, 0, 0.15); border-radius: 12px; text-align: left;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="font-size: 13px; font-weight: 700; color: #FFDE00; line-height: 18px;">
                      ⏱ Este código expira em 10 minutos.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 4px; font-size: 12px; color: #94A3B8; line-height: 18px;">
                      Se você não solicitou esta alteração, sua conta permanece segura e você pode ignorar esta mensagem com tranquilidade.
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0A0C13; border-top: 1px solid #1C1F2C; padding: 22px 32px; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700; color: #E2E8F0;">Equipe RenPlay</p>
              <a href="https://renplay.site" style="font-size: 12px; color: #FFDE00; text-decoration: none; font-weight: 700; letter-spacing: 0.5px;">renplay.site</a>
              <p style="margin: 10px 0 0 0; font-size: 11px; color: #64748B; line-height: 16px;">
                Este é um e-mail automático de segurança. Por favor, não responda.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
</body>
</html>`;
}

export function buildRecoveryEmailText(code: string, email: string = ""): string {
  const recoveryUrl = `https://renplay.site/recuperar?code=${code}${email ? `&email=${encodeURIComponent(email)}` : ""}`;
  return `Olá!

Recebemos uma solicitação para redefinir a senha da sua conta RenPlay.

Para abrir diretamente no RenPlay Launcher e preencher automaticamente o seu código, acesse:
${recoveryUrl}

Ou use o código de recuperação manual:
${code}

Este código expira em 10 minutos.

Se você não solicitou esta alteração, sua conta permanece segura e você pode ignorar este e-mail.

Equipe RenPlay
https://renplay.site/`;
}

export async function sendRecoveryEmail(to: string, code: string): Promise<{ success: boolean; error?: string }> {
  // If mock sender provided or running in test mode with mock active
  if (mockEmailSender) {
    return mockEmailSender({ to, code });
  }

  // Prevent sending real emails during test or build unless explicitly configured
  if (process.env.NODE_ENV === "test" && !process.env.FORCE_RESEND_IN_TEST) {
    return { success: true };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY não configurada.");
    return { success: false, error: "Serviço de envio de e-mails não configurado." };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "RenPlay <seguranca@renplay.site>";

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject: "RenPlay — Seu código de recuperação",
      html: buildRecoveryEmailHtml(code, to),
      text: buildRecoveryEmailText(code, to),
    });

    if (error) {
      console.error("Erro na API do Resend:", error.name, error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Falha inesperada ao enviar e-mail com Resend:", err?.message || err);
    return { success: false, error: "Falha na comunicação com o serviço de e-mail." };
  }
}

/**
 * Solicitação de recuperação (Etapa 1 e 2).
 * Proteção contra enumeração: responde sempre a mesma mensagem genérica se a conta não existir.
 */
export async function requestPasswordReset(
  request: Request,
  rawEmail: unknown
): Promise<{ success: boolean; message: string; cooldownRemaining?: number }> {
  const genericMessage = "Se existir uma conta associada a este e-mail, enviaremos um código de recuperação.";

  const emailCheck = validateEmailFormat(rawEmail);
  if (!emailCheck.valid) {
    return { success: false, message: emailCheck.error || "Informe um endereço de e-mail válido." };
  }
  const email = emailCheck.email!;

  // Extrair IP para proteção contra abuso global
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";

  // Rate limit por IP: máx 8 solicitações a cada 15 min
  const ipAllowed = await checkRateLimit(`pwd_reset_ip:${ip}`, 8, 15);
  if (!ipAllowed) {
    return {
      success: false,
      message: "Muitas tentativas de recuperação deste dispositivo. Aguarde um pouco.",
    };
  }

  const db = getDb();

  // Localizar usuário de forma segura
  const userResult = await db.query<{ id: string; active: boolean; banned: boolean }>(
    `SELECT id, active, banned FROM rp_users WHERE email = $1 LIMIT 1`,
    [email]
  );

  const user = userResult.rows[0];

  // Se o usuário não existir ou estiver banido/inativo:
  // Executa uma espera proporcional para evitar timing attack de enumeração
  if (!user || !user.active || user.banned) {
    await new Promise((resolve) => setTimeout(resolve, 80 + Math.floor(Math.random() * 40)));
    return { success: true, message: genericMessage };
  }

  // Verificar intervalo mínimo de 60 segundos entre reenvios para este usuário
  const recentRequest = await db.query<{ created_at: Date }>(
    `SELECT created_at FROM rp_password_resets
     WHERE user_id = $1 AND status IN ('PENDING', 'VERIFIED')
       AND created_at > (now() - interval '60 seconds')
     ORDER BY created_at DESC LIMIT 1`,
    [user.id]
  );

  if (recentRequest.rows.length > 0) {
    return {
      success: false,
      message: "Aguarde antes de solicitar um novo código.",
    };
  }

  // Rate limit por conta: máx 4 códigos a cada 15 min
  const userAllowed = await checkRateLimit(`pwd_reset_usr:${user.id}`, 4, 15);
  if (!userAllowed) {
    return {
      success: false,
      message: "Limite de solicitações para esta conta atingido. Aguarde alguns minutos.",
    };
  }

  // Gerar código de 6 dígitos seguro
  const code = generateRecoveryCode();
  const codeHmac = computeCodeHmac(user.id, code);
  const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

  // Iniciar transação no banco
  const client = await db.connect();
  let requestId: string;
  try {
    await client.query("BEGIN");

    // Invalidar solicitações anteriores
    await client.query(
      `UPDATE rp_password_resets
       SET status = 'REVOKED'
       WHERE user_id = $1 AND status IN ('PENDING', 'VERIFIED')`,
      [user.id]
    );

    // Inserir nova solicitação com HMAC protegido do código
    const insertResult = await client.query<{ id: string }>(
      `INSERT INTO rp_password_resets (user_id, code_hmac, expires_at, max_attempts, status)
       VALUES ($1, $2, $3, $4, 'PENDING')
       RETURNING id`,
      [user.id, codeHmac, expiresAt, MAX_FAILED_ATTEMPTS]
    );
    requestId = insertResult.rows[0].id;

    // Enviar código via Resend
    const sendResult = await sendRecoveryEmail(email, code);
    if (!sendResult.success) {
      // Reverter transação para não deixar código utilizável
      await client.query("ROLLBACK");
      return {
        success: false,
        message: "Não foi possível enviar o e-mail de recuperação. Tente novamente mais tarde.",
      };
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    console.error("Erro ao registrar recuperação de senha:", error);
    return {
      success: false,
      message: "Não foi possível concluir a solicitação. Tente novamente.",
    };
  } finally {
    client.release();
  }

  return { success: true, message: genericMessage };
}

/**
 * Validação do código de 6 dígitos (Etapa 4).
 * Emite uma autorização temporária de uso único (`resetToken`).
 */
export async function verifyRecoveryCode(
  rawEmail: unknown,
  rawCode: unknown
): Promise<{ success: boolean; resetToken?: string; message: string }> {
  if (typeof rawCode !== "string" || !/^\d{6}$/.test(rawCode.trim())) {
    return { success: false, message: "Informe o código de 6 dígitos." };
  }
  const code = rawCode.trim();

  const emailCheck = validateEmailFormat(rawEmail);
  if (!emailCheck.valid) {
    return { success: false, message: "Informe um endereço de e-mail válido." };
  }
  const email = emailCheck.email!;

  const db = getDb();
  const userResult = await db.query<{ id: string }>(
    `SELECT id FROM rp_users WHERE email = $1 LIMIT 1`,
    [email]
  );
  const user = userResult.rows[0];
  if (!user) {
    return { success: false, message: "Código inválido ou expirado." };
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Buscar a solicitação pendente mais recente com lock FOR UPDATE para atomicidade
    const requestResult = await client.query<{
      id: string;
      code_hmac: string;
      attempts_count: number;
      max_attempts: number;
      expires_at: Date;
      status: string;
    }>(
      `SELECT id, code_hmac, attempts_count, max_attempts, expires_at, status
       FROM rp_password_resets
       WHERE user_id = $1 AND status = 'PENDING'
       ORDER BY created_at DESC
       LIMIT 1
       FOR UPDATE`,
      [user.id]
    );

    const resetReq = requestResult.rows[0];
    if (!resetReq) {
      await client.query("COMMIT");
      return { success: false, message: "Código inválido ou expirado." };
    }

    // Verificar se expirou
    if (new Date() > new Date(resetReq.expires_at)) {
      await client.query(
        `UPDATE rp_password_resets SET status = 'EXPIRED' WHERE id = $1`,
        [resetReq.id]
      );
      await client.query("COMMIT");
      return { success: false, message: "Código inválido ou expirado." };
    }

    // Verificar se excedeu o número de tentativas
    if (resetReq.attempts_count >= resetReq.max_attempts) {
      await client.query(
        `UPDATE rp_password_resets SET status = 'REVOKED' WHERE id = $1`,
        [resetReq.id]
      );
      await client.query("COMMIT");
      return {
        success: false,
        message: "Você excedeu o número de tentativas. Solicite outro código.",
      };
    }

    // Comparar HMAC em tempo constante
    const expectedHmac = resetReq.code_hmac;
    const actualHmac = computeCodeHmac(user.id, code);

    const valid =
      expectedHmac.length === actualHmac.length &&
      crypto.timingSafeEqual(Buffer.from(expectedHmac, "hex"), Buffer.from(actualHmac, "hex"));

    if (!valid) {
      const newAttempts = resetReq.attempts_count + 1;
      const isRevoked = newAttempts >= resetReq.max_attempts;

      await client.query(
        `UPDATE rp_password_resets
         SET attempts_count = $1, status = CASE WHEN $2 = true THEN 'REVOKED' ELSE status END
         WHERE id = $3`,
        [newAttempts, isRevoked, resetReq.id]
      );

      await client.query("COMMIT");

      if (isRevoked) {
        return {
          success: false,
          message: "Você excedeu o número de tentativas. Solicite outro código.",
        };
      }
      return { success: false, message: "Código inválido ou expirado." };
    }

    // Código válido! Gerar token temporário de redefinição de uso único
    const rawResetToken = crypto.randomBytes(32).toString("base64url");
    const tokenHash = hashToken(rawResetToken);
    const tokenExpiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);

    await client.query(
      `UPDATE rp_password_resets
       SET status = 'VERIFIED',
           reset_token_hash = $1,
           reset_token_expires_at = $2
       WHERE id = $3`,
      [tokenHash, tokenExpiresAt, resetReq.id]
    );

    await client.query("COMMIT");

    return {
      success: true,
      resetToken: rawResetToken,
      message: "Código verificado com sucesso.",
    };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    console.error("Erro ao verificar código de recuperação:", error);
    return {
      success: false,
      message: "Não foi possível concluir a verificação. Tente novamente.",
    };
  } finally {
    client.release();
  }
}

/**
 * Definição da nova senha (Etapa 6).
 * Valida o token temporário emitido na verificação, aplica validações de senha,
 * gera hash Argon2id, revoga todas as sessões e consome a autorização.
 */
export async function executePasswordReset(
  rawResetToken: unknown,
  rawPassword: unknown,
  rawConfirmPassword?: unknown
): Promise<{ success: boolean; message: string }> {
  if (typeof rawResetToken !== "string" || rawResetToken.length < 32 || rawResetToken.length > 128) {
    return {
      success: false,
      message: "Autorização de redefinição inválida ou expirada. Inicie uma nova recuperação.",
    };
  }
  const resetToken = rawResetToken.trim();

  // Validar requisitos de senha
  const passCheck = validatePasswordFormat(rawPassword, {
    confirmPassword: rawConfirmPassword,
    checkConfirm: true,
  });
  if (!passCheck.valid) {
    return { success: false, message: passCheck.error || "Senha inválida." };
  }
  const password = rawPassword as string;

  // Verificação HIBP de senhas vazadas
  const pwnedCheck = await checkPwnedPassword(password);
  if (pwnedCheck.pwned) {
    return {
      success: false,
      message: "Esta senha apareceu em vazamentos de dados conhecidos. Escolha outra mais segura.",
    };
  }

  const tokenHash = hashToken(resetToken);
  const db = getDb();
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Localizar a solicitação verificada com lock FOR UPDATE
    const reqResult = await client.query<{
      id: string;
      user_id: string;
      reset_token_expires_at: Date;
      status: string;
    }>(
      `SELECT id, user_id, reset_token_expires_at, status
       FROM rp_password_resets
       WHERE reset_token_hash = $1 AND status = 'VERIFIED'
       LIMIT 1
       FOR UPDATE`,
      [tokenHash]
    );

    const resetReq = reqResult.rows[0];
    if (!resetReq) {
      await client.query("ROLLBACK");
      return {
        success: false,
        message: "Autorização de redefinição inválida ou expirada. Inicie uma nova recuperação.",
      };
    }

    if (new Date() > new Date(resetReq.reset_token_expires_at)) {
      await client.query(
        `UPDATE rp_password_resets SET status = 'EXPIRED' WHERE id = $1`,
        [resetReq.id]
      );
      await client.query("COMMIT");
      return {
        success: false,
        message: "Autorização de redefinição expirada. Inicie uma nova recuperação.",
      };
    }

    // Gerar novo hash Argon2id
    const newPasswordHash = await hashPassword(password);

    // 1. Atualizar a senha do usuário
    await client.query(
      `UPDATE rp_users
       SET password_hash = $1, updated_at = now()
       WHERE id = $2`,
      [newPasswordHash, resetReq.user_id]
    );

    // 2. Consumir definitivamente a autorização
    await client.query(
      `UPDATE rp_password_resets
       SET status = 'CONSUMED', consumed_at = now(), reset_token_hash = NULL
       WHERE id = $1`,
      [resetReq.id]
    );

    // 3. Revogar TODAS as sessões web e desktop ativas do usuário
    await client.query(
      `UPDATE rp_sessions
       SET revoked_at = now()
       WHERE user_id = $1 AND revoked_at IS NULL`,
      [resetReq.user_id]
    );

    // 4. Invalidar quaisquer outros códigos de recuperação do usuário
    await client.query(
      `UPDATE rp_password_resets
       SET status = 'REVOKED'
       WHERE user_id = $1 AND id != $2 AND status IN ('PENDING', 'VERIFIED')`,
      [resetReq.user_id, resetReq.id]
    );

    await client.query("COMMIT");

    return {
      success: true,
      message: "Senha redefinida com sucesso. Faça login com sua nova senha.",
    };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    console.error("Erro ao redefinir senha:", error);
    return {
      success: false,
      message: "Não foi possível concluir a alteração de senha. Tente novamente.",
    };
  } finally {
    client.release();
  }
}
