import type { AIProvider } from "./ai";

export interface EmbeddingOptions {
  provider: AIProvider;
  model: string;
}

/**
 * 生成文本向量（Embedding）
 * 支持 OpenAI 兼容 API 和 Ollama
 */
export async function generateEmbedding(
  text: string,
  options: EmbeddingOptions
): Promise<number[]> {
  const { provider, model } = options;
  const url = `${provider.baseUrl.replace(/\/$/, "")}/v1/embeddings`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (provider.apiKey) {
    headers["Authorization"] = `Bearer ${provider.apiKey}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      input: text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Embedding 请求失败: ${response.status} ${errorText}`);
  }

  const json = await response.json();
  return json.data?.[0]?.embedding ?? [];
}

/**
 * 批量生成向量
 */
export async function generateEmbeddings(
  texts: string[],
  options: EmbeddingOptions
): Promise<number[][]> {
  const { provider, model } = options;
  const url = `${provider.baseUrl.replace(/\/$/, "")}/v1/embeddings`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (provider.apiKey) {
    headers["Authorization"] = `Bearer ${provider.apiKey}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      input: texts,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Embedding 批量请求失败: ${response.status} ${errorText}`);
  }

  const json = await response.json();
  return json.data?.map((item: { embedding: number[] }) => item.embedding) ?? [];
}

/**
 * 计算余弦相似度
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

/**
 * 向量 Top-K 检索
 */
export function topKSimilarity(
  queryEmbedding: number[],
  candidates: { id: string; embedding: number[] }[],
  k: number
): { id: string; score: number }[] {
  const scored = candidates.map((c) => ({
    id: c.id,
    score: cosineSimilarity(queryEmbedding, c.embedding),
  }));

  return scored.sort((a, b) => b.score - a.score).slice(0, k);
}
