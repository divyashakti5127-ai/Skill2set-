"use client";

import React from "react";
import { SavedJob } from "@/lib/storage";

interface ApplyConfirmationModalProps {
  job: SavedJob;
  isOpen: boolean;
  onClose: () => void;
  onConfirmApplied: (job: SavedJob, noteType: "just_applied" | "already_applied") => void;
  onNotYet: () => void;
}

export default function ApplyConfirmationModal({
  job,
  isOpen,
  onClose,
  onConfirmApplied,
  onNotYet,
}: ApplyConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-card border border-amber-500/35 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl shadow-amber-500/15 p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Icon & Close */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/25">
            📨
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground text-xl p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Title & Job Context */}
        <div className="mb-6">
          <h3 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
            Did you apply for this job?
          </h3>
          <div className="mt-2 bg-background/80 border border-border/80 rounded-2xl p-3.5">
            <p className="text-sm font-bold text-foreground leading-snug">{job.title}</p>
            <p className="text-xs font-semibold text-amber-400/90 mt-0.5">{job.company}</p>
            <p className="text-[11px] text-muted mt-1">📍 {job.location} · {job.workMode}</p>
          </div>
          <p className="text-xs text-muted/90 mt-3 leading-relaxed">
            Updating this moves your card to the <span className="text-amber-300 font-semibold">"Applied"</span> stage and records the date in your pipeline.
          </p>
        </div>

        {/* Action Options */}
        <div className="space-y-2.5">
          {/* Option 1: Yes, I applied */}
          <button
            onClick={() => onConfirmApplied(job, "just_applied")}
            className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3.5 px-4 text-sm transition-all duration-150 shadow-md shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
          >
            <span>✓</span>
            <span>Yes, I applied</span>
          </button>

          {/* Option 2: I already applied earlier */}
          <button
            onClick={() => onConfirmApplied(job, "already_applied")}
            className="w-full rounded-2xl bg-card border border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/10 text-amber-300 font-semibold py-3 px-4 text-xs sm:text-sm transition-all duration-150 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>🕒</span>
            <span>I already applied earlier</span>
          </button>

          {/* Option 3: Not yet */}
          <button
            onClick={onNotYet}
            className="w-full rounded-2xl border border-border text-muted hover:text-foreground hover:bg-slate-800/60 font-medium py-2.5 px-4 text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Not yet (Keep in current stage)
          </button>
        </div>
      </div>
    </div>
  );
}
