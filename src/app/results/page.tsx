"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import ApplicationKitModal, { ApplicationKitData } from "@/components/ApplicationKitModal";
import { MissingSkill } from "@/lib/storage";

/* ───── Types ───── */

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: string;
  description: string;
  fullDescription?: string;
  postedDate?: string | null;
  applyLink: string | null;
  matchScore?: number;
  whyMatch?: string;
  matchingSkills?: string[];
  missingSkills?: MissingSkill[];
}

interface RoadmapData {
  overview: string;
  gettingStarted: string[];
  whereToFind: string[];
  monetization: string[];
  timeline: string;
  encouragement: string;
}

/* ───── Match Badge ───── */

function MatchBadge({ score }: { score: number }) {
  if (score >= 80) {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 text-xs font-bold tabular-nums shadow-sm shadow-amber-500/10">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse mr-1.5" />
        {score}% match
      </span>
    );
  }
  if (score >= 50) {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-500/10 text-amber-400/90 border border-amber-500/20 px-2.5 py-0.5 text-xs font-semibold tabular-nums">
        {score}% match
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/50 px-2.5 py-0.5 text-xs font-medium tabular-nums">
      {score}% match
    </span>
  );
}

/* ───── Work mode badge ───── */

function WorkModeBadge({ mode }: { mode: string }) {
  return (
    <span className="inline-flex items-center rounded bg-slate-800/80 text-slate-400 border border-slate-700/40 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider">
      {mode}
    </span>
  );
}

/* ───── Interactive Career Roadmap Modal ───── */

