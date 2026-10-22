export class RegistrationInputError extends Error {}

export function validateRegistration(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new RegistrationInputError('Dados de cadastro inválidos.');
  const input = body as Record<string, unknown>;
  if (Object.keys(input).some(key => !['username', 'email', 'password', 'displayName'].includes(key))) throw new RegistrationInputError('O cadastro aceita apenas os dados de uma conta de membro.');
  if (typeof input.username !== 'string' || !/^[a-zA-Z0-9]{3,32}$/.test(input.username)) throw new RegistrationInputError('O usuário deve ter de 3 a 32 letras (A–Z) ou números, sem espaços ou símbolos.');
  if (typeof input.email !== 'string') throw new RegistrationInputError('Informe um e-mail válido.');
  const email = input.email.trim().toLowerCase();
  if (email.length > 254 || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/.test(email) || email.split('@')[0].length > 64 || email.startsWith('.') || email.includes('..') || email.includes('.@')) throw new RegistrationInputError('Informe um e-mail válido.');
  if (typeof input.password !== 'string' || Array.from(input.password).length < 15 || Buffer.byteLength(input.password, 'utf8') > 72 || input.password.includes('\0')) throw new RegistrationInputError('Use uma senha com pelo menos 15 caracteres e no máximo 72 bytes (acentos e emojis ocupam mais espaço).');
  if (input.displayName !== undefined && (typeof input.displayName !== 'string' || input.displayName.length > 80 || /[\u0000-\u001f\u007f]/.test(input.displayName))) throw new RegistrationInputError('O nome de exibição deve ter no máximo 80 caracteres, sem caracteres de controle.');
  return { username: input.username.toLowerCase(), email, password: input.password, displayName: (input.displayName as string | undefined)?.trim() || input.username.toLowerCase() };
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
