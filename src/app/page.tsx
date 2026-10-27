"use client";
import { useState, useEffect } from "react";
import type { LauncherInfo } from "@/types/game";
import { RenPlayLanding } from "@/components/home/RenPlayLanding";
export default function HomePage() {
  const [launcherInfo, setLauncherInfo] = useState<LauncherInfo>({ version: "", channel: "stable", downloadUrl: null, notes: "" });
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/launcher", { signal: controller.signal })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data && typeof data === "object") setLauncherInfo(data); })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  return <RenPlayLanding launcherInfo={launcherInfo}/>;
}
