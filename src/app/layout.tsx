import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import HeaderNav from "@/components/HeaderNav";
import UserAuthModal from "@/components/UserAuthModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Skillsetu | Turn Your Skills Into Your Next Opportunity",
  description: "AI-Powered Career Intelligence Platform — smart job discovery, skill gap analysis, creator roadmaps, and Kanban application tracking.",
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
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AppProvider>
          {/* Header */}
          <HeaderNav />

          {/* Main content */}
          <main className="flex-1">{children}</main>

          {/* Account / User Modal */}
          <UserAuthModal />
        </AppProvider>
      </body>
    </html>
  );
}

