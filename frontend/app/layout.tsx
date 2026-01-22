import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dani Flamingo | World Walker",
  description: "Photography Portfolio exploring 50+ countries. Captured by Dani Flamingo.",
  keywords: ["fotografía", "travel photography", "portfolio", "visual director", "dani flamingo", "world walker"],
  
  icons: {
    icon: "/logo.jpeg",
    shortcut: "/logo.jpeg",
    apple: "/logo.jpeg",
  },

  openGraph: {
    title: "Dani Flamingo Photography",
    description: "Exploring the world, one frame at a time.",
    images: ["/logo.jpeg"],
    url: "https://daniflamingo.vercel.app",
    siteName: "Dani Flamingo Portfolio",
    type: "website",
  },

  verification: {
    google: "lqbvZq_lq2tt5xnQa5xz5yveAxTUMIqSHgKky7T5xtc",
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