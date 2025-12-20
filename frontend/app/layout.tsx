import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Fuente por defecto de Next.js
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// AQUÍ ES DONDE SE CAMBIA EL TÍTULO Y EL ICONO
export const metadata: Metadata = {
  title: "Dani Flamingo | World Walker",
  description: "Photography Portfolio exploring 50+ countries. Captured by Dani Flamingo.",
  icons: {
    icon: "/logo.jpeg", // Usamos tu logo como favicon directamente
    shortcut: "/logo.jpeg",
    apple: "/logo.jpeg", // Para cuando alguien guarde la web en su iPhone
  },
  openGraph: {
    title: "Dani Flamingo Photography",
    description: "Exploring the world, one frame at a time.",
    images: ["/logo.jpeg"], // Imagen que sale al compartir en WhatsApp/Twitter
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