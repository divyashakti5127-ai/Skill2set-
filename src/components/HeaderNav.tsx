"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function HeaderNav() {
  const pathname = usePathname();
  const { savedJobs, savedRoadmaps } = useApp();

  return (
    <header className="border-b border-border/80 bg-card/70 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform tracking-wider">
            SS
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
              Skillsetu
            </h1>
            <p className="text-[11px] text-muted hidden md:block tracking-wide">
              Bridging skills to opportunities — jobs & creator roadmaps
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              pathname === "/"
                ? "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                : "text-muted hover:text-foreground hover:bg-slate-800/40"
            }`}
          >
            Search
          </Link>

          <Link
            href="/tracker"
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              pathname === "/tracker"
                ? "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                : "text-muted hover:text-foreground hover:bg-slate-800/40"
            }`}
          >
            <span>Pipeline</span>
            {savedJobs.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center justify-center">
                {savedJobs.length}
              </span>
            )}
          </Link>

          <Link
            href="/saved"
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              pathname === "/saved"
                ? "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                : "text-muted hover:text-foreground hover:bg-slate-800/40"
            }`}
          >
            <span>Dashboard</span>
            {savedRoadmaps.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center justify-center">
                {savedRoadmaps.length}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
