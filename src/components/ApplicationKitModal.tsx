"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";

export interface ApplicationKitData {
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    workMode: string;
    description: string;
    fullDescription?: string;
    applyLink: string | null;
    matchScore?: number;
    whyMatch?: string;
    matchingSkills?: string[];
    missingSkills?: any[];
  };
  coverLetter: string;
  resumeHeadline: string;
  resumeBullets: string[];
}

export default function ApplicationKitModal({
  data,
  onClose,
}: {
  data: ApplicationKitData;
  onClose: () => void;
}) {
  const { saveJob, isJobSaved } = useApp();
  const [activeTab, setActiveTab] = useState<"letter" | "resume">("letter");
  const [coverLetter, setCoverLetter] = useState(data.coverLetter);
  const [resumeHeadline, setResumeHeadline] = useState(data.resumeHeadline);
  const [resumeBullets, setResumeBullets] = useState<string[]>(data.resumeBullets);
  const [copied, setCopied] = useState(false);

  const jobSaved = isJobSaved(data.job.id);

  const handleCopyCurrent = () => {
    let textToCopy = "";
    if (activeTab === "letter") {
      textToCopy = coverLetter;
    } else {
      textToCopy = `TARGET ROLE: ${data.job.title} at ${data.job.company}\n\nHEADLINE:\n${resumeHeadline}\n\nTAILORED IMPACT BULLETS:\n${resumeBullets.map((b) => `• ${b}`).join("\n")}`;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const fullDoc = `=====================================================
SKILLSETU APPLICATION KIT
Target Role: ${data.job.title}
Company: ${data.job.company} (${data.job.location})
Generated: ${new Date().toLocaleDateString()}
=====================================================

--- 1. COVER LETTER ---

${coverLetter}

-----------------------------------------------------

--- 2. TAILORED RESUME SUMMARY & BULLET POINTS ---

Headline:
${resumeHeadline}

Key Highlights & Impact Bullets:
${resumeBullets.map((b, i) => `${i + 1}. ${b}`).join("\n")}
`;

    const blob = new Blob([fullDoc], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Skillsetu_Application_Kit_${data.job.title.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulletChange = (idx: number, val: string) => {
    const updated = [...resumeBullets];
    updated[idx] = val;
    setResumeBullets(updated);
  };

  const handleAddBullet = () => {
    setResumeBullets([...resumeBullets, "Led core initiatives delivering scalable results with cross-functional teams."]);
  };

  const handleRemoveBullet = (idx: number) => {
    setResumeBullets(resumeBullets.filter((_, i) => i !== idx));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-card border border-amber-500/30 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl shadow-amber-500/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border/80 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-card to-card">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">💼</span>
              <h3 className="text-lg font-bold text-foreground">
                Tailored Application Kit
              </h3>
            </div>
            <p className="text-xs text-muted mt-0.5">
              {data.job.title} · <span className="text-amber-400 font-medium">{data.job.company}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground transition-colors text-xl leading-none p-1.5 rounded-lg hover:bg-slate-800/60 cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-border/80 bg-background/50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab("letter")}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === "letter"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            <span>✉️</span> Personalized Cover Letter
          </button>
          <button
            onClick={() => setActiveTab("resume")}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === "resume"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            <span>📝</span> Tailored Resume Bullets
          </button>
        </div>

        {/* Body Content */}
        <div className="px-6 py-5 overflow-y-auto flex-1 space-y-4 text-sm">
          {activeTab === "letter" ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted font-medium">Edit cover letter before sending:</span>
                <span className="text-[11px] text-amber-400/80">✨ Auto-tailored to job context</span>
              </div>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={12}
                className="w-full rounded-2xl border border-border bg-background/90 p-4 text-sm text-foreground/90 leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition resize-none font-sans"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                  Resume Professional Headline / Subtitle
                </label>
                <input
                  type="text"
                  value={resumeHeadline}
                  onChange={(e) => setResumeHeadline(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background/90 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider">
                    Targeted Achievement Bullets (Editable)
                  </label>
                  <button
                    onClick={handleAddBullet}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                  >
                    + Add Bullet
                  </button>
                </div>
                <div className="space-y-2.5">
                  {resumeBullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold mt-2.5 text-xs">•</span>
                      <textarea
                        rows={2}
                        value={bullet}
                        onChange={(e) => handleBulletChange(idx, e.target.value)}
                        className="flex-1 rounded-xl border border-border bg-background/90 p-2.5 text-xs sm:text-sm text-foreground/90 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-none"
                      />
                      <button
                        onClick={() => handleRemoveBullet(idx)}
                        className="text-muted hover:text-red-400 p-2 text-xs cursor-pointer"
                        title="Remove bullet"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border/80 flex flex-wrap items-center justify-between gap-3 bg-card/60">
          <div className="flex items-center gap-2">
            <button
              onClick={() => saveJob(data.job)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                jobSaved
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-background/80 text-muted border-border hover:text-foreground"
              }`}
            >
              {jobSaved ? "★ Saved in Tracker" : "☆ Save to Tracker"}
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDownload}
              className="rounded-xl border border-border px-4 py-2 text-xs sm:text-sm font-medium text-foreground hover:bg-slate-800/60 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download .txt
            </button>
            <button
              onClick={handleCopyCurrent}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-5 py-2 text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 min-w-[100px]"
            >
              {copied ? "✓ Copied!" : "Copy Active Tab"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
