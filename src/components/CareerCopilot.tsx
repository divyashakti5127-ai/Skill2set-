"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import {
  CopilotMessage,
  getCopilotMessages,
  saveCopilotMessages,
  clearCopilotMessages,
} from "@/lib/copilot-storage";

export default function CareerCopilot() {
  const {
    isCopilotOpen,
    openCopilot,
    closeCopilot,
    activeProfile,
    copilotJob,
    copilotRoadmap,
    initialCopilotPrompt,
  } = useApp();

  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unscopedJob, setUnscopedJob] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const profileId = activeProfile?.id || "default";
  const activeJob = unscopedJob ? null : copilotJob;

  // Load conversation history on mount or profile change
  useEffect(() => {
    const saved = getCopilotMessages(profileId);
    if (saved.length > 0) {
      setMessages(saved);
    } else {
      // Default welcome message
      const defaultWelcome: CopilotMessage = {
        id: "welcome-1",
        role: "assistant",
        content: activeProfile?.title
          ? `Hello! I'm your **Skillsetu Career Copilot**. I have your **${activeProfile.title}** profile in context.\n\nHow can I help guide your next career move today?`
          : `Hello! I'm your **Skillsetu Career Copilot**.\n\nI can help you evaluate job matches, address skill gaps, tailor interview strategies, and explore career directions. How can I help you today?`,
        timestamp: new Date().toISOString(),
        suggestedQuestions: activeJob
          ? [
              `Why does this ${activeJob.title} job match me?`,
              `How do I explain my missing skills for this role?`,
              `Should I apply now or learn more first?`,
            ]
          : activeProfile?.title
          ? [
              "What roles fit my background best?",
              "What skill should I learn next?",
              "How can I position my resume for a transition?",
            ]
          : [
              "What skills are most in-demand right now?",
              "How do I choose between Frontend and Full Stack?",
              "How does Skillsetu match jobs to skills?",
            ],
      };
      setMessages([defaultWelcome]);
    }
  }, [profileId, activeProfile?.title]);

  // Handle auto-focus and initial prompt trigger
  useEffect(() => {
    if (isCopilotOpen) {
      setUnscopedJob(false);
      setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom();
      }, 150);

      if (initialCopilotPrompt) {
        handleSendMessage(initialCopilotPrompt);
      }
    }
  }, [isCopilotOpen, initialCopilotPrompt]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isCopilotOpen) {
      scrollToBottom();
    }
  }, [messages, loading, isCopilotOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    setError(null);
    setInputText("");

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
      contextBadge: activeJob ? `${activeJob.title} at ${activeJob.company}` : undefined,
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    saveCopilotMessages(profileId, updatedHistory);
    setLoading(true);

    try {
      // Assemble structured context payload
      const historyPayload = updatedHistory.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const profilePayload = activeProfile
        ? {
            title: activeProfile.title,
            background: activeProfile.background,
            interests: activeProfile.interests,
            location: activeProfile.location,
            experience: activeProfile.experience,
            workMode: activeProfile.workMode,
            minSalary: activeProfile.minSalary,
            summaryBio: activeProfile.summaryBio,
            parsedSkills: activeProfile.parsedSkills,
            workHistory: activeProfile.workHistory,
            education: activeProfile.education,
            suggestedRoles: activeProfile.suggestedRoles,
            certifications: activeProfile.certifications,
          }
        : undefined;

      const jobPayload = activeJob
        ? {
            title: activeJob.title,
            company: activeJob.company,
            location: activeJob.location,
            workMode: activeJob.workMode,
            matchScore: activeJob.matchScore,
            whyMatch: activeJob.whyMatch,
            matchingSkills: activeJob.matchingSkills,
            missingSkills: activeJob.missingSkills,
            description: activeJob.description,
          }
        : undefined;

      const roadmapPayload = copilotRoadmap
        ? {
            field: copilotRoadmap.field || "Career Path",
            overview: copilotRoadmap.roadmap?.overview || copilotRoadmap.overview,
            timeline: copilotRoadmap.roadmap?.timeline || copilotRoadmap.timeline,
            completedSteps: copilotRoadmap.completedSteps,
          }
        : undefined;

      const response = await fetch("/api/career-copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          profileContext: profilePayload,
          jobContext: jobPayload,
          roadmapContext: roadmapPayload,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const assistantMsg: CopilotMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.answer || "I've analyzed your career query and recommendations.",
        timestamp: new Date().toISOString(),
        suggestedQuestions: Array.isArray(data.suggestedQuestions) ? data.suggestedQuestions : [],
      };

      const finalHistory = [...updatedHistory, assistantMsg];
      setMessages(finalHistory);
      saveCopilotMessages(profileId, finalHistory);
    } catch (err: any) {
      console.warn("[Career Copilot Frontend Error]:", err);
      setError("Skillsetu Copilot is temporarily unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Clear Copilot conversation history for this profile?")) {
      clearCopilotMessages(profileId);
      const resetMsg: CopilotMessage = {
        id: `welcome-reset-${Date.now()}`,
        role: "assistant",
        content: `Conversation history cleared. How can I help you with your career goals today?`,
        timestamp: new Date().toISOString(),
        suggestedQuestions: [
          "What roles fit my profile?",
          "What skill should I learn next?",
          "How can I prepare for interviews?",
        ],
      };
      setMessages([resetMsg]);
    }
  };

  // Helper to format assistant markdown without unsafe HTML injection
  const renderFormattedText = (content: string) => {
    // Split into paragraphs
    const paragraphs = content.split(/\n\n+/);
    return (
      <div className="space-y-3">
        {paragraphs.map((p, pIdx) => {
          // Check for bullet lists
          if (p.includes("\n• ") || p.startsWith("• ") || p.includes("\n- ") || p.startsWith("- ")) {
            const lines = p.split("\n").filter((l) => l.trim().length > 0);
            return (
              <ul key={pIdx} className="space-y-1.5 my-2">
                {lines.map((line, lIdx) => {
                  const cleanedLine = line.replace(/^[•\-]\s*/, "");
                  return (
                    <li key={lIdx} className="flex items-start gap-2 text-xs sm:text-sm leading-relaxed">
                      <span className="text-amber-400 font-bold mt-0.5">•</span>
                      <span>{renderInlineBold(cleanedLine)}</span>
                    </li>
                  );
                })}
              </ul>
            );
          }

          // Check for numbered lists
          if (/^\d+\.\s/.test(p)) {
            const lines = p.split("\n").filter((l) => l.trim().length > 0);
            return (
              <ol key={pIdx} className="space-y-1.5 my-2">
                {lines.map((line, lIdx) => {
                  const match = line.match(/^(\d+\.)\s*(.*)/);
                  if (match) {
                    return (
                      <li key={lIdx} className="flex items-start gap-2 text-xs sm:text-sm leading-relaxed">
                        <span className="text-amber-400 font-bold text-xs mt-0.5">{match[1]}</span>
                        <span>{renderInlineBold(match[2])}</span>
                      </li>
                    );
                  }
                  return <div key={lIdx}>{renderInlineBold(line)}</div>;
                })}
              </ol>
            );
          }

          // Check for headings
          if (p.startsWith("### ")) {
            return (
              <h4 key={pIdx} className="text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-wider pt-1">
                {renderInlineBold(p.replace(/^###\s*/, ""))}
              </h4>
            );
          }

          return (
            <p key={pIdx} className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
              {renderInlineBold(p)}
            </p>
          );
        })}
      </div>
    );
  };

  // Helper for **bold** text rendering
  const renderInlineBold = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="font-bold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* ───── Floating Global Trigger Button ───── */}
      {!isCopilotOpen && (
        <div className="fixed bottom-5 right-5 z-40 animate-in fade-in zoom-in-95 duration-300">
          <button
            onClick={() => openCopilot()}
            className="group relative flex items-center gap-2.5 bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-3 rounded-full font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/25 border border-amber-300/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            aria-label="Open Skillsetu AI Career Copilot"
          >
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950"></span>
            </span>
            <span className="tracking-wide">✨ Ask Skillsetu</span>
            <span className="hidden sm:inline-block bg-slate-950/15 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest">
              Copilot
            </span>
          </button>
        </div>
      )}

      {/* ───── Slide-Over Drawer Container ───── */}
      {isCopilotOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop overlay (dismiss on click) */}
          <div
            onClick={closeCopilot}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          {/* Right Drawer Panel */}
          <div className="relative w-full sm:w-[460px] md:w-[500px] bg-card border-l border-border/90 shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-border/80 bg-card/95 backdrop-blur-md flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xs shadow-md shadow-amber-500/20">
                  ✨
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-1.5">
                    Skillsetu Copilot
                    <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.2 rounded-full font-semibold uppercase tracking-wider">
                      Advisor
                    </span>
                  </h3>
                  <p className="text-[11px] text-muted tracking-wide">
                    Turn your skills into your next opportunity
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleClearHistory}
                  title="Clear conversation"
                  className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-slate-800/60 transition-colors text-xs cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <button
                  onClick={closeCopilot}
                  title="Close Copilot"
                  className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Context Grounding Bar */}
            <div className="bg-slate-900/80 px-4 py-2.5 border-b border-border/70 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Grounded In:</span>
              
              {/* Profile Chip */}
              {activeProfile ? (
                <span className="bg-amber-500/10 text-amber-300 border border-amber-500/25 px-2.5 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1 truncate max-w-[200px]">
                  <span>👤</span>
                  <span className="truncate">{activeProfile.title}</span>
                </span>
              ) : (
                <span className="text-muted text-[11px] italic">No active profile</span>
              )}

              {/* Scoped Job Chip */}
              {activeJob && (
                <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 px-2.5 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1.5 truncate max-w-[220px]">
                  <span>💼</span>
                  <span className="truncate">{activeJob.title}</span>
                  <button
                    onClick={() => setUnscopedJob(true)}
                    title="Remove job focus"
                    className="hover:text-emerald-100 font-bold ml-0.5 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}

              {/* Scoped Roadmap Chip */}
              {copilotRoadmap && !activeJob && (
                <span className="bg-purple-500/10 text-purple-300 border border-purple-500/25 px-2.5 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1 truncate max-w-[200px]">
                  <span>🗺️</span>
                  <span className="truncate">{copilotRoadmap.field || "Roadmap"}</span>
                </span>
              )}
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                  >
                    {/* Optional Context Tag for user query */}
                    {msg.contextBadge && (
                      <span className="text-[10px] text-muted mb-1 px-2 py-0.5 bg-slate-800/60 rounded-md border border-slate-700/40">
                        Context: {msg.contextBadge}
                      </span>
                    )}

                    <div
                      className={`max-w-[92%] sm:max-w-[88%] rounded-2xl p-4 text-xs sm:text-sm shadow-sm leading-relaxed ${
                        isUser
                          ? "bg-slate-800 border border-amber-500/30 text-foreground rounded-tr-xs"
                          : "bg-background/90 border border-border/80 text-foreground/90 rounded-tl-xs"
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        renderFormattedText(msg.content)
                      )}
                    </div>

                    {/* Suggested follow-up prompt chips */}
                    {!isUser && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                      <div className="mt-2.5 space-y-1.5 max-w-[92%]">
                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider">
                          Suggested Questions:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggestedQuestions.map((q, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSendMessage(q)}
                              disabled={loading}
                              className="text-left bg-card hover:bg-amber-500/15 border border-border hover:border-amber-500/40 text-foreground/80 hover:text-amber-300 text-[11px] px-2.5 py-1 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                            >
                              {q} ➔
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Thinking / Loading Animation */}
              {loading && (
                <div className="flex items-start gap-2 animate-in fade-in duration-200">
                  <div className="bg-background/90 border border-border/80 rounded-2xl rounded-tl-xs p-3.5 shadow-sm">
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
                      <span className="ml-1 text-muted text-[11px]">Skillsetu is analyzing...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 flex items-center justify-between gap-2">
                  <span>{error}</span>
                  <button
                    onClick={() => handleSendMessage()}
                    className="text-amber-400 hover:underline font-bold text-[11px] cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3.5 sm:p-4 border-t border-border/80 bg-card/95 backdrop-blur-md">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-end gap-2 bg-background border border-border focus-within:border-amber-500/50 rounded-2xl p-2 transition-colors"
              >
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={2}
                  maxLength={1500}
                  placeholder="Ask anything about your career, skills, or job matches..."
                  className="flex-1 bg-transparent border-0 outline-none text-xs sm:text-sm text-foreground placeholder:text-muted resize-none px-2 py-1 max-h-28"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || loading}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 p-2.5 rounded-xl font-bold transition-all flex-shrink-0 cursor-pointer shadow-md shadow-amber-500/20 disabled:cursor-not-allowed"
                  aria-label="Send query"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </form>
              <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-muted">
                <span>Press Enter to send • Shift+Enter for new line</span>
                <span>{inputText.length}/1500</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
