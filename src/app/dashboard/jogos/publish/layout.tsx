import { getCurrentUser } from "@/lib/auth";
import { evaluateRouteAccess } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function PublishLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const access = evaluateRouteAccess(user, "/dashboard/jogos/publish");
  if (!access.allowed && access.redirectUrl) {
    redirect(access.redirectUrl);
  }
  return <>{children}</>;
}
