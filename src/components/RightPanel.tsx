import { useEffect, useRef } from "react";
import { Sparkles, Send, Square, FileText, KeyRound, Map, Languages, List, MoreHorizontal, ChevronDown, ChevronRight, Trash2, Database, Bot, MessageSquare } from "lucide-react";
import { useChatStore } from "@/stores/chatStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useAppStore } from "@/stores/appStore";
import { useEditorStore } from "@/stores/editorStore";
import type { AIProvider } from "@/services/ai";
import type { RAGOptions } from "@/services/rag";
import { indexDocument } from "@/services/rag";
import { useState } from "react";

interface TocItem {
  level: number;
  text: string;
  id: string;
  children?: TocItem[];
}

const tocData: TocItem[] = [
  {
    level: 1,
    text: "1. 以用户为中心",
    id: "1",
    children: [
      { level: 2, text: "1.1 用户研究", id: "1-1" },
      { level: 2, text: "1.2 需求洞察", id: "1-2" },
      { level: 2, text: "1.3 持续反馈", id: "1-3" },
    ],
  },
  {
    level: 1,
    text: "2. 简单而不简陋",
    id: "2",
    children: [
      { level: 2, text: "2.1 减少认知负担", id: "2-1" },
      { level: 2, text: "2.2 聚焦核心功能", id: "2-2" },
      { level: 2, text: "2.3 清晰的信息层次", id: "2-3" },
    ],
  },
  {
    level: 1,
    text: "3. 一致性与连贯性",
    id: "3",
    children: [
      { level: 2, text: "3.1 设计语言一致", id: "3-1" },
      { level: 2, text: "3.2 交互模式统一", id: "3-2" },
      { level: 2, text: "3.3 体验连贯流畅", id: "3-3" },
    ],
  },
  {
    level: 1,
    text: "4. 可访问性",
    id: "4",
    children: [
      { level: 2, text: "4.1 包容性设计", id: "4-1" },
      { level: 2, text: "4.2 无障碍体验", id: "4-2" },
    ],
  },
  {
    level: 1,
    text: "5. 持续迭代",
    id: "5",
    children: [
      { level: 2, text: "5.1 快速试错", id: "5-1" },
      { level: 2, text: "5.2 数据驱动", id: "5-2" },
    ],
  },
];

const quickActions = [
  { icon: <FileText size={14} />, label: "总结本文档", action: "summarize" },
  { icon: <KeyRound size={14} />, label: "提取关键要点", action: "extract" },
  { icon: <Map size={14} />, label: "生成思维导图", action: "mindmap" },
  { icon: <Languages size={14} />, label: "翻译文档", action: "translate" },
];

