import type { Memory } from "@/types";

export type MemoryCategory = "declarative" | "procedural";

export interface MemoryEntry extends Memory {
  /** 访问次数 */
  accessCount: number;
  /** 最后访问时间 */
  lastAccessedAt: string;
  /** 来源文档 ID（可选） */
  sourceDocumentId?: string;
}

export interface MemoryStore {
  memories: MemoryEntry[];
}

/**
 * 长期记忆服务
 * - 陈述性记忆：知识点、事实
 * - 程序性记忆：操作习惯、偏好
 * - 衰减机制：长期未访问的记忆权重降低
 * - 锁定机制：用户手动锁定的记忆永不衰减
 */
export class MemoryService {
  private memories: Map<string, MemoryEntry> = new Map();

  /**
   * 添加记忆
   */
  addMemory(entry: Omit<MemoryEntry, "id" | "accessCount" | "lastAccessedAt">): MemoryEntry {
    const id = `mem_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    const memory: MemoryEntry = {
      ...entry,
      id,
      accessCount: 0,
      lastAccessedAt: now,
    };

    this.memories.set(id, memory);
    return memory;
  }

  /**
   * 获取所有记忆
   */
  getAllMemories(category?: MemoryCategory): MemoryEntry[] {
    const all = Array.from(this.memories.values());
    if (category) {
      return all.filter((m) => m.category === category);
    }
    return all;
  }

  /**
   * 获取单条记忆
   */
  getMemory(id: string): MemoryEntry | undefined {
    const mem = this.memories.get(id);
    if (mem) {
      // 更新访问信息
      mem.accessCount++;
      mem.lastAccessedAt = new Date().toISOString();
      this.memories.set(id, mem);
    }
    return mem;
  }

  /**
   * 更新记忆
   */
  updateMemory(id: string, updates: Partial<MemoryEntry>): boolean {
    const mem = this.memories.get(id);
    if (!mem) return false;

    this.memories.set(id, { ...mem, ...updates });
    return true;
  }

  /**
   * 删除记忆
   */
  deleteMemory(id: string): boolean {
    return this.memories.delete(id);
  }

  /**
   * 锁定/解锁记忆
   */
  toggleLock(id: string): boolean {
    const mem = this.memories.get(id);
    if (!mem) return false;

    mem.locked = !mem.locked;
    this.memories.set(id, mem);
    return true;
  }

  /**
   * 应用衰减机制
   * 根据最后访问时间和衰减系数计算当前权重
   * 返回需要清理的低权重记忆 ID 列表
   */
  applyDecay(threshold: number = 0.1): string[] {
    const toRemove: string[] = [];
    const now = Date.now();

    for (const [id, mem] of this.memories) {
      // 锁定的记忆不衰减
      if (mem.locked) continue;

      const daysSinceAccess = (now - new Date(mem.lastAccessedAt).getTime()) / 86400000;
      const decayFactor = Math.pow(mem.decay, daysSinceAccess);

      // 如果权重低于阈值，标记为待清理
      if (decayFactor < threshold) {
        toRemove.push(id);
      }
    }

    // 清理低权重记忆
    for (const id of toRemove) {
      this.memories.delete(id);
    }

    return toRemove;
  }

  /**
   * 语义搜索记忆（基于关键词匹配）
   * TODO: 后续可接入向量检索
   */
  searchMemories(query: string, limit: number = 5): MemoryEntry[] {
    const keyword = query.toLowerCase();
    const scored = Array.from(this.memories.values())
      .map((mem) => {
        const contentLower = mem.content.toLowerCase();
        let score = 0;

        // 精确匹配
        if (contentLower === keyword) score += 10;
        // 包含匹配
        else if (contentLower.includes(keyword)) score += 5;
        // 词频匹配
        else {
          const words = keyword.split(/\s+/);
          for (const word of words) {
            if (contentLower.includes(word)) score += 1;
          }
        }

        // 访问频率加成
        score += mem.accessCount * 0.5;

        return { mem, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.mem);

    return scored;
  }

  /**
   * 压缩相关记忆为摘要
   * 将多条相关记忆合并为一条摘要记忆
   */
  compressMemories(memoryIds: string[], summary: string): MemoryEntry | null {
    const memories = memoryIds.map((id) => this.memories.get(id)).filter(Boolean) as MemoryEntry[];
    if (memories.length === 0) return null;

    // 创建摘要记忆
    const summaryMemory = this.addMemory({
      content: summary,
      category: memories[0].category,
      locked: false,
      decay: 0.95,
      sourceDocumentId: memories[0].sourceDocumentId,
    });

    // 删除原始记忆
    for (const id of memoryIds) {
      this.memories.delete(id);
    }

    return summaryMemory;
  }

  /**
   * 获取记忆统计
   */
  getStats() {
    const all = Array.from(this.memories.values());
    return {
      total: all.length,
      declarative: all.filter((m) => m.category === "declarative").length,
      procedural: all.filter((m) => m.category === "procedural").length,
      locked: all.filter((m) => m.locked).length,
    };
  }

  /**
   * 清空所有记忆
   */
  clear(): void {
    this.memories.clear();
  }
}

// 全局单例
export const memoryService = new MemoryService();
