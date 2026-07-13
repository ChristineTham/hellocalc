import type { Metadata, Viewport } from "next";
import { Archivo, Barlow_Semi_Condensed, DotGothic16, IBM_Plex_Mono } from "next/font/google";
import localFont from "next/font/local";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

// mirrors next.config.ts basePath — for base-path-safe manifest/icon/SW URLs
const BASE = process.env.NODE_ENV === "production" ? "/hellocalc" : "";
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

// Dot-matrix LCD glyphs for the matrix-display machines (RPL / pioneer / HP-41):
// DotGothic16 is a FINE dot-matrix face — denser, crisper dots than the chunky
// Silkscreen — so it reads like a high-quality HP dot-matrix panel. DSEG7 stays
// for the seven-segment families. (Var kept as --font-silkscreen for the token.)
const silkscreen = DotGothic16({
  variable: "--font-silkscreen",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hello Calc",
  description: "Advanced modern calculator app",
  manifest: `${BASE}/manifest.webmanifest`,
  appleWebApp: { capable: true, title: "Hello Calc", statusBarStyle: "black-translucent" },
  icons: { icon: `${BASE}/icon.svg`, apple: `${BASE}/icon.svg` },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#12151b" },
    { media: "(prefers-color-scheme: light)", color: "#f6f3ec" },
  ],
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
      suppressHydrationWarning
    >
      <head>
        {/* No-FOUC theme: resolve the saved choice (or system) and stamp the
            `.dark` class BEFORE first paint. Mirrors ThemeToggle's logic. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('hellocalc-theme')||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
