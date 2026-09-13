"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function UserAuthModal() {
  const { user, updateUser, loginModalOpen, setLoginModalOpen, profiles, activeProfile, selectActiveProfile } = useApp();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isEditing, setIsEditing] = useState(false);

  if (!loginModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const initials = (name || "User")
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    updateUser({ name, email, avatarText: initials || "SS", isLoggedIn: true });
    setIsEditing(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={() => setLoginModalOpen(false)}
    >
      <div
        className="bg-card border border-amber-500/30 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl shadow-amber-500/10 p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/80 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-amber-500/20">
              {user.avatarText || "SS"}
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">User Profile & Account</h3>
              <p className="text-xs text-muted">Skillsetu Local & Cloud Identity</p>
            </div>
          </div>
          <button
            onClick={() => setLoginModalOpen(false)}
            className="text-muted hover:text-foreground text-lg p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* User Info / Edit Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Divyashakti Sharma"
              className="w-full rounded-xl border border-border bg-background/90 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. you@example.com"
              className="w-full rounded-xl border border-border bg-background/90 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>

          {/* Active Profile Selection */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Current Active Skill Profile
            </label>
            <div className="space-y-2">
              {profiles.map((p) => {
                const isActive = activeProfile?.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectActiveProfile(p.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center justify-between cursor-pointer ${
                      isActive
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-300 font-semibold"
                        : "bg-background/60 border-border text-foreground/80 hover:border-border/80"
                    }`}
                  >
                    <div>
                      <p className="font-bold">{p.title}</p>
                      <p className="text-[11px] text-muted truncate max-w-[240px] mt-0.5">{p.background}</p>
                    </div>
                    {isActive && <span className="text-amber-400 font-bold">✓ Active</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border/80">
            <button
              type="button"
              onClick={() => setLoginModalOpen(false)}
              className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted hover:text-foreground transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2.5 text-sm transition-all cursor-pointer shadow-md shadow-amber-500/20"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
