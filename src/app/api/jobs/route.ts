import { NextRequest, NextResponse } from "next/server";

const JSEARCH_API_URL = "https://jsearch.p.rapidapi.com/search";
const GEMINI_MODELS = ["gemini-3.6-flash"];

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
 * Fetch jobs directly from Adzuna API with detailed masked debug logging
 */
async function fetchAdzunaJobs(
  query: string,
  location: string,
  appId: string,
  appKey: string
): Promise<RawJob[]> {
  const country = getCountryCode(location);
  const maskedAppId = appId ? `${appId.slice(0, 4)}...` : "UNDEFINED";
  const maskedAppKey = appKey ? `${appKey.slice(0, 4)}...` : "UNDEFINED";

  console.log("==================================================");
  console.log("[Adzuna Config Runtime]");
  console.log(`process.env.ADZUNA_APP_ID: "${maskedAppId}"`);
  console.log(`process.env.ADZUNA_APP_KEY: "${maskedAppKey}"`);

  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    what: query,
    results_per_page: "10",
    "content-type": "application/json",
  });

  if (location) {
    params.set("where", location);
  }

  const requestUrl = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params.toString()}`;
  const maskedUrl = requestUrl.replace(appKey, maskedAppKey);

  console.log(`[Adzuna Request URL]: ${maskedUrl}`);

  const jobs: RawJob[] = [];

  try {
    const response = await fetch(requestUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    const responseStatus = response.status;
    const responseText = await response.text();

    console.log(`[Adzuna Response Status]: ${responseStatus}`);
    console.log(`[Adzuna Raw Response Body]: ${responseText.slice(0, 500)}${responseText.length > 500 ? "..." : ""}`);
    console.log("==================================================");

    if (response.ok) {
      const data = JSON.parse(responseText);
      const results = data.results || [];
      for (const item of results) {
        jobs.push({
          id: `adzuna-${item.id}`,
          title: item.title ? item.title.replace(/<[^>]*>?/gm, "") : "Untitled",
          company: item.company?.display_name || "Company",
          location: item.location?.display_name || location || "Not specified",
          workMode: item.contract_time === "full_time" ? "Full-time" : "Standard",
          description: (item.description ? item.description.replace(/<[^>]*>?/gm, "").slice(0, 300) : "") + "…",
          fullDescription: item.description ? item.description.replace(/<[^>]*>?/gm, "") : "",
          postedDate: item.created || null,
          applyLink: item.redirect_url || null,
        });
      }
    }
  } catch (err: any) {
    console.error("[Adzuna Fetch Exception]:", err.message || err);
    console.log("==================================================");
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
  const fallbackQuery = [background, interests].filter(Boolean).join(" ") || "general";

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
        console.warn(`[Gemini API] Query generation with ${model} returned ${response.status}: ${errText}`);
      }
    } catch (err) {
      console.warn(`[Gemini API] Query generator attempt with model ${model} failed:`, err);
    }
  }

  console.log("[Gemini Query Generation] Using fallback query:", [fallbackQuery]);
  return [fallbackQuery];
}

/**
 * Fetch real jobs for a single query (tries Adzuna, then JSearch, then Remotive)
 */
async function fetchRealJobsForQuery(
  query: string,
  location: string,
  adzunaAppId?: string,
  adzunaAppKey?: string,
  jsearchKey?: string
): Promise<RawJob[]> {
  let jobs: RawJob[] = [];

  // 1. Try Adzuna API if credentials are provided
  if (adzunaAppId && adzunaAppKey && adzunaAppId !== "your_app_id_here") {
    jobs = await fetchAdzunaJobs(query, location, adzunaAppId, adzunaAppKey);
  }

  // 2. Try JSearch if configured and Adzuna returned 0
  if (jobs.length === 0 && jsearchKey && jsearchKey !== "your_jsearch_api_key_here") {
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

  // 3. If still 0, search live open job feed for the exact query
  if (jobs.length === 0) {
    try {
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
3. Specific Reasoning Rule: Each "whyMatch" must reference SPECIFIC details from that job's actual description/duties (e.g. content creation, script writing, video hosting, software engineering requirements), NOT a generic templated sentence.
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
              console.log(` #${idx + 1} [${r.matchScore}%] "${r.title}" at ${r.company}`);
              console.log(`    Why: ${r.whyMatch}`);
            });
            console.log("==================================================");
            return rankedJobs;
          }
        }
      } else {
        const errText = await response.text();
        console.warn(`[Gemini API] Ranking with ${model} returned ${response.status}: ${errText}`);
      }
    } catch (err) {
      console.warn(`[Gemini API] Ranking attempt with model ${model} failed:`, err);
    }
  }

  // Fallback if ranking fails
  return jobs.slice(0, 5).map((j, i) => ({
    ...j,
    matchScore: 35 - i * 5,
    whyMatch: `Low direct match: This role focuses on ${j.title} duties with limited crossover to ${background || "your stated background"}.`,
  }));
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

  // 2. Fetch real jobs for each query
  for (const query of searchQueries) {
    const queryResults = await fetchRealJobsForQuery(query, location, adzunaAppId, adzunaAppKey, jsearchKey);
    console.log(` -> Query "${query}" returned: ${queryResults.length} real jobs`);

    for (const job of queryResults) {
      const key = `${job.title.toLowerCase().trim()}|${job.company.toLowerCase().trim()}`;
      if (!seenJobKeys.has(key)) {
        seenJobKeys.add(key);
        rawJobs.push(job);
      }
    }
  }

  console.log(`[Search Summary] Total unique real jobs gathered: ${rawJobs.length}`);
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
