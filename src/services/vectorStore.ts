import type { Chunk } from "./chunker";

/**
 * RAG 向量存储（前端内存版）
 * 后续可迁移到 sqlite-vss 或 Tauri 后端
 */

interface StoredChunk extends Chunk {
  embedding: number[];
}

export class VectorStore {
  private chunks: Map<string, StoredChunk> = new Map();

  /**
   * 存储文档分块
   */
  addChunks(chunks: StoredChunk[]): void {
    for (const chunk of chunks) {
      this.chunks.set(chunk.id, chunk);
    }
  }

  /**
   * 删除文档的所有分块
   */
  removeDocumentChunks(documentId: string): void {
    for (const [id, chunk] of this.chunks) {
      if (chunk.documentId === documentId) {
        this.chunks.delete(id);
      }
    }
  }

  /**
   * 获取文档的所有分块
   */
  getDocumentChunks(documentId: string): StoredChunk[] {
    return Array.from(this.chunks.values()).filter(
      (c) => c.documentId === documentId
    );
  }

  /**
   * 获取所有分块
   */
  getAllChunks(): StoredChunk[] {
    return Array.from(this.chunks.values());
  }

  /**
   * 获取分块数量
   */
  get size(): number {
    return this.chunks.size;
  }

  /**
   * 清空所有数据
   */
  clear(): void {
    this.chunks.clear();
  }
}

// 全局单例
export const vectorStore = new VectorStore();
