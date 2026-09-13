"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { ApplicationStage, SavedJob } from "@/lib/storage";
import ApplicationKitModal, { ApplicationKitData } from "@/components/ApplicationKitModal";

const STAGES: { id: ApplicationStage; title: string; icon: string; badgeColor: string }[] = [
  { id: "saved", title: "Saved / Backlog", icon: "📌", badgeColor: "bg-slate-800 text-slate-300 border-slate-700" },
  { id: "applied", title: "Applied", icon: "📨", badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
  { id: "interview", title: "Interviewing", icon: "🎯", badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
  { id: "offer", title: "Offer / Accepted", icon: "🎉", badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
];

export default function TrackerPage() {
  const { savedJobs, updateJobStatus, updateJobNotes, removeSavedJob, activeProfile } = useApp();
  const [activeKitData, setActiveKitData] = useState<ApplicationKitData | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const handleOpenKit = async (job: SavedJob) => {
    try {
      const res = await fetch("/api/application-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: job.title,
          company: job.company,
          jobDescription: job.fullDescription || job.description,
          background: activeProfile?.background || "Experienced candidate",
          interests: activeProfile?.interests || "Growth and impact",
        }),
      });
      const data = await res.json();
      setActiveKitData({
        job,
        coverLetter: data.coverLetter || "Generated cover letter...",
        resumeHeadline: data.resumeHeadline || `${job.title} Specialist`,
        resumeBullets: data.resumeBullets || ["Demonstrated core execution and leadership."],
      });
    } catch {
      setActiveKitData({
        job,
        coverLetter: `Dear Hiring Team at ${job.company},\n\nI am writing to express my interest in the ${job.title} role.`,
        resumeHeadline: `${job.title} Candidate`,
        resumeBullets: ["Demonstrated track record of performance and collaborative execution."],
      });
    }
  };

  const handleSaveNotes = (id: string) => {
    updateJobNotes(id, noteDraft);
    setEditingNotesId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-400 mb-2">
            <span>📊</span> Kanban Application Pipeline
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Application Tracker
          </h2>
          <p className="text-sm text-muted mt-1">
            Track your job applications, notes, and interview progress in one unified board.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2.5 text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-amber-500/20"
          >
            <span>+ Find New Opportunities</span>
          </Link>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {STAGES.map((stage) => {
          const stageJobs = savedJobs.filter((j) => j.status === stage.id);

          return (
            <div
              key={stage.id}
              className="bg-card/70 border border-border/80 rounded-3xl p-4 sm:p-5 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{stage.icon}</span>
                  <h3 className="text-sm font-bold text-foreground">{stage.title}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${stage.badgeColor}`}>
                  {stageJobs.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="space-y-3.5 flex-1 overflow-y-auto">
                {stageJobs.length === 0 ? (
                  <div className="h-44 border border-dashed border-border/70 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-xs text-muted">No jobs in {stage.title.toLowerCase()}</p>
                    {stage.id === "saved" && (
                      <Link
                        href="/"
                        className="text-xs text-amber-400 hover:underline font-semibold mt-1"
                      >
                        Search & Save Jobs
                      </Link>
                    )}
                  </div>
                ) : (
                  stageJobs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-card border border-border hover:border-amber-500/40 rounded-2xl p-4 shadow-sm transition-all hover:shadow-md"
                    >
                      {/* Title & Company */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-bold text-foreground leading-tight">
                          {job.title}
                        </h4>
                        {typeof job.matchScore === "number" && (
                          <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            {job.matchScore}%
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted mb-2 font-medium">{job.company}</p>

                      <p className="text-[11px] text-muted/80 flex items-center gap-1 mb-3">
                        <span>📍</span> {job.location} · {job.workMode}
                      </p>

                      {/* Matching vs Missing Skills chips */}
                      {job.missingSkills && job.missingSkills.length > 0 && (
                        <div className="mb-3 bg-background/70 border border-border/80 rounded-xl p-2 text-[11px] space-y-1">
                          <p className="text-amber-300 font-semibold flex items-center gap-1">
                            <span>⚡ Gap:</span> {job.missingSkills[0]?.skill}
                          </p>
                        </div>
                      )}

                      {/* Notes snippet or editor */}
                      <div className="mb-3">
                        {editingNotesId === job.id ? (
                          <div className="space-y-1.5">
                            <textarea
                              rows={2}
                              value={noteDraft}
                              onChange={(e) => setNoteDraft(e.target.value)}
                              placeholder="Add personal notes (e.g. contacted recruiter, referral name)..."
                              className="w-full text-xs rounded-xl bg-background border border-border p-2 text-foreground focus:outline-none focus:border-amber-500 resize-none"
                            />
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => setEditingNotesId(null)}
                                className="text-[10px] text-muted px-2 py-0.5 rounded hover:text-foreground"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveNotes(job.id)}
                                className="text-[10px] bg-amber-500 text-slate-950 font-bold px-2.5 py-0.5 rounded"
                              >
                                Save Note
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              setEditingNotesId(job.id);
                              setNoteDraft(job.notes || "");
                            }}
                            className="bg-background/50 border border-border/60 hover:border-border rounded-xl p-2 text-[11px] text-muted cursor-pointer transition-colors"
                          >
                            {job.notes ? (
                              <p className="text-foreground/80 line-clamp-2">📝 {job.notes}</p>
                            ) : (
                              <p className="italic text-muted/60">+ Add notes / interview prep</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Card Actions & Stage Mover */}
                      <div className="pt-2 border-t border-border/80 flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-1.5">
                          <button
                            onClick={() => handleOpenKit(job)}
                            className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
                          >
                            <span>📝</span> App Kit
                          </button>

                          {job.applyLink && (
                            <a
                              href={job.applyLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-muted hover:text-foreground hover:underline"
                            >
                              Portal ↗
                            </a>
                          )}

                          <button
                            onClick={() => removeSavedJob(job.id)}
                            className="text-[11px] text-muted hover:text-red-400 transition-colors"
                            title="Remove from board"
                          >
                            ✕
                          </button>
                        </div>

                        {/* Stage Selector Dropdown / Buttons */}
                        <div className="flex items-center gap-1 pt-1 overflow-x-auto text-[10px]">
                          <span className="text-muted/60 text-[9px] uppercase">Move:</span>
                          {STAGES.map((s) => (
                            <button
                              key={s.id}
                              disabled={job.status === s.id}
                              onClick={() => updateJobStatus(job.id, s.id)}
                              className={`px-1.5 py-0.5 rounded font-medium transition-all ${
                                job.status === s.id
                                  ? "bg-amber-500/20 text-amber-300 opacity-50 cursor-default"
                                  : "bg-background/80 border border-border text-muted hover:text-foreground hover:border-amber-500/40 cursor-pointer"
                              }`}
                            >
                              {s.title.split(" ")[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Application Kit Modal */}
      {activeKitData && (
        <ApplicationKitModal
          data={activeKitData}
          onClose={() => setActiveKitData(null)}
        />
      )}
    </div>
  );
}
