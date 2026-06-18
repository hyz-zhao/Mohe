import { create } from "zustand";
import { memoryService, type MemoryEntry, type MemoryCategory } from "@/services/memoryService";

interface MemoryState {
  memories: MemoryEntry[];
  selectedCategory: MemoryCategory | "all";

  loadMemories: (category?: MemoryCategory) => void;
  addMemory: (entry: Omit<MemoryEntry, "id" | "accessCount" | "lastAccessedAt">) => MemoryEntry;
  deleteMemory: (id: string) => void;
  toggleLock: (id: string) => void;
  applyDecay: (threshold?: number) => string[];
  searchMemories: (query: string, limit?: number) => MemoryEntry[];
  setSelectedCategory: (category: MemoryCategory | "all") => void;
  getStats: () => { total: number; declarative: number; procedural: number; locked: number };
}

export const useMemoryStore = create<MemoryState>((set, get) => ({
  memories: [],
  selectedCategory: "all",

  loadMemories: (category) => {
    const memories = memoryService.getAllMemories(category);
    set({ memories });
  },

  addMemory: (entry) => {
    const memory = memoryService.addMemory(entry);
    set((s) => ({ memories: [memory, ...s.memories] }));
    return memory;
  },

  deleteMemory: (id) => {
    memoryService.deleteMemory(id);
    set((s) => ({ memories: s.memories.filter((m) => m.id !== id) }));
  },

  toggleLock: (id) => {
    memoryService.toggleLock(id);
    set((s) => ({
      memories: s.memories.map((m) =>
        m.id === id ? { ...m, locked: !m.locked } : m
      ),
    }));
  },

  applyDecay: (threshold) => {
    const removed = memoryService.applyDecay(threshold);
    set((s) => ({
      memories: s.memories.filter((m) => !removed.includes(m.id)),
    }));
    return removed;
  },

  searchMemories: (query, limit) => {
    return memoryService.searchMemories(query, limit);
  },

  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
    get().loadMemories(category === "all" ? undefined : category);
  },

  getStats: () => memoryService.getStats(),
}));
