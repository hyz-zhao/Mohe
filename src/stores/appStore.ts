import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Document, FileTreeNode } from "@/types";

export interface UserInfo {
  username: string;
  avatar: string; // base64 encoded image or emoji
}

export interface TagItem {
  id: string;
  name: string;
  color: string;
  docIds: string[];
}

export interface TrashedDoc {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  pinned?: boolean;
  starred?: boolean;
}

interface AppState {
  documents: Document[];
  searchQuery: string;
  activeTab: "all" | "mine" | "starred";
  userInfo: UserInfo;
  tags: TagItem[];
  trashedDocs: TrashedDoc[];
  fileTree: FileTreeNode[];

  setDocuments: (docs: Document[]) => void;
  addDocument: (doc: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  touchDocument: (id: string) => void;
  deleteDocument: (id: string) => void;
  trashDocument: (id: string) => void;
  restoreDocument: (id: string) => void;
  permanentlyDelete: (id: string) => void;
  clearTrash: () => void;
  toggleStar: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setActiveTab: (tab: "all" | "mine" | "starred") => void;
  setUserInfo: (info: Partial<UserInfo>) => void;
  addTag: (name: string, color: string) => void;
  removeTag: (id: string) => void;
  renameTag: (id: string, name: string) => void;
  toggleTagOnDoc: (tagId: string, docId: string) => void;
  addFolder: (parentId: string | null, name: string) => void;
  addFile: (parentId: string | null, name: string) => void;
  renameFileNode: (id: string, name: string) => void;
  deleteFileNode: (id: string) => void;
}

const DEFAULT_USER_INFO: UserInfo = {
  username: "用户",
  avatar: "",
};

const DEFAULT_TAGS: TagItem[] = [
  { id: "t1", name: "设计原则", color: "#3b82f6", docIds: ["1"] },
  { id: "t2", name: "方法论", color: "#10b981", docIds: ["1", "3"] },
  { id: "t3", name: "UX", color: "#f59e0b", docIds: ["4"] },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
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
      tags: DEFAULT_TAGS,
      trashedDocs: [],
      fileTree: [
        {
          id: "folder-docs",
          name: "文档",
          type: "folder",
          children: [
            { id: "file-3", name: "组件化设计思维", type: "file", docId: "3" },
            { id: "file-1", name: "设计原则总览", type: "file", docId: "1" },
            { id: "file-2", name: "Nexus 设计系统介绍", type: "file", docId: "2" },
            { id: "file-4", name: "用户体验设计指南", type: "file", docId: "4" },
            { id: "file-5", name: "信息架构与内容组织", type: "file", docId: "5" },
          ],
        },
        {
          id: "folder-project",
          name: "项目文件",
          type: "folder",
          children: [
            { id: "pf-gitignore", name: ".gitignore", type: "file" },
            { id: "pf-sdd", name: "软件设计说明书_SDD.md", type: "file" },
            { id: "pf-design", name: "设计开发文档.md", type: "file" },
            { id: "pf-index", name: "index.html", type: "file" },
            { id: "pf-pkg", name: "package.json", type: "file" },
            { id: "pf-readme", name: "README.md", type: "file" },
            { id: "pf-tailwind", name: "tailwind.config.js", type: "file" },
            { id: "pf-tsconfig", name: "tsconfig.json", type: "file" },
            { id: "pf-vite", name: "vite.config.ts", type: "file" },
          ],
        },
      ],

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
      trashDocument: (id) =>
        set((s) => {
          const doc = s.documents.find((d) => d.id === id);
          if (!doc) return s;
          const trashed: TrashedDoc = {
            ...doc,
            deleted_at: new Date().toISOString(),
          };
          return {
            documents: s.documents.filter((d) => d.id !== id),
            trashedDocs: [trashed, ...s.trashedDocs],
          };
        }),
      restoreDocument: (id) =>
        set((s) => {
          const doc = s.trashedDocs.find((d) => d.id === id);
          if (!doc) return s;
          const restored: Document = {
            id: doc.id,
            title: doc.title,
            content: doc.content,
            created_at: doc.created_at,
            updated_at: new Date().toISOString(),
            pinned: doc.pinned,
            starred: doc.starred,
          };
          return {
            documents: [restored, ...s.documents],
            trashedDocs: s.trashedDocs.filter((d) => d.id !== id),
          };
        }),
      permanentlyDelete: (id) =>
        set((s) => ({
          trashedDocs: s.trashedDocs.filter((d) => d.id !== id),
        })),
      clearTrash: () => set({ trashedDocs: [] }),
      toggleStar: (id) =>
        set((s) => ({
          documents: s.documents.map((d) =>
            d.id === id ? { ...d, starred: !d.starred } : d
          ),
        })),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setUserInfo: (info) => set((s) => ({ userInfo: { ...s.userInfo, ...info } })),
      addTag: (name, color) =>
        set((s) => ({
          tags: [...s.tags, { id: `t${Date.now()}`, name, color, docIds: [] }],
        })),
      removeTag: (id) =>
        set((s) => ({
          tags: s.tags.filter((t) => t.id !== id),
        })),
      renameTag: (id, name) =>
        set((s) => ({
          tags: s.tags.map((t) => (t.id === id ? { ...t, name } : t)),
        })),
      toggleTagOnDoc: (tagId, docId) =>
        set((s) => ({
          tags: s.tags.map((t) => {
            if (t.id !== tagId) return t;
            const has = t.docIds.includes(docId);
            return {
              ...t,
              docIds: has ? t.docIds.filter((id) => id !== docId) : [...t.docIds, docId],
            };
          }),
        })),
      addFolder: (parentId, name) =>
        set((s) => {
          const newFolder: FileTreeNode = {
            id: `folder-${Date.now()}`,
            name,
            type: "folder",
            children: [],
          };
          if (!parentId) {
            return { fileTree: [...s.fileTree, newFolder] };
          }
          const addToParent = (nodes: FileTreeNode[]): FileTreeNode[] =>
            nodes.map((node) => {
              if (node.id === parentId && node.type === "folder") {
                return { ...node, children: [...(node.children || []), newFolder] };
              }
              if (node.children) {
                return { ...node, children: addToParent(node.children) };
              }
              return node;
            });
          return { fileTree: addToParent(s.fileTree) };
        }),
      addFile: (parentId, name) =>
        set((s) => {
          const finalName = name.includes(".") ? name : `${name}.md`;
          const docId = `doc-${Date.now()}`;
          const newFile: FileTreeNode = {
            id: `file-${Date.now()}`,
            name: finalName,
            type: "file",
            docId,
          };
          const newDoc: Document = {
            id: docId,
            title: finalName.replace(/\.[^.]+$/, ""),
            content: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          let newTree = s.fileTree;
          if (!parentId) {
            newTree = [...s.fileTree, newFile];
          } else {
            const addToParent = (nodes: FileTreeNode[]): FileTreeNode[] =>
              nodes.map((node) => {
                if (node.id === parentId && node.type === "folder") {
                  return { ...node, children: [...(node.children || []), newFile] };
                }
                if (node.children) {
                  return { ...node, children: addToParent(node.children) };
                }
                return node;
              });
            newTree = addToParent(s.fileTree);
          }
          return { fileTree: newTree, documents: [newDoc, ...s.documents] };
        }),
      renameFileNode: (id, name) =>
        set((s) => {
          const renameInTree = (nodes: FileTreeNode[]): FileTreeNode[] =>
            nodes.map((node) => {
              if (node.id === id) {
                return { ...node, name };
              }
              if (node.children) {
                return { ...node, children: renameInTree(node.children) };
              }
              return node;
            });
          return { fileTree: renameInTree(s.fileTree) };
        }),
      deleteFileNode: (id) =>
        set((s) => {
          const removeFromTree = (nodes: FileTreeNode[]): FileTreeNode[] =>
            nodes
              .filter((node) => node.id !== id)
              .map((node) => {
                if (node.children) {
                  return { ...node, children: removeFromTree(node.children) };
                }
                return node;
              });
          return { fileTree: removeFromTree(s.fileTree) };
        }),
    }),
    {
      name: "mohe-app-data",
      partialize: (state) => ({
        userInfo: state.userInfo,
        documents: state.documents,
        tags: state.tags,
        trashedDocs: state.trashedDocs,
        fileTree: state.fileTree,
      }),
    }
  )
);