function TocSection({ item }: { item: TocItem }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 w-full py-1 text-sm text-text-primary hover:bg-bg-hover rounded px-1 transition-colors"
      >
        {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        {item.text}
      </button>
      {expanded && item.children && (
        <div className="ml-4">
          {item.children.map((child) => (
            <button
              key={child.id}
              className="block w-full text-left py-0.5 pl-4 text-xs text-text-tertiary hover:text-text-link transition-colors"
            >
              {child.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MessageBubble({ role, content }: { role: string; content: string }) {
  const isUser = role === "user";

  return (
    <div className={`flex gap-2.5 animate-fade-in ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
          isUser
            ? "bg-bg-card border border-border-card"
            : "bg-gradient-to-br from-accent to-cyan shadow-md shadow-accent/30"
        }`}
      >
        {isUser ? (
          <span className="text-xs text-text-secondary">我</span>
        ) : (
          <Sparkles size={12} className="text-white" />
        )}
      </div>
      <div
        className={`flex-1 min-w-0 px-3 py-2 rounded-lg text-sm leading-relaxed ${
          isUser
            ? "bg-bg-active text-text-primary"
            : "bg-bg-card text-text-secondary"
        }`}
      >
        {content || (
          <span className="inline-flex gap-0.5">
            <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </span>
        )}
      </div>
    </div>
  );
}

export default function RightPanel() {
  const {
    messages,
    isStreaming,
    sendMessage,
    stopStreaming,
    sendQuickAction,
    clearMessages,
    ragEnabled,
    toggleRAG,
    chatMode,
    setChatMode,
    agentThoughts,
  } = useChatStore();

  const settings = useSettingsStore();
  const { documents } = useAppStore();
  const { currentDocId, activePanel, setActivePanel } = useEditorStore();
  const [inputValue, setInputValue] = useState("");
  const [indexing, setIndexing] = useState(false);
  const [indexStatus, setIndexStatus] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const doc = documents.find((d) => d.id === currentDocId);

  const provider: AIProvider = {
    name: settings.apiProvider,
    baseUrl: settings.baseUrl,
    apiKey: settings.apiKey,
    model: settings.model,
  };

  const ragOptions: RAGOptions = {
    provider,
    embeddingModel: settings.embeddingModel,
    topK: 5,
    minScore: 0.3,
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!inputValue.trim() || isStreaming) return;
    const text = inputValue.trim();
    setInputValue("");
    await sendMessage(text, provider, undefined, ragOptions);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function handleQuickAction(action: string) {
    if (!doc) return;
    await sendQuickAction(action, doc.content, provider, ragOptions);
  }

  async function handleIndexDocument() {
    if (!doc || indexing) return;
    setIndexing(true);
    setIndexStatus("正在分块...");
    try {
      const count = await indexDocument(doc.id, doc.content, ragOptions);
      setIndexStatus(`索引完成：${count} 个分块`);
      setTimeout(() => setIndexStatus(""), 3000);
    } catch (error) {
      setIndexStatus(`索引失败: ${error instanceof Error ? error.message : "未知错误"}`);
      setTimeout(() => setIndexStatus(""), 5000);
    }
    setIndexing(false);
  }

  const showChat = activePanel === "ai";
  const showOutline = activePanel === "outline";

  return (
    <aside className="w-80 bg-bg-sidebar border-l border-border-default flex flex-col shrink-0 select-none animate-slide-in-right">
      {/* Panel Toggle Header */}
      <div className="h-10 flex items-center justify-between px-2 border-b border-border-default">
        <div className="flex gap-1">
          <button
            onClick={() => setActivePanel("ai")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
              showChat
                ? "bg-bg-active text-text-primary"
                : "text-text-tertiary hover:bg-bg-hover hover:text-text-secondary"
            }`}
          >
            <Sparkles size={14} className={showChat ? "text-cyan" : ""} />
            AI 助手
          </button>
          <button
            onClick={() => setActivePanel("outline")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
              showOutline
                ? "bg-bg-active text-text-primary"
                : "text-text-tertiary hover:bg-bg-hover hover:text-text-secondary"
            }`}
          >
            <List size={14} />
            大纲
          </button>
        </div>
        {showChat && messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="p-1.5 text-text-muted hover:text-danger hover:bg-bg-hover rounded transition-colors"
            title="清空对话"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {/* Panel Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {showChat ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-cyan flex items-center justify-center mb-3 shadow-lg shadow-accent/30 animate-glow">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <p className="text-sm text-text-secondary mb-1">你好，我是你的 AI 助手</p>
                  <p className="text-xs text-text-tertiary">有什么可以帮助你的吗？</p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
                  ))}
                  {/* Agent Thoughts */}
                  {chatMode === "agent" && agentThoughts.length > 0 && (
                    <div className="ml-9 space-y-1">
                      {agentThoughts.map((thought, i) => (
                        <div
                          key={i}
                          className="text-xs text-text-muted bg-bg-card/50 rounded px-2 py-1 border-l-2 border-cyan/50"
                        >
                          {thought}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length === 0 && doc && (
              <div className="px-3 pb-3">
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action) => (
                    <button
                      key={action.action}
                      onClick={() => handleQuickAction(action.action)}
                      className="flex items-center gap-2 px-3 py-2.5 bg-bg-card border border-border-card rounded-md text-xs text-text-secondary hover:bg-bg-hover hover:border-accent/50 transition-colors"
                    >
                      <span className="text-text-tertiary">{action.icon}</span>
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-3 pb-3">
              {/* Mode & RAG Controls */}
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                  {/* Chat Mode Toggle */}
                  <button
                    onClick={() => setChatMode(chatMode === "normal" ? "agent" : "normal")}
                    className={`flex items-center gap-1.5 text-xs transition-colors ${
                      chatMode === "agent"
                        ? "text-cyan hover:text-cyan"
                        : "text-text-muted hover:text-text-secondary"
                    }`}
                    title={chatMode === "agent" ? "Agent 模式（可调用工具）" : "普通对话模式"}
                  >
                    {chatMode === "agent" ? <Bot size={12} /> : <MessageSquare size={12} />}
                    <span>{chatMode === "agent" ? "Agent" : "对话"}</span>
                  </button>
                  {/* RAG Toggle */}
                  <button
                    onClick={toggleRAG}
                    className={`flex items-center gap-1.5 text-xs transition-colors ${
                      ragEnabled
                        ? "text-accent hover:text-accent-hover"
                        : "text-text-muted hover:text-text-secondary"
                    }`}
                    title={ragEnabled ? "RAG 已启用" : "RAG 已禁用"}
                  >
                    <Database size={12} />
                    <span>知识库 {ragEnabled ? "ON" : "OFF"}</span>
                  </button>
                </div>
                {doc && (
                  <button
                    onClick={handleIndexDocument}
                    disabled={indexing}
                    className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors disabled:opacity-50"
                  >
                    {indexing ? (
                      <>
                        <span className="w-3 h-3 border-2 border-text-muted border-t-transparent rounded-full animate-spin" />
                        <span>索引中...</span>
                      </>
                    ) : (
                      <>
                        <Database size={12} />
                        <span>索引文档</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              {indexStatus && (
                <div className="mb-2 px-2 py-1.5 bg-bg-card border border-border-card rounded text-xs text-text-secondary">
                  {indexStatus}
                </div>
              )}
              <div className="relative flex items-end bg-bg-input border border-border-input rounded-lg focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/50 transition-colors">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isStreaming ? "AI 正在回复..." : "输入消息..."}
                  rows={1}
                  disabled={isStreaming}
                  className="flex-1 bg-transparent text-text-primary text-sm placeholder:text-text-muted resize-none focus:outline-none px-3 py-2.5 max-h-32"
                />
                {isStreaming ? (
                  <button
                    onClick={stopStreaming}
                    className="m-1.5 p-1.5 bg-danger/20 text-danger rounded-md hover:bg-danger/30 transition-colors"
                  >
                    <Square size={14} />
                  </button>
                ) : (
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    className="m-1.5 p-1.5 bg-accent text-white rounded-md hover:bg-accent-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={14} />
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between mt-1.5 px-1">
                <span className="text-xs text-text-muted">
                  {settings.apiProvider === "ollama" ? "Ollama" : "OpenAI"} · {settings.model}
                </span>
                <span className="text-xs text-text-muted">Enter 发送</span>
              </div>
            </div>
          </>
        ) : (
          /* Document Outline */
          <div className="flex-1 overflow-y-auto px-3 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-text-primary">文档大纲</span>
              <button className="text-text-muted hover:text-text-secondary transition-colors">
                <MoreHorizontal size={14} />
              </button>
            </div>
            <div className="space-y-0.5">
              {tocData.map((item) => (
                <TocSection key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
