import { chunkDocument, type Chunk } from "./chunker";
import { generateEmbedding, topKSimilarity } from "./embedding";
import { vectorStore } from "./vectorStore";
import type { AIProvider } from "./ai";

export interface RAGOptions {
  provider: AIProvider;
  embeddingModel: string;
  topK?: number;
  minScore?: number;
}

export interface SearchResult {
  chunk: Chunk;
  score: number;
}

/**
 * 索引文档：分块 + 生成向量 + 存储
 */
export async function indexDocument(
  documentId: string,
  content: string,
  options: RAGOptions
): Promise<number> {
  // 1. 分块
  const chunks = chunkDocument(documentId, content);

  // 2. 删除旧分块
  vectorStore.removeDocumentChunks(documentId);

  // 3. 逐块生成向量并存储
  for (const chunk of chunks) {
    try {
      const embedding = await generateEmbedding(chunk.content, {
        provider: options.provider,
        model: options.embeddingModel,
      });

      vectorStore.addChunks([{ ...chunk, embedding }]);
    } catch (error) {
      console.error(`分块 ${chunk.id} 向量生成失败:`, error);
    }
  }

  return chunks.length;
}

/**
 * 语义检索：查询向量 + Top-K 召回
 */
export async function searchSimilar(
  query: string,
  options: RAGOptions
): Promise<SearchResult[]> {
  const topK = options.topK ?? 5;
  const minScore = options.minScore ?? 0.3;

  // 1. 生成查询向量
  const queryEmbedding = await generateEmbedding(query, {
    provider: options.provider,
    model: options.embeddingModel,
  });

  // 2. 检索所有分块
  const allChunks = vectorStore.getAllChunks();

  // 3. Top-K 相似度排序
  const results = topKSimilarity(
    queryEmbedding,
    allChunks.map((c) => ({ id: c.id, embedding: c.embedding })),
    topK
  );

  // 4. 过滤低分结果 + 组装返回
  return results
    .filter((r) => r.score >= minScore)
    .map((r) => {
      const chunk = allChunks.find((c) => c.id === r.id)!;
      return { chunk, score: r.score };
    });
}

/**
 * 构建 RAG 上下文文本
 * 将检索结果格式化为可注入 prompt 的文本
 */
export function buildRAGContext(results: SearchResult[]): string {
  if (results.length === 0) return "";

  const parts = results.map((r, i) => {
    const heading = r.chunk.heading ? `[${r.chunk.heading}] ` : "";
    return `--- 参考片段 ${i + 1} (相关度: ${(r.score * 100).toFixed(0)}%) ---\n${heading}${r.chunk.content}`;
  });

  return "以下是从知识库中检索到的相关参考内容：\n\n" + parts.join("\n\n");
}
