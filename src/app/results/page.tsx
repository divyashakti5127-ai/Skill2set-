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
  return (
    <span className="inline-flex items-center rounded-full bg-accent/15 text-accent px-2.5 py-0.5 text-xs font-semibold tabular-nums">
      {score}% match
    </span>
  );
}

/* ───── Work mode badge ───── */

function WorkModeBadge({ mode }: { mode: string }) {
  return (
    <span className="inline-flex items-center rounded bg-border/60 text-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide">
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-card/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🗺️</span>
              <h3 className="text-lg font-semibold text-foreground capitalize">
                Career Roadmap: {field}
              </h3>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Personalized guide for building an income & career in India
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground transition-colors text-xl leading-none p-1 cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 overflow-y-auto flex-1 space-y-6 text-sm">
          {/* Overview */}
          <div className="bg-accent/5 border border-accent/15 rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-accent mb-1.5 flex items-center gap-1.5">
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
          <div className="bg-gradient-to-r from-accent/10 to-purple-500/10 border border-accent/20 rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-accent mb-1 flex items-center gap-1.5">
              <span>✨</span> Encouragement
            </h4>
            <p className="text-foreground/90 italic leading-relaxed">
              "{roadmap.encouragement}"
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex gap-3 justify-end bg-card/60">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-foreground hover:border-foreground/30 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleCopy}
            className="rounded-lg bg-accent hover:bg-accent-hover text-white px-5 py-2 text-sm font-medium transition-colors cursor-pointer min-w-[90px] flex items-center justify-center gap-1.5"
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Generated Cover Letter
            </h3>
            <p className="text-xs text-muted mt-0.5">
              {job.title} · {job.company}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground transition-colors text-xl leading-none p-1 cursor-pointer"
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
        <div className="px-6 py-4 border-t border-border flex gap-3 justify-end bg-card/50">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-foreground hover:border-foreground/30 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleCopy}
            className="rounded-lg bg-accent hover:bg-accent-hover text-white px-5 py-2 text-sm font-medium transition-colors cursor-pointer min-w-[90px] flex items-center justify-center gap-1.5"
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
                Copy
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
        } else {
          setJobs(data.jobs || []);
        }
      } catch {
        setError("Network error — could not reach the server.");
        setJobs([]);
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
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
        Your job search
      </h2>

      {/* Search summary card */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-5">
        <div>
          <p className="text-xs font-medium text-muted mb-1">Background</p>
          <p className="text-[15px] text-foreground">
            {background || (
              <span className="text-muted italic">Not specified</span>
            )}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted mb-1">Interests</p>
          <p className="text-[15px] text-foreground">
            {interests || (
              <span className="text-muted italic">Not specified</span>
            )}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted mb-1">
            Preferred location
          </p>
          <p className="text-[15px] text-foreground">
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
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-foreground hover:border-foreground/30 transition-colors"
        >
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
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
          Edit search
        </Link>
      </div>

      {/* Career Roadmap Banner Card */}
      <div className="mt-8 bg-gradient-to-r from-card to-accent/5 border border-border rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">🧭</span>
              <h3 className="text-base font-semibold text-foreground">
                Not finding traditional jobs?
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-muted">
              Get an AI-powered roadmap to monetize and build a sustainable career in{" "}
              <span className="text-foreground font-medium underline decoration-accent/50 underline-offset-2">
                {interests || background || "your passion"}
              </span>{" "}
              in India.
            </p>
          </div>
          <button
            onClick={handleGenerateRoadmap}
            disabled={roadmapLoading}
            className="rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-60 text-white px-5 py-2.5 text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-2 flex-shrink-0 shadow-sm"
          >
            {roadmapLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
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
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating Roadmap…
              </>
            ) : (
              <>
                <span>Get Career Roadmap</span>
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

      {/* ───── Recommended jobs ───── */}
      <h3 className="text-lg font-semibold text-foreground mt-10 mb-5">
        Recommended jobs
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
          <p className="text-sm text-muted mb-4 animate-pulse">
            Analyzing and ranking jobs with AI…
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
          No jobs found. Try broadening your search.
        </p>
      )}

      {/* Job cards */}
      {!loading && !error && jobs.length > 0 && (
        <div className="space-y-4">
          {jobs.map((job) => {
            const isExpanded = !!expandedJobIds[job.id];
            const isGeneratingThis = generatingLetterId === job.id;

            return (
              <div
                key={job.id}
                className="bg-card border border-border rounded-2xl p-5 sm:p-6 hover:border-accent/30 transition-colors"
              >
                {/* Title + Match Score */}
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <h4 className="text-[15px] font-semibold text-foreground leading-snug">
                    {job.title}
                  </h4>
                  {typeof job.matchScore === "number" && (
                    <MatchBadge score={job.matchScore} />
                  )}
                </div>

                {/* Company */}
                <p className="text-sm text-muted mb-2">{job.company}</p>

                {/* Location + work mode */}
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-xs text-muted/70 flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
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
                  <p className="text-sm text-foreground/75 leading-relaxed mb-3 line-clamp-2">
                    {job.description}
                  </p>
                )}

                {/* Why this matches section */}
                {job.whyMatch && (
                  <div className="bg-accent/5 border border-accent/15 rounded-lg px-3.5 py-2.5 mb-4">
                    <p className="text-xs text-accent/90 leading-relaxed">
                      <span className="font-medium">Why this matches:</span>{" "}
                      {job.whyMatch}
                    </p>
                  </div>
                )}

                {/* Expanded Full Details Section */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border/80 space-y-4 mb-4 animate-in fade-in duration-200">
                    <div>
                      <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
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
                          className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline font-medium"
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
                    className="rounded-lg border border-border text-foreground/90 hover:bg-border/30 hover:border-foreground/30 px-4 py-2 text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5"
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
                    className="rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-60 text-white px-4 py-2 text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    {isGeneratingThis ? (
                      <>
                        <svg
                          className="animate-spin -ml-0.5 mr-1 h-3.5 w-3.5 text-white"
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
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
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
