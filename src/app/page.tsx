"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const [goodAt, setGoodAt] = useState("");
  const [interests, setInterests] = useState("");
  const [where, setWhere] = useState("");
  const [error, setError] = useState("");

  const [showPrefs, setShowPrefs] = useState(false);
  const [experience, setExperience] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [minSalary, setMinSalary] = useState("");

  const examples = [
    "Mechanical Engineer",
    "Finance Graduate",
    "Graphic Designer",
    "Nurse",
    "Marketing Specialist",
  ];

  const handleExample = (ex: string) => {
    setGoodAt(ex);
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!goodAt.trim()) {
      setError("Tell us at least one skill or background.");
      return;
    }

    setError("");
    const params = new URLSearchParams();
    params.set("background", goodAt.trim());
    if (interests.trim()) params.set("interests", interests.trim());
    if (where.trim()) params.set("location", where.trim());
    if (experience) params.set("experience", experience);
    if (workMode) params.set("workMode", workMode);
    if (minSalary.trim()) params.set("minSalary", minSalary.trim());
    router.push(`/results?${params.toString()}`);
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-2xl">
        {/* Hero */}
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 text-xs font-semibold text-amber-400 mb-2">
            <span>✨</span> There is always a way forward
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            Discover your{" "}
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
              path forward
            </span>
          </h2>
          <p className="text-muted text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
            Describe your skills or passions in your own words. We uncover real job matches, gig opportunities, and step-by-step career roadmaps across India and beyond.
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border hover:border-amber-500/30 transition-colors rounded-3xl p-6 sm:p-10 shadow-2xl relative backdrop-blur-sm"
        >
          {/* Field 1 – Good at */}
          <div className="mb-6">
            <label
              htmlFor="goodAt"
              className="block text-sm font-semibold text-foreground mb-2 flex items-center justify-between"
            >
              <span>What are you good at or passionate about?</span>
              <span className="text-xs text-muted font-normal">Required</span>
            </label>
            <textarea
              id="goodAt"
              rows={3}
              value={goodAt}
              onChange={(e) => {
                setGoodAt(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. Sketching portraits, standup comedy, React frontend development, pottery, fitness training..."
              className={`w-full rounded-2xl border bg-background/90 px-4 py-3.5 text-[15px] text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition resize-none leading-relaxed shadow-inner ${
                error ? "border-red-500/70" : "border-border"
              }`}
            />
            {error && (
              <p className="mt-1.5 text-xs text-red-400 font-medium">{error}</p>
            )}
          </div>

          {/* Field 2 – Interests */}
          <div className="mb-6">
            <label
              htmlFor="interests"
              className="block text-sm font-semibold text-foreground mb-2 flex items-center justify-between"
            >
              <span>What specific roles, crafts, or work interest you?</span>
              <span className="text-xs text-muted font-normal">Optional</span>
            </label>
            <textarea
              id="interests"
              rows={2}
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g. Portrait art, live performance, UI design, ceramic crafts, content creation..."
              className="w-full rounded-2xl border border-border bg-background/90 px-4 py-3.5 text-[15px] text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition resize-none leading-relaxed shadow-inner"
            />
          </div>

          {/* Field 3 – Where */}
          <div className="mb-8">
            <label
              htmlFor="where"
              className="block text-sm font-semibold text-foreground mb-2 flex items-center justify-between"
            >
              <span>Where do you want to work or monetize?</span>
              <span className="text-xs text-muted font-normal">Optional</span>
            </label>
            <input
              id="where"
              type="text"
              value={where}
              onChange={(e) => setWhere(e.target.value)}
              placeholder="e.g. India, Bengaluru, Mumbai, Delhi, Remote, or Worldwide"
              className="w-full rounded-2xl border border-border bg-background/90 px-4 py-3.5 text-[15px] text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition shadow-inner"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-4 text-base transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Explore Opportunities & Roadmaps</span>
            <span className="text-lg">➔</span>
          </button>

          {/* Add preferences toggle */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => setShowPrefs(!showPrefs)}
              className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <span>{showPrefs ? "Hide preferences" : "Add experience & salary preferences"}</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform ${showPrefs ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>

          {/* Collapsible preferences */}
          {showPrefs && (
            <div className="mt-5 pt-5 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in">
              <div>
                <label
                  htmlFor="experience"
                  className="block text-xs font-medium text-muted mb-1.5"
                >
                  Experience level
                </label>
                <select
                  id="experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition appearance-none cursor-pointer"
                >
                  <option value="">Any</option>
                  <option value="intern">Intern / Student</option>
                  <option value="entry">Entry level</option>
                  <option value="mid">Mid level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead / Manager</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="workMode"
                  className="block text-xs font-medium text-muted mb-1.5"
                >
                  Work mode
                </label>
                <select
                  id="workMode"
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition appearance-none cursor-pointer"
                >
                  <option value="">Any</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">Onsite</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="minSalary"
                  className="block text-xs font-medium text-muted mb-1.5"
                >
                  Minimum salary
                </label>
                <input
                  id="minSalary"
                  type="text"
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                  placeholder="e.g. ₹8L, $60k"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition"
                />
              </div>
            </div>
          )}

          {/* Examples */}
          <div className="mt-7 pt-5 border-t border-border/80 text-center">
            <p className="text-xs text-muted flex flex-wrap items-center justify-center gap-1.5">
              <span>Popular searches:</span>{" "}
              {examples.map((ex, i) => (
                <span key={ex} className="inline-flex items-center">
                  <button
                    type="button"
                    onClick={() => handleExample(ex)}
                    className="text-amber-400/90 hover:text-amber-300 hover:underline transition-colors cursor-pointer font-medium"
                  >
                    {ex}
                  </button>
                  {i < examples.length - 1 && (
                    <span className="text-border mx-1.5">·</span>
                  )}
                </span>
              ))}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
