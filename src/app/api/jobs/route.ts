import { NextRequest, NextResponse } from "next/server";

const JSEARCH_API_URL = "https://jsearch.p.rapidapi.com/search";

interface RawJob {
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

interface GeminiRankResult {
  id: string;
  matchScore: number;
  whyMatch: string;
}

/**
 * Step 1: AI Query Generator (Initial 4-5 Creative/Adjacent Queries)
 */
async function generateSearchQueriesWithGemini(
  background: string,
  interests: string,
  apiKey: string
): Promise<string[]> {
  const fallbackQuery = [background, interests].filter(Boolean).join(" ") || "general";

  const prompt = `Based on this person's background and interests, think broadly and creatively about REAL, commonly-searchable job titles and industries that could genuinely suit them — including adjacent/related fields, not just the literal activity. For example, someone who loves making people laugh and standup comedy could suit: content creator, social media manager, event host, comedy writer, public speaking trainer, voice artist, entertainment coordinator. Generate 4-5 diverse, realistic job search query strings (real job titles, not made-up ones).

Person's Background: ${background || "Open"}
Person's Interests: ${interests || "Open"}

Return ONLY valid JSON in this exact shape, with no extra text or markdown:
{ "queries": ["query1", "query2", "query3", "query4", "query5"] }`;

  const models = ["gemini-2.5-flash", "gemini-1.5-flash"];

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 300,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        let cleaned = rawText.trim();
        if (cleaned.startsWith("```json")) {
          cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "").trim();
        } else if (cleaned.startsWith("```")) {
          cleaned = cleaned.replace(/^```/, "").replace(/```$/, "").trim();
        }

        const parsed = JSON.parse(cleaned);
        if (parsed && Array.isArray(parsed.queries) && parsed.queries.length > 0) {
          const valid = parsed.queries.filter(
            (q: unknown): q is string => typeof q === "string" && q.trim().length > 0
          );
          if (valid.length > 0) {
            return valid;
          }
        }
      }
    } catch (err) {
      console.warn(`Query generator attempt with model ${model} failed:`, err);
    }
  }

  return [fallbackQuery, "content creator", "marketing coordinator", "event manager"];
}

/**
 * Step 1b: Secondary Broader Query Generator (if initial results < 3)
 */
async function generateBroaderQueriesWithGemini(
  background: string,
  interests: string,
  apiKey: string
): Promise<string[]> {
  const prompt = `The previous searches found limited results for someone with this background and interests.
Suggest 3 more general/adjacent career fields and realistic job titles for someone with this background, focusing on transferable skills (e.g. communication, creative presentation, audience engagement, operations).

Person's Background: ${background || "Open"}
Person's Interests: ${interests || "Open"}

Return ONLY valid JSON in this shape, with no markdown:
{ "queries": ["broader query 1", "broader query 2", "broader query 3"] }`;

  const models = ["gemini-2.5-flash", "gemini-1.5-flash"];

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.5,
              maxOutputTokens: 200,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        let cleaned = rawText.trim();
        if (cleaned.startsWith("```json")) {
          cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "").trim();
        } else if (cleaned.startsWith("```")) {
          cleaned = cleaned.replace(/^```/, "").replace(/```$/, "").trim();
        }

        const parsed = JSON.parse(cleaned);
        if (parsed && Array.isArray(parsed.queries) && parsed.queries.length > 0) {
          return parsed.queries.filter(
            (q: unknown): q is string => typeof q === "string" && q.trim().length > 0
          );
        }
      }
    } catch (err) {
      console.warn(`Broader query generator attempt with model ${model} failed:`, err);
    }
  }

  return ["creative specialist", "media associate", "communications manager"];
}

/**
 * Fetch real jobs for a single query from JSearch (with live open-job feed fallback)
 */
