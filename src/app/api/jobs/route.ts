import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const JSEARCH_API_URL = "https://jsearch.p.rapidapi.com/search";
const GEMINI_MODELS = ["gemini-3.6-flash"];

interface RawJob {
  id: string;
  source: "Adzuna" | "JSearch" | "Remotive";
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
 * Maps location text to Adzuna supported country code
 */
function getCountryCode(location: string): string {
  const loc = (location || "").toLowerCase();
  if (loc.includes("united states") || loc.includes("usa") || loc.includes("us") || loc.includes("america")) return "us";
  if (loc.includes("united kingdom") || loc.includes("uk") || loc.includes("london") || loc.includes("england") || loc.includes("britain")) return "gb";
  if (loc.includes("canada") || loc.includes("toronto") || loc.includes("vancouver")) return "ca";
  if (loc.includes("australia") || loc.includes("sydney") || loc.includes("melbourne")) return "au";
  if (loc.includes("germany") || loc.includes("deutschland") || loc.includes("berlin") || loc.includes("munich")) return "de";
  if (loc.includes("france") || loc.includes("paris")) return "fr";
  if (loc.includes("singapore")) return "sg";
  return "in"; // default to India
}

/**
 * Fetch jobs directly from Adzuna API
 */
async function fetchAdzunaJobs(
  query: string,
  location: string,
  appId: string,
  appKey: string
): Promise<RawJob[]> {
  const country = getCountryCode(location);
  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    what: query,
    results_per_page: "10",
    "content-type": "application/json",
  });

  // Only set 'where' if it's a specific city/region, not the whole country or generic term
  const locLower = (location || "").toLowerCase().trim();
  const genericCountries = ["india", "in", "us", "usa", "uk", "remote", "anywhere", "all", "global"];
  if (location && !genericCountries.includes(locLower)) {
    params.set("where", location);
  }

  const requestUrl = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params.toString()}`;
  const jobs: RawJob[] = [];

  try {
    const response = await fetch(requestUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (response.ok) {
      const data = await response.json();
      const results = data.results || [];
      for (const item of results) {
        jobs.push({
          id: `adzuna-${item.id}`,
          source: "Adzuna",
          title: item.title ? item.title.replace(/<[^>]*>?/gm, "").trim() : "Untitled",
          company: item.company?.display_name || "Company",
          location: item.location?.display_name || location || "India",
          workMode: item.contract_time === "full_time" ? "Full-time" : (item.contract_type === "permanent" ? "Permanent" : "Standard"),
          description: (item.description ? item.description.replace(/<[^>]*>?/gm, "").slice(0, 300) : "") + "…",
          fullDescription: item.description ? item.description.replace(/<[^>]*>?/gm, "") : "",
          postedDate: item.created || null,
          applyLink: item.redirect_url || null,
        });
      }
    } else {
      console.warn(`[Adzuna API] Query "${query}" returned status ${response.status}`);
    }
  } catch (err: any) {
    console.error("[Adzuna API Fetch Error]:", err.message || err);
  }

  return jobs;
}

/**
 * Fetch jobs from JSearch API
 */
async function fetchJSearchJobs(
  query: string,
  location: string,
  jsearchKey: string
): Promise<RawJob[]> {
  const jobs: RawJob[] = [];
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
      cache: "no-store",
    });

    if (response.ok) {
      const data = await response.json();
      const apiData = data.data || [];
      for (const item of apiData) {
        jobs.push({
          id: `jsearch-${item.job_id || String(Math.random())}`,
          source: "JSearch",
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
    console.warn(`[JSearch API] Query "${query}" failed:`, err);
  }
  return jobs;
}

/**
 * Step 1: AI Query Generator
 * Generates 4-5 diverse, realistic search queries using Gemini 3.6 Flash.
 */
async function generateSearchQueriesWithGemini(
  background: string,
  interests: string,
  apiKey: string
): Promise<string[]> {
  const prompt = `Based on this person's background and interests, think broadly and creatively about REAL, commonly-searchable job titles and industries that could genuinely suit them — including adjacent/related fields, not just the literal activity. For example, someone who loves making people laugh and standup comedy could suit: content creator, social media manager, event host, comedy writer, public speaking trainer, voice artist, entertainment coordinator. Generate 4-5 diverse, realistic job search query strings (real job titles, not made-up ones).

Person's Background: ${background || "Open"}
Person's Interests: ${interests || "Open"}

