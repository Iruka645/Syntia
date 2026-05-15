

export interface Character {
  id: number;
  name: string;
  description: string;
  greeting: string;
  avatarUrl?: string;
  provider?: string;
  model?: string;
  systemPrompt: string;
  apiKey?: string;
}

export interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface UserArchive {
  id: number;
  name: string;
  content: string;
  isDefault: boolean;
}

export interface Chat {
  id: number;
  character: Character;
  archiveId?: number | null;
  archive?: UserArchive | null;
}

export interface SessionUser {
  id: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  image?: string | null;
}

export type JsonValue = string | number | boolean | null | { [key: string]: JsonValue } | JsonValue[];

export interface ApiResponse<T = JsonValue> {
  data?: T;
  message?: string;
  error?: string;
}
