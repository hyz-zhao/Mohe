import { create } from "zustand";
import type { ViewMode, ActivePanel } from "@/types";

interface EditorState {
  viewMode: ViewMode;
  activePanel: ActivePanel;
  currentDocId: string | null;
  sidebarCollapsed: boolean;
  rightPanelCollapsed: boolean;
  activeNav: string;
  saved: boolean;

  setViewMode: (mode: ViewMode) => void;
  setActivePanel: (panel: ActivePanel) => void;
  setCurrentDocId: (id: string | null) => void;
  toggleSidebar: () => void;
  toggleRightPanel: () => void;
  setActiveNav: (nav: string) => void;
  setSaved: (saved: boolean) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  viewMode: "edit",
  activePanel: "ai",
  currentDocId: null,
  sidebarCollapsed: false,
  rightPanelCollapsed: false,
  activeNav: "知识库",
  saved: true,

  setViewMode: (mode) => set({ viewMode: mode }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setCurrentDocId: (id) => set({ currentDocId: id }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleRightPanel: () =>
    set((s) => ({ rightPanelCollapsed: !s.rightPanelCollapsed })),
  setActiveNav: (nav) => set({ activeNav: nav }),
  setSaved: (saved) => set({ saved }),
}));
