import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GEMINI_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.6-flash",
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
];

interface ApplicationKitResponse {
  coverLetter: string;
  resumeHeadline: string;
  resumeBullets: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobTitle, company, jobDescription, background, interests } = body;

    if (!jobTitle || !company) {
      return NextResponse.json(
        { error: "Job title and company name are required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_key_here") {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured in .env.local" },
        { status: 500 }
      );
    }

    const prompt = `You are an elite career strategist, executive resume writer, and hiring consultant.
Generate a tailored "Application Kit" for this job application in India/Global market.

Applicant Background & Skills: "${background || "Experienced professional"}"
Applicant Passions & Interests: "${interests || "Industry innovation and growth"}"
Target Role: "${jobTitle}"
Target Company: "${company}"
Job Description / Context: "${(jobDescription || "").slice(0, 600)}"

Instructions:
1. Cover Letter: A personalized, confident, and natural first-person cover letter under 250 words.
   - Hook the hiring manager with enthusiasm for ${company}.
   - Connect the applicant's real skills & passions directly to this role's specific challenges.
   - Professional closing with call to action.
2. Resume Headline: A punchy 1-line professional title/tagline positioning the applicant perfectly for this role.
3. Resume Bullet Points: 3 to 5 high-impact, action-oriented bullet points (STAR method: Action verb + Context + Measurable Result/Impact) showcasing how the candidate's background solves ${company}'s needs.

Return JSON in this exact structure:
{
  "coverLetter": "Dear Hiring Team at ${company},\\n\\n...",
  "resumeHeadline": "Results-Driven ${jobTitle} | Specializing in ...",
  "resumeBullets": [
    "Spearheaded ... resulting in 30% increase in ...",
    "Leveraged background in ... to streamline ...",
    "Architected and delivered ... with cross-functional teams"
  ]
}`;

    let result: ApplicationKitResponse | null = null;
    let lastError = "";

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
                temperature: 0.4,
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

          const parsed = JSON.parse(cleaned);
          if (parsed.coverLetter && Array.isArray(parsed.resumeBullets)) {
            result = {
              coverLetter: parsed.coverLetter.trim(),
              resumeHeadline: parsed.resumeHeadline?.trim() || `${jobTitle} Specialist`,
              resumeBullets: parsed.resumeBullets.map((b: string) => b.trim()),
            };
            console.log(`[Application Kit API] Generated successfully with model: ${model}`);
            break;
          }
        } else {
          const errorData = await response.text();
          lastError = `Model ${model} returned ${response.status}: ${errorData.slice(0, 150)}`;
          console.warn(`[Application Kit API] ${lastError}`);
        }
      } catch (err: any) {
        lastError = err.message || "Fetch failed";
        console.warn(`[Application Kit API] Error with ${model}:`, lastError);
      }
    }

    // Fallback if Gemini failed
    if (!result) {
      console.warn("Gemini call failed, generating dynamic fallback application kit.");
      const bgCore = background.split(",")[0]?.trim() || "Industry Experience";
      result = {
        coverLetter: `Dear Hiring Team at ${company},

I am excited to apply for the ${jobTitle} position at ${company}. With a solid foundation in ${bgCore} and a passion for ${interests || "delivering high-impact work"}, I have developed a strong track record of driving results and solving complex challenges.

Throughout my work, I have focused on combining hands-on technical execution with proactive communication. I am particularly impressed by ${company}'s current initiatives and look forward to contributing my expertise to help accelerate your team's key goals.

Thank you for your consideration, and I look forward to the opportunity to speak further.

Sincerely,
[Your Name]`,
        resumeHeadline: `${jobTitle} | Background in ${bgCore} & Creative Problem Solving`,
        resumeBullets: [
          `Leveraged ${bgCore} expertise to design and execute core deliverables aligned with strategic milestones.`,
          `Partnered closely with cross-functional stakeholders to optimize workflows and reduce turnaround time.`,
          `Applied strong analytical and problem-solving skills to overcome project bottlenecks and maintain high quality standards.`,
          `Demonstrated rapid adaptability and continuous learning across modern tools and emerging industry practices.`,
        ],
      };
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Application kit generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate application kit. Please try again." },
      { status: 500 }
    );
  }
}
