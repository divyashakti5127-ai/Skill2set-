export interface CopilotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  suggestedQuestions?: string[];
  contextBadge?: string;
}

export interface CopilotSessionRecord {
  profileId: string;
  updatedAt: string;
  messages: CopilotMessage[];
}

const COPILOT_STORAGE_KEY = "skill2set_copilot_history_v1";
const LEGACY_COPILOT_STORAGE_KEY = "skillsetu_copilot_history_v1";
const MAX_STORED_MESSAGES = 20;

function getStoredSessions(): Record<string, CopilotSessionRecord> {
  if (typeof window === "undefined") return {};
  try {
    let raw = localStorage.getItem(COPILOT_STORAGE_KEY);
    if (!raw) {
      raw = localStorage.getItem(LEGACY_COPILOT_STORAGE_KEY);
      if (raw) {
        localStorage.setItem(COPILOT_STORAGE_KEY, raw);
      }
    }
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.warn("[Copilot Storage] Failed to parse sessions, resetting:", err);
    return {};
  }
}

function saveStoredSessions(sessions: Record<string, CopilotSessionRecord>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COPILOT_STORAGE_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.warn("[Copilot Storage] Failed to write sessions to localStorage:", err);
  }
}

export function getCopilotMessages(profileId = "default"): CopilotMessage[] {
  const sessions = getStoredSessions();
  const session = sessions[profileId];
  if (session && Array.isArray(session.messages)) {
    return session.messages;
  }
  return [];
}

export function saveCopilotMessages(profileId = "default", messages: CopilotMessage[]): void {
  const sessions = getStoredSessions();
  // Bound to last MAX_STORED_MESSAGES to prevent storage exhaustion
  const boundedMessages = messages.slice(-MAX_STORED_MESSAGES);
  sessions[profileId] = {
    profileId,
    updatedAt: new Date().toISOString(),
    messages: boundedMessages,
  };
  saveStoredSessions(sessions);
}

export function clearCopilotMessages(profileId = "default"): void {
  const sessions = getStoredSessions();
  delete sessions[profileId];
  saveStoredSessions(sessions);
}
