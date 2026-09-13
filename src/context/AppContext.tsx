"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  ApplicationStage,
  MissingSkill,
  SavedJob,
  SavedRoadmap,
  SkillProfile,
  UserAccount,
  getActiveProfileId,
  getStoredProfiles,
  getStoredSavedJobs,
  getStoredSavedRoadmaps,
  getStoredUser,
  saveStoredProfiles,
  saveStoredSavedJobs,
  saveStoredSavedRoadmaps,
  saveStoredUser,
  setActiveProfileId,
} from "@/lib/storage";

interface AppContextType {
  user: UserAccount;
  setUser: (user: UserAccount) => void;
  updateUser: (data: Partial<UserAccount>) => void;
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;

  profiles: SkillProfile[];
  activeProfile: SkillProfile | null;
  saveProfile: (profile: Omit<SkillProfile, "id" | "createdAt"> & { id?: string }) => void;
  deleteProfile: (id: string) => void;
  selectActiveProfile: (id: string) => void;

  savedJobs: SavedJob[];
  saveJob: (job: Omit<SavedJob, "status" | "savedAt">) => void;
  removeSavedJob: (id: string) => void;
  updateJobStatus: (id: string, status: ApplicationStage) => void;
  updateJobNotes: (id: string, notes: string) => void;
  isJobSaved: (id: string) => boolean;

  savedRoadmaps: SavedRoadmap[];
  saveRoadmap: (data: { field: string; roadmap: SavedRoadmap["roadmap"]; completedSteps?: number[] }) => void;
  toggleRoadmapStep: (roadmapId: string, stepIndex: number) => void;
  removeSavedRoadmap: (id: string) => void;
  isRoadmapSaved: (field: string) => boolean;
  getSavedRoadmapByField: (field: string) => SavedRoadmap | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserAccount>({
    name: "Dev Explorer",
    email: "explorer@skillsetu.in",
    avatarText: "DE",
    isLoggedIn: true,
  });

