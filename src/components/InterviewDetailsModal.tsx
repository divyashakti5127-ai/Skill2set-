"use client";

import React, { useState, useEffect } from "react";
import { SavedJob } from "@/lib/storage";

interface InterviewDetailsModalProps {
  job: SavedJob;
  isOpen: boolean;
  onClose: () => void;
  onSave: (details: { interviewDate: string; interviewType: string; interviewNotes: string }) => void;
}

const INTERVIEW_TYPES = [
  "Phone Screen",
  "Video Interview",
  "In-person",
  "HR Round",
  "Technical Round",
  "Other",
];

export default function InterviewDetailsModal({
  job,
  isOpen,
  onClose,
  onSave,
}: InterviewDetailsModalProps) {
  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [interviewDate, setInterviewDate] = useState(job?.interviewDate || getTodayDateString());
  const [interviewType, setInterviewType] = useState(job?.interviewType || "Video Interview");
  const [interviewNotes, setInterviewNotes] = useState(job?.interviewNotes || "");

  useEffect(() => {
    if (job) {
      setInterviewDate(job.interviewDate || getTodayDateString());
      setInterviewType(job.interviewType || "Video Interview");
      setInterviewNotes(job.interviewNotes || "");
    }
  }, [job]);

  if (!isOpen || !job) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      interviewDate,
      interviewType,
      interviewNotes,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-card border border-amber-500/35 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl shadow-amber-500/15 p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/25">
              🎯
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                Interview Details
              </h3>
              <p className="text-xs text-muted">
                {job.title} · <span className="text-amber-400 font-semibold">{job.company}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground text-xl p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Interview Date */}
          <div>
            <label className="block text-xs font-semibold text-foreground/90 mb-1.5 flex items-center gap-1.5">
              <span>📅</span> Interview Date
            </label>
            <input
              type="date"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              className="w-full rounded-2xl bg-background border border-border px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
              required
            />
          </div>

          {/* Interview Type Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-foreground/90 mb-1.5 flex items-center gap-1.5">
              <span>🎙️</span> Interview Type
            </label>
            <select
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              className="w-full rounded-2xl bg-background border border-border px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
            >
              {INTERVIEW_TYPES.map((type) => (
                <option key={type} value={type} className="bg-slate-900 text-foreground">
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-foreground/90 mb-1.5 flex items-center gap-1.5">
              <span>📝</span> Notes & Preparation (Optional)
            </label>
            <textarea
              rows={3}
              value={interviewNotes}
              onChange={(e) => setInterviewNotes(e.target.value)}
              placeholder="e.g. Interview on Zoom at 3 PM, prepare portfolio, review system design questions..."
              className="w-full rounded-2xl bg-background border border-border p-3 text-xs sm:text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-border/70">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-border px-4 py-2.5 text-xs sm:text-sm text-muted hover:text-foreground hover:bg-slate-800/60 font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-5 py-2.5 text-xs sm:text-sm shadow-md shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center gap-2"
            >
              <span>✓</span>
              <span>Save Interview Details</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
