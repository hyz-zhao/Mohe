import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Settings } from "@/types";

interface SettingsState extends Settings {
  setApiProvider: (provider: Settings["apiProvider"]) => void;
  setApiKey: (key: string) => void;
  setBaseUrl: (url: string) => void;
  setModel: (model: string) => void;
  setEmbeddingModel: (model: string) => void;
}

const DEFAULT_SETTINGS: Settings = {
  apiProvider: "ollama",
  apiKey: "",
  baseUrl: "http://localhost:11434",
  model: "qwen2.5:latest",
  embeddingModel: "nomic-embed-text",
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      setApiProvider: (provider) => set({ apiProvider: provider }),
      setApiKey: (apiKey) => set({ apiKey }),
      setBaseUrl: (baseUrl) => set({ baseUrl }),
      setModel: (model) => set({ model }),
      setEmbeddingModel: (embeddingModel) => set({ embeddingModel }),
    }),
    {
      name: "mohe-settings",
      partialize: (state) => ({
        apiProvider: state.apiProvider,
        apiKey: state.apiKey,
        baseUrl: state.baseUrl,
        model: state.model,
        embeddingModel: state.embeddingModel,
      }),
    }
  )
);
