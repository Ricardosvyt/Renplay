import { getCurrentUser } from "@/lib/auth";
import { evaluateRouteAccess } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const instant = false;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const access = evaluateRouteAccess(user, "/dashboard");
  if (!access.allowed && access.redirectUrl) {
    redirect(access.redirectUrl);
  }
  return <DashboardShell userName={user?.displayName || user?.username || "Administrador"}>{children}</DashboardShell>;
}
