import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Skill2Job",
  description: "Find jobs that fit your skills",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm">
                S2J
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground group-hover:text-accent-hover transition-colors">
                  Skill2Job
                </h1>
                <p className="text-xs text-muted hidden sm:block">
                  Find jobs that fit your skills
                </p>
              </div>
            </Link>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
