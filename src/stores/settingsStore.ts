import { create } from "zustand";
import type { Settings } from "@/types";

interface SettingsState extends Settings {
  setApiProvider: (provider: Settings["apiProvider"]) => void;
  setApiKey: (key: string) => void;
  setBaseUrl: (url: string) => void;
  setModel: (model: string) => void;
  setEmbeddingModel: (model: string) => void;
}

const defaultSettings: Settings = {
  apiProvider: "ollama",
  apiKey: "",
  baseUrl: "http://localhost:11434",
  model: "qwen2.5:latest",
  embeddingModel: "nomic-embed-text",
};

export const useSettingsStore = create<SettingsState>((set) => ({
  ...defaultSettings,

  setApiProvider: (provider) => set({ apiProvider: provider }),
  setApiKey: (apiKey) => set({ apiKey }),
  setBaseUrl: (baseUrl) => set({ baseUrl }),
  setModel: (model) => set({ model }),
  setEmbeddingModel: (embeddingModel) => set({ embeddingModel }),
}));
