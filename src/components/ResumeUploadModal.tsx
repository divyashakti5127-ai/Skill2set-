"use client";

import React, { useState, useRef } from "react";
import { DetailedSkill, SkillProfile, WorkExperienceItem } from "@/lib/storage";

interface ParsedProfile {
  title: string;
  summaryBio: string;
  skills: DetailedSkill[];
  workHistory: WorkExperienceItem[];
  education: string[];
  certifications: string[];
  suggestedRoles: string[];
  experienceLevel: string;
  location: string;
  workMode: string;
  searchBackground: string;
  interests: string;
}

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyProfile: (profile: ParsedProfile) => void;
}

export default function ResumeUploadModal({
  isOpen,
  onClose,
  onApplyProfile,
}: ResumeUploadModalProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Review / Edit state
  const [parsedData, setParsedData] = useState<ParsedProfile | null>(null);

  // Form edit drafts
  const [editTitle, setEditTitle] = useState("");
  const [editBackground, setEditBackground] = useState("");
  const [editInterests, setEditInterests] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editExperience, setEditExperience] = useState("");
  const [editWorkMode, setEditWorkMode] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    if (selected) {
      if (!selected.name.toLowerCase().endsWith(".pdf")) {
        setError("Please upload a PDF file, or switch to the 'Paste Text' tab.");
        return;
      }
      setFile(selected);
      setError("");
    }
  };

  const handleExtract = async () => {
    setError("");
    setLoading(true);

    try {
      let res: Response;

      if (activeTab === "upload") {
        if (!file) {
          setError("Please select a PDF file first.");
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append("file", file);

        res = await fetch("/api/parse-profile", {
          method: "POST",
          body: formData,
        });
      } else {
        if (!pastedText.trim() || pastedText.trim().length < 20) {
          setError("Please paste at least a few lines of resume text.");
          setLoading(false);
          return;
        }

        res = await fetch("/api/parse-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: pastedText.trim() }),
        });
      }

      const data = await res.json();

      if (!res.ok || !data.profile) {
        throw new Error(data.error || "Failed to parse resume. Please try pasting the text directly.");
      }

      const prof: ParsedProfile = data.profile;
      setParsedData(prof);

      // Pre-fill editable review fields
      setEditTitle(prof.title || "Parsed Career Profile");
      setEditBackground(prof.searchBackground || "");
      setEditInterests(prof.interests || prof.suggestedRoles.join(", ") || "");
      setEditLocation(prof.location || "India");
      setEditExperience(prof.experienceLevel || "");
      setEditWorkMode(prof.workMode || "");
    } catch (err: any) {
      setError(err.message || "An error occurred while parsing. Please paste text directly.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmUseProfile = () => {
    if (!parsedData) return;

    const finalProfile: ParsedProfile = {
      ...parsedData,
      title: editTitle.trim() || parsedData.title,
      searchBackground: editBackground.trim() || parsedData.searchBackground,
      interests: editInterests.trim() || parsedData.interests,
      location: editLocation.trim() || parsedData.location,
      experienceLevel: editExperience || parsedData.experienceLevel,
      workMode: editWorkMode || parsedData.workMode,
    };

    onApplyProfile(finalProfile);
    onClose();
  };

  const handleReset = () => {
    setParsedData(null);
    setFile(null);
    setPastedText("");
    setError("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-card border border-amber-500/35 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl shadow-amber-500/15"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border/80 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-card to-card">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-sm">
              📄
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                {parsedData ? "Review Extracted Profile" : "Auto-Fill with Resume Intelligence"}
              </h3>
              <p className="text-xs text-muted">
                {parsedData
                  ? "Review and customize extracted skills before searching"
                  : "Upload a PDF or paste text to extract your skills and experience"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-muted hover:text-foreground text-lg p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-sm">
          {/* STEP 1: UPLOAD / PASTE VIEW */}
          {!parsedData && (
            <div className="space-y-4">
              {/* Tab Selector */}
              <div className="flex bg-background/80 p-1 rounded-2xl border border-border gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("upload");
                    setError("");
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === "upload"
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <span>📎</span> Upload PDF Resume
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("paste");
                    setError("");
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === "paste"
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <span>📝</span> Paste Resume Text
                </button>
              </div>

              {/* Upload Tab */}
              {activeTab === "upload" && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border hover:border-amber-500/50 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-background/50 flex flex-col items-center justify-center gap-2 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                    📥
                  </div>
                  {file ? (
                    <div>
                      <p className="text-sm font-bold text-amber-300">{file.name}</p>
                      <p className="text-xs text-muted mt-0.5">
                        {(file.size / 1024).toFixed(1)} KB · Click to change file
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Click to select or drop your resume (PDF)
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        Standard text-based PDF format recommended
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Paste Text Tab */}
              {activeTab === "paste" && (
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1.5">
                    Paste Resume or LinkedIn Profile Text:
                  </label>
                  <textarea
                    rows={8}
                    value={pastedText}
                    onChange={(e) => {
                      setPastedText(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Paste your experience, summary, and skills list here..."
                    className="w-full rounded-2xl border border-border bg-background/90 p-3.5 text-xs text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-none font-sans leading-relaxed"
                  />
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3.5 text-xs text-red-300">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: REVIEW & EDIT EXTRACTED PROFILE VIEW */}
          {parsedData && (
            <div className="space-y-4 animate-in fade-in">
              {/* Top Summary Badge */}
              {parsedData.summaryBio && (
                <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-3.5">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">
                    AI Extracted Executive Summary
                  </span>
                  <p className="text-xs text-foreground/90 leading-relaxed italic">
                    "{parsedData.summaryBio}"
                  </p>
                </div>
              )}

              {/* Editable Fields Grid */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">
                    Target Profile Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">
                    Extracted Skills & Capabilities (Search Background)
                  </label>
                  <textarea
                    rows={2}
                    value={editBackground}
                    onChange={(e) => setEditBackground(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">
                    Target Roles / Career Directions
                  </label>
                  <input
                    type="text"
                    value={editInterests}
                    onChange={(e) => setEditInterests(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-muted mb-1">
                      Experience Level
                    </label>
                    <select
                      value={editExperience}
                      onChange={(e) => setEditExperience(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:border-amber-500"
                    >
                      <option value="">Any</option>
                      <option value="intern">Intern / Student</option>
                      <option value="entry">Entry Level (0-2 yrs)</option>
                      <option value="mid">Mid Level (3-5 yrs)</option>
                      <option value="senior">Senior (5-10 yrs)</option>
                      <option value="lead">Lead / Manager (10+ yrs)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-muted mb-1">
                      Work Mode
                    </label>
                    <select
                      value={editWorkMode}
                      onChange={(e) => setEditWorkMode(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:border-amber-500"
                    >
                      <option value="">Any</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="onsite">Onsite</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Categorized Skills Tags Preview */}
              {parsedData.skills && parsedData.skills.length > 0 && (
                <div className="pt-2 border-t border-border/80">
                  <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">
                    Categorized Skills Breakdown ({parsedData.skills.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {parsedData.skills.map((s, idx) => {
                      const categoryColors = {
                        technical: "bg-blue-500/10 text-blue-300 border-blue-500/25",
                        soft: "bg-purple-500/10 text-purple-300 border-purple-500/25",
                        domain: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
                        tool: "bg-amber-500/10 text-amber-300 border-amber-500/25",
                      };
                      return (
                        <span
                          key={idx}
                          className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${
                            categoryColors[s.category] || "bg-card text-muted border-border"
                          }`}
                        >
                          {s.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border/80 flex items-center justify-between bg-card/60">
          {!parsedData ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleExtract}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-60 text-slate-950 font-bold px-5 py-2 text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Resume with AI...</span>
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    <span>Extract Profile</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted hover:text-foreground cursor-pointer"
              >
                ← Parse Another
              </button>
              <button
                type="button"
                onClick={handleConfirmUseProfile}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold px-6 py-2.5 text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-1.5 hover:scale-[1.01]"
              >
                <span>✓ Use This Profile in Search</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
