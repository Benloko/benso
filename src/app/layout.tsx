import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BenSo - Plateforme sociale de storytelling & Marketplace d'histoires",
  description: "Découvrez, publiez et monétisez vos histoires en Afrique francophone. Récits gratuits, œuvres payantes par Mobile Money (MTN, Moov, Wave) et communauté.",
  keywords: ["BenSo", "Storytelling", "Bénin", "Afrique francophone", "Mobile Money", "Auteurs", "Réseau social", "Livres", "Romans"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#0B0914] text-gray-100 selection:bg-rose-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
