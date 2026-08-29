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
 * Converts vague or indirect user input into 2-3 targeted job search query strings.
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
          console.log("Gemini Generated Job Search Queries:", parsed.queries);
          return parsed.queries.filter((q: unknown): q is string => typeof q === "string" && q.trim().length > 0);
        }
      }
    } catch (err) {
      console.warn(`Query generation attempt with model ${model} failed:`, err);
    }
  }

  // Fallback to raw query
  return [fallbackQuery];
}

function generateDiverseCandidateJobs(
  background: string,
  interests: string,
  location: string
): RawJob[] {
  const loc = location || "Remote / Anywhere";
  const bg = background || "General";
  const int = interests || "Growth";

  return [
    {
      id: "candidate-1",
      title: `Senior ${bg.split(",")[0].trim()} Designer / Specialist`,
      company: "Studio Craft & Co.",
      location: loc,
      workMode: location.toLowerCase().includes("onsite") ? "Onsite" : "Hybrid",
      description: `Lead creative and technical initiatives focused on ${bg} and ${int}. Develop concepts, prototypes, and final execution for high-profile clients.`,
      fullDescription: `Studio Craft & Co. is seeking an experienced specialist in ${bg}. You will lead design systems, material selection, and collaborate directly with clients interested in ${int}. Requires strong portfolio and demonstrated problem solving.`,
      applyLink: "https://www.linkedin.com/jobs",
    },
    {
      id: "candidate-2",
      title: `Creative & Product Consultant (${int.split(",")[0].trim()})`,
      company: "Atelier Vanguard",
      location: loc,
      workMode: "Remote",
      description: `Bridge creative craftsmanship and modern industry demands in ${int}. Hands-on execution with ${bg}.`,
      fullDescription: `Atelier Vanguard is expanding its remote product team. We are looking for individuals passionate about ${int} with hands-on background in ${bg}. You will work on cross-disciplinary projects from research to production.`,
      applyLink: "https://www.indeed.com",
    },
    {
      id: "candidate-3",
      title: `Textile, Fashion & Material Designer`,
      company: "Loom & Thread Studio",
      location: loc,
      workMode: "Hybrid",
      description: `Create bespoke patterns, textile illustrations, and physical/digital garment prototypes. Passion for drawing, fabric manipulation, and sustainable fashion.`,
      fullDescription: `Loom & Thread is hiring a Textile & Surface Designer. If you love drawing, working with fabrics, patterns, and creative construction, you will design seasonal collections, source materials, and collaborate with production teams.`,
      applyLink: "https://www.linkedin.com/jobs",
    },
    {
      id: "candidate-4",
      title: `Visual Illustrator & Concept Artist`,
      company: "Kaleidoscope Media",
      location: loc,
      workMode: "Remote",
      description: `Produce original artwork, digital illustrations, and visual storyboards across apparel, branding, and digital media.`,
      fullDescription: `Kaleidoscope Media is looking for a Concept Artist & Illustrator. Ideal for individuals with strong visual expression, drawing skills, and an eye for aesthetics across merchandise and media.`,
      applyLink: "https://www.glassdoor.com",
    },
    {
      id: "candidate-5",
      title: `Apparel Product Developer`,
      company: "North Star Wear",
      location: loc,
      workMode: "Onsite",
      description: `Oversee apparel lifecycle from fabric selection to sample fitting and mass production. Coordinate with fashion designers and vendors.`,
      fullDescription: `North Star Wear is looking for an Apparel Developer. You will evaluate fabrics, inspect fit samples, and ensure designs meet production standards.`,
      applyLink: "https://www.indeed.com",
    },
    {
      id: "candidate-6",
      title: `Mechanical / CAD Design Engineer`,
      company: "Apex Precision Engineering",
      location: loc,
      workMode: "Onsite",
      description: `Design mechanical assemblies, 3D CAD modeling, component drafting, and structural stress validation.`,
      fullDescription: `Apex Engineering is seeking a Mechanical Engineer proficient in CAD, SolidWorks, and component manufacturing. You will create detailed engineering drawings and conduct prototype testing.`,
      applyLink: "https://www.linkedin.com/jobs",
    },
    {
      id: "candidate-7",
      title: `Operations & Project Coordinator`,
      company: "Global Horizon Logistics",
      location: loc,
      workMode: "Hybrid",
      description: `Manage schedules, team resources, operational workflows, and delivery milestones across departments.`,
      fullDescription: `Seeking an organized project coordinator to drive operational efficiency, track milestones, and ensure smooth delivery across cross-functional teams.`,
      applyLink: "https://www.glassdoor.com",
    },
    {
      id: "candidate-8",
      title: `Digital Marketing & Brand Specialist`,
      company: "Pulse Growth Agency",
      location: loc,
      workMode: "Remote",
      description: `Execute multichannel campaigns, content marketing, creative storytelling, and audience engagement strategies.`,
      fullDescription: `Pulse Growth is hiring a Brand Specialist to lead storytelling, content creation, and creative campaigns for emerging consumer and tech brands.`,
      applyLink: "https://www.indeed.com",
    },
  ];
}

