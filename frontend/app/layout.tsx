import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuizApp — Offline Test Platform",
  description: "Take knowledge tests online and offline. Results sync automatically when you reconnect.",
  manifest: '/manifest.json',
  keywords: ["quiz", "test", "offline", "learning", "pwa"],
  authors: [{ name: "Viktor" }],
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "QuizApp — Offline Test Platform",
    description: "Take knowledge tests online and offline. Results sync automatically when you reconnect.",
    url: "https://quiz-offline-platform.site",
    siteName: "QuizApp",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    title: "QuizApp",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

