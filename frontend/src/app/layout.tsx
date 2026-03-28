import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope, Source_Sans_3 } from "next/font/google";

import { Providers } from "@/components/providers";
import "@/app/globals.css";

const displayFont = Manrope({
  subsets: ["latin"],
  variable: "--font-display",
});

const bodyFont = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "HealthGuard",
  description: "A modern health tracking product built with Next.js and FastAPI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
