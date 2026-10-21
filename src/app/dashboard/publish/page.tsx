import { redirect } from "next/navigation";

export default function LegacyPublishRedirect() {
  redirect("/dashboard/jogos/publish");
}
