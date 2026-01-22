import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Fuente por defecto de Next.js
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dani Flamingo | World Walker",
  description: "Photography Portfolio exploring 50+ countries. Captured by Dani Flamingo.",
  keywords: ["fotografía", "travel photography", "portfolio", "visual director", "dani flamingo", "world walker"], // Palabras clave para SEO
  
  // Iconos de la web
  icons: {
    icon: "/logo.jpeg",
    shortcut: "/logo.jpeg",
    apple: "/logo.jpeg",
  },

  // Cómo se ve al compartir en redes sociales
  openGraph: {
    title: "Dani Flamingo Photography",
    description: "Exploring the world, one frame at a time.",
    images: ["/logo.jpeg"],
    url: "https://daniflamingo.vercel.app",
    siteName: "Dani Flamingo Portfolio",
    type: "website",
  },

  // AQUÍ PEGAS EL CÓDIGO DE GOOGLE SEARCH CONSOLE
  verification: {
    google: "google-site-verification=QeDASJi_K-booKSx2hdK5q3UHVnF1D_0xgT2s03A6N0",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}