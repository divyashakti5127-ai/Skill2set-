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
  applyLink: string | null;
}

/* ───── Work mode badge ───── */

function WorkModeBadge({ mode }: { mode: string }) {
  return (
    <span className="inline-flex items-center rounded bg-border/60 text-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide">
      {mode}
    </span>
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
          </div>
          <div className="h-3 bg-border rounded w-1/3 mb-4" />
          <div className="space-y-2 mb-4">
            <div className="h-3 bg-border rounded w-full" />
            <div className="h-3 bg-border rounded w-5/6" />
          </div>
          <div className="h-9 bg-border rounded-lg w-28" />
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

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (background) params.set("background", background);
      if (interests) params.set("interests", interests);
      if (location) params.set("location", location);

      try {
        const res = await fetch(`/api/jobs?${params.toString()}`);
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

      {/* ───── Recommended jobs ───── */}
      <h3 className="text-lg font-semibold text-foreground mt-12 mb-5">
        Recommended jobs
      </h3>

      {/* Loading */}
      {loading && (
        <>
          <p className="text-sm text-muted mb-4 animate-pulse">
            Searching jobs…
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
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-card border border-border rounded-2xl p-5 sm:p-6 hover:border-accent/30 transition-colors"
            >
              {/* Title */}
              <h4 className="text-[15px] font-semibold text-foreground leading-snug mb-1.5">
                {job.title}
              </h4>

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

              {/* Description */}
              <p className="text-sm text-foreground/75 leading-relaxed mb-4 line-clamp-2">
                {job.description}
              </p>

              {/* Action */}
              {job.applyLink ? (
                <a
                  href={job.applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-lg bg-accent hover:bg-accent-hover text-white px-4 py-2 text-sm font-medium transition-colors"
                >
                  View details ↗
                </a>
              ) : (
                <button className="rounded-lg bg-accent hover:bg-accent-hover text-white px-4 py-2 text-sm font-medium transition-colors cursor-pointer">
                  View details
                </button>
              )}
            </div>
          ))}
        </div>
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
