import validator from "validator";
import disposableDomains from "disposable-email-domains";
import { resolveMx } from "node:dns/promises";
import crypto from "node:crypto";
import zxcvbn from "zxcvbn";

export class RegistrationInputError extends Error {}

export const USERNAME_REGEX = /^[a-zA-Z0-9]{3,24}$/;
export const RESERVED_USERNAMES = new Set(['admin', 'renplay', 'support']);

function getDisposableList(): string[] {
  if (Array.isArray(disposableDomains)) return disposableDomains;
  if (disposableDomains && typeof disposableDomains === 'object') {
    const maybeDefault = (disposableDomains as { default?: unknown }).default;
    if (Array.isArray(maybeDefault)) return maybeDefault;
  }
  try {
    const mod = typeof require === 'function' ? require('disposable-email-domains') : null;
    if (Array.isArray(mod)) return mod;
    if (mod && Array.isArray(mod.default)) return mod.default;
  } catch {}
  return [];
}

export const BLOCKED_DOMAINS = new Set<string>([
  ...getDisposableList().map((d: string) => String(d).toLowerCase().trim()),
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.biz',
  'guerrillamail.org',
  'guerrillamailblock.com',
  '10minutemail.com',
  '10minutemail.net',
  '10minemail.com',
  'tempmail.com',
  'temp-mail.org',
  'temp-mail.io',
  'tempmailo.com',
  'throwawaymail.com',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'sharklasers.com',
  'dispostable.com',
  'getairmail.com',
  'maildrop.cc',
  'fakeinbox.com',
  'trashmail.com',
  'trashmail.net',
  'trashmail.me',
  'mohmal.com',
  'mohmal.im',
  'mohmal.in',
  '1secmail.com',
  '1secmail.org',
  '1secmail.net',
  'emailondeck.com',
  'generator.email',
  'inboxkitten.com',
  'nada.ltd',
  'getnada.com',
  'abyssmail.com',
  'boximail.com',
  'clrmail.com',
  'dropmail.me',
  'burnermail.io',
  'tmailor.com',
  'fexpost.com',
  'cevipsa.com',
  'greencafe24.com',
  'vintomaper.com',
  'wwjmp.com',
  'crazymailing.com',
  'mvrht.net',
  'bupcl.com',
  'grr.la',
  'pokemail.net',
  'spam4.me',
  'fakemailgenerator.com',
  'armyspy.com',
  'cuvox.de',
  'dayrep.com',
  'einrot.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'rhyta.com',
  'superrito.com',
  'teleworm.us',
  'tinypm.com',
  'mytemp.email',
  'tempr.email',
  'discard.email',
  'spambog.com',
  'tempail.com',
  'disposablemail.com',
  'incognitomail.org',
  'fakemail.net',
  'tempinbox.com',
  'mailcatch.com',
  'mintemail.com',
  'jetable.org',
]);

const DISPOSABLE_MX_HOSTS = [
  'mailinator.com',
  'guerrillamail.com',
  'temp-mail.org',
  'tempmail.com',
  '10minutemail.com',
  '1secmail.com',
  'trashmail.com',
  'yopmail.com',
  'sharklasers.com',
  'dispostable.com',
  'mohmal.com',
  'emailondeck.com',
  'crazymailing.com',
  'throwawaymail.com',
  'getairmail.com',
];

export function isDisposableDomain(domain: string): boolean {
  const norm = domain.trim().toLowerCase();
  if (BLOCKED_DOMAINS.has(norm)) return true;
  if (/temp[-_]?mail|dispos|fake[-_]?inbox|throwaway|trash[-_]?mail|10[-_]?minute|guerrilla|mohmal|1secmail|yopmail|mailinator/i.test(norm)) {
    return true;
  }
  const parts = norm.split('.');
  for (let i = 1; i < parts.length - 1; i++) {
    const parent = parts.slice(i).join('.');
    if (BLOCKED_DOMAINS.has(parent)) return true;
  }
  return false;
}

export function isDisposableMx(exchange: string): boolean {
  const host = exchange.trim().toLowerCase().replace(/\.$/, '');
  return DISPOSABLE_MX_HOSTS.some(p => host === p || host.endsWith('.' + p));
}

