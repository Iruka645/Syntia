export interface Character {
  id: number;
  name: string;
  description: string;
  greeting: string;
  avatarUrl?: string;
  provider?: string;
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
