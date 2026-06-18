import { create } from "zustand";
import type { ChatMessage } from "@/types";
import { streamChat, type AIProvider } from "@/services/ai";
import { searchSimilar, buildRAGContext, type RAGOptions } from "@/services/rag";
import { runAgent } from "@/services/agent";

export type ChatMode = "normal" | "agent";

interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  currentChatId: string | null;
  abortController: AbortController | null;
  ragEnabled: boolean;
  lastRAGContext: string;
  chatMode: ChatMode;
  agentThoughts: string[];

  addMessage: (message: ChatMessage) => void;
  updateLastAssistantMessage: (content: string) => void;
  setIsStreaming: (streaming: boolean) => void;
  setCurrentChatId: (id: string | null) => void;
  clearMessages: () => void;
  toggleRAG: () => void;
  setChatMode: (mode: ChatMode) => void;
  addAgentThought: (thought: string) => void;
  clearAgentThoughts: () => void;

  sendMessage: (
    content: string,
    provider: AIProvider,
    systemPrompt?: string,
    ragOptions?: RAGOptions
  ) => Promise<void>;

  stopStreaming: () => void;

  sendQuickAction: (
    action: string,
    documentContent: string,
    provider: AIProvider,
    ragOptions?: RAGOptions
  ) => Promise<void>;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isStreaming: false,
  currentChatId: null,
  abortController: null,
  ragEnabled: true,
  lastRAGContext: "",
  chatMode: "normal",
  agentThoughts: [],

  addMessage: (message) =>
    set((s) => ({ messages: [...s.messages, message] })),

  updateLastAssistantMessage: (content) =>
    set((s) => {
      const messages = [...s.messages];
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === "assistant") {
          messages[i] = { ...messages[i], content };
          break;
        }
      }
      return { messages };
    }),

  setIsStreaming: (streaming) => set({ isStreaming: streaming }),
  setCurrentChatId: (id) => set({ currentChatId: id }),
  clearMessages: () => set({ messages: [] }),
  toggleRAG: () => set((s) => ({ ragEnabled: !s.ragEnabled })),
  setChatMode: (mode) => set({ chatMode: mode }),
  addAgentThought: (thought) =>
    set((s) => ({ agentThoughts: [...s.agentThoughts, thought] })),
  clearAgentThoughts: () => set({ agentThoughts: [] }),

  stopStreaming: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
      set({ abortController: null, isStreaming: false });
    }
  },

  sendMessage: async (content, provider, systemPrompt, ragOptions) => {
    const { messages, isStreaming, ragEnabled, chatMode } = get();
    if (isStreaming) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
    };

    set((s) => ({
      messages: [...s.messages, userMessage, assistantMessage],
      isStreaming: true,
      agentThoughts: [],
    }));

    if (chatMode === "agent") {
      // Agent 模式：使用 ReAct 循环
      try {
        const response = await runAgent(
          content,
          messages.filter((m) => m.role !== "system"),
          {
            provider,
            maxIterations: 5,
            onThought: (thought) => {
              get().addAgentThought(thought);
            },
            onToolCall: (calls) => {
              get().addAgentThought(
                `🔧 调用工具: ${calls.map((c) => `${c.name}(${JSON.stringify(c.arguments)})`).join(", ")}`
              );
            },
            onToolResult: (result) => {
              get().addAgentThought(`📋 工具结果:\n${result.slice(0, 200)}${result.length > 200 ? "..." : ""}`);
            },
          },
          systemPrompt
        );

        get().updateLastAssistantMessage(response);
      } catch (error) {
        get().updateLastAssistantMessage(
          `❌ Agent 执行错误: ${error instanceof Error ? error.message : String(error)}`
        );
      }
      set({ isStreaming: false });
    } else {
      // 普通模式：RAG + 流式对话
      let ragContext = "";
      if (ragEnabled && ragOptions) {
        try {
          const results = await searchSimilar(content, ragOptions);
          ragContext = buildRAGContext(results);
          set({ lastRAGContext: ragContext });
        } catch (error) {
          console.error("RAG 检索失败:", error);
        }
      }

      let finalSystemPrompt = systemPrompt || "";
      if (ragContext) {
        finalSystemPrompt = `${finalSystemPrompt}\n\n${ragContext}\n\n请基于以上参考内容回答用户的问题。如果参考内容不足以回答问题，请说明。`.trim();
      }

      const allMessages = [
        ...(finalSystemPrompt
          ? [{ role: "system" as const, content: finalSystemPrompt, id: "sys", timestamp: "" }]
          : []),
        ...messages.filter((m) => m.role !== "system"),
        userMessage,
      ];

      let accumulated = "";

      const controller = await streamChat(
        provider,
        { messages: allMessages, model: provider.model, stream: true },
        {
          onChunk: (text) => {
            accumulated += text;
            get().updateLastAssistantMessage(accumulated);
          },
          onDone: () => {
            set({ isStreaming: false, abortController: null });
          },
          onError: (error) => {
            get().updateLastAssistantMessage(` 错误: ${error.message}`);
            set({ isStreaming: false, abortController: null });
          },
        }
      );

      set({ abortController: controller });
    }
  },

  sendQuickAction: async (action, documentContent, provider, ragOptions) => {
    const prompts: Record<string, string> = {
      summarize: `请总结以下文档的核心内容，用简洁的要点形式呈现：\n\n${documentContent}`,
      extract: `请从以下文档中提取关键要点和重要信息：\n\n${documentContent}`,
      translate: `请将以下文档翻译为中文（如已是中文则翻译为英文）：\n\n${documentContent}`,
      mindmap: `请根据以下文档内容，生成一个结构化的思维导图大纲（使用 Markdown 列表格式）：\n\n${documentContent}`,
    };

    const prompt = prompts[action] || documentContent;
    await get().sendMessage(prompt, provider, undefined, ragOptions);
  },
}));
