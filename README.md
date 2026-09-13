# Skillsetu 🌉

> **Bridging your skills to real opportunities** — AI-powered job discovery, multi-provider aggregator, personalized career roadmaps, and full Kanban application tracking.

---

## ✨ Features

- **Multi-Provider Real-Time Aggregation:** Simultaneously queries and merges live listings from JSearch (RapidAPI) and Adzuna (India).
- **Gemini AI Smart Ranking & Scoring:** Intelligently scores and explains matches specifically against user background and passion areas.
- **Skill Gap Analysis:** Highlights exact matching skills vs missing skills on each job card, with direct curated resources to close the gap.
- **Creator & Unconventional Career Roadmaps:** When searches cover creative, gig, or performance pursuits (e.g. standup comedy, sketching, pottery), Skillsetu generates step-by-step blueprints for getting noticed, finding gigs, and monetization channels in India.
- **Interactive Saved Roadmaps & Checklist:** Save roadmaps to your Dashboard with interactive step checkoffs and progress bars.
- **AI Application Kit Generator:** Instant tailored cover letters, targeted resume headlines, and impactful resume bullet points.
- **Job Status Kanban Tracker:** Complete board with stages (`Saved / Backlog`, `Applied`, `Interviewing`, `Offer / Accepted`), notes editor, and stage progression.
- **Automated Apply Verification Flow:** Prompts the user with grace period verification after opening application portals to seamlessly advance jobs into the `Applied` column.
- **"Got Interview Call?" Interview Hub:** Log interview dates with an HTML5 date picker, select round types (HR, Technical, Video, etc.), and store prep notes.
- **Multiple Skill Profiles:** Save and easily switch between multiple career profiles (e.g., *Full Stack Developer*, *Content Writer*, *Dance Educator*) with full state persistence.
- **Test Mode Toggle:** Simulate job applications and tracking flows without needing to apply to live third-party listings.
- **Warm Sunrise Dark Theme:** Modern, optimistic visual design built with Next.js 16, React 19, and Tailwind CSS v4.

---

## 🚀 Getting Started

### 1. Prerequisites & Environment Variables

Copy `.env.example` to `.env.local` and add your API keys:

```bash
cp .env.example .env.local
```

```env
GEMINI_API_KEY=your_gemini_api_key_here
JSEARCH_API_KEY=your_jsearch_api_key_here
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
- **State Management:** Reactive React Context + HTML5 LocalStorage persistence

---

## 🔒 Security & Privacy

- All API keys and secrets are strictly loaded from server-side environment variables and are excluded from source control via `.gitignore`.
- User data, saved jobs, and skill profiles are persisted securely in client-side storage.

