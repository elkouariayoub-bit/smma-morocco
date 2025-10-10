import type { Metadata } from "next";
import "./globals.css";
import { DateRangeProvider } from "./providers/date-range";

export const metadata: Metadata = {
  title: "SMMA Morocco",
  description: "Minimal social media management MVP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DateRangeProvider>{children}</DateRangeProvider>
      </body>
    </html>
  );
}
