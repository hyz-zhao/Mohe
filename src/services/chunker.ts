/**
 * 文档分块服务
 * 策略：标题层级 + 固定长度混合分块
 */

export interface Chunk {
  id: string;
  documentId: string;
  content: string;
  heading?: string;
  headingLevel?: number;
  index: number;
}

export interface ChunkOptions {
  /** 固定长度分块的最大字符数 */
  maxChunkSize?: number;
  /** 块之间重叠字符数 */
  overlap?: number;
  /** 是否按标题层级分块 */
  useHeadingSplit?: boolean;
}

const DEFAULT_OPTIONS: Required<ChunkOptions> = {
  maxChunkSize: 512,
  overlap: 64,
  useHeadingSplit: true,
};

/**
 * 按标题层级分块
 * 将文档按 Markdown 标题（# ## ###）切分为语义块
 */
function splitByHeadings(content: string): { heading: string; level: number; body: string }[] {
  const lines = content.split("\n");
  const sections: { heading: string; level: number; body: string }[] = [];
  let currentHeading = "";
  let currentLevel = 0;
  let currentBody = "";

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      // 保存上一个 section
      if (currentHeading || currentBody.trim()) {
        sections.push({
          heading: currentHeading,
          level: currentLevel,
          body: currentBody.trim(),
        });
      }
      currentLevel = headingMatch[1].length;
      currentHeading = headingMatch[2].trim();
      currentBody = "";
    } else {
      currentBody += (currentBody ? "\n" : "") + line;
    }
  }

  // 保存最后一个 section
  if (currentHeading || currentBody.trim()) {
    sections.push({
      heading: currentHeading,
      level: currentLevel,
      body: currentBody.trim(),
    });
  }

  return sections;
}

/**
 * 按固定长度分块
 * 对过长的文本按字符数切分，带重叠
 */
function splitByLength(text: string, maxLen: number, overlap: number): string[] {
  if (text.length <= maxLen) return [text];

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + maxLen;

    // 尝试在句子边界切分
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf("。", end);
      const lastNewline = text.lastIndexOf("\n", end);
      const lastBreak = Math.max(lastPeriod, lastNewline);

      if (lastBreak > start + maxLen * 0.5) {
        end = lastBreak + 1;
      }
    }

    chunks.push(text.slice(start, end).trim());
    start = end - overlap;
  }

  return chunks.filter((c) => c.length > 0);
}

/**
 * 文档分块主函数
 * 混合策略：先按标题切分，过长的块再按固定长度切分
 */
export function chunkDocument(
  documentId: string,
  content: string,
  options?: ChunkOptions
): Chunk[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const chunks: Chunk[] = [];
  let chunkIndex = 0;

  if (opts.useHeadingSplit) {
    const sections = splitByHeadings(content);

    for (const section of sections) {
      // 组合标题 + 正文
      const fullText = section.heading
        ? `${"#".repeat(section.level)} ${section.heading}\n${section.body}`
        : section.body;

      if (fullText.length <= opts.maxChunkSize) {
        chunks.push({
          id: `${documentId}-chunk-${chunkIndex}`,
          documentId,
          content: fullText,
          heading: section.heading || undefined,
          headingLevel: section.level || undefined,
          index: chunkIndex++,
        });
      } else {
        // 过长的块再按固定长度切分
        const subChunks = splitByLength(fullText, opts.maxChunkSize, opts.overlap);
        for (const sub of subChunks) {
          chunks.push({
            id: `${documentId}-chunk-${chunkIndex}`,
            documentId,
            content: sub,
            heading: section.heading || undefined,
            headingLevel: section.level || undefined,
            index: chunkIndex++,
          });
        }
      }
    }
  } else {
    // 纯固定长度分块
    const subChunks = splitByLength(content, opts.maxChunkSize, opts.overlap);
    for (const sub of subChunks) {
      chunks.push({
        id: `${documentId}-chunk-${chunkIndex}`,
        documentId,
        content: sub,
        index: chunkIndex++,
      });
    }
  }

  return chunks;
}

/**
 * 计算文本的 token 数（粗略估算：中文 ~1.5 字符/token，英文 ~4 字符/token）
 */
export function estimateTokens(text: string): number {
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const otherChars = text.length - chineseChars;
  return Math.ceil(chineseChars / 1.5 + otherChars / 4);
}