function RoadmapModal({
  field,
  roadmap,
  onClose,
}: {
  field: string;
  roadmap: RoadmapData;
  onClose: () => void;
}) {
  const { saveRoadmap, isRoadmapSaved, getSavedRoadmapByField } = useApp();
  const existing = getSavedRoadmapByField(field);

  const [completedSteps, setCompletedSteps] = useState<number[]>(existing?.completedSteps || []);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(isRoadmapSaved(field));

  const totalSteps = roadmap.gettingStarted.length;
  const progressPercent = Math.round((completedSteps.length / (totalSteps || 1)) * 100);

  const handleToggleStep = (idx: number) => {
    const updated = completedSteps.includes(idx)
      ? completedSteps.filter((s) => s !== idx)
      : [...completedSteps, idx].sort((a, b) => a - b);
    setCompletedSteps(updated);
    saveRoadmap({ field, roadmap, completedSteps: updated });
    setSavedSuccess(true);
  };

  const handleSaveToDashboard = () => {
    saveRoadmap({ field, roadmap, completedSteps });
    setSavedSuccess(true);
  };

  const handleCopy = () => {
    const text = `🗺️ CAREER ROADMAP: ${field.toUpperCase()} (India)

💡 OVERVIEW
${roadmap.overview}

🚀 GETTING STARTED CHECKLIST
${roadmap.gettingStarted.map((s, i) => `[${completedSteps.includes(i) ? "X" : " "}] Step ${i + 1}: ${s}`).join("\n")}

📍 WHERE TO GET NOTICED & FIND OPPORTUNITIES
${roadmap.whereToFind.map((s) => `• ${s}`).join("\n")}

💰 HOW TO MONETIZE IN INDIA
${roadmap.monetization.map((s) => `• ${s}`).join("\n")}

⏳ REALISTIC TIMELINE
${roadmap.timeline}

✨ WORDS OF ENCOURAGEMENT
${roadmap.encouragement}
`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-card border border-amber-500/30 rounded-3xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden shadow-2xl shadow-amber-500/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border/80 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-card to-card">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🗺️</span>
              <h3 className="text-lg font-bold text-foreground capitalize">
                Career Roadmap: {field}
              </h3>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Personalized blueprint for building income & momentum in India
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground transition-colors text-xl leading-none p-1.5 rounded-lg hover:bg-slate-800/60 cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Progress Tracker Bar */}
        <div className="bg-background/80 px-6 py-3 border-b border-border/70 flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-foreground">Milestone Progress</span>
              <span className="font-bold text-amber-400">
                {completedSteps.length} of {totalSteps} Completed ({progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-border">
              <div
                className="bg-gradient-to-r from-amber-500 to-amber-400 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <button
            onClick={handleSaveToDashboard}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              savedSuccess
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25"
            }`}
          >
            {savedSuccess ? "✓ Saved to Dashboard" : "☆ Save Roadmap"}
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 overflow-y-auto flex-1 space-y-6 text-sm">
          {/* Overview */}
          <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5 flex items-center gap-1.5">
              <span>💡</span> Market & Landscape Overview
            </h4>
            <p className="text-foreground/90 leading-relaxed">
              {roadmap.overview}
            </p>
          </div>

          {/* Getting Started with Interactive Checkmarks */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
              <span>🚀</span> 1. Actionable Milestones (Check off as you complete)
            </h4>
            <div className="space-y-2.5">
              {roadmap.gettingStarted.map((step, idx) => {
                const isDone = completedSteps.includes(idx);
                return (
                  <div
                    key={idx}
                    onClick={() => handleToggleStep(idx)}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isDone
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                        : "bg-card border-border/80 text-foreground/90 hover:border-amber-500/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => {}}
                      className="mt-1 w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-xs mr-1.5">Step {idx + 1}:</span>
                      <span className={`text-xs sm:text-sm ${isDone ? "line-through opacity-80" : ""}`}>
                        {step}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Where to Find */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
              <span>📍</span> 2. Where to Get Noticed & Find Opportunities in India
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {roadmap.whereToFind.map((place, idx) => (
                <div
                  key={idx}
                  className="bg-card border border-border/80 rounded-2xl p-3 flex items-start gap-2"
                >
                  <span className="text-amber-400 text-sm mt-0.5">•</span>
                  <p className="text-foreground/85 leading-relaxed text-xs sm:text-sm">
                    {place}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Monetization */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
              <span>💰</span> 3. How People Monetize in India
            </h4>
            <div className="space-y-2">
              {roadmap.monetization.map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 bg-card border border-border/80 rounded-2xl p-3"
                >
                  <span className="text-emerald-400 font-semibold text-sm">₹</span>
                  <p className="text-foreground/85 leading-relaxed">
                    {m}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-card border border-border/90 rounded-2xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-1.5 flex items-center gap-1.5">
              <span>⏳</span> 4. Realistic Timeline & Progression
            </h4>
            <p className="text-foreground/85 leading-relaxed">
              {roadmap.timeline}
            </p>
          </div>

          {/* Encouragement */}
          <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-600/15 border border-amber-500/30 rounded-2xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-1 flex items-center gap-1.5">
              <span>✨</span> Words of Encouragement
            </h4>
            <p className="text-foreground/95 italic leading-relaxed">
              "{roadmap.encouragement}"
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/80 flex gap-3 justify-end bg-card/60">
          <button
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-sm text-muted hover:text-foreground hover:border-foreground/30 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleCopy}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-5 py-2 text-sm font-bold transition-all cursor-pointer min-w-[90px] flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
          >
            {copied ? "✓ Copied!" : "Copy Full Roadmap"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───── Loading skeleton ───── */

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-card border border-border rounded-3xl p-5 sm:p-6 animate-pulse"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="h-5 bg-border rounded w-3/5 mb-2" />
              <div className="h-3.5 bg-border rounded w-2/5" />
            </div>
            <div className="h-6 bg-border rounded-full w-20" />
          </div>
          <div className="h-3 bg-border rounded w-1/3 mb-4" />
          <div className="space-y-2 mb-4">
            <div className="h-3 bg-border rounded w-full" />
            <div className="h-3 bg-border rounded w-5/6" />
          </div>
          <div className="flex gap-3">
            <div className="h-9 bg-border rounded-lg w-28" />
            <div className="h-9 bg-border rounded-lg w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───── Results content ───── */

function ResultsContent() {
  const searchParams = useSearchParams();
  const { saveJob, isJobSaved, activeProfile } = useApp();

  const background = searchParams.get("background") || activeProfile?.background || "";
  const interests = searchParams.get("interests") || activeProfile?.interests || "";
  const location = searchParams.get("location") || activeProfile?.location || "";

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isUnconventionalField, setIsUnconventionalField] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Expand details state for job cards
  const [expandedJobIds, setExpandedJobIds] = useState<Record<string, boolean>>({});

  // Application Kit state
  const [generatingKitId, setGeneratingKitId] = useState<string | null>(null);
  const [activeApplicationKit, setActiveApplicationKit] = useState<ApplicationKitData | null>(null);
  const [kitError, setKitError] = useState("");

  // Career Roadmap state
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [activeRoadmap, setActiveRoadmap] = useState<{
    field: string;
    roadmap: RoadmapData;
  } | null>(null);
  const [roadmapError, setRoadmapError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (background) params.set("background", background);
      if (interests) params.set("interests", interests);
      if (location) params.set("location", location);

      try {
        const res = await fetch(`/api/jobs?${params.toString()}`, {
          cache: "no-store",
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to fetch jobs");
          setJobs([]);
          setIsUnconventionalField(false);
        } else {
          setJobs(data.jobs || []);
          setIsUnconventionalField(Boolean(data.isUnconventionalField));
        }
      } catch {
        setError("Network error — could not reach the server.");
        setJobs([]);
        setIsUnconventionalField(false);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [background, interests, location]);

  const toggleDetails = (jobId: string) => {
    setExpandedJobIds((prev) => ({
      ...prev,
      [jobId]: !prev[jobId],
    }));
  };

  const handleGenerateApplicationKit = async (job: Job) => {
    setGeneratingKitId(job.id);
    setKitError("");

    try {
      const res = await fetch("/api/application-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: job.title,
          company: job.company,
          jobDescription: job.fullDescription || job.description,
          background,
          interests,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.coverLetter) {
        throw new Error(data.error || "Could not generate application kit.");
      }

      setActiveApplicationKit({
        job,
        coverLetter: data.coverLetter,
        resumeHeadline: data.resumeHeadline || `${job.title} Candidate`,
        resumeBullets: data.resumeBullets || [
          `Demonstrated hands-on experience in ${background.split(",")[0] || "core domain"}.`,
        ],
      });
    } catch (err: any) {
      setKitError(err.message || "Failed to generate application kit.");
      setTimeout(() => setKitError(""), 5000);
    } finally {
      setGeneratingKitId(null);
    }
  };

  const handleGenerateRoadmap = async () => {
    setRoadmapLoading(true);
    setRoadmapError("");

    try {
      const res = await fetch("/api/career-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          background,
          interests,
          location,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.roadmap) {
        throw new Error(data.error || "Could not generate career roadmap.");
      }

      setActiveRoadmap({
        field: data.field || interests || background || "Your Field",
        roadmap: data.roadmap,
      });
    } catch (err: any) {
      setRoadmapError(err.message || "Failed to generate roadmap.");
      setTimeout(() => setRoadmapError(""), 5000);
    } finally {
      setRoadmapLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Page heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2.5">
            <span>✦</span> Your Recommended Opportunities
          </h2>
          <p className="text-xs text-muted mt-1">
            Real jobs and custom roadmaps analyzed specifically for your profile.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-xl border border-border text-foreground/80 hover:text-foreground hover:border-amber-500/40 hover:bg-slate-800/40 px-3.5 py-2 text-xs font-semibold transition-colors self-start sm:self-auto"
        >
          <svg
            className="w-3.5 h-3.5 text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
          Edit Search
        </Link>
      </div>

      {/* Search summary card */}
      <div className="bg-card border border-border/90 rounded-3xl p-5 sm:p-7 space-y-4 shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <p className="font-semibold text-muted uppercase tracking-wider mb-1">Your Skills & Background</p>
            <p className="text-sm font-medium text-foreground">
              {background || <span className="text-muted italic">Not specified</span>}
            </p>
          </div>
          <div>
            <p className="font-semibold text-muted uppercase tracking-wider mb-1">Target Roles / Passions</p>
            <p className="text-sm font-medium text-foreground">
              {interests || <span className="text-muted italic">Not specified</span>}
            </p>
          </div>
          <div>
            <p className="font-semibold text-muted uppercase tracking-wider mb-1">Target Location</p>
            <p className="text-sm font-medium text-foreground">
              {location || <span className="text-muted italic">India / Remote</span>}
            </p>
          </div>
        </div>
      </div>

      {/* ───── High-Prominence Career Roadmap Banner (if Unconventional/Gig Field) ───── */}
      {isUnconventionalField && (
        <div className="mb-8 bg-gradient-to-br from-amber-500/20 via-slate-900/90 to-card border-2 border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-xl shadow-amber-500/5 relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 text-xs font-bold shadow-sm">
              ✨ Recommended for this path • There is always a way forward
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mt-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🗺️</span>
                <h3 className="text-lg font-bold text-foreground">
                  Get a Career Roadmap for {interests || background}
                </h3>
              </div>
              <p className="text-sm text-foreground/85 leading-relaxed max-w-lg">
                This field often thrives beyond traditional 9-to-5 job postings — your personalized AI roadmap unlocks gigs, monetization channels, platforms, and building sustainable income in India.
              </p>
            </div>
            <button
              onClick={handleGenerateRoadmap}
              disabled={roadmapLoading}
              className="rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-60 text-slate-950 px-6 py-3.5 text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 flex-shrink-0 shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              {roadmapLoading ? "Crafting Blueprint…" : "View Career Roadmap ➔"}
            </button>
          </div>

          {roadmapError && (
            <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-lg p-2.5 text-xs text-red-400">
              {roadmapError}
            </div>
          )}
        </div>
      )}

      {/* ───── Recommended jobs ───── */}
      <div className="flex items-center justify-between mt-8 mb-5">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <span>💼</span> Recommended Job Matches
        </h3>
        <span className="text-xs text-muted">
          Showing AI-ranked real job postings
        </span>
      </div>

      {/* Kit Error Alert */}
      {kitError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-sm text-red-400 mb-4 animate-in fade-in">
          {kitError}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <>
          <p className="text-sm text-amber-400/90 mb-4 animate-pulse flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            Analyzing real job boards and evaluating skill gaps…
          </p>
          <LoadingSkeleton />
        </>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* No results */}
      {!loading && !error && jobs.length === 0 && (
        <div className="bg-card border border-border rounded-3xl p-8 text-center">
          <p className="text-sm text-muted mb-4">
            No exact job matches found right now. Try expanding your search or explore a creator career roadmap.
          </p>
          <button
            onClick={handleGenerateRoadmap}
            className="rounded-xl bg-amber-500 text-slate-950 font-bold px-4 py-2 text-xs"
          >
            Generate Career Roadmap Instead ➔
          </button>
        </div>
      )}

      {/* Job cards with SKILL GAP ANALYSIS */}
      {!loading && !error && jobs.length > 0 && (
        <div className="space-y-5">
          {jobs.map((job) => {
            const isExpanded = !!expandedJobIds[job.id];
            const isGeneratingThis = generatingKitId === job.id;
            const score = job.matchScore ?? 0;
            const isSaved = isJobSaved(job.id);

            // Visual card hierarchy styling based on match score
            const cardHierarchyClass =
              score >= 80
                ? "bg-card border border-amber-500/35 hover:border-amber-500/60 shadow-lg shadow-amber-500/5"
                : score >= 50
                ? "bg-card border border-border/90 hover:border-amber-500/30 shadow-sm"
                : "bg-card/75 border border-border/60 opacity-90 hover:opacity-100 hover:border-border";

            return (
              <div
                key={job.id}
                className={`${cardHierarchyClass} rounded-3xl p-5 sm:p-7 transition-all duration-200`}
              >
                {/* Title + Match Score */}
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-foreground leading-snug">
                      {job.title}
                    </h4>
                    <p className="text-sm font-semibold text-muted mt-0.5">{job.company}</p>
                  </div>
                  {typeof job.matchScore === "number" && (
                    <MatchBadge score={job.matchScore} />
                  )}
                </div>

                {/* Location + work mode */}
                <div className="flex items-center gap-2 mb-3 mt-1">
                  <p className="text-xs text-muted/80 flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5 text-amber-400/70"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {job.location}
                  </p>
                  <WorkModeBadge mode={job.workMode} />
                </div>

                {/* Short preview Description */}
                {!isExpanded && (
                  <p className="text-sm text-foreground/80 leading-relaxed mb-4 line-clamp-2">
                    {job.description}
                  </p>
                )}

                {/* Why this matches section */}
                {job.whyMatch && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-3 mb-4">
                    <p className="text-xs text-amber-300/90 leading-relaxed">
                      <span className="font-bold text-amber-300">Why this matches:</span>{" "}
                      {job.whyMatch}
                    </p>
                  </div>
                )}

                {/* ───── SKILL GAP ANALYSIS SECTION ───── */}
                <div className="bg-background/80 border border-border/80 rounded-2xl p-4 mb-4 space-y-3">
                  {/* You Already Have */}
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                      <span>✓</span> You Already Have:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {job.matchingSkills && job.matchingSkills.length > 0 ? (
                        job.matchingSkills.map((s, idx) => (
                          <span
                            key={idx}
                            className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 px-2.5 py-1 rounded-full text-xs font-medium"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted italic">Core domain experience</span>
                      )}
                    </div>
                  </div>

                  {/* Missing Skills & Free/Paid Learning Resources */}
                  <div className="pt-2 border-t border-border/60">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                      <span>⚡</span> Missing Skills & Learning Paths:
                    </div>
                    <div className="space-y-2">
                      {job.missingSkills && job.missingSkills.length > 0 ? (
                        job.missingSkills.map((ms, idx) => (
                          <div
                            key={idx}
                            className="bg-card/90 border border-border/70 rounded-xl p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                          >
                            <div>
                              <span className="font-bold text-foreground">{ms.skill}</span>
                              {ms.reason && (
                                <p className="text-[11px] text-muted mt-0.5">{ms.reason}</p>
                              )}
                            </div>
                            {ms.resource && (
                              <a
                                href={ms.resource.url || `https://www.youtube.com/results?search_query=${encodeURIComponent(ms.skill + " tutorial")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors flex-shrink-0 self-start sm:self-auto"
                              >
                                <span>{ms.resource.type === "free" ? "🟢 Free Resource:" : "🟡 Resource:"}</span>
                                <span>{ms.resource.platform || "YouTube / Guide"} ↗</span>
                              </a>
                            )}
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-muted italic">Ready to apply directly</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Full Details Section */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border/80 space-y-4 mb-4 animate-in fade-in duration-200">
                    <div>
                      <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">
                        Full Job Description
                      </p>
                      <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line">
                        {job.fullDescription || job.description}
                      </p>
                    </div>

                    {job.postedDate && (
                      <p className="text-xs text-muted">
                        Posted: {new Date(job.postedDate).toLocaleDateString()}
                      </p>
                    )}

                    {job.applyLink && (
                      <div>
                        <a
                          href={job.applyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 hover:underline font-semibold"
                        >
                          Official Apply Portal ↗
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions Button Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    {/* View / Collapse Details */}
                    <button
                      onClick={() => toggleDetails(job.id)}
                      className="rounded-xl border border-border text-foreground/90 hover:bg-slate-800/50 hover:border-amber-500/30 px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      {isExpanded ? "Collapse details ▲" : "View details ▼"}
                    </button>

                    {/* Bookmark / Save to Pipeline */}
                    <button
                      onClick={() => saveJob(job)}
                      className={`rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSaved
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-background/80 text-muted border-border hover:text-foreground hover:border-amber-500/30"
                      }`}
                    >
                      {isSaved ? "★ Saved in Pipeline" : "☆ Save Job"}
                    </button>
                  </div>

                  {/* Generate Application Kit (Cover Letter + Resume Bullets) */}
                  <button
                    onClick={() => handleGenerateApplicationKit(job)}
                    disabled={isGeneratingThis}
                    className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-60 text-slate-950 px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shadow-amber-500/20"
                  >
                    {isGeneratingThis ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-slate-950" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Tailoring Kit…
                      </>
                    ) : (
                      <>
                        <span>⚡</span>
                        <span>Tailor Cover Letter & Resume</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ───── Secondary Career Roadmap Banner (for Standard Fields) ───── */}
      {!isUnconventionalField && !loading && (
        <div className="mt-10 bg-gradient-to-br from-card via-slate-900/80 to-amber-500/5 border border-amber-500/25 hover:border-amber-500/40 rounded-3xl p-6 text-card-foreground transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">🧭</span>
                <h4 className="text-sm font-bold text-foreground">
                  Want to explore alternative career paths or freelance momentum?
                </h4>
              </div>
              <p className="text-xs text-muted">
                Generate an AI career roadmap to explore independent consulting, specialized niches, and skills progression in{" "}
                <span className="text-amber-300 font-semibold">
                  {interests || background || "your field"}
                </span>.
              </p>
            </div>
            <button
              onClick={handleGenerateRoadmap}
              disabled={roadmapLoading}
              className="rounded-xl border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-shrink-0"
            >
              {roadmapLoading ? "Crafting Blueprint…" : "Explore Career Roadmap ➔"}
            </button>
          </div>

          {roadmapError && (
            <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-lg p-2.5 text-xs text-red-400">
              {roadmapError}
            </div>
          )}
        </div>
      )}

      {/* Tailored Application Kit Modal (Cover Letter + Resume Bullets) */}
      {activeApplicationKit && (
        <ApplicationKitModal
          data={activeApplicationKit}
          onClose={() => setActiveApplicationKit(null)}
        />
      )}

      {/* Interactive Career Roadmap Display Modal */}
      {activeRoadmap && (
        <RoadmapModal
          field={activeRoadmap.field}
          roadmap={activeRoadmap.roadmap}
          onClose={() => setActiveRoadmap(null)}
        />
      )}
    </div>
  );
}

/* ───── Page ───── */

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <div className="h-8 bg-border rounded w-1/3 mb-8 animate-pulse" />
          <LoadingSkeleton />
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
