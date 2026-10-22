import type { AuthUser } from "@/lib/auth";

export type Role = "USER" | "VIP" | "TRANSLATOR" | "MODERATOR" | "DEVELOPER" | "ADMIN";

export const STAFF_ROLES = ["ADMIN", "MODERATOR", "DEVELOPER", "TRANSLATOR"] as const;
export const ADMIN_ONLY_ROLES = ["ADMIN"] as const;
export const DEV_ROLES = ["ADMIN", "DEVELOPER"] as const;

export function hasAnyRole(user: AuthUser | null | undefined, roles: readonly string[]): boolean {
  if (!user || !user.active) return false;
  return user.roles.some((r) => roles.includes(r));
}

export function canAccessDashboard(user: AuthUser | null | undefined): boolean {
  return hasAnyRole(user, STAFF_ROLES);
}

export function canAccessDevPortal(user: AuthUser | null | undefined): boolean {
  return hasAnyRole(user, DEV_ROLES);
}

export function canManageUsers(user: AuthUser | null | undefined): boolean {
  return hasAnyRole(user, ADMIN_ONLY_ROLES);
}

export function canManageSettings(user: AuthUser | null | undefined): boolean {
  return hasAnyRole(user, ADMIN_ONLY_ROLES);
}

export function canManageGames(user: AuthUser | null | undefined): boolean {
  return hasAnyRole(user, DEV_ROLES);
}

export function evaluateRouteAccess(
  user: AuthUser | null | undefined,
  pathname: string
): { allowed: boolean; redirectUrl?: string; reason?: string } {
  if (!user) {
    return {
      allowed: false,
      redirectUrl: `/login?next=${encodeURIComponent(pathname)}`,
      reason: "UNAUTHENTICATED",
    };
  }

  // Admin user management: only ADMIN
  if (pathname === "/dashboard/usuarios" || pathname.startsWith("/dashboard/usuarios/")) {
    if (!canManageUsers(user)) {
      return { allowed: false, redirectUrl: "/dashboard", reason: "FORBIDDEN" };
    }
  }

  // Admin settings: only ADMIN
  if (pathname === "/dashboard/configuracoes" || pathname.startsWith("/dashboard/configuracoes/")) {
    if (!canManageSettings(user)) {
      return { allowed: false, redirectUrl: "/dashboard", reason: "FORBIDDEN" };
    }
  }

  // Dev portal: ADMIN or DEVELOPER
  if (pathname === "/dev" || pathname.startsWith("/dev/")) {
    if (!canAccessDevPortal(user)) {
      return { allowed: false, redirectUrl: "/dashboard", reason: "FORBIDDEN" };
    }
  }

  // Publishing games: ADMIN or DEVELOPER
  if (
    pathname === "/dashboard/publish" ||
    pathname.startsWith("/dashboard/publish/") ||
    pathname === "/dashboard/jogos/publish" ||
    pathname.startsWith("/dashboard/jogos/publish/")
  ) {
    if (!canManageGames(user)) {
      return { allowed: false, redirectUrl: "/dashboard", reason: "FORBIDDEN" };
    }
  }

  // General dashboard: any STAFF role (ADMIN, MODERATOR, DEVELOPER, TRANSLATOR)
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    if (!canAccessDashboard(user)) {
      // Regular users and VIPs are redirected to their member portal
      return { allowed: false, redirectUrl: "/portal", reason: "FORBIDDEN" };
    }
  }

  return { allowed: true };
}
