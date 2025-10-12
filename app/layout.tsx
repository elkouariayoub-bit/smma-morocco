import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SMMA Morocco",
  description: "Minimal social media management MVP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-surface">
      <body className={`${inter.variable} font-sans antialiased text-slate-900 bg-surface`}>{children}</body>
    </html>
  );
}
