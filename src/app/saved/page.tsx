"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { SavedRoadmap } from "@/lib/storage";

export default function SavedPage() {
  const router = useRouter();
  const {
    savedRoadmaps,
    toggleRoadmapStep,
    removeSavedRoadmap,
    savedJobs,
    removeSavedJob,
    profiles,
    saveProfile,
    deleteProfile,
    selectActiveProfile,
    activeProfile,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"roadmaps" | "jobs" | "profiles">("roadmaps");
  const [newProfileTitle, setNewProfileTitle] = useState("");
  const [newProfileBg, setNewProfileBg] = useState("");
  const [newProfileInt, setNewProfileInt] = useState("");
  const [newProfileLoc, setNewProfileLoc] = useState("India");
  const [showAddProfile, setShowAddProfile] = useState(false);

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileBg.trim()) return;
    saveProfile({
      title: newProfileTitle.trim() || "My New Profile",
      background: newProfileBg.trim(),
      interests: newProfileInt.trim(),
      location: newProfileLoc.trim() || "India",
    });
    setNewProfileTitle("");
    setNewProfileBg("");
    setNewProfileInt("");
    setShowAddProfile(false);
  };

  const handleSearchProfile = (p: typeof profiles[0]) => {
    selectActiveProfile(p.id);
    const params = new URLSearchParams();
    if (p.background) params.set("background", p.background);
    if (p.interests) params.set("interests", p.interests);
    if (p.location) params.set("location", p.location);
    router.push(`/results?${params.toString()}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-400 mb-2">
            <span>⭐</span> Saved Work & Progress
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            My Career Dashboard
          </h2>
          <p className="text-sm text-muted mt-1">
            Track saved roadmaps, monitor step progress, and switch between skill profiles.
          </p>
        </div>

        <Link
          href="/"
          className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2.5 text-xs sm:text-sm transition-all cursor-pointer shadow-md shadow-amber-500/20 self-start sm:self-auto"
        >
          Explore New Paths ➔
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/80 gap-3 mb-8 bg-card/40 p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveTab("roadmaps")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "roadmaps"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
              : "text-muted hover:text-foreground"
          }`}
        >
          <span>🗺️</span> Saved Roadmaps ({savedRoadmaps.length})
        </button>
        <button
          onClick={() => setActiveTab("jobs")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "jobs"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
              : "text-muted hover:text-foreground"
          }`}
        >
          <span>💼</span> Saved Jobs ({savedJobs.length})
        </button>
        <button
          onClick={() => setActiveTab("profiles")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "profiles"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
              : "text-muted hover:text-foreground"
          }`}
        >
          <span>👤</span> Skill Profiles ({profiles.length})
        </button>
      </div>

      {/* TAB 1: SAVED ROADMAPS WITH STEP PROGRESS */}
      {activeTab === "roadmaps" && (
        <div className="space-y-6">
          {savedRoadmaps.length === 0 ? (
            <div className="bg-card border border-border rounded-3xl p-10 text-center">
              <span className="text-4xl mb-3 block">🗺️</span>
              <h3 className="text-lg font-bold text-foreground mb-1">No roadmaps saved yet</h3>
              <p className="text-sm text-muted max-w-md mx-auto mb-5">
                Generate an AI career roadmap on any search and click "Save Roadmap" to track your milestones step-by-step.
              </p>
              <Link
                href="/"
                className="inline-flex rounded-xl bg-amber-500 text-slate-950 font-bold px-5 py-2.5 text-xs sm:text-sm shadow-md"
              >
                Search & Build a Roadmap
              </Link>
            </div>
          ) : (
            savedRoadmaps.map((rm) => {
              const totalSteps = rm.roadmap.gettingStarted.length;
              const completedCount = rm.completedSteps.length;
              const percentage = Math.round((completedCount / (totalSteps || 1)) * 100);

              return (
                <div
                  key={rm.id}
                  className="bg-card border border-border/90 hover:border-amber-500/35 rounded-3xl p-6 sm:p-7 shadow-lg transition-all"
                >
                  {/* Top Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🗺️</span>
                        <h3 className="text-lg font-bold text-foreground capitalize">
                          {rm.field} Roadmap
                        </h3>
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        Saved on {new Date(rm.savedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full">
                        {completedCount} of {totalSteps} Steps ({percentage}%)
                      </span>
                      <button
                        onClick={() => removeSavedRoadmap(rm.id)}
                        className="text-xs text-muted hover:text-red-400 p-1 cursor-pointer"
                        title="Delete roadmap"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-background/80 h-2.5 rounded-full overflow-hidden border border-border mb-6">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-amber-400 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  {/* Step Checklist */}
                  <div className="space-y-3 mb-6">
                    <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">
                      Milestone Action Steps (Check when completed)
                    </h4>
                    {rm.roadmap.gettingStarted.map((step, idx) => {
                      const isChecked = rm.completedSteps.includes(idx);
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleRoadmapStep(rm.id, idx)}
                          className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                            isChecked
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                              : "bg-background/60 border-border text-foreground/90 hover:border-amber-500/30"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="mt-1 w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                          />
                          <div className="flex-1 text-xs sm:text-sm">
                            <span className="font-bold mr-1.5">Step {idx + 1}:</span>
                            <span className={isChecked ? "line-through opacity-80" : ""}>{step}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Monetization & Opportunities Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-border/80 text-xs">
                    <div className="bg-background/60 border border-border/70 rounded-2xl p-3.5">
                      <p className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                        <span>💰</span> Top Monetization Paths:
                      </p>
                      <ul className="space-y-1 text-foreground/80 list-disc list-inside">
                        {rm.roadmap.monetization.slice(0, 2).map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-background/60 border border-border/70 rounded-2xl p-3.5">
                      <p className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                        <span>📍</span> Places to Get Noticed:
                      </p>
                      <ul className="space-y-1 text-foreground/80 list-disc list-inside">
                        {rm.roadmap.whereToFind.slice(0, 2).map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: SAVED JOBS & SKILL GAPS */}
      {activeTab === "jobs" && (
        <div className="space-y-4">
          {savedJobs.length === 0 ? (
            <div className="bg-card border border-border rounded-3xl p-10 text-center">
              <span className="text-4xl mb-3 block">💼</span>
              <h3 className="text-lg font-bold text-foreground mb-1">No jobs saved yet</h3>
              <p className="text-sm text-muted max-w-md mx-auto mb-5">
                Save jobs from the search results to analyze skill gaps and track your application milestones.
              </p>
              <Link
                href="/"
                className="inline-flex rounded-xl bg-amber-500 text-slate-950 font-bold px-5 py-2.5 text-xs sm:text-sm shadow-md"
              >
                Search Job Opportunities
              </Link>
            </div>
          ) : (
            savedJobs.map((job) => (
              <div
                key={job.id}
                className="bg-card border border-border hover:border-amber-500/35 rounded-3xl p-5 sm:p-6 shadow-md transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-foreground">{job.title}</h4>
                    {typeof job.matchScore === "number" && (
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                        {job.matchScore}% match
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-muted">
                    {job.company} · <span className="text-xs">{job.location} ({job.workMode})</span>
                  </p>

                  {/* Matching Skills */}
                  {job.matchingSkills && job.matchingSkills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-bold text-emerald-400">✓ You have:</span>
                      {job.matchingSkills.map((s, i) => (
                        <span key={i} className="text-[11px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Missing Skills */}
                  {job.missingSkills && job.missingSkills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-bold text-amber-400">⚡ To Learn:</span>
                      {job.missingSkills.map((m, i) => (
                        <span key={i} className="text-[11px] bg-amber-500/10 text-amber-300 border border-amber-500/25 px-2 py-0.5 rounded-full font-medium">
                          {m.skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-2.5">
                  <Link
                    href="/tracker"
                    className="rounded-xl bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 text-amber-300 font-semibold px-3.5 py-1.5 text-xs transition-colors"
                  >
                    View in Pipeline ➔
                  </Link>
                  {job.applyLink && (
                    <a
                      href={job.applyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted hover:text-foreground underline"
                    >
                      Portal Link
                    </a>
                  )}
                  <button
                    onClick={() => removeSavedJob(job.id)}
                    className="text-xs text-muted hover:text-red-400 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: SKILL PROFILES */}
      {activeTab === "profiles" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-muted uppercase tracking-wider">
              Your Target Skill Profiles
            </h3>
            <button
              onClick={() => setShowAddProfile(!showAddProfile)}
              className="text-xs bg-amber-500 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl shadow cursor-pointer"
            >
              {showAddProfile ? "✕ Cancel" : "+ Create New Profile"}
            </button>
          </div>

          {/* Add Profile Form */}
          {showAddProfile && (
            <form onSubmit={handleCreateProfile} className="bg-card border border-amber-500/30 rounded-3xl p-6 space-y-4 animate-in fade-in">
              <h4 className="text-sm font-bold text-foreground">Add New Target Career Profile</h4>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase mb-1">Profile Title</label>
                <input
                  type="text"
                  value={newProfileTitle}
                  onChange={(e) => setNewProfileTitle(e.target.value)}
                  placeholder="e.g. AI Prompt Engineer / Data Analyst"
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase mb-1">Skills & Background (Required)</label>
                <textarea
                  rows={2}
                  value={newProfileBg}
                  onChange={(e) => setNewProfileBg(e.target.value)}
                  placeholder="e.g. Python, SQL, Prompt Engineering, Machine Learning basics..."
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase mb-1">Passions & Target Roles</label>
                <input
                  type="text"
                  value={newProfileInt}
                  onChange={(e) => setNewProfileInt(e.target.value)}
                  placeholder="e.g. LLM Evaluation, Automation, AI Consulting"
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold py-2.5 text-sm shadow cursor-pointer"
              >
                Save Skill Profile
              </button>
            </form>
          )}

          {/* Profiles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profiles.map((p) => {
              const isActive = activeProfile?.id === p.id;
              return (
                <div
                  key={p.id}
                  className={`border rounded-3xl p-5 sm:p-6 transition-all relative flex flex-col justify-between ${
                    isActive
                      ? "bg-card border-amber-500/50 shadow-lg shadow-amber-500/5"
                      : "bg-card/70 border-border/80 hover:border-border"
                  }`}
                >
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-base font-bold text-foreground">{p.title}</h4>
                      {isActive ? (
                        <span className="text-[11px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40">
                          Active Profile
                        </span>
                      ) : (
                        <button
                          onClick={() => selectActiveProfile(p.id)}
                          className="text-xs text-muted hover:text-amber-400 font-medium cursor-pointer"
                        >
                          Set Active
                        </button>
                      )}
                    </div>

                    <div className="text-xs space-y-1 text-foreground/80">
                      <p><span className="text-muted font-medium">Skills:</span> {p.background}</p>
                      {p.interests && <p><span className="text-muted font-medium">Interests:</span> {p.interests}</p>}
                      <p><span className="text-muted font-medium">Location:</span> {p.location || "India"}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/80">
                    <button
                      onClick={() => handleSearchProfile(p)}
                      className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-1.5 text-xs transition-colors shadow flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>🔍 Run Job Search</span>
                    </button>
                    {profiles.length > 1 && (
                      <button
                        onClick={() => deleteProfile(p.id)}
                        className="text-xs text-muted hover:text-red-400 cursor-pointer"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
