import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-3.6-flash", "gemini-2.5-flash-lite"];

interface RoadmapResponse {
  overview: string;
  gettingStarted: string[];
  whereToFind: string[];
  monetization: string[];
  timeline: string;
  encouragement: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { background, interests, location } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_key_here") {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const field = interests || background || "this creative field";
    const loc = location || "India";

    const prompt = `The user has this background: '${background || "Self-taught / Passionate"}' and interest: '${field}', located in ${loc}, India. This may be a passion, craft, or skill that isn't traditionally seen as a standard corporate career path in India.

Generate a detailed, highly specific, realistic, and encouraging career roadmap for building an income and sustainable career around '${field}' in India today.

Structure the response as a JSON object with these exact keys:
1. "overview": 2-3 sentences on the realistic market potential, creator/freelance economy outlook, and opportunities for '${field}' in India today.
2. "gettingStarted": array of 3-5 concrete, actionable first steps someone should take (specific skills to practice, tools/equipment, portfolio building, and early reps).
3. "whereToFind": array of 3-6 specific, realistic platforms, venues, apps, communities, and real-world places relevant to India where someone can get opportunities, exposure, gigs, or clients in '${field}' (e.g. specific platforms, city hubs, subreddits, collectives, booking portals).
4. "monetization": array of 3-5 realistic, specific ways people actually earn income from '${field}' in India today (include both early/starter earnings and scalable long-term monetization).
5. "timeline": a short, honest paragraph on realistic timeframes (e.g. months 1-3, year 1, year 2+) and how progress typically compounds, managing expectations honestly without being discouraging.
6. "encouragement": 1-2 sentences of genuine, grounded encouragement tailored specifically to someone pursuing '${field}' in India.

Make every single tip, platform, and monetization channel SPECIFIC to '${field}' (do NOT give generic advice like 'work hard' or 'network online' — mention actual methods, spaces, and mechanisms used in '${field}').

Return ONLY a valid JSON object matching this schema.`;

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

          const parsed: RoadmapResponse = JSON.parse(cleaned);

