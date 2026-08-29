import { Job } from "./mock-jobs";

/**
 * Rank jobs by simple keyword matching against the user's background and interests.
 *
 * - Combines background + interests into a list of lowercase keywords
 * - For each job, checks how many keywords appear as substrings in the
 *   job's title + description + whyMatch (case-insensitive)
 * - Scores start at a base of 60 and gain points per keyword match (capped at 99)
 * - Returns jobs sorted highest-score-first
 * - If no keywords match any job, returns the original array with original scores
 */
export function rankJobs(
  jobs: Job[],
  background: string,
  interests: string
): Job[] {
  // 1. Build keyword list
  const raw = `${background}, ${interests}`;
  const keywords = raw
    .toLowerCase()
    .split(/[,\s]+/)
    .map((k) => k.trim())
    .filter((k) => k.length > 0);

  // No keywords → return original list untouched
  if (keywords.length === 0) {
    return jobs;
  }

  // 2. Score each job
  const BASE_SCORE = 60;
  const POINTS_PER_MATCH = 8;

  const scored = jobs.map((job) => {
    const haystack = `${job.title} ${job.description} ${job.whyMatch}`.toLowerCase();

    let hits = 0;
    for (const kw of keywords) {
      if (haystack.includes(kw)) {
        hits++;
      }
    }

    const dynamicScore = Math.min(BASE_SCORE + hits * POINTS_PER_MATCH, 99);

    return { job, hits, dynamicScore };
  });

  // 3. Check if any job matched at all
  const anyMatch = scored.some((s) => s.hits > 0);

  if (!anyMatch) {
    return jobs;
  }

  // 4. Sort by hits descending, then return with updated scores
  scored.sort((a, b) => b.hits - a.hits);

  return scored.map((s) => ({
    ...s.job,
    matchScore: s.dynamicScore,
  }));
}
