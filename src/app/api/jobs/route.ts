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
 * Step 1: AI-Powered Query Builder
 * Converts user input into 2-3 targeted job search query strings.
 */
async function generateSearchQueriesWithGemini(
  background: string,
  interests: string,
  apiKey: string
): Promise<string[]> {
  const fallbackQuery = [background, interests].filter(Boolean).join(" ") || "general";

  const prompt = `Based on this person's background and interests, generate 2-3 concise, effective job search query strings that a job search engine like Indeed would understand. Focus on job titles and industry terms, not full sentences.

Person's Background: ${background || "Open"}
Person's Interests: ${interests || "Open"}

Return ONLY valid JSON in this exact shape, with no extra text or markdown:
{ "queries": ["query one", "query two", "query three"] }`;

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
          const validQueries = parsed.queries.filter(
            (q: unknown): q is string => typeof q === "string" && q.trim().length > 0
          );
          if (validQueries.length > 0) {
            console.log("Gemini Generated Job Search Queries:", validQueries);
            return validQueries;
          }
        }
      }
    } catch (err) {
      console.warn(`Query generation attempt with model ${model} failed:`, err);
    }
  }

  // Fallback to raw query
  return [fallbackQuery];
}

/**
 * Step 2: AI-Powered Job Evaluator & Ranker
 * Strictly ranks from the provided pool only - NEVER hallucinates or invents fake jobs.
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
    description: j.description.slice(0, 250),
  }));

  const prompt = `You are an expert career advisor and job matching AI.

User Background / Skills: ${background || "Open background"}
User Interests / Goals: ${interests || "Open interests"}
User Preferred Location: ${location || "Any"}

Here is the exact list of available candidate job listings:
${JSON.stringify(jobSummaries, null, 2)}

Strict Instructions:
1. Only rank and return jobs from the provided list above.
2. Do NOT invent, create, or hallucinate any jobs, companies, or IDs that are not in the input list.
3. If the input list is empty or none match, return an empty array [].
4. Select and rank the TOP 5 most relevant jobs from this list.
5. For each selected job, provide:
   - "id": exact original id string from the input list
   - "matchScore": integer from 0 to 100 representing genuine fit
   - "whyMatch": a customized 1-2 sentence explanation of why this specific job matches the user.

Return ONLY a valid JSON array matching this exact schema with no extra text or markdown formatting:
[
  { "id": "job_id_here", "matchScore": 92, "whyMatch": "Directly matches your background in..." }
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
              temperature: 0.2,
              maxOutputTokens: 1000,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        // Clean markdown code blocks
        let cleaned = rawText.trim();
        if (cleaned.startsWith("```json")) {
          cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "").trim();
        } else if (cleaned.startsWith("```")) {
          cleaned = cleaned.replace(/^```/, "").replace(/```$/, "").trim();
        }

        const parsed: GeminiRankResult[] = JSON.parse(cleaned);

        if (Array.isArray(parsed)) {
          const jobMap = new Map(jobs.map((j) => [j.id, j]));
          const rankedJobs: RawJob[] = [];

          for (const item of parsed) {
            // Anti-hallucination guard: strict validation against original JSearch job IDs
            const original = jobMap.get(item.id);
            if (original) {
              rankedJobs.push({
                ...original,
                matchScore: typeof item.matchScore === "number" ? item.matchScore : 80,
                whyMatch: item.whyMatch || "Matches your profile.",
              });
            } else {
              console.warn(`[Anti-Hallucination] Discarded non-existent job ID returned by Gemini: "${item.id}"`);
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

  // Fallback: return first 5 raw jobs without hallucinating new data
  return jobs.slice(0, 5).map((j, i) => ({
    ...j,
    matchScore: 85 - i * 3,
    whyMatch: `Relevant role matching ${background || "your profile"}.`,
  }));
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const background = searchParams.get("background") || "";
  const interests = searchParams.get("interests") || "";
  const location = searchParams.get("location") || "";

  const jsearchKey = process.env.JSEARCH_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  // 1. Generate 2-3 targeted search queries with Gemini
  let searchQueries: string[] = [];
  if (geminiKey && geminiKey !== "your_key_here") {
    searchQueries = await generateSearchQueriesWithGemini(background, interests, geminiKey);
  } else {
    searchQueries = [[background, interests].filter(Boolean).join(" ") || "jobs"];
  }

  let rawJobs: RawJob[] = [];
  const seenJobKeys = new Set<string>();

  // 2. Fetch real jobs from JSearch for each query and deduplicate
  if (jsearchKey && jsearchKey !== "your_jsearch_api_key_here") {
    for (const query of searchQueries) {
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
            const key = `${(item.job_title || "").toString().toLowerCase().trim()}|${(item.employer_name || "").toString().toLowerCase().trim()}`;
            if (!seenJobKeys.has(key)) {
              seenJobKeys.add(key);
              rawJobs.push({
                id: (item.job_id as string) || String(Math.random()),
                title: (item.job_title as string) || "Untitled Position",
                company: (item.employer_name as string) || "Confidential",
                location:
                  [item.job_city, item.job_state, item.job_country]
                    .filter(Boolean)
                    .join(", ") || (item.job_is_remote ? "Remote" : "Location on request"),
                workMode: item.job_is_remote ? "Remote" : "Onsite",
                description: ((item.job_description as string) || "").slice(0, 300) + "…",
                fullDescription: (item.job_description as string) || "",
                postedDate: (item.job_posted_at_datetime_utc as string) || null,
                applyLink: (item.job_apply_link as string) || null,
              });
            }
          }
        } else {
          console.log(`[JSearch API] Status ${response.status} for query: "${query}" in "${location}"`);
        }
      } catch (err) {
        console.warn(`JSearch query for "${query}" encountered an issue:`, err);
      }
    }
  }

  // Raw JSearch Log Output as requested
  console.log("==================================================");
  console.log(`[Raw JSearch Results] Total jobs returned: ${rawJobs.length}`);
  if (rawJobs.length > 0) {
    console.log(
      "Jobs found:",
      rawJobs.map((j) => ({ title: j.title, company: j.company, location: j.location }))
    );
  } else {
    console.log("No real jobs returned from JSearch API for queries:", searchQueries);
  }
  console.log("==================================================");

  // If JSearch returned 0 jobs, do NOT fabricate or hallucinate fake jobs.
  if (rawJobs.length === 0) {
    return NextResponse.json({ jobs: [] });
  }

  // 3. AI Semantic Ranking & Evaluation
  let finalJobs: RawJob[] = [];
  if (geminiKey && geminiKey !== "your_key_here") {
    finalJobs = await rankJobsWithGemini(rawJobs, background, interests, location, geminiKey);
  } else {
    finalJobs = rawJobs.slice(0, 5).map((j, i) => ({
      ...j,
      matchScore: 90 - i * 5,
      whyMatch: `Relevant role matching your search terms.`,
    }));
  }

  return NextResponse.json({ jobs: finalJobs });
}
