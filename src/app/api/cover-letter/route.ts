import { NextRequest, NextResponse } from "next/server";

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

    const prompt = `You are a professional career coach and copywriter.
Write a personalized, compelling, and natural first-person cover letter under 250 words for this job application.

Applicant Background / Skills: ${background || "Experienced professional"}
Applicant Interests: ${interests || "Industry innovation and growth"}
Target Job Title: ${jobTitle}
Company: ${company}
Job Description Context: ${jobDescription ? jobDescription.slice(0, 500) : "Relevant industry position"}

Structure requirements:
1. Short engaging opening referencing the specific role (${jobTitle}) and company (${company}).
2. 2-3 concise paragraphs connecting the applicant's background and interests directly to the job requirements.
3. A polite, confident closing and call to action.

Formatting: Output only the cover letter text ready to send. No markdown headings, placeholders like [Your Name] are fine at the bottom. Keep it under 250 words.`;

    const models = ["gemini-2.5-flash", "gemini-1.5-flash"];
    let letter = "";
    let lastError = "";

    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 600,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const generatedText =
            data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText) {
            letter = generatedText.trim();
            break;
          }
        } else {
          const errorData = await response.text();
          lastError = `Model ${model} returned ${response.status}: ${errorData}`;
        }
      } catch (err: any) {
        lastError = err.message || "Fetch failed";
      }
    }

    if (!letter) {
      console.warn("Gemini API call failed, generating backup cover letter.", lastError);
      // Fallback generator in case of network/quota issues
      letter = `Dear Hiring Team at ${company},

I am writing to express my strong enthusiasm for the ${jobTitle} position at ${company}. Having followed ${company}'s work and impact, I am eager to bring my background and dedication to your team.

My experience with ${background || "key industry skills"} and passion for ${interests || "driving impact"} align closely with the responsibilities of this role. I thrive on collaborating with cross-functional teams, solving challenging problems, and delivering scalable solutions that create measurable value.

I would welcome the opportunity to discuss how my background and skill set can support ${company}'s upcoming goals. Thank you for your time and consideration.

Sincerely,
[Your Name]`;
    }

    return NextResponse.json({ coverLetter: letter });
  } catch (error: any) {
    console.error("Cover letter generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate cover letter. Please try again." },
      { status: 500 }
    );
  }
}
