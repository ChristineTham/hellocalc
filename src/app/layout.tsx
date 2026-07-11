import type { Metadata } from "next";
import { Archivo, Barlow_Semi_Condensed, IBM_Plex_Mono, Silkscreen } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
// KaTeX styles at the shell level so typeset math is styled on first paint
// (docs/responsive-layout.md §11 FOUC row).
import "katex/dist/katex.min.css";

// 7-segment LCD numerals (DSEG7 Classic, OFL-1.1 — see fonts/NOTICE.md).
// next/font/local self-hosts and generates a base-path-safe @font-face.
const dseg7 = localFont({
  src: "./fonts/DSEG7Classic-Bold.woff2",
  variable: "--font-dseg7",
  weight: "700",
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const barlow = Barlow_Semi_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Dot-matrix LCD numerals for RPL machines (the HP-48's display is a 131×64
// pixel matrix, not seven-segment) — a 5×7-style pixel font reads exactly
// like its character set. DSEG7 stays for the segment-display families.
const silkscreen = Silkscreen({
  variable: "--font-silkscreen",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hello Calc",
  description: "Advanced modern calculator app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${barlow.variable} ${plexMono.variable} ${dseg7.variable} ${silkscreen.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