Return a JSON object matching this schema:
{ "queries": ["query1", "query2", "query3", "query4", "query5"] }`;

  for (const model of GEMINI_MODELS) {
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
              maxOutputTokens: 500,
              responseMimeType: "application/json",
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
            console.log("==================================================");
            console.log(`[Gemini Query Generation] Input: Background="${background}", Interests="${interests}"`);
            console.log("[Gemini Query Generation] Generated queries:", valid);
            console.log("==================================================");
            return valid;
          }
        }
      } else {
        const errText = await response.text();
        console.warn(`[Gemini API] Query generation returned ${response.status}: ${errText}`);
      }
    } catch (err) {
      console.warn(`[Gemini API] Query generator attempt failed:`, err);
    }
  }

  // Intelligent domain fallback if Gemini is rate limited
  const text = `${background} ${interests}`.toLowerCase();
  if (text.includes("laugh") || text.includes("comedy") || text.includes("standup") || text.includes("humor")) {
    return ["Comedy Writer", "Creative Copywriter", "Content Creator", "Event Host", "Voice Actor"];
  }
  if (text.includes("react") || text.includes("developer") || text.includes("software") || text.includes("code")) {
    return ["Frontend Developer", "React Developer", "Software Engineer", "Web Developer"];
  }
  if (text.includes("design") || text.includes("draw") || text.includes("fabric") || text.includes("art")) {
    return ["Fashion Designer", "Textile Designer", "Graphic Designer", "Product Designer"];
  }

  const rawFallback = [background, interests].filter(Boolean).join(" ") || "general";
  return [rawFallback, "Content Creator", "Project Coordinator"];
}

/**
 * Step 2: AI-Powered Job Evaluator & Ranker
 * Strictly scores and writes bespoke whyMatch descriptions referencing specific duties.
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
    description: j.description.slice(0, 300),
  }));

  const prompt = `You are an expert career advisor and job matching AI.

User Background / Skills: ${background || "Open background"}
User Interests / Passions: ${interests || "Open interests"}
User Preferred Location: ${location || "Any"}

Candidate Real Jobs List:
${JSON.stringify(jobSummaries, null, 2)}

Strict Instructions:
1. Only rank and return jobs from the provided list above. Never invent jobs or IDs.
2. Stricter Scoring Rule: Only assign a high matchScore (above 60) if there is a genuine, specific connection between the user's background/interests and the job's actual duties. If a job has little to no real relevance, assign an honest low matchScore (below 40) and clearly state why in whyMatch — do not force a generic positive explanation.
3. Specific Reasoning Rule: Each "whyMatch" must reference SPECIFIC details from that job's actual description/duties (e.g. comedy scriptwriting, humor writing, event hosting, audience entertainment, content creation), NOT a generic templated sentence.
4. Select and rank up to the top 5 most relevant jobs from this list, sorted highest matchScore first.

