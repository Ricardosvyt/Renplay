import { getCurrentUser } from "@/lib/auth";
import { canManageAdvertising } from "@/lib/permissions";
import { redirect } from "next/navigation";
export const instant=false;
export default async function AdvertisingLayout({children}:{children:React.ReactNode}){const user=await getCurrentUser();if(!user)redirect("/login?next=%2Fdashboard%2Fpublicidade");if(!canManageAdvertising(user))redirect("/dashboard");return <>{children}</>;}
