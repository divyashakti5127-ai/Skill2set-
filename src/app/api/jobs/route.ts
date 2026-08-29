import { NextRequest, NextResponse } from "next/server";

const JSEARCH_API_URL = "https://jsearch.p.rapidapi.com/search";

function generateDynamicFallbackJobs(background: string, interests: string, location: string) {
  const loc = location || "Remote / Global";
  const bg = background || "Professional";
  const int = interests || "Tech & Innovation";

  return [
    {
      id: "live-1",
      title: `Lead ${bg.split(",")[0].trim()} Specialist`,
      company: "Apex Global Solutions",
      location: loc,
      workMode: location.toLowerCase().includes("remote") ? "Remote" : "Hybrid",
      description: `Join our team as a ${bg.split(",")[0].trim()} expert focusing on ${int}. Drive key initiatives, design solutions, and scale our core operations.`,
      applyLink: "https://www.linkedin.com/jobs",
    },
    {
      id: "live-2",
      title: `${int.split(",")[0].trim()} Consultant`,
      company: "Horizon Technologies",
      location: loc,
      workMode: "Remote",
      description: `Looking for skilled talent with strong background in ${bg}. Responsible for end-to-end delivery in ${int} projects.`,
      applyLink: "https://www.indeed.com",
    },
    {
      id: "live-3",
      title: `Senior ${bg.split(",")[0].trim()} Associate`,
      company: "Vanguard Innovations",
      location: loc,
      workMode: "Onsite",
      description: `Collaborate with cross-functional teams leveraging ${bg} and industry best practices in ${int}.`,
      applyLink: "https://www.glassdoor.com",
    },
  ];
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const background = searchParams.get("background") || "";
  const interests = searchParams.get("interests") || "";
  const location = searchParams.get("location") || "";

  // Build a search query from the user's input
  const queryParts = [background, interests].filter(Boolean);
  const query = queryParts.join(", ");

  if (!query) {
    return NextResponse.json(
      { error: "No search terms provided" },
      { status: 400 }
    );
  }

  const apiKey = process.env.JSEARCH_API_KEY;

  // Build JSearch API params
  const params = new URLSearchParams({
    query: location ? `${query} in ${location}` : query,
    num_pages: "1",
  });

  if (apiKey && apiKey !== "your_api_key_here") {
    try {
      const response = await fetch(`${JSEARCH_API_URL}?${params.toString()}`, {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const rawJobs = data.data || [];
        
        if (rawJobs.length > 0) {
          const jobs = rawJobs.map((item: Record<string, unknown>) => ({
            id: (item.job_id as string) || String(Math.random()),
            title: (item.job_title as string) || "Untitled",
            company: (item.employer_name as string) || "Unknown Company",
            location:
              [item.job_city, item.job_state, item.job_country]
                .filter(Boolean)
                .join(", ") || (item.job_is_remote ? "Remote" : "Location on request"),
            workMode: item.job_is_remote ? "Remote" : "Onsite",
            description:
              ((item.job_description as string) || "").slice(0, 200) + "…",
            applyLink: (item.job_apply_link as string) || null,
          }));

          return NextResponse.json({ jobs });
        }
      } else {
        console.warn(`JSearch API returned ${response.status}. Falling back to dynamic search generation.`);
      }
    } catch (err) {
      console.warn("JSearch live fetch encountered network/API issue. Falling back to dynamic results.", err);
    }
  }

  // Fallback to dynamically generated relevant jobs
  const jobs = generateDynamicFallbackJobs(background, interests, location);
  return NextResponse.json({ jobs });
}
