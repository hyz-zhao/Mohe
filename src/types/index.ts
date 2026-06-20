export interface Document {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  pinned?: boolean;
  starred?: boolean;
}

export interface Memory {
  id: string;
  content: string;
  category: "declarative" | "procedural";
  locked: boolean;
  decay: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export type Theme = "cream" | "dark";

export interface Settings {
  apiProvider: "openai" | "ollama";
  apiKey: string;
  baseUrl: string;
  model: string;
  embeddingModel: string;
  theme: Theme;
}

export type ViewMode = "edit" | "preview" | "split";

export type ActivePanel = "none" | "ai" | "outline";
