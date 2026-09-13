"use client";

import React, { useState, useEffect } from "react";

interface SaveProfilePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: {
    background: string;
    interests: string;
    location: string;
    experience?: string;
    workMode?: string;
    minSalary?: string;
  };
  onProceed: (saveAsProfile: boolean, profileName?: string) => void;
}

export default function SaveProfilePromptModal({
  isOpen,
  onClose,
  formData,
  onProceed,
}: SaveProfilePromptModalProps) {
  const [step, setStep] = useState<"ask" | "naming">("ask");
  const [profileName, setProfileName] = useState("");

  useEffect(() => {
    if (isOpen) {
      setStep("ask");
      // Generate intelligent suggested name from interests or background
      const suggestion = (formData.interests || formData.background || "")
        .split(",")[0]
        .trim();
      setProfileName(suggestion ? suggestion : "Custom Skill Profile");
    }
  }, [isOpen, formData]);

  if (!isOpen) return null;

  const handleSaveAndExplore = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = profileName.trim() || "Custom Skill Profile";
    onProceed(true, finalName);
  };

  const handleExploreWithoutSaving = () => {
    onProceed(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-card border border-amber-500/35 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl shadow-amber-500/15 p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Icon & Close */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/25">
            👤
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground text-xl p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {step === "ask" ? (
          <div>
            {/* Title & Description */}
            <div className="mb-5">
              <h3 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                Save this as a Skill Profile?
              </h3>
              <p className="text-xs text-muted/90 mt-1.5 leading-relaxed">
                Saving this profile lets you easily switch between different passions and careers anytime from your account.
              </p>

              {/* Form snapshot preview */}
              <div className="mt-4 bg-background/80 border border-border/80 rounded-2xl p-3 text-xs space-y-1">
                <p className="font-semibold text-foreground truncate">
                  ⚡ <span className="text-muted">Skills:</span> {formData.background}
                </p>
                {formData.interests && (
                  <p className="text-muted/90 truncate">
                    🎯 <span className="text-muted">Target:</span> {formData.interests}
                  </p>
                )}
                {formData.location && (
                  <p className="text-muted/80 text-[11px]">
                    📍 <span className="text-muted">Location:</span> {formData.location}
                  </p>
                )}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => setStep("naming")}
                className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3.5 px-4 text-sm transition-all duration-150 shadow-md shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>✨</span>
                <span>Yes, save as new profile</span>
              </button>

              <button
                type="button"
                onClick={handleExploreWithoutSaving}
                className="w-full rounded-2xl border border-border text-muted hover:text-foreground hover:bg-slate-800/60 font-medium py-3 px-4 text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Just explore without saving →</span>
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Naming the Profile */
          <form onSubmit={handleSaveAndExplore}>
            <div className="mb-5">
              <h3 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                Name your Skill Profile
              </h3>
              <p className="text-xs text-muted/90 mt-1.5 leading-relaxed">
                Give this career profile a distinct title (e.g. Content Writer, Dance Educator, Full Stack Developer).
              </p>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-foreground/90 mb-1.5">
                  Profile Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g. Content Writer, Dance Educator, Full Stack Developer"
                  autoFocus
                  required
                  className="w-full rounded-2xl bg-background border border-border px-3.5 py-3 text-xs sm:text-sm text-foreground focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setStep("ask")}
                className="rounded-2xl border border-border px-4 py-3 text-xs sm:text-sm text-muted hover:text-foreground hover:bg-slate-800/60 font-medium transition-colors cursor-pointer"
              >
                Back
              </button>

              <button
                type="submit"
                className="flex-1 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3 px-4 text-xs sm:text-sm shadow-md shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>✓</span>
                <span>Save Profile & Explore</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