async function fetchRealJobsForQuery(
  query: string,
  location: string,
  jsearchKey?: string
): Promise<RawJob[]> {
  const jobs: RawJob[] = [];

  // 1. Try JSearch if configured
  if (jsearchKey && jsearchKey !== "your_jsearch_api_key_here") {
    try {
      const params = new URLSearchParams({
        query: location ? `${query} in ${location}` : query,
        num_pages: "1",
        date_posted: "all",
      });

      const response = await fetch(`${JSEARCH_API_URL}?${params.toString()}`, {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": jsearchKey,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const apiData = data.data || [];
        for (const item of apiData) {
          jobs.push({
            id: (item.job_id as string) || String(Math.random()),
            title: (item.job_title as string) || "Untitled Position",
            company: (item.employer_name as string) || "Confidential",
            location:
              [item.job_city, item.job_state, item.job_country]
                .filter(Boolean)
                .join(", ") || (item.job_is_remote ? "Remote" : (location || "Location on request")),
            workMode: item.job_is_remote ? "Remote" : "Onsite",
            description: ((item.job_description as string) || "").slice(0, 300) + "…",
            fullDescription: (item.job_description as string) || "",
            postedDate: (item.job_posted_at_datetime_utc as string) || null,
            applyLink: (item.job_apply_link as string) || null,
          });
        }
      }
    } catch (err) {
      console.warn(`JSearch query for "${query}" failed:`, err);
    }
  }

  // 2. If JSearch returned 0 (e.g. rate limit/unsubscribed), fetch real live jobs from verified public job feeds
  if (jobs.length === 0) {
    try {
      // Remotive public live jobs endpoint
      const res = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}&limit=6`);
      if (res.ok) {
        const data = await res.json();
        const remotiveJobs = data.jobs || [];
        for (const item of remotiveJobs) {
          jobs.push({
            id: `remotive-${item.id}`,
            title: item.title || "Specialist",
            company: item.company_name || "Innovative Co.",
            location: item.candidate_required_location || location || "Remote / Global",
            workMode: "Remote",
            description: (item.description ? item.description.replace(/<[^>]*>?/gm, "").slice(0, 300) : "") + "…",
            fullDescription: item.description ? item.description.replace(/<[^>]*>?/gm, "") : "",
            postedDate: item.publication_date || null,
            applyLink: item.url || "https://remotive.com",
          });
        }
      }
    } catch (err) {
      console.warn(`Live feed query for "${query}" failed:`, err);
    }
  }

  return jobs;
}

/**
 * Step 3: AI-Powered Job Evaluator & Ranker
 * Strictly ranks provided real jobs and crafts bespoke whyMatch explanations per job.
 */
async function rankJobsWithGemini(
  jobs: RawJob[],
  background: string,
  interests: string,
  location: string,
  apiKey: string
): Promise<RawJob[]> {
  if (!jobs || jobs.length === 0) {
    return [];
  }

  const jobSummaries = jobs.map((j) => ({
    id: j.id,
    title: j.title,
    company: j.company,
    location: j.location,
    description: j.description.slice(0, 280),
  }));

  const prompt = `You are an expert career advisor and job matching AI.

User Background / Traits: ${background || "Open background"}
User Interests / Passions: ${interests || "Open interests"}
User Preferred Location: ${location || "Any"}

Candidate Real Jobs:
${JSON.stringify(jobSummaries, null, 2)}

Strict Instructions:
1. Only rank and return jobs from the provided list above. Never invent jobs, companies, or IDs.
2. Evaluate transferable skills, creative storytelling, presentation, audience engagement, domain interest, or technical fit.
3. Select and rank the TOP 5 most relevant jobs from this list.
4. For EACH selected job, write a distinct, bespoke "whyMatch" explanation (1-2 sentences) showing specifically how this particular role connects to the user's background and passions (do NOT use identical or generic template text).
5. Assign a genuine "matchScore" from 0 to 100.

Return ONLY a valid JSON array:
[
  { "id": "job_id_here", "matchScore": 88, "whyMatch": "Specific connection to role..." }
]`;

  const models = ["gemini-2.5-flash", "gemini-1.5-flash"];

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1200,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        let cleaned = rawText.trim();
        if (cleaned.startsWith("```json")) {
          cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "").trim();
        } else if (cleaned.startsWith("```")) {
          cleaned = cleaned.replace(/^```/, "").replace(/```$/, "").trim();
        }

        const parsed: GeminiRankResult[] = JSON.parse(cleaned);

        if (Array.isArray(parsed) && parsed.length > 0) {
          const jobMap = new Map(jobs.map((j) => [j.id, j]));
          const rankedJobs: RawJob[] = [];

          for (const item of parsed) {
            const original = jobMap.get(item.id);
            if (original) {
              rankedJobs.push({
                ...original,
                matchScore: typeof item.matchScore === "number" ? item.matchScore : 82,
                whyMatch: item.whyMatch || `Connects with your focus in ${interests || background}.`,
              });
            }
          }

          if (rankedJobs.length > 0) {
            rankedJobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
            return rankedJobs;
          }
        }
      }
    } catch (err) {
      console.warn(`Gemini ranking attempt with model ${model} failed:`, err);
    }
  }

  // Fallback if ranking fails: return top jobs with individualized whyMatch
  return jobs.slice(0, 5).map((j, i) => ({
    ...j,
    matchScore: 86 - i * 3,
    whyMatch: `Your experience and interest in ${interests || background} provide transferable skills for this ${j.title} role at ${j.company}.`,
  }));
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const background = searchParams.get("background") || "";
  const interests = searchParams.get("interests") || "";
  const location = searchParams.get("location") || "";

  const jsearchKey = process.env.JSEARCH_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  console.log("==================================================");
  console.log(`[Job Search Request] Background: "${background}" | Interests: "${interests}" | Location: "${location}"`);

  // 1. Initial 4-5 diverse/adjacent search queries with Gemini
  let initialQueries: string[] = [];
  if (geminiKey && geminiKey !== "your_key_here") {
    initialQueries = await generateSearchQueriesWithGemini(background, interests, geminiKey);
  } else {
    initialQueries = [[background, interests].filter(Boolean).join(" ") || "general"];
  }

  console.log(`[Pass 1 Queries Generated (${initialQueries.length})]:`, initialQueries);

  const rawJobs: RawJob[] = [];
  const seenJobKeys = new Set<string>();
  let queriesAttemptedCount = 0;

  // Execute Pass 1 Queries
  for (const query of initialQueries) {
    queriesAttemptedCount++;
    const queryResults = await fetchRealJobsForQuery(query, location, jsearchKey);
    console.log(` -> Query #${queriesAttemptedCount} ("${query}") returned: ${queryResults.length} real jobs`);

    for (const job of queryResults) {
      const key = `${job.title.toLowerCase().trim()}|${job.company.toLowerCase().trim()}`;
      if (!seenJobKeys.has(key)) {
        seenJobKeys.add(key);
        rawJobs.push(job);
      }
    }
  }

  // 2. If results are limited (< 3 jobs), execute Pass 2 with 3 broader adjacent queries
  if (rawJobs.length < 3 && geminiKey && geminiKey !== "your_key_here") {
    console.log(`[Pass 2 Triggered] Only ${rawJobs.length} jobs found. Generating broader transferable skill queries...`);
    const broaderQueries = await generateBroaderQueriesWithGemini(background, interests, geminiKey);
    console.log(`[Pass 2 Queries Generated (${broaderQueries.length})]:`, broaderQueries);

    for (const query of broaderQueries) {
      queriesAttemptedCount++;
      const queryResults = await fetchRealJobsForQuery(query, location, jsearchKey);
      console.log(` -> Broader Query #${queriesAttemptedCount} ("${query}") returned: ${queryResults.length} real jobs`);

      for (const job of queryResults) {
        const key = `${job.title.toLowerCase().trim()}|${job.company.toLowerCase().trim()}`;
        if (!seenJobKeys.has(key)) {
          seenJobKeys.add(key);
          rawJobs.push(job);
        }
      }
    }
  }

  console.log(`[Search Summary] Total queries attempted: ${queriesAttemptedCount} | Total unique real jobs gathered: ${rawJobs.length}`);
  console.log("==================================================");

  // If after 7-8 broadened queries genuinely 0 real jobs were found:
  if (rawJobs.length === 0) {
    return NextResponse.json({ jobs: [] });
  }

  // 3. AI Semantic Ranking & Custom whyMatch Generation
  let finalJobs: RawJob[] = [];
  if (geminiKey && geminiKey !== "your_key_here") {
    finalJobs = await rankJobsWithGemini(rawJobs, background, interests, location, geminiKey);
  } else {
    finalJobs = rawJobs.slice(0, 5).map((j, i) => ({
      ...j,
      matchScore: 88 - i * 4,
      whyMatch: `Matches your skills in ${background} and interests in ${interests}.`,
    }));
  }

  return NextResponse.json({ jobs: finalJobs });
}
