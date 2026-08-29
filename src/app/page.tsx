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
    <div className="flex-1 flex items-center justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-2xl">
        {/* Hero */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
            What&apos;s your next job?
          </h2>
          <p className="text-muted text-base sm:text-lg max-w-md mx-auto">
            Describe yourself in plain words. We&apos;ll find the best matching
            jobs anywhere in the world.
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-2xl p-6 sm:p-10"
        >
          {/* Field 1 – Good at */}
          <div className="mb-6">
            <label
              htmlFor="goodAt"
              className="block text-sm font-medium text-foreground mb-2"
            >
              What are you good at?
            </label>
            <textarea
              id="goodAt"
              rows={3}
              value={goodAt}
              onChange={(e) => {
                setGoodAt(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. Mechanical engineering graduate, AutoCAD, SolidWorks, automobile design"
              className={`w-full rounded-xl border bg-background px-4 py-3 text-[15px] text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition resize-none leading-relaxed ${
                error ? "border-red-500/70" : "border-border"
              }`}
            />
            {error && (
              <p className="mt-1.5 text-xs text-red-400">{error}</p>
            )}
          </div>

          {/* Field 2 – Interests */}
          <div className="mb-6">
            <label
              htmlFor="interests"
              className="block text-sm font-medium text-foreground mb-2"
            >
              What kind of work interests you?
            </label>
            <textarea
              id="interests"
              rows={3}
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g. Automotive design, manufacturing, EV industry"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-[15px] text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition resize-none leading-relaxed"
            />
          </div>

          {/* Field 3 – Where */}
          <div className="mb-8">
            <label
              htmlFor="where"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Where do you want to work?
            </label>
            <textarea
              id="where"
              rows={2}
              value={where}
              onChange={(e) => setWhere(e.target.value)}
              placeholder="e.g. India, Bengaluru, UAE, Germany, remote, or anywhere"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-[15px] text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition resize-none leading-relaxed"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold py-3.5 text-base transition-colors cursor-pointer"
          >
            Find my best jobs
          </button>

          {/* Add preferences toggle */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowPrefs(!showPrefs)}
              className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
            >
              Add preferences
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
            <div className="mt-5 pt-5 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition appearance-none cursor-pointer"
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
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition appearance-none cursor-pointer"
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
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition"
                />
              </div>
            </div>
          )}

          {/* Examples */}
          <div className="mt-6 pt-5 border-t border-border text-center">
            <p className="text-xs text-muted">
              Try:{" "}
              {examples.map((ex, i) => (
                <span key={ex}>
                  <button
                    type="button"
                    onClick={() => handleExample(ex)}
                    className="text-accent/80 hover:text-accent hover:underline transition-colors cursor-pointer"
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
