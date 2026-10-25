import { getCurrentUser } from "@/lib/auth";
import { evaluateRouteAccess } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function SavesLayout({ children }: { children: React.ReactNode }) {
  const access = evaluateRouteAccess(await getCurrentUser(), "/dashboard/saves");
  if (!access.allowed && access.redirectUrl) redirect(access.redirectUrl);
  return <>{children}</>;
}