export function validateUsername(username: unknown): { error?: string; username?: string } {
  if (typeof username !== 'string' || username.length === 0) {
    return { error: 'Informe um nome de usuário.' };
  }
  if (/\s/.test(username)) {
    return { error: 'O nome de usuário não pode conter espaços.' };
  }
  if (username.trim().length === 0) {
    return { error: 'Informe um nome de usuário.' };
  }
  if (/[áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ]/i.test(username) || /[\u0300-\u036f]/.test(username.normalize('NFD'))) {
    return { error: 'Não utilize letras com acentos.' };
  }
  if (/[^a-zA-Z0-9]/.test(username)) {
    return { error: 'Use apenas letras e números.' };
  }
  if (username.length < 3) {
    return { error: 'O nome deve ter pelo menos 3 caracteres.' };
  }
  if (username.length > 24) {
    return { error: 'O nome pode ter no máximo 24 caracteres.' };
  }
  const normalized = username.toLowerCase();
  if (RESERVED_USERNAMES.has(normalized)) {
    return { error: 'Este nome de usuário não está disponível.' };
  }
  return { username: normalized };
}

export function validateEmailFormat(value: unknown): { valid: boolean; error?: string; email?: string; domain?: string } {
  if (value === undefined || value === null || (typeof value === 'string' && value.length === 0)) {
    return { valid: false, error: 'Informe seu endereço de e-mail.' };
  }
  if (typeof value !== 'string') {
    return { valid: false, error: 'Digite um endereço de e-mail válido.' };
  }
  if (/\s/.test(value)) {
    return { valid: false, error: 'O e-mail não pode conter espaços.' };
  }
  const email = value.trim().toLowerCase();
  if (!email) {
    return { valid: false, error: 'Informe seu endereço de e-mail.' };
  }
  if (email.length > 254) {
    return { valid: false, error: 'O endereço de e-mail é muito longo.' };
  }
  if (!email.includes('@')) {
    return { valid: false, error: 'O e-mail deve conter @.' };
  }
  const parts = email.split('@');
  if (parts.length !== 2 || !parts[1] || parts[1].length === 0) {
    return { valid: false, error: 'Informe um domínio de e-mail válido.' };
  }
  const [localPart, domain] = parts;
  if (localPart.length > 64) {
    return { valid: false, error: 'O endereço de e-mail é muito longo.' };
  }
  if (!domain.includes('.') || domain.startsWith('.') || domain.endsWith('.') || domain.length < 3) {
    return { valid: false, error: 'Informe um domínio de e-mail válido.' };
  }
  if (!validator.isEmail(email) || email.includes('..') || email.startsWith('.')) {
    return { valid: false, error: 'Digite um endereço de e-mail válido.' };
  }
  if (isDisposableDomain(domain)) {
    return { valid: false, error: 'E-mails temporários ou descartáveis não são permitidos.' };
  }
  return { valid: true, email, domain };
}

export async function validateEmail(value: unknown, options: { checkMx?: boolean } = {}): Promise<{ valid: boolean; error?: string; email?: string }> {
  const syncCheck = validateEmailFormat(value);
  if (!syncCheck.valid) {
    return { valid: false, error: syncCheck.error };
  }
  const { email, domain } = syncCheck;
  if (options.checkMx && process.env.NODE_ENV !== 'test') {
    try {
      const mx = await resolveMx(domain!);
      if (!mx.length || mx.every(record => record.exchange === '.')) {
        return { valid: false, error: 'O domínio deste e-mail não parece existir.' };
      }
      if (mx.some(record => isDisposableMx(record.exchange))) {
        return { valid: false, error: 'E-mails temporários ou descartáveis não são permitidos.' };
      }
    } catch (error: any) {
      if (['ENOTFOUND', 'ENODATA', 'SERVFAIL'].includes(error?.code)) {
        return { valid: false, error: 'O domínio deste e-mail não parece existir.' };
      }
      return { valid: false, error: 'Não foi possível validar o e-mail. Tente novamente.' };
    }
  }
  return { valid: true, email: email! };
}