  const [profiles, setProfiles] = useState<SkillProfile[]>([]);
  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(null);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [savedRoadmaps, setSavedRoadmaps] = useState<SavedRoadmap[]>([]);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    setUserState(getStoredUser());
    const profs = getStoredProfiles();
    setProfiles(profs);
    const activeId = getActiveProfileId() || profs[0]?.id || null;
    setActiveProfileIdState(activeId);
    setSavedJobs(getStoredSavedJobs());
    setSavedRoadmaps(getStoredSavedRoadmaps());
    setIsLoaded(true);
  }, []);

  const setUser = (u: UserAccount) => {
    setUserState(u);
    saveStoredUser(u);
  };

  const updateUser = (data: Partial<UserAccount>) => {
    const updated = { ...user, ...data };
    setUserState(updated);
    saveStoredUser(updated);
  };

  const selectActiveProfile = (id: string) => {
    setActiveProfileIdState(id);
    setActiveProfileId(id);
  };

  const saveProfile = (data: Omit<SkillProfile, "id" | "createdAt"> & { id?: string }) => {
    let updated: SkillProfile[];
    if (data.id) {
      updated = profiles.map((p) =>
        p.id === data.id ? { ...p, ...data } : p
      );
    } else {
      const newProf: SkillProfile = {
        id: `profile-${Date.now()}`,
        title: data.title || "Custom Skill Profile",
        background: data.background,
        interests: data.interests,
        location: data.location,
        experience: data.experience,
        workMode: data.workMode,
        minSalary: data.minSalary,
        createdAt: new Date().toISOString(),
      };
      updated = [newProf, ...profiles];
      selectActiveProfile(newProf.id);
    }
    setProfiles(updated);
    saveStoredProfiles(updated);
  };

  const deleteProfile = (id: string) => {
    const updated = profiles.filter((p) => p.id !== id);
    setProfiles(updated);
    saveStoredProfiles(updated);
    if (activeProfileId === id && updated.length > 0) {
      selectActiveProfile(updated[0].id);
    }
  };

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0] || null;

  /* ───── Saved Jobs & Application Tracker ───── */

  const isJobSaved = (id: string) => savedJobs.some((j) => j.id === id);

  const saveJob = (job: Omit<SavedJob, "status" | "savedAt">) => {
    if (isJobSaved(job.id)) {
      // Remove if already saved (toggle behaviour)
      removeSavedJob(job.id);
      return;
    }
    const newSavedJob: SavedJob = {
      ...job,
      status: "saved",
      savedAt: new Date().toISOString(),
    };
    const updated = [newSavedJob, ...savedJobs];
    setSavedJobs(updated);
    saveStoredSavedJobs(updated);
  };

  const removeSavedJob = (id: string) => {
    const updated = savedJobs.filter((j) => j.id !== id);
    setSavedJobs(updated);
    saveStoredSavedJobs(updated);
  };

  const updateJobStatus = (id: string, status: ApplicationStage) => {
    const updated = savedJobs.map((j) =>
      j.id === id
        ? {
            ...j,
            status,
            appliedDate: status === "applied" && !j.appliedDate ? new Date().toISOString() : j.appliedDate,
          }
        : j
    );
    setSavedJobs(updated);
    saveStoredSavedJobs(updated);
  };

  const updateJobNotes = (id: string, notes: string) => {
    const updated = savedJobs.map((j) => (j.id === id ? { ...j, notes } : j));
    setSavedJobs(updated);
    saveStoredSavedJobs(updated);
  };

  /* ───── Saved Roadmaps & Checklists ───── */

  const isRoadmapSaved = (field: string) =>
    savedRoadmaps.some((r) => r.field.toLowerCase() === field.toLowerCase());

  const getSavedRoadmapByField = (field: string) =>
    savedRoadmaps.find((r) => r.field.toLowerCase() === field.toLowerCase());

  const saveRoadmap = (data: {
    field: string;
    roadmap: SavedRoadmap["roadmap"];
    completedSteps?: number[];
  }) => {
    const existing = getSavedRoadmapByField(data.field);
    let updated: SavedRoadmap[];
    if (existing) {
      updated = savedRoadmaps.map((r) =>
        r.id === existing.id
          ? {
              ...r,
              roadmap: data.roadmap,
              completedSteps: data.completedSteps || r.completedSteps,
            }
          : r
      );
    } else {
      const newRoadmap: SavedRoadmap = {
        id: `roadmap-${Date.now()}`,
        field: data.field,
        roadmap: data.roadmap,
        completedSteps: data.completedSteps || [],
        savedAt: new Date().toISOString(),
      };
      updated = [newRoadmap, ...savedRoadmaps];
    }
    setSavedRoadmaps(updated);
    saveStoredSavedRoadmaps(updated);
  };

  const toggleRoadmapStep = (roadmapId: string, stepIndex: number) => {
    const updated = savedRoadmaps.map((r) => {
      if (r.id === roadmapId) {
        const has = r.completedSteps.includes(stepIndex);
        const steps = has
          ? r.completedSteps.filter((s) => s !== stepIndex)
          : [...r.completedSteps, stepIndex].sort((a, b) => a - b);
        return { ...r, completedSteps: steps };
      }
      return r;
    });
    setSavedRoadmaps(updated);
    saveStoredSavedRoadmaps(updated);
  };

  const removeSavedRoadmap = (id: string) => {
    const updated = savedRoadmaps.filter((r) => r.id !== id);
    setSavedRoadmaps(updated);
    saveStoredSavedRoadmaps(updated);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        updateUser,
        loginModalOpen,
        setLoginModalOpen,
        profiles,
        activeProfile,
        saveProfile,
        deleteProfile,
        selectActiveProfile,
        savedJobs,
        saveJob,
        removeSavedJob,
        updateJobStatus,
        updateJobNotes,
        isJobSaved,
        savedRoadmaps,
        saveRoadmap,
        toggleRoadmapStep,
        removeSavedRoadmap,
        isRoadmapSaved,
        getSavedRoadmapByField,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
