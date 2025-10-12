import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SMMA Morocco",
  description: "Minimal social media management MVP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-background text-foreground">
      <body className="font-sans antialiased bg-background text-foreground">{children}</body>
    </html>
  );
}
