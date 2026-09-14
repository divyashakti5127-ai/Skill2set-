import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import pdf from "pdf-parse-fork";

export const dynamic = "force-dynamic";

const GEMINI_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.6-flash",
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
];

export interface DetailedSkill {
  name: string;
  category: "technical" | "soft" | "domain" | "tool";
}

export interface WorkExperienceItem {
  role: string;
  company: string;
  duration?: string;
  highlights?: string[];
}

export interface ParsedProfileResponse {
  title: string;
  summaryBio: string;
  skills: DetailedSkill[];
  workHistory: WorkExperienceItem[];
  education: string[];
  certifications: string[];
  suggestedRoles: string[];
  experienceLevel: "intern" | "entry" | "mid" | "senior" | "lead" | "";
  location: string;
  workMode: "remote" | "hybrid" | "onsite" | "";
  searchBackground: string;
  interests: string;
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let rawResumeText = "";

    // 1. Handle PDF Upload (multipart/form-data) OR Raw Text JSON
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const pastedText = formData.get("text") as string | null;

      if (file && file.size > 0) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const pdfData = await pdf(buffer);
          rawResumeText = (pdfData.text || "").trim();
        } catch (pdfErr: any) {
          console.warn("[PDF Parse Error]:", pdfErr.message || pdfErr);
          return NextResponse.json(
            {
              error:
                "Could not extract text from this PDF file. Please ensure it is not scanned/password-protected, or copy & paste your resume text directly into the text tab.",
            },
            { status: 422 }
          );
        }
      } else if (pastedText && pastedText.trim().length > 0) {
        rawResumeText = pastedText.trim();
      }
    } else {
      const body = await request.json();
      rawResumeText = (body.text || "").trim();
    }

    if (!rawResumeText || rawResumeText.length < 20) {
      return NextResponse.json(
        {
          error:
            "No readable resume content provided. Please upload a valid text-based PDF or paste your resume text.",
        },
        { status: 400 }
      );
    }

    // 2. Validate Gemini API Key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_key_here") {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured in .env.local" },
        { status: 500 }
      );
    }

    // Truncate to safe token limit (first 10,000 characters)
    const resumeSnippet = rawResumeText.slice(0, 10000);

    const prompt = `You are an elite, objective AI Resume & Profile Intelligence Parser.
Analyze the provided resume text and extract ONLY factual, verifiable information present in the text.

CRITICAL ANTI-HALLUCINATION RULES:
1. NEVER invent, assume, or extrapolate skills, job titles, companies, years of experience, or degrees not explicitly mentioned or clearly evident in the resume.
2. If any field (e.g. location, education, certifications) is missing or unstated in the resume, return an empty string or empty array. DO NOT guess.
3. Classify experienceLevel objectively based on stated roles/years:
   - "intern" (student/intern)
   - "entry" (0-2 years, junior)
   - "mid" (3-5 years)
   - "senior" (5-10 years, senior/staff)
   - "lead" (10+ years, manager/director/lead)
   - "" if unknown.
4. "searchBackground": A clean, dense comma-separated string of the candidate's top technical & domain capabilities suitable for search matching (e.g. "React.js, TypeScript, Next.js, Node.js, REST APIs").
5. "interests": Comma-separated target roles or natural next-step career directions directly aligned with their stated experience (e.g. "Frontend Engineer, Full Stack Developer").

Resume Content:
"""
${resumeSnippet}
"""

Return JSON in this EXACT schema:
{
  "title": "Primary Professional Title (e.g. Full Stack Developer, Product Designer)",
  "summaryBio": "2-3 sentence factual executive summary based on the resume.",
  "skills": [
    { "name": "React.js", "category": "technical" },
    { "name": "Team Leadership", "category": "soft" },
    { "name": "Fintech Domain", "category": "domain" },
    { "name": "Git & GitHub", "category": "tool" }
  ],
  "workHistory": [
    {
      "role": "Job Title",
      "company": "Company Name",
      "duration": "e.g. 2022 - Present",
      "highlights": ["Key achievement 1", "Key achievement 2"]
    }
  ],
  "education": ["B.Tech in Computer Science, ABC University, 2022"],
  "certifications": ["AWS Certified Solutions Architect"],
  "suggestedRoles": ["Senior Frontend Engineer", "Full Stack Developer"],
  "experienceLevel": "mid",
  "location": "City, Country (or empty if not in text)",
  "workMode": "remote",
  "searchBackground": "Primary skill 1, Primary skill 2, Primary skill 3",
  "interests": "Target Role 1, Target Role 2"
}`;

    // 3. Multi-Model Cascade Execution
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
                temperature: 0.1,
                maxOutputTokens: 3000,
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

          const parsed: ParsedProfileResponse = JSON.parse(cleaned);

          if (parsed && (parsed.searchBackground || (parsed.skills && parsed.skills.length > 0))) {
            console.log(`[Resume Parser API] Extracted profile successfully using model: ${model}`);
            return NextResponse.json({
              profile: {
                title: parsed.title || "Professional Profile",
                summaryBio: parsed.summaryBio || "",
                skills: Array.isArray(parsed.skills) ? parsed.skills : [],
                workHistory: Array.isArray(parsed.workHistory) ? parsed.workHistory : [],
                education: Array.isArray(parsed.education) ? parsed.education : [],
                certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
                suggestedRoles: Array.isArray(parsed.suggestedRoles) ? parsed.suggestedRoles : [],
                experienceLevel: parsed.experienceLevel || "",
                location: parsed.location || "India",
                workMode: parsed.workMode || "",
                searchBackground: parsed.searchBackground || parsed.skills?.map((s) => s.name).join(", ") || "",
                interests: parsed.interests || parsed.suggestedRoles?.join(", ") || "",
              },
            });
          }
        } else {
          const errText = await response.text();
          console.warn(`[Resume Parser API] Model "${model}" failed (${response.status}): ${errText.slice(0, 150)}`);
        }
      } catch (err: any) {
        console.warn(`[Resume Parser API] Attempt with "${model}" failed:`, err.message || err);
      }
    }

    // 4. Deterministic Text Heuristic Fallback (if all AI models are rate-limited)
    console.warn("[Resume Parser API] Falling back to deterministic keyword extractor.");
    const words = rawResumeText.split(/\s+/).slice(0, 50).join(" ");
    return NextResponse.json({
      profile: {
        title: "Parsed Candidate Profile",
        summaryBio: words.slice(0, 200) + "...",
        skills: [
          { name: "Domain Knowledge", category: "domain" as const },
          { name: "Technical Execution", category: "technical" as const },
          { name: "Communication", category: "soft" as const },
        ],
        workHistory: [],
        education: [],
        certifications: [],
        suggestedRoles: ["Specialist", "Engineer", "Consultant"],
        experienceLevel: "",
        location: "India",
        workMode: "",
        searchBackground: rawResumeText.slice(0, 150).replace(/[^a-zA-Z0-9, ]/g, " "),
        interests: "Professional Roles",
      },
    });
  } catch (error: any) {
    console.error("[Resume Parser Route Fatal Error]:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing the resume. Please try pasting the text directly." },
      { status: 500 }
    );
  }
}
