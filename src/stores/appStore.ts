import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Document } from "@/types";

export interface UserInfo {
  username: string;
  avatar: string; // base64 encoded image or emoji
}

interface AppState {
  documents: Document[];
  searchQuery: string;
  activeTab: "all" | "mine" | "starred";
  userInfo: UserInfo;

  setDocuments: (docs: Document[]) => void;
  addDocument: (doc: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  touchDocument: (id: string) => void;
  deleteDocument: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setActiveTab: (tab: "all" | "mine" | "starred") => void;
  setUserInfo: (info: Partial<UserInfo>) => void;
}

const DEFAULT_USER_INFO: UserInfo = {
  username: "用户",
  avatar: "👤",
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      documents: [
        {
          id: "1",
          title: "设计原则总览",
          content: "# 设计原则总览\n\n设计原则是我们面对复杂设计决策时的北极星。\n\n## 1. 以用户为中心\n\n所有设计决策都应基于对用户需求的深刻理解。\n\n> 理解用户的真实需求，而不是假设他们需要什么。\n> — Steve Jobs\n\n## 2. 简单而不简陋\n\n简单是复杂的终极体现，我们通过精简界面、聚焦核心功能和消除不必要的干扰，来帮助用户更轻松地达成目标。",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          pinned: true,
          starred: true,
        },
        {
          id: "2",
          title: "Nexus 设计系统介绍",
          content: "# Nexus 设计系统\n\nNexus 是一套完整的设计系统。",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "3",
          title: "组件化设计思维",
          content: "# 组件化设计思维\n\n组件化是现代前端开发的核心范式。",
          created_at: new Date(Date.now() - 172800000).toISOString(),
          updated_at: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: "4",
          title: "用户体验设计指南",
          content: "# 用户体验设计指南\n\nUX 设计是产品成功的关键。",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "5",
          title: "信息架构与内容组织",
          content: "# 信息架构与内容组织\n\n良好的信息架构是用户体验的基础。",
          created_at: new Date("2026-05-14").toISOString(),
          updated_at: new Date("2026-05-14").toISOString(),
        },
      ],
      searchQuery: "",
      activeTab: "all",
      userInfo: DEFAULT_USER_INFO,

      setDocuments: (docs) => set({ documents: docs }),
      addDocument: (doc) => set((s) => ({ documents: [doc, ...s.documents] })),
      updateDocument: (id, updates) =>
        set((s) => ({
          documents: s.documents.map((d) =>
            d.id === id ? { ...d, ...updates, updated_at: new Date().toISOString() } : d
          ),
        })),
      touchDocument: (id) =>
        set((s) => {
          const idx = s.documents.findIndex((d) => d.id === id);
          if (idx <= 0) return s;
          const docs = [...s.documents];
          const [doc] = docs.splice(idx, 1);
          docs.unshift(doc);
          return { documents: docs };
        }),
      deleteDocument: (id) =>
        set((s) => ({ documents: s.documents.filter((d) => d.id !== id) })),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setUserInfo: (info) => set((s) => ({ userInfo: { ...s.userInfo, ...info } })),
    }),
    {
      name: "mohe-app-data",
      partialize: (state) => ({ userInfo: state.userInfo, documents: state.documents }),
    }
  )
);
