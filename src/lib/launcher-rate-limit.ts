import {
  checkAuthRateLimit,
  recordAuthSuccess,
  recordAuthFailure,
} from "@/lib/auth-rate-limit";
import { normalizeIdentifier } from "@/lib/auth";

/**
 * RENPLAY — Launcher Rate Limit Adapter
 * 
 * Bridges launcher desktop endpoints to the centralized PostgreSQL atomic rate limiter.
 * Fixes IP spoofing and eliminates single-identifier lockouts of legitimate users.
 */
export async function allowLauncherAuth(
  request: Request,
  action: string,
  identifier: string,
  _maximum?: number
): Promise<boolean> {
  const normalizedId = normalizeIdentifier(identifier);
  const result = await checkAuthRateLimit(request, action, normalizedId);
  return result.allowed;
}

export async function clearLauncherAuthRateLimit(
  request: Request,
  action: string,
  identifier: string
): Promise<void> {
  const normalizedId = normalizeIdentifier(identifier);
  await recordAuthSuccess(request, action, normalizedId);
}

export async function recordLauncherAuthFailure(
  request: Request,
  action: string,
  identifier: string
): Promise<void> {
  const normalizedId = normalizeIdentifier(identifier);
  await recordAuthFailure(request, action, normalizedId);
}
