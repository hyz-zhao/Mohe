import { toolRegistry } from "./toolRegistry";
import { useAppStore } from "@/stores/appStore";
import { vectorStore } from "./vectorStore";
import type { RAGOptions } from "./rag";
import { searchSimilar, buildRAGContext } from "./rag";

/**
 * 注册所有内置工具
 */
export function registerBuiltinTools(getRAGOptions: () => RAGOptions | null) {
  // 1. 搜索文档
  toolRegistry.register(
    {
      name: "search_documents",
      description: "在知识库中搜索文档，支持关键词和语义搜索。返回匹配的文档列表。",
      parameters: {
        query: {
          type: "string",
          description: "搜索关键词或自然语言查询",
          required: true,
        },
        limit: {
          type: "number",
          description: "返回结果数量上限，默认 5",
          required: false,
        },
      },
    },
    async (args) => {
      const query = args.query as string;
      const limit = (args.limit as number) || 5;

      // 先尝试语义搜索
      const ragOpts = getRAGOptions();
      if (ragOpts && vectorStore.size > 0) {
        try {
          const results = await searchSimilar(query, { ...ragOpts, topK: limit });
          if (results.length > 0) {
            return buildRAGContext(results);
          }
        } catch {
          // 降级到文本搜索
        }
      }

      // 文本搜索降级
      const { documents } = useAppStore.getState();
      const keyword = query.toLowerCase();
      const matched = documents
        .filter(
          (d) =>
            d.title.toLowerCase().includes(keyword) ||
            d.content.toLowerCase().includes(keyword)
        )
        .slice(0, limit);

      if (matched.length === 0) {
        return "未找到匹配的文档。";
      }

      return matched
        .map(
          (d) =>
            `## ${d.title}\n${d.content.slice(0, 200)}${d.content.length > 200 ? "..." : ""}`
        )
        .join("\n\n---\n\n");
    }
  );

  // 2. 获取文档内容
  toolRegistry.register(
    {
      name: "get_document",
      description: "获取指定文档的完整内容。需要提供文档标题或 ID。",
      parameters: {
        title: {
          type: "string",
          description: "文档标题（模糊匹配）",
          required: true,
        },
      },
    },
    async (args) => {
      const title = (args.title as string).toLowerCase();
      const { documents } = useAppStore.getState();
      const doc = documents.find(
        (d) =>
          d.title.toLowerCase().includes(title) ||
          d.id === args.title
      );

      if (!doc) {
        return `未找到标题包含 "${args.title}" 的文档。`;
      }

      return `# ${doc.title}\n\n${doc.content}`;
    }
  );

  // 3. 创建文档
  toolRegistry.register(
    {
      name: "create_document",
      description: "创建一个新的 Markdown 文档。",
      parameters: {
        title: {
          type: "string",
          description: "文档标题",
          required: true,
        },
        content: {
          type: "string",
          description: "文档内容（Markdown 格式）",
          required: true,
        },
      },
    },
    async (args) => {
      const { addDocument } = useAppStore.getState();
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
      const now = new Date().toISOString();

      addDocument({
        id,
        title: args.title as string,
        content: args.content as string,
        created_at: now,
        updated_at: now,
      });

      return `文档 "${args.title}" 创建成功 (ID: ${id})。`;
    }
  );

  // 4. 列出所有文档
  toolRegistry.register(
    {
      name: "list_documents",
      description: "列出知识库中的所有文档，返回标题和更新时间。",
      parameters: {},
    },
    async () => {
      const { documents } = useAppStore.getState();
      if (documents.length === 0) {
        return "知识库中暂无文档。";
      }

      return documents
        .map(
          (d) =>
            `- **${d.title}** (更新于 ${new Date(d.updated_at).toLocaleDateString("zh-CN")})`
        )
        .join("\n");
    }
  );

  // 5. 知识库语义查询
  toolRegistry.register(
    {
      name: "knowledge_query",
      description: "基于向量语义在知识库中检索最相关的内容片段。适用于需要精确语义匹配的场景。",
      parameters: {
        query: {
          type: "string",
          description: "自然语言查询",
          required: true,
        },
        top_k: {
          type: "number",
          description: "返回最相关的片段数量，默认 3",
          required: false,
        },
      },
    },
    async (args) => {
      const ragOpts = getRAGOptions();
      if (!ragOpts) {
        return "知识库未就绪，请先索引文档。";
      }

      const topK = (args.top_k as number) || 3;
      const results = await searchSimilar(args.query as string, {
        ...ragOpts,
        topK,
      });

      if (results.length === 0) {
        return "未在知识库中找到相关内容。";
      }

      return buildRAGContext(results);
    }
  );
}
