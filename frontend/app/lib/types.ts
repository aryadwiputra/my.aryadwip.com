export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export type Mood = "great" | "good" | "okay" | "low" | "bad";

export interface JournalPrompts {
  gratitude?: string;
  intention?: string;
  affirmation?: string;
}

export interface Journal {
  id: string;
  date: string; // YYYY-MM-DD
  mood?: Mood | null;
  energy?: number | null;
  prompts: JournalPrompts;
  createdAt: number;
  updatedAt: number;
}

export interface JournalStreaks {
  current: number;
  longest: number;
}

export interface JournalPayload {
  mood?: Mood;
  energy?: number;
  prompts?: JournalPrompts;
}