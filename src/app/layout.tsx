import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { AdTrackingScripts } from "@/components/AdTrackingScripts";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });

export const metadata: Metadata = {
  title: "Vero — Profissionais verificados. Progresso que se vê.",
  description:
    "Marketplace de terapeutas, psicólogos, coaches e consultores com vetting de credenciais, avaliações públicas e progresso visual acompanhado no seu painel.",
  // Pré-lançamento: o site está no ar pra revisão interna, mas ainda não
  // é pra aparecer em buscadores. Remover quando decidirem lançar de
  // verdade (ver robots.ts também).
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`h-full antialiased ${inter.variable} ${fraunces.variable}`}
    >
      <body className="min-h-full flex flex-col bg-paper font-sans text-ink">
        <AdTrackingScripts />
        {children}
      </body>
    </html>
  );
}
