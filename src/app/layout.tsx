import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Renplay - Em Desenvolvimento",
  description: "Plataforma e Launcher de jogos Ren'Py com design épico e interativo.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
