import { getCurrentUser } from "@/lib/auth";
import { evaluateRouteAccess } from "@/lib/permissions";
import { redirect } from "next/navigation";

export const instant = false;

export default async function UsuariosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const access = evaluateRouteAccess(user, "/dashboard/usuarios");
  if (!access.allowed && access.redirectUrl) {
    redirect(access.redirectUrl);
  }
  return <>{children}</>;
}
