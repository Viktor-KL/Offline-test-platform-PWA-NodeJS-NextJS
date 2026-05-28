import type { Metadata } from "next";
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
  openGraph: {
    title: "QuizApp — Offline Test Platform",
    description: "Take knowledge tests online and offline. Results sync automatically when you reconnect.",
    url: "https://quiz-offline-platform.site",
    siteName: "QuizApp",
    type: "website",
  },
  themeColor: "#6366f1",
  appleWebApp: {
    capable: true,
    title: "QuizApp",
    statusBarStyle: "default",
  },
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

