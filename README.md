# Skillsetu 🌉

> **Bridging your skills to real opportunities** — AI-powered job discovery, multi-provider aggregator, and creator roadmaps in India.

---

## ✨ Features

- **Multi-Provider Real-Time Aggregation:** Simultaneously queries and merges live listings from JSearch (RapidAPI) and Adzuna (India).
- **Gemini AI Smart Ranking & Scoring:** Intelligently scores and explains matches specifically against user background and passion areas.
- **Creator & Unconventional Career Roadmaps:** When searches cover creative, gig, or performance pursuits (e.g. standup comedy, sketching, pottery), Skillsetu generates step-by-step blueprints for getting noticed, platforms, and monetization channels in India.
- **AI Cover Letter Generator:** Crafts customized, persuasive cover letters tailored to specific job descriptions and applicant strengths.
- **Warm Sunrise Theme:** Modern, optimistic visual design built with Next.js 16, React 19, and Tailwind CSS v4.

---

## 🚀 Getting Started

### 1. Prerequisites & Environment Variables

Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
RAPIDAPI_KEY=your_rapidapi_key_here
ADZUNA_APP_ID=your_adzuna_app_id_here
ADZUNA_APP_KEY=your_adzuna_app_key_here
```

### 2. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Frontend:** React 19, Tailwind CSS v4
- **AI / LLM:** Google Gemini API (`gemini-3.5-flash`, `gemini-3.5-flash-lite`, `gemini-3.6-flash`)
- **APIs:** JSearch (RapidAPI), Adzuna Job Search API

