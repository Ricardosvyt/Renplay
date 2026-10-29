import { getCurrentUser } from "@/lib/auth";
import { evaluateRouteAccess } from "@/lib/permissions";
import { redirect } from "next/navigation";

export const instant = false;

export default async function ConfiguracoesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const access = evaluateRouteAccess(user, "/dashboard/configuracoes");
  if (!access.allowed && access.redirectUrl) {
    redirect(access.redirectUrl);
  }
  return <>{children}</>;
}
