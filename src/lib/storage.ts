export type ApplicationStage = "saved" | "applied" | "interview" | "offer" | "rejected";

export interface SkillResource {
  title: string;
  type: "free" | "paid";
  platform: string;
  url?: string;
}

export interface MissingSkill {
  skill: string;
  reason?: string;
  resource?: SkillResource;
}

export interface SkillProfile {
  id: string;
  title: string;
  background: string;
  interests: string;
  location: string;
  experience?: string;
  workMode?: string;
  minSalary?: string;
  createdAt: string;
}

export interface SavedJob {
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
  missingSkills?: MissingSkill[];
  status: ApplicationStage;
  notes?: string;
  appliedDate?: string;
  interviewDate?: string;
  interviewType?: string;
  interviewNotes?: string;
  savedAt: string;
}

export interface SavedRoadmap {
  id: string;
  field: string;
  roadmap: {
    overview: string;
    gettingStarted: string[];
    whereToFind: string[];
    monetization: string[];
    timeline: string;
    encouragement: string;
  };
  completedSteps: number[];
  savedAt: string;
  notes?: string;
}

export interface UserAccount {
  name: string;
  email: string;
  avatarText: string;
  isLoggedIn: boolean;
}

const STORAGE_KEYS = {
  USER: "skillsetu_user",
  PROFILES: "skillsetu_profiles",
  SAVED_JOBS: "skillsetu_saved_jobs",
  SAVED_ROADMAPS: "skillsetu_saved_roadmaps",
  ACTIVE_PROFILE_ID: "skillsetu_active_profile_id",
};

export function getStoredUser(): UserAccount {
  if (typeof window === "undefined") return { name: "Guest User", email: "", avatarText: "GU", isLoggedIn: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : { name: "Dev Explorer", email: "explorer@skillsetu.in", avatarText: "DE", isLoggedIn: true };
  } catch {
    return { name: "Guest User", email: "", avatarText: "GU", isLoggedIn: false };
  }
}

export function saveStoredUser(user: UserAccount): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (err) {
    console.error("Failed to save user:", err);
  }
}

export function getStoredProfiles(): SkillProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILES);
    if (!raw) {
      const defaultProfiles: SkillProfile[] = [
        {
          id: "profile-1",
          title: "Creative Storyteller & Content",
          background: "Writing, standup comedy, scriptwriting",
          interests: "Creative copywriter, scriptwriter, media host",
          location: "India",
          createdAt: new Date().toISOString(),
        },
        {
          id: "profile-2",
          title: "Fullstack Web & React",
          background: "React.js, Next.js, TypeScript, Tailwind CSS",
          interests: "Frontend Engineer, Fullstack Developer",
          location: "Bengaluru, India",
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(defaultProfiles));
      return defaultProfiles;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredProfiles(profiles: SkillProfile[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  } catch (err) {
    console.error("Failed to save profiles:", err);
  }
}

export function getStoredSavedJobs(): SavedJob[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_JOBS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredSavedJobs(jobs: SavedJob[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_JOBS, JSON.stringify(jobs));
  } catch (err) {
    console.error("Failed to save jobs:", err);
  }
}

export function getStoredSavedRoadmaps(): SavedRoadmap[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_ROADMAPS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredSavedRoadmaps(roadmaps: SavedRoadmap[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_ROADMAPS, JSON.stringify(roadmaps));
  } catch (err) {
    console.error("Failed to save roadmaps:", err);
  }
}

export function getActiveProfileId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE_ID);
}

export function setActiveProfileId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE_ID, id);
}
