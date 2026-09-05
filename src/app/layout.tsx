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
  title: "Skillsetu | Bridging Skills to Real Opportunities",
  description: "Bridging your skills to real opportunities — AI-powered job matching & career roadmaps.",
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
        <header className="border-b border-border/80 bg-card/60 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-extrabold text-sm shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform tracking-wider">
                SS
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  Skillsetu
                </h1>
                <p className="text-[11px] text-muted hidden sm:block tracking-wide">
                  Bridging your skills to real opportunities — traditional jobs & creator roadmaps
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