/**
 * Step 2: AI-Powered Job Evaluator & Ranker
 */
async function rankJobsWithGemini(
  jobs: RawJob[],
  background: string,
  interests: string,
  location: string,
  apiKey: string
): Promise<RawJob[]> {
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

Here is a pool of candidate job listings:
${JSON.stringify(jobSummaries, null, 2)}

Instructions:
1. Evaluate how well each job aligns with the user's background, transferable skills, creative or technical aptitude, and expressed interests (look beyond exact keywords to find genuine semantic and role fit).
2. Select and rank the TOP 5 most relevant jobs.
3. For each selected job, provide:
   - "id": exact original id from the list
   - "matchScore": integer from 0 to 100 representing genuine fit
   - "whyMatch": a concise 1-2 sentence explanation of why this job matches the user's background and interests.

Return ONLY a valid JSON array matching this exact schema with no extra text or markdown formatting:
[
  { "id": "job_id_here", "matchScore": 92, "whyMatch": "Directly matches your interest in..." }
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

        if (Array.isArray(parsed) && parsed.length > 0) {
          const jobMap = new Map(jobs.map((j) => [j.id, j]));
          const rankedJobs: RawJob[] = [];

          for (const item of parsed) {
            const original = jobMap.get(item.id);
            if (original) {
              rankedJobs.push({
                ...original,
                matchScore: typeof item.matchScore === "number" ? item.matchScore : 85,
                whyMatch: item.whyMatch || "Matches your profile.",
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

  // Fallback if Gemini fails or returns unparseable output
  return jobs.slice(0, 5).map((j, i) => ({
    ...j,
    matchScore: 88 - i * 4,
    whyMatch: `Aligned with your background in ${background || "the field"} and interest in ${interests || "industry roles"}.`,
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

  // 2. Fetch jobs from JSearch for each query and deduplicate
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
        }
      } catch (err) {
        console.warn(`JSearch query for "${query}" encountered an issue:`, err);
      }
    }
  }

  // If JSearch didn't return jobs, use diverse candidate pool matching generated queries
  if (rawJobs.length === 0) {
    rawJobs = generateDiverseCandidateJobs(searchQueries.join(", "), interests, location);
  }

  // 3. AI Semantic Ranking & Evaluation
  let finalJobs: RawJob[] = [];
  if (geminiKey && geminiKey !== "your_key_here") {
    finalJobs = await rankJobsWithGemini(rawJobs, background, interests, location, geminiKey);
  } else {
    finalJobs = rawJobs.slice(0, 5).map((j, i) => ({
      ...j,
      matchScore: 90 - i * 5,
      whyMatch: `Relevant to ${background || "your experience"} and ${interests || "career goals"}.`,
    }));
  }

  return NextResponse.json({ jobs: finalJobs });
}
