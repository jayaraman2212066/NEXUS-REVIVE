import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Nexus Revive — Resurrect Any File. From Any Era.",
  description:
    "Repair corrupted files, convert 50+ ancient formats, and extract text with local AI — free preview, always. WordPerfect, Lotus 1-2-3, dBASE, old PDFs, scanned images.",
  keywords: [
    "file recovery", "corrupt file repair", "WordPerfect converter",
    "old file format converter", "PDF OCR", "dBASE converter",
    "Lotus 1-2-3", "file conversion", "nexus revive",
  ],
  authors: [{ name: "Nexus Revive" }],
  creator: "Nexus Revive",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://nexusrevive.com"
  ),
  icons: {
    icon: [
      { url: "/n_logo_tabbrowse.ico", type: "image/x-icon" },
    ],
    shortcut: "/n_logo_tabbrowse.ico",
    apple: "/n_logo_tabbrowse.png",
  },
  openGraph: {
    title: "Nexus Revive — Resurrect Any File. From Any Era.",
    description:
      "50+ ancient formats. Corrupted files. Broken encodings. AI repairs them instantly — free preview, always.",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://nexusrevive.com",
    siteName: "Nexus Revive",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Nexus Revive Logo" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexus Revive — Resurrect Any File.",
    description: "AI-powered file recovery for any format, any era.",
    images: ["/logo.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/x-icon" href="/n_logo_tabbrowse.ico" />
        <link rel="apple-touch-icon" href="/n_logo_tabbrowse.png" />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
