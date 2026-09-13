"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function UserAuthModal() {
  const {
    user,
    updateUser,
    loginModalOpen,
    setLoginModalOpen,
    profiles,
    activeProfile,
    selectActiveProfile,
    saveProfile,
    updateProfileTitle,
    deleteProfile,
  } = useApp();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [activeTab, setActiveTab] = useState<"profiles" | "account">("profiles");

  // Profile editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitleDraft, setEditTitleDraft] = useState("");

  // New profile creation state
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSkills, setNewSkills] = useState("");
  const [newInterests, setNewInterests] = useState("");
  const [newLocation, setNewLocation] = useState("India");

  if (!loginModalOpen) return null;

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const initials = (name || "User")
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    updateUser({ name, email, avatarText: initials || "SS", isLoggedIn: true });
    setActiveTab("profiles");
  };

  const handleStartEdit = (p: { id: string; title: string }) => {
    setEditingId(p.id);
    setEditTitleDraft(p.title);
  };

  const handleSaveEditTitle = (id: string) => {
    if (editTitleDraft.trim()) {
      updateProfileTitle(id, editTitleDraft.trim());
    }
    setEditingId(null);
  };

  const handleCreateNewProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSkills.trim()) return;

    saveProfile({
      title: newTitle.trim(),
      background: newSkills.trim(),
      interests: newInterests.trim(),
      location: newLocation.trim() || "India",
    });

    setIsCreatingNew(false);
    setNewTitle("");
    setNewSkills("");
    setNewInterests("");
    setNewLocation("India");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={() => setLoginModalOpen(false)}
    >
      <div
        className="bg-card border border-amber-500/35 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl shadow-amber-500/15 p-6 sm:p-7 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/80 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-amber-500/20">
              {user.avatarText || "SS"}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-foreground tracking-tight">
                {user.name || "My Account"}
              </h3>
              <p className="text-xs text-muted truncate max-w-[220px]">
                {user.email || "explorer@skillsetu.in"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setLoginModalOpen(false)}
            className="text-muted hover:text-foreground text-lg p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mb-4 bg-background/80 p-1 rounded-2xl border border-border">
          <button
            type="button"
            onClick={() => setActiveTab("profiles")}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "profiles"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-muted hover:text-foreground"
            }`}
          >
            <span>👤</span>
            <span>My Skill Profiles ({profiles.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("account")}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "account"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-muted hover:text-foreground"
            }`}
          >
            <span>⚙️</span>
            <span>Account Settings</span>
          </button>
        </div>

        {/* Tab 1: My Skill Profiles */}
        {activeTab === "profiles" && (
          <div className="space-y-4 overflow-y-auto flex-1 pr-1">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-foreground">My Skill Profiles</h4>
                <p className="text-xs text-muted">Switch active profile or manage saved paths</p>
              </div>

              {!isCreatingNew && (
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(true)}
                  className="rounded-xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-500 text-amber-300 font-bold px-3 py-1.5 text-xs transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>+ New Profile</span>
                </button>
              )}
            </div>

            {/* Create New Profile Form */}
            {isCreatingNew && (
              <form
                onSubmit={handleCreateNewProfile}
                className="bg-background/90 border border-amber-500/40 rounded-2xl p-4 space-y-3 shadow-inner"
              >
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-amber-300">Create New Skill Profile</h5>
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    className="text-xs text-muted hover:text-foreground cursor-pointer"
                  >
                    ✕ Cancel
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted mb-1">
                    Profile Title
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Dance Educator, Graphic Designer"
                    required
                    className="w-full text-xs rounded-xl bg-card border border-border px-3 py-2 text-foreground focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted mb-1">
                    Skills & Background
                  </label>
                  <input
                    type="text"
                    value={newSkills}
                    onChange={(e) => setNewSkills(e.target.value)}
                    placeholder="e.g. Contemporary dance, choreography, teaching"
                    required
                    className="w-full text-xs rounded-xl bg-card border border-border px-3 py-2 text-foreground focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted mb-1">
                      Target Interests (Optional)
                    </label>
                    <input
                      type="text"
                      value={newInterests}
                      onChange={(e) => setNewInterests(e.target.value)}
                      placeholder="e.g. Dance Instructor"
                      className="w-full text-xs rounded-xl bg-card border border-border px-3 py-2 text-foreground focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="e.g. India, Remote"
                      className="w-full text-xs rounded-xl bg-card border border-border px-3 py-2 text-foreground focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold py-2 text-xs shadow-md shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  Save & Activate Profile
                </button>
              </form>
            )}

            {/* Profile List */}
            <div className="space-y-3">
              {profiles.length === 0 ? (
                <div className="p-6 border border-dashed border-border rounded-2xl text-center">
                  <p className="text-xs text-muted">No saved skill profiles found.</p>
                </div>
              ) : (
                profiles.map((p) => {
                  const isActive = activeProfile?.id === p.id;
                  const isEditingThis = editingId === p.id;

                  return (
                    <div
                      key={p.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isActive
                          ? "bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10"
                          : "bg-background/70 border-border hover:border-amber-500/30"
                      }`}
                    >
                      {/* Top row: Title and Active status */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        {isEditingThis ? (
                          <div className="flex items-center gap-1.5 flex-1 mr-2">
                            <input
                              type="text"
                              value={editTitleDraft}
                              onChange={(e) => setEditTitleDraft(e.target.value)}
                              className="text-xs font-bold bg-card border border-amber-500 rounded-lg px-2.5 py-1 text-foreground flex-1 focus:outline-none"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEditTitle(p.id)}
                              className="text-[11px] bg-amber-500 text-slate-950 font-bold px-2 py-1 rounded-lg cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="text-[11px] text-muted hover:text-foreground px-1.5 py-1 cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs sm:text-sm font-extrabold text-foreground">
                              {p.title}
                            </h5>
                            {isActive && (
                              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full shadow-sm">
                                ✓ Active
                              </span>
                            )}
                          </div>
                        )}

                        {/* Actions: Rename / Delete */}
                        {!isEditingThis && (
                          <div className="flex items-center gap-1 text-xs">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(p)}
                              className="text-muted hover:text-amber-400 p-1 transition-colors cursor-pointer"
                              title="Edit profile name"
                            >
                              ✏️
                            </button>
                            {profiles.length > 1 && (
                              <button
                                type="button"
                                onClick={() => deleteProfile(p.id)}
                                className="text-muted hover:text-red-400 p-1 transition-colors cursor-pointer"
                                title="Delete profile"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Summary */}
                      <p className="text-xs text-muted/90 line-clamp-2 mt-1">
                        ⚡ <span className="font-semibold text-foreground/80">Skills:</span> {p.background}
                      </p>
                      {p.interests && (
                        <p className="text-[11px] text-muted/80 line-clamp-1 mt-0.5">
                          🎯 <span className="text-muted">Target:</span> {p.interests}
                        </p>
                      )}
                      <p className="text-[10px] text-muted/70 mt-1">📍 {p.location || "India"}</p>

                      {/* Switch Active Button */}
                      {!isActive && (
                        <div className="mt-3 pt-2 border-t border-border/60 flex justify-end">
                          <button
                            type="button"
                            onClick={() => selectActiveProfile(p.id)}
                            className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>Switch to this profile →</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Account Settings */}
        {activeTab === "account" && (
          <form onSubmit={handleSaveAccount} className="space-y-4 overflow-y-auto flex-1 pr-1">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Divyashakti Sharma"
                className="w-full rounded-2xl border border-border bg-background px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. explorer@skillsetu.in"
                className="w-full rounded-2xl border border-border bg-background px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-2.5 text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                Save Account Info
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-border/80 mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setLoginModalOpen(false)}
            className="rounded-2xl border border-border px-5 py-2.5 text-xs sm:text-sm font-medium text-muted hover:text-foreground hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
