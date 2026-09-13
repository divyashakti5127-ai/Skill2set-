"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { ApplicationStage, SavedJob } from "@/lib/storage";
import ApplicationKitModal, { ApplicationKitData } from "@/components/ApplicationKitModal";
import ApplyConfirmationModal from "@/components/ApplyConfirmationModal";
import InterviewDetailsModal from "@/components/InterviewDetailsModal";

const STAGES: { id: ApplicationStage; title: string; icon: string; badgeColor: string }[] = [
  { id: "saved", title: "Saved / Backlog", icon: "📌", badgeColor: "bg-slate-800 text-slate-300 border-slate-700" },
  { id: "applied", title: "Applied", icon: "📨", badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
  { id: "interview", title: "Interviewing", icon: "🎯", badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
  { id: "offer", title: "Offer / Accepted", icon: "🎉", badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
];

export default function TrackerPage() {
  const {
    savedJobs,
    updateJobStatus,
    updateJobNotes,
    updateInterviewDetails,
    removeSavedJob,
    activeProfile,
  } = useApp();
  const [activeKitData, setActiveKitData] = useState<ApplicationKitData | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  // Test Mode toggle state (persisted to localStorage)
  const [testMode, setTestMode] = useState<boolean>(false);

  // Initialize testMode on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("skillsetu_test_mode");
      if (stored === "true") setTestMode(true);
    }
  }, []);

  const toggleTestMode = () => {
    setTestMode((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("skillsetu_test_mode", String(next));
      }
      return next;
    });
  };

  // Interview modal state
  const [interviewModalJob, setInterviewModalJob] = useState<SavedJob | null>(null);

  // Post-apply prompt & 8s countdown states
  const [confirmModalJob, setConfirmModalJob] = useState<SavedJob | null>(null);
  const [pendingToastJob, setPendingToastJob] = useState<SavedJob | null>(null);
  const [countdown, setCountdown] = useState<number>(8);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const clearPendingTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleApplyClick = (job: SavedJob) => {
    if (testMode) {
      // In Test Mode: Skip opening real link and directly show confirmation popup
      clearPendingTimer();
      setPendingToastJob(null);
      setConfirmModalJob(job);
      return;
    }

    if (job.applyLink) {
      window.open(job.applyLink, "_blank", "noopener,noreferrer");
    }

    // Start 8-second countdown in normal mode
    clearPendingTimer();
    setPendingToastJob(job);
    setCountdown(8);

    let remaining = 8;
    intervalRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        clearPendingTimer();
        setPendingToastJob(null);
        setConfirmModalJob(job);
      }
    }, 1000);
  };

  const triggerConfirmImmediately = (job: SavedJob) => {
    clearPendingTimer();
    setPendingToastJob(null);
    setConfirmModalJob(job);
  };

  const handleCancelToast = () => {
    clearPendingTimer();
    setPendingToastJob(null);
  };

  const handleConfirmApplied = (job: SavedJob, noteType: "just_applied" | "already_applied") => {
    updateJobStatus(job.id, "applied");
    const dateFormatted = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const noteLine =
      noteType === "just_applied"
        ? `Applied via official portal on ${dateFormatted}`
        : `Previously applied via official portal`;
    const updatedNotes = job.notes ? `${job.notes}\n• ${noteLine}` : `• ${noteLine}`;
    updateJobNotes(job.id, updatedNotes);
    setConfirmModalJob(null);
  };

  const handleNotYet = () => {
    setConfirmModalJob(null);
  };

  // Interview modal handlers
  const handleOpenInterviewModal = (job: SavedJob) => {
    setInterviewModalJob(job);
  };

  const handleSaveInterviewDetails = (details: {
    interviewDate: string;
    interviewType: string;
    interviewNotes: string;
  }) => {
    if (!interviewModalJob) return;
    updateInterviewDetails(interviewModalJob.id, {
      ...details,
      status: "interview",
    });
    setInterviewModalJob(null);
  };

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

        <div className="flex flex-wrap items-center gap-3">
          {/* Test Mode Toggle */}
          <div className="flex items-center gap-2.5 bg-card border border-border hover:border-amber-500/40 px-3.5 py-2 rounded-2xl shadow-sm transition-all">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground flex items-center gap-1">
                <span>🧪</span> Test Mode
                {testMode && (
                  <span className="text-[10px] uppercase font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded-md">
                    ON
                  </span>
                )}
              </span>
              <span className="text-[10px] text-muted">
                {testMode ? "Direct modal (no link)" : "Opens real job portals"}
              </span>
            </div>
            <button
              type="button"
              onClick={toggleTestMode}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                testMode ? "bg-amber-500" : "bg-slate-700 hover:bg-slate-600"
              }`}
              role="switch"
              aria-checked={testMode}
              title={testMode ? "Test Mode is ON: Portal button opens verification popup directly" : "Test Mode is OFF: Portal button opens real external links"}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow-md transition duration-200 ease-in-out ${
                  testMode ? "translate-x-5 bg-slate-950" : "translate-x-0 bg-slate-200"
                }`}
              />
            </button>
          </div>

          <Link
            href="/"
            className="rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2.5 text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-amber-500/20"
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

                      {/* Interview Scheduled Badge (Shown in Interviewing stage or if interview details exist) */}
                      {job.status === "interview" && (
                        <div className="mb-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-2.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                              <span>📅</span>
                              {job.interviewDate
                                ? `Interview: ${new Date(job.interviewDate).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                  })}${job.interviewType ? ` • ${job.interviewType}` : ""}`
                                : job.interviewType
                                ? `${job.interviewType} scheduled`
                                : "Interview Scheduled"}
                            </span>
                            <button
                              onClick={() => handleOpenInterviewModal(job)}
                              className="text-[10px] text-amber-400 hover:text-amber-300 hover:underline font-semibold cursor-pointer"
                            >
                              Edit ✏️
                            </button>
                          </div>
                          {job.interviewNotes && (
                            <p className="text-[11px] text-muted/90 mt-1.5 italic line-clamp-2">
                              💬 {job.interviewNotes}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Prominent "Got Interview Call?" Button on Applied Cards */}
                      {job.status === "applied" && (
                        <button
                          onClick={() => handleOpenInterviewModal(job)}
                          className="w-full mb-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold py-2.5 px-3 text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                        >
                          <span>🎯</span>
                          <span>Got Interview Call?</span>
                        </button>
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
                            <button
                              onClick={() => handleApplyClick(job)}
                              className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                              title="Open official portal & track application"
                            >
                              <span>Portal ↗</span>
                            </button>
                          )}

                          <button
                            onClick={() => removeSavedJob(job.id)}
                            className="text-[11px] text-muted hover:text-red-400 transition-colors cursor-pointer"
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

      {/* Floating 8s Apply Countdown Toast */}
      {pendingToastJob && (
        <div className="fixed bottom-6 right-6 z-40 max-w-sm bg-card border border-amber-500/50 rounded-2xl shadow-2xl shadow-amber-500/20 p-4 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-xs">
                {countdown}s
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Opening portal tab...</p>
                <p className="text-[11px] text-muted line-clamp-1">{pendingToastJob.title}</p>
              </div>
            </div>
            <button
              onClick={handleCancelToast}
              className="text-muted hover:text-foreground text-xs p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => triggerConfirmImmediately(pendingToastJob)}
              className="flex-1 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 py-1.5 px-3 rounded-xl transition-all cursor-pointer"
            >
              Check status now
            </button>
            <button
              onClick={handleCancelToast}
              className="text-xs text-muted hover:text-foreground py-1.5 px-2 rounded-xl cursor-pointer"
            >
              Dismiss
            </button>
          </div>
          <div className="mt-2.5 w-full bg-slate-800 rounded-full h-1 overflow-hidden">
            <div
              className="bg-amber-400 h-full transition-all duration-1000 ease-linear"
              style={{ width: `${(countdown / 8) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Did You Apply Confirmation Modal */}
      {confirmModalJob && (
        <ApplyConfirmationModal
          job={confirmModalJob}
          isOpen={!!confirmModalJob}
          onClose={() => setConfirmModalJob(null)}
          onConfirmApplied={handleConfirmApplied}
          onNotYet={handleNotYet}
        />
      )}

      {/* Interview Details Modal */}
      {interviewModalJob && (
        <InterviewDetailsModal
          job={interviewModalJob}
          isOpen={!!interviewModalJob}
          onClose={() => setInterviewModalJob(null)}
          onSave={handleSaveInterviewDetails}
        />
      )}

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