export function validatePasswordFormat(
  password: unknown,
  options: {
    username?: string;
    confirmPassword?: unknown;
    checkConfirm?: boolean;
  } = {}
): { valid: boolean; error?: string } {
  if (password === undefined || password === null || (typeof password === 'string' && password.length === 0)) {
    return { valid: false, error: 'Crie uma senha para continuar.' };
  }
  if (typeof password !== 'string') {
    return { valid: false, error: 'Crie uma senha para continuar.' };
  }
  if (options.username && password.toLowerCase() === options.username.toLowerCase()) {
    return { valid: false, error: 'Escolha uma senha diferente do seu nome de usuário.' };
  }
  const charLength = Array.from(password).length;
  if (charLength < 12) {
    return { valid: false, error: 'Sua senha deve ter pelo menos 12 caracteres.' };
  }
  if (charLength > 128) {
    return { valid: false, error: 'Sua senha pode ter no máximo 128 caracteres.' };
  }
  const score = zxcvbn(password, options.username ? [options.username] : []).score;
  if (score <= 1) {
    return { valid: false, error: 'Esta senha é muito comum. Escolha uma mais segura.' };
  }
  if (options.checkConfirm) {
    if (options.confirmPassword === undefined || options.confirmPassword === null || (typeof options.confirmPassword === 'string' && options.confirmPassword.length === 0)) {
      return { valid: false, error: 'Confirme sua senha para continuar.' };
    }
    if (options.confirmPassword !== password) {
      return { valid: false, error: 'As senhas não coincidem.' };
    }
  }
  return { valid: true };
}

export async function checkPwnedPassword(password: string): Promise<{ pwned: boolean; error?: string }> {
  try {
    const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        'Add-Padding': 'true',
        'User-Agent': 'RenPlay-Auth/1.0',
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      return { pwned: false, error: 'Não foi possível verificar a segurança da senha. Tente novamente.' };
    }

    const text = await response.text();
    const lines = text.split(/\r?\n/);
    for (const line of lines) {
      const [hSuffix, countStr] = line.split(':');
      if (hSuffix && hSuffix.trim() === suffix) {
        const count = parseInt(countStr || '0', 10);
        if (count > 0) {
          return { pwned: true };
        }
      }
    }
    return { pwned: false };
  } catch {
    return { pwned: false, error: 'Não foi possível verificar a segurança da senha. Tente novamente.' };
  }
}

export function validateRegistration(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new RegistrationInputError('Dados de cadastro inválidos.');
  const input = body as Record<string, unknown>;
  if (Object.keys(input).some(key => !['username', 'email', 'password', 'confirmPassword', 'displayName', 'termsAccepted'].includes(key))) {
    throw new RegistrationInputError('O cadastro aceita apenas os dados de uma conta de membro.');
  }
  
  const userCheck = validateUsername(input.username);
  if (userCheck.error) throw new RegistrationInputError(userCheck.error);
  const username = userCheck.username!;

  const emailCheck = validateEmailFormat(input.email);
  if (!emailCheck.valid) throw new RegistrationInputError(emailCheck.error!);
  const email = emailCheck.email!;

  const passCheck = validatePasswordFormat(input.password, {
    username,
    confirmPassword: input.confirmPassword,
    checkConfirm: input.confirmPassword !== undefined,
  });
  if (!passCheck.valid) throw new RegistrationInputError(passCheck.error!);

  if (input.displayName !== undefined && (typeof input.displayName !== 'string' || input.displayName.length > 80 || /[\u0000-\u001f\u007f]/.test(input.displayName))) {
    throw new RegistrationInputError('O nome de exibição deve ter no máximo 80 caracteres, sem caracteres de controle.');
  }
  return { username, email, password: input.password as string, displayName: (input.displayName as string | undefined)?.trim() || username };
}

// Bound the actual stream, not only the attacker-controlled Content-Length header.
export async function readRegistrationBody(request: Request) {
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') throw new RegistrationInputError('Envie os dados no formato JSON.');
  const reader = request.body?.getReader();
  if (!reader) throw new RegistrationInputError('Dados de cadastro ausentes.');
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 4096) { await reader.cancel(); throw new RegistrationInputError('Dados de cadastro muito grandes.'); }
      chunks.push(value);
    }
    try { return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown; }
    catch { throw new RegistrationInputError('JSON de cadastro inválido.'); }
  } finally { reader.releaseLock(); }
}
