"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";

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

/* ───── Career Roadmap Modal ───── */

function RoadmapModal({
  field,
  roadmap,
  onClose,
}: {
  field: string;
  roadmap: RoadmapData;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `🗺️ CAREER ROADMAP: ${field.toUpperCase()} (India)

💡 OVERVIEW
${roadmap.overview}

🚀 GETTING STARTED
${roadmap.gettingStarted.map((s, i) => `${i + 1}. ${s}`).join("\n")}

📍 WHERE TO GET NOTICED & FIND OPPORTUNITIES
${roadmap.whereToFind.map((s, i) => `• ${s}`).join("\n")}

💰 HOW TO MONETIZE IN INDIA
${roadmap.monetization.map((s, i) => `• ${s}`).join("\n")}

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
        className="bg-card border border-amber-500/30 rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden shadow-2xl shadow-amber-500/10"
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

        {/* Body */}
        <div className="px-6 py-6 overflow-y-auto flex-1 space-y-6 text-sm">
          {/* Overview */}
          <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5 flex items-center gap-1.5">
              <span>💡</span> Market & Landscape Overview
            </h4>
            <p className="text-foreground/90 leading-relaxed">
              {roadmap.overview}
            </p>
          </div>

          {/* Getting Started */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
              <span>🚀</span> 1. Getting Started (Core Skills & Foundation)
            </h4>
            <div className="space-y-2.5">
              {roadmap.gettingStarted.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 bg-card border border-border/80 rounded-xl p-3"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-border text-foreground text-xs font-semibold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <p className="text-foreground/85 leading-relaxed pt-0.5">
                    {step}
                  </p>
                </div>
              ))}
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
                  className="bg-card border border-border/80 rounded-xl p-3 flex items-start gap-2"
                >
                  <span className="text-accent text-sm mt-0.5">•</span>
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
                  className="flex items-start gap-2.5 bg-card border border-border/80 rounded-xl p-3"
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
          <div className="bg-card border border-border/90 rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-1.5 flex items-center gap-1.5">
              <span>⏳</span> 4. Realistic Timeline & Progression
            </h4>
            <p className="text-foreground/85 leading-relaxed">
              {roadmap.timeline}
            </p>
          </div>

          {/* Encouragement */}
          <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-600/15 border border-amber-500/30 rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-1 flex items-center gap-1.5">
              <span>✨</span> Encouragement
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
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-foreground hover:border-foreground/30 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleCopy}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-5 py-2 text-sm font-bold transition-all cursor-pointer min-w-[90px] flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
          >
            {copied ? (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy Roadmap
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───── Cover Letter Modal ───── */

function CoverLetterModal({
  job,
  letter,
  onClose,
}: {
  job: Job;
  letter: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(letter).then(() => {
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
        className="bg-card border border-amber-500/25 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl shadow-amber-500/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border/80 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-card to-card">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Generated Cover Letter
            </h3>
            <p className="text-xs text-muted mt-0.5">
              {job.title} · {job.company}
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

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          <pre className="whitespace-pre-wrap text-[14px] text-foreground/90 leading-relaxed font-sans select-text">
            {letter}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/80 flex gap-3 justify-end bg-card/60">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-foreground hover:border-foreground/30 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleCopy}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-5 py-2 text-sm font-bold transition-all cursor-pointer min-w-[90px] flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
          >
            {copied ? (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy Cover Letter
              </>
            )}
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
          className="bg-card border border-border rounded-2xl p-5 sm:p-6 animate-pulse"
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

  const background = searchParams.get("background") || "";
  const interests = searchParams.get("interests") || "";
  const location = searchParams.get("location") || "";

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isUnconventionalField, setIsUnconventionalField] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Expand details state for job cards
  const [expandedJobIds, setExpandedJobIds] = useState<Record<string, boolean>>({});

  // Cover letter state
  const [generatingLetterId, setGeneratingLetterId] = useState<string | null>(null);
  const [activeCoverLetter, setActiveCoverLetter] = useState<{
    job: Job;
    letter: string;
  } | null>(null);
  const [letterError, setLetterError] = useState("");

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

  const handleGenerateCoverLetter = async (job: Job) => {
    setGeneratingLetterId(job.id);
    setLetterError("");

    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
        throw new Error(data.error || "Could not generate cover letter.");
      }

      setActiveCoverLetter({
        job,
        letter: data.coverLetter,
      });
    } catch (err: any) {
      setLetterError(err.message || "Failed to generate cover letter.");
      setTimeout(() => setLetterError(""), 5000);
    } finally {
      setGeneratingLetterId(null);
    }
  };

  const handleGenerateRoadmap = async () => {
    setRoadmapLoading(true);
    setRoadmapError("");

    try {
      const res = await fetch("/api/career-roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Page heading */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mb-8 flex items-center gap-2.5">
        <span>✦</span> Your Recommended Paths
      </h2>

      {/* Search summary card */}
      <div className="bg-card border border-border/90 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Background</p>
          <p className="text-[15px] font-medium text-foreground">
            {background || (
              <span className="text-muted italic">Not specified</span>
            )}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Interests & Passions</p>
          <p className="text-[15px] font-medium text-foreground">
            {interests || (
              <span className="text-muted italic">Not specified</span>
            )}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">
            Preferred location
          </p>
          <p className="text-[15px] font-medium text-foreground">
            {location || (
              <span className="text-muted italic">Not specified</span>
            )}
          </p>
        </div>
      </div>

      {/* Edit search */}
      <div className="mt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-xl border border-border text-foreground/80 hover:text-foreground hover:border-amber-500/40 hover:bg-slate-800/40 px-4 py-2 text-sm font-medium transition-colors"
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
          Edit search criteria
        </Link>
      </div>

      {/* ───── High-Prominence Career Roadmap Banner (if Unconventional/Gig Field) ───── */}
      {isUnconventionalField && (
        <div className="mt-8 bg-gradient-to-br from-amber-500/20 via-slate-900/90 to-card border-2 border-amber-500/40 rounded-2xl p-6 sm:p-7 shadow-xl shadow-amber-500/5 relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 text-xs font-bold shadow-sm">
              ✨ Recommended for this path • There's always a way forward
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
              className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-60 text-slate-950 px-6 py-3 text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 flex-shrink-0 shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              {roadmapLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-slate-950"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth={4}
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Crafting Blueprint…
                </>
              ) : (
                <>
                  <span>View Career Roadmap</span>
                  <span>➔</span>
                </>
              )}
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
      <h3 className="text-lg font-bold text-foreground mt-10 mb-5 flex items-center gap-2">
        <span>💼</span> Recommended Job Opportunities
      </h3>

      {/* Cover Letter Error Alert */}
      {letterError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400 mb-4 animate-in fade-in">
          {letterError}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <>
          <p className="text-sm text-amber-400/90 mb-4 animate-pulse flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            Analyzing and ranking opportunities with AI…
          </p>
          <LoadingSkeleton />
        </>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* No results */}
      {!loading && !error && jobs.length === 0 && (
        <p className="text-sm text-muted">
          No jobs found matching these exact terms. Try broadening your background or interests.
        </p>
      )}

      {/* Job cards */}
      {!loading && !error && jobs.length > 0 && (
        <div className="space-y-4">
          {jobs.map((job) => {
            const isExpanded = !!expandedJobIds[job.id];
            const isGeneratingThis = generatingLetterId === job.id;
            const score = job.matchScore ?? 0;

            // Visual card hierarchy styling based on match score
            const cardHierarchyClass =
              score >= 80
                ? "bg-card border border-amber-500/35 hover:border-amber-500/60 shadow-lg shadow-amber-500/5"
                : score >= 50
                ? "bg-card border border-border/90 hover:border-amber-500/30"
                : "bg-card/75 border border-border/60 opacity-90 hover:opacity-100 hover:border-border";

            return (
              <div
                key={job.id}
                className={`${cardHierarchyClass} rounded-2xl p-5 sm:p-6 transition-all duration-200`}
              >
                {/* Title + Match Score */}
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <h4 className="text-[16px] font-bold text-foreground leading-snug">
                    {job.title}
                  </h4>
                  {typeof job.matchScore === "number" && (
                    <MatchBadge score={job.matchScore} />
                  )}
                </div>

                {/* Company */}
                <p className="text-sm font-medium text-muted mb-2">{job.company}</p>

                {/* Location + work mode */}
                <div className="flex items-center gap-2 mb-3">
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
                  <p className="text-sm text-foreground/80 leading-relaxed mb-3 line-clamp-2">
                    {job.description}
                  </p>
                )}

                {/* Why this matches section */}
                {job.whyMatch && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 mb-4">
                    <p className="text-xs text-amber-300/90 leading-relaxed">
                      <span className="font-bold text-amber-300">Why this matches:</span>{" "}
                      {job.whyMatch}
                    </p>
                  </div>
                )}

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
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {/* View / Collapse Details button */}
                  <button
                    onClick={() => toggleDetails(job.id)}
                    className="rounded-xl border border-border text-foreground/90 hover:bg-slate-800/50 hover:border-amber-500/30 px-4 py-2 text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    {isExpanded ? (
                      <>
                        Collapse details
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      </>
                    ) : (
                      <>
                        View details
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </>
                    )}
                  </button>

                  {/* Generate cover letter button */}
                  <button
                    onClick={() => handleGenerateCoverLetter(job)}
                    disabled={isGeneratingThis}
                    className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-60 text-slate-950 px-4 py-2 text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shadow-amber-500/15"
                  >
                    {isGeneratingThis ? (
                      <>
                        <svg
                          className="animate-spin -ml-0.5 mr-1 h-3.5 w-3.5 text-slate-950"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth={4}
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Drafting Letter…
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Generate cover letter
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ───── Secondary / Standard Career Roadmap Banner (for Standard Fields) ───── */}
      {!isUnconventionalField && !loading && (
        <div className="mt-10 bg-gradient-to-br from-card via-slate-900/80 to-amber-500/5 border border-amber-500/25 hover:border-amber-500/40 rounded-2xl p-6 text-card-foreground transition-all">
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
              {roadmapLoading ? (
                <>
                  <svg
                    className="animate-spin h-3.5 w-3.5 text-amber-300"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth={4}
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Crafting Blueprint…
                </>
              ) : (
                <>
                  <span>Explore Career Roadmap</span>
                  <span>➔</span>
                </>
              )}
            </button>
          </div>

          {roadmapError && (
            <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-lg p-2.5 text-xs text-red-400">
              {roadmapError}
            </div>
          )}
        </div>
      )}

      {/* Cover Letter Display Modal */}
      {activeCoverLetter && (
        <CoverLetterModal
          job={activeCoverLetter.job}
          letter={activeCoverLetter.letter}
          onClose={() => setActiveCoverLetter(null)}
        />
      )}

      {/* Career Roadmap Display Modal */}
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
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <div className="h-8 bg-border rounded w-1/3 mb-8 animate-pulse" />
          <LoadingSkeleton />
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
