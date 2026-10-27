import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CookieConsent } from "@/components/ui/CookieConsent";

export const viewport: Viewport = {
  themeColor: "#FFDE00",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.renplay.site"
  ),
  title: {
    default: "RenPlay — Sua próxima história começa aqui",
    template: "%s | RenPlay",
  },
  description:
    "Descubra visual novels e jogos Ren'Py, organize sua biblioteca e aproveite o launcher oficial para Windows, Linux, macOS e Android com sincronização de saves na nuvem.",
  applicationName: "RenPlay",
  keywords: [
    "RenPlay",
    "Ren'Py",
    "visual novel",
    "launcher",
    "jogos",
    "anime",
    "saves na nuvem",
    "download",
  ],
  authors: [{ name: "Equipe RenPlay" }],
  creator: "RenPlay",
  publisher: "RenPlay",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.renplay.site",
    siteName: "RenPlay",
    title: "RenPlay — Sua próxima história começa aqui",
    description:
      "Descubra visual novels e jogos Ren'Py, organize sua biblioteca e aproveite o launcher oficial para Windows, Linux, macOS e Android com sincronização de saves na nuvem.",
    images: [
      {
        url: "https://www.renplay.site/og-image.png",
        width: 1200,
        height: 630,
        alt: "RenPlay — Plataforma e Launcher Oficial de Visual Novels",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RenPlay — Sua próxima história começa aqui",
    description:
      "Descubra visual novels e jogos Ren'Py, organize sua biblioteca e aproveite o launcher oficial para Windows, Linux, macOS e Android com sincronização de saves na nuvem.",
    images: ["https://www.renplay.site/og-image.png"],
    creator: "@RenPlayApp",
  },
  icons: {
    icon: [
      { url: "/app-icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    apple: "/app-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#0c0d0f] text-[#f5f3ed]">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