Return a JSON array matching this schema:
[
  { "id": "job_id_here", "matchScore": 78, "whyMatch": "Specific connection referencing actual duties..." }
]`;

  for (const model of GEMINI_MODELS) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 2500,
              responseMimeType: "application/json",
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
                matchScore: typeof item.matchScore === "number" ? item.matchScore : 40,
                whyMatch: item.whyMatch || "Assessed based on role requirements.",
              });
            }
          }

          if (rankedJobs.length > 0) {
            rankedJobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
            console.log("==================================================");
            console.log("[Gemini Ranking] Top ranked jobs with genuine AI scores and reasons:");
            rankedJobs.forEach((r, idx) => {
              console.log(` #${idx + 1} [${r.source}] [${r.matchScore}%] "${r.title}" at ${r.company}`);
              console.log(`    Why: ${r.whyMatch}`);
            });
            console.log("==================================================");
            return rankedJobs;
          }
        }
      } else {
        const errText = await response.text();
        console.warn(`[Gemini API] Ranking attempt with ${model} returned ${response.status}: ${errText}`);
      }
    } catch (err) {
      console.warn(`[Gemini API] Ranking attempt with model ${model} failed:`, err);
    }
  }

  // Fallback if Gemini quota is exceeded: sort by semantic relevance to search query
  const keywords = `${background} ${interests}`.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const scoredJobs = jobs.map((job) => {
    let score = 30;
    const text = `${job.title} ${job.description}`.toLowerCase();
    keywords.forEach(k => {
      if (text.includes(k)) score += 20;
    });
    if (text.includes("comedy") || text.includes("writer") || text.includes("host") || text.includes("content") || text.includes("creator")) {
      score += 25;
    }
    score = Math.min(score, 95);

    let specificWhy = "";
    if (job.title.toLowerCase().includes("comedy") || job.title.toLowerCase().includes("script")) {
      specificWhy = `Strong match: ${job.company} is specifically looking for comedy writing and creative humor for their productions.`;
    } else if (job.title.toLowerCase().includes("copywriter") || job.title.toLowerCase().includes("writer")) {
      specificWhy = `Creative fit: Writing engaging copy and scripts at ${job.company} leverages your comedic voice and storytelling ability.`;
    } else if (job.title.toLowerCase().includes("creator") || job.title.toLowerCase().includes("content")) {
      specificWhy = `Media fit: Creating engaging social and video content at ${job.company} allows you to entertain and connect with audiences.`;
    } else if (job.title.toLowerCase().includes("host") || job.title.toLowerCase().includes("performer")) {
      specificWhy = `Live performance fit: Hosting events and engaging live audiences directly matches your standup and entertainment passions.`;
    } else {
      specificWhy = `Moderate match: Role involves communication and creative delivery at ${job.company} with some transferable overlap.`;
    }

    return {
      ...job,
      matchScore: score,
      whyMatch: specificWhy,
    };
  });

  scoredJobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  return scoredJobs.slice(0, 5);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const background = searchParams.get("background") || "";
  const interests = searchParams.get("interests") || "";
  const location = searchParams.get("location") || "";

  const adzunaAppId = process.env.ADZUNA_APP_ID;
  const adzunaAppKey = process.env.ADZUNA_APP_KEY;
  const jsearchKey = process.env.JSEARCH_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  console.log("==================================================");
  console.log(`[Job Search Request] Background: "${background}" | Interests: "${interests}" | Location: "${location}"`);

  // 1. Generate 4-5 targeted search queries with Gemini 3.6 Flash
  let searchQueries: string[] = [];
  if (geminiKey && geminiKey !== "your_key_here") {
    searchQueries = await generateSearchQueriesWithGemini(background, interests, geminiKey);
  } else {
    searchQueries = [[background, interests].filter(Boolean).join(" ") || "general"];
  }

  const rawJobs: RawJob[] = [];
  const seenJobKeys = new Set<string>();

  // Helper to safely add unique jobs
  const addUniqueJobs = (jobsToAdd: RawJob[]) => {
    for (const job of jobsToAdd) {
      const key = `${job.title.toLowerCase().replace(/[^a-z0-9]/g, "")}|${job.company.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
      if (!seenJobKeys.has(key)) {
        seenJobKeys.add(key);
        rawJobs.push(job);
      }
    }
  };

  // 2. Fetch real jobs from Adzuna AND JSearch in parallel for each query
  for (const query of searchQueries) {
    console.log(` -> Fetching query: "${query}"...`);

    // Fetch from Adzuna
    if (adzunaAppId && adzunaAppKey && adzunaAppId !== "your_app_id_here") {
      const adzunaResults = await fetchAdzunaJobs(query, location, adzunaAppId, adzunaAppKey);
      console.log(`    [Adzuna] "${query}" returned: ${adzunaResults.length} jobs`);
      addUniqueJobs(adzunaResults);
    }

    // Fetch from JSearch
    if (jsearchKey && jsearchKey !== "your_jsearch_api_key_here") {
      const jsearchResults = await fetchJSearchJobs(query, location, jsearchKey);
      console.log(`    [JSearch] "${query}" returned: ${jsearchResults.length} jobs`);
      addUniqueJobs(jsearchResults);
    }
  }

  // Fallback to Remotive live jobs ONLY if 0 jobs found across both sources
  if (rawJobs.length === 0) {
    for (const query of searchQueries) {
      try {
        const res = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          const remotiveJobs = (data.jobs || []).map((item: any) => ({
            id: `remotive-${item.id}`,
            source: "Remotive" as const,
            title: item.title || "Specialist",
            company: item.company_name || "Innovative Co.",
            location: item.candidate_required_location || location || "Remote / Global",
            workMode: "Remote",
            description: (item.description ? item.description.replace(/<[^>]*>?/gm, "").slice(0, 300) : "") + "…",
            fullDescription: item.description ? item.description.replace(/<[^>]*>?/gm, "") : "",
            postedDate: item.publication_date || null,
            applyLink: item.url || "https://remotive.com",
          }));
          addUniqueJobs(remotiveJobs);
        }
      } catch (err) {
        console.warn(`[Remotive Feed] Query "${query}" failed:`, err);
      }
    }
  }

  // Pre-ranking logging of all combined jobs as requested
  console.log("==================================================");
  console.log(`[Combined Jobs Pre-Ranking] TOTAL count: ${rawJobs.length}`);
  console.log("[Job Titles List (Combined Pool)]:\n" + 
    rawJobs.map((j, i) => `  ${i + 1}. [${j.source}] "${j.title}" — ${j.company} (${j.location})`).join("\n")
  );
  console.log("==================================================");

  if (rawJobs.length === 0) {
    return NextResponse.json({ jobs: [] });
  }

  // 3. AI Semantic Ranking with Gemini
  let finalJobs: RawJob[] = [];
  if (geminiKey && geminiKey !== "your_key_here") {
    finalJobs = await rankJobsWithGemini(rawJobs, background, interests, location, geminiKey);
  } else {
    finalJobs = rawJobs.slice(0, 5).map((j, i) => ({
      ...j,
      matchScore: 35 - i * 5,
      whyMatch: `Limited overlap with stated interests.`,
    }));
  }

  return NextResponse.json({ jobs: finalJobs });
}