          if (parsed && parsed.overview && Array.isArray(parsed.gettingStarted)) {
            return NextResponse.json({ roadmap: parsed, field });
          }
        } else {
          const errText = await response.text();
          console.warn(`[Career Roadmap API] ${model} returned ${response.status}: ${errText}`);
        }
      } catch (err) {
        console.warn(`[Career Roadmap API] Error with ${model}:`, err);
      }
    }

    // Dynamic smart fallback with domain-specific knowledge if Gemini is rate-limited or times out
    const lowerField = field.toLowerCase();
    let fallbackRoadmap: RoadmapResponse;

    if (lowerField.includes("standup") || lowerField.includes("laugh") || lowerField.includes("comedy") || lowerField.includes("comic")) {
      fallbackRoadmap = {
        overview: `Standup comedy and live humor in India have evolved into a thriving creator ecosystem with dedicated venues, touring circuits, and lucrative brand integrations across Tier-1 and Tier-2 cities.`,
        gettingStarted: [
          `Write 5 minutes of tight material and record every practice set on audio to analyze timing, punchlines, and rhythm.`,
          `Attend weekly local open mics (at least 2-3 per week) to test premises and build stage comfort under low pressure.`,
          `Study crowd work and joke structures from established Indian and international comedians.`,
          `Record crisp 30-60 second clips of your best bits specifically framed for vertical video.`
        ],
        whereToFind: [
          `Open mic circuits & comedy clubs (e.g., The Habitat & Balraj Comedy Club in Mumbai, Canvas Laugh Club, Bangalore Comedy Club, Delhi Comedy Circuit).`,
          `Instagram Reels and YouTube Shorts (the primary discovery engine for Indian standup comedians today).`,
          `College fest talent hunts and local pub trivia/host gigs (great for early paid stage time).`,
          `Artist management collectives and comedy Discord/WhatsApp groups.`
        ],
        monetization: [
          `Spot fees & split-door tickets for club lineups (₹1,000 - ₹5,000 per spot early on).`,
          `Corporate gigs, product launches, and annual day emceeing (₹25,000 - ₹1,00,000+ once established).`,
          `YouTube ad revenue and brand sponsorships on video releases.`,
          `Writing for OTT shows, sketch channels, ad agencies, and roast formats.`
        ],
        timeline: `Months 1-6: Grinding open mics, finding your voice, building 10 solid minutes. Months 6-18: Viral short-form clips, opening for headline acts, landing paid club spots. Year 2+: Touring half-specials, corporate shows, and dedicated live tickets.`,
        encouragement: `Every top comic in India bombed repeatedly at the start. Stage time is the only currency that matters—keep showing up.`
      };
    } else if (lowerField.includes("potter") || lowerField.includes("ceramic") || lowerField.includes("clay") || lowerField.includes("sculpt")) {
      fallbackRoadmap = {
        overview: `Studio pottery and handmade ceramics are experiencing high demand in India driven by aesthetic home décor, indie cafes, boutique restaurants, and corporate gifting.`,
        gettingStarted: [
          `Master wheel throwing basics, hand-building techniques, and glazing science at a local community ceramic studio.`,
          `Build a cohesive signature style or functional product line (mugs, planters, tableware, abstract vases).`,
          `Set up a minimal workspace for greenware drying and partner with local kilns for shared firing sessions.`,
          `Document your tactile throwing and glazing process on video for social media storytelling.`
        ],
        whereToFind: [
          `Flea markets and designer pop-ups (e.g., Sunday Soul Sante, Lil Flea, Dastkar, Kynkyny).`,
          `Studio collectives (e.g., Claystation Bangalore, Ceramic Center Vadodara, Delhi Blue Pottery Trust).`,
          `Instagram shop storefronts and lifestyle multi-designer platforms (e.g., Jaypore, Nicobar, Etsy India).`,
          `Local lifestyle cafes and boutique architects seeking customized tableware or bespoke fixtures.`
        ],
        monetization: [
          `Direct batch sales of handmade pottery drops via Instagram / Etsy (₹800 - ₹4,000 per piece).`,
          `Weekend beginner pottery workshops and masterclasses (₹2,500 - ₹4,500 per seat).`,
          `Wholesale custom tableware orders for boutique restaurants and specialty coffee shops.`,
          `Corporate gifting hampers and festive collection pre-orders.`
        ],
        timeline: `Months 1-6: Technique consistency, glaze experimenting, and building initial catalog. Months 6-12: Pop-up stalls, first workshop cohorts, and online drops. Year 2+: Studio brand presence, bulk cafe contracts, and private commissions.`,
        encouragement: `Handmade craftsmanship has an irreplaceable warmth in a mass-produced world. Your unique touch is your greatest moat.`
      };
    } else if (lowerField.includes("game") || lowerField.includes("esport") || lowerField.includes("gaming") || lowerField.includes("stream")) {
      fallbackRoadmap = {
        overview: `India's gaming and esports market is among the fastest growing in the world, with mobile esports, streaming, game journalism, and community management creating multi-tier income paths.`,
        gettingStarted: [
          `Choose your focus track: competitive esports athlete, content creator/streamer, caster/analyst, or community manager.`,
          `Maintain a consistent streaming schedule on YouTube Gaming or Rooter with high-energy commentary or elite gameplay.`,
          `Build a Discord community and engage with regional gaming squads and tournament scrims.`,
          `Learn basic video editing (CapCut / Premiere) to repurpose stream highlights into viral Shorts and Reels.`
        ],
        whereToFind: [
          `Tournaments & scrim platforms (e.g., Nodwin Gaming, Skyesports, Krafton India, Villager Esports).`,
          `Streaming platforms (YouTube Gaming, Loco, Rooter).`,
          `Indian Gaming Show (IGS), Comic Con India, and university LAN tournaments.`,
          `Esports org talent scouts (e.g., S8UL, GodLike, Revenant, Orangutan).`
        ],
        monetization: [
          `Tournament prize pools and weekly scrim payouts.`,
          `Streaming superchats, channel memberships, and platform creator grants.`,
          `Brand deals with gaming peripherals, energy drinks, smartphones, and app promotions.`,
          `Freelance esports casting, moderation, and team coaching.`
        ],
        timeline: `Months 1-4: Audience discovery, highlight packaging, and tournament qualifying. Months 5-12: Consistent stream viewers, minor org sponsorships, and paid scrims. Year 2+: Tier-1 org contracts, brand campaigns, and commercial creator status.`,
        encouragement: `The Indian gaming industry is just scratching the surface. With discipline, good sportsmanship, and consistent content, your audience will find you.`
      };
    } else {
      fallbackRoadmap = {
        overview: `Pursuing ${field} in India offers growing opportunities through digital platforms, niche communities, and the expanding creator and freelance economy.`,
        gettingStarted: [
          `Dedicate 1-2 hours daily to focused craft practice and document your work in public.`,
          `Build a clean digital portfolio showcasing 5-10 of your strongest projects or performances.`,
          `Engage with local practitioner circles and online Indian creator communities in ${field}.`,
          `Experiment with short-form visual/video demonstrations on social media to build organic discovery.`
        ],
        whereToFind: [
          `Instagram & YouTube (reels, process breakdowns, and case studies for viral discovery).`,
          `City-specific creator collectives and cultural spaces (e.g. in Bengaluru, Mumbai, Delhi, Pune).`,
          `Freelance platforms (Upwork, Fiverr, Topmate, Indian freelance groups).`,
          `Local community events, workshops, pop-up markets, and niche meetups.`
        ],
        monetization: [
          `Direct client commissions and customized freelance projects.`,
          `Beginner workshops, masterclasses, and cohort-based teaching.`,
          `Live performances, consultations, or exhibition sales.`,
          `Brand partnerships and content sponsorships as your following expands.`
        ],
        timeline: `Months 1-6: Focus entirely on skill mastery and public portfolio building. Months 6-12: Secure your first paid gigs, collaborations, and client referrals. Year 2+: Diversify income across client work, digital products, and teaching.`,
        encouragement: `Every pioneer in ${field} started from scratch. Consistency, quality, and authenticity in India's growing market will set you apart.`
      };
    }

    return NextResponse.json({ roadmap: fallbackRoadmap, field });
  } catch (err: any) {
    console.error("[Career Roadmap Route Error]:", err);
    return NextResponse.json(
      { error: "Couldn't generate a roadmap right now, please try again." },
      { status: 500 }
    );
  }
}
