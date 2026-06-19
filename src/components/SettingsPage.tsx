import { useState, useRef, useEffect } from "react";
import {
  X, Server, Key, Cpu, Sparkles, Check, Database, Download, Upload,
  HardDrive, User, Camera, Smile, Pencil, Trash2, ChevronRight, Zap,
  Shield, Globe, Palette, Image as ImageIcon, FileText, MessageSquare,
  Activity
} from "lucide-react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useAppStore } from "@/stores/appStore";
import { useChatStore } from "@/stores/chatStore";

interface SettingsPageProps {
  onClose: () => void;
}

const EMOJI_AVATARS = [
  "", "🧑‍💻", "👩‍", "🧙", "", "🐱", "🐺", "🦉",
  "", "⚡", "🔥", "💎", "🌊", "🍃", "🌙", "☀️",
  "", "🎨", "", "📚", "", "🚀", "", "🏔️",
];

type TabId = "profile" | "ai" | "data";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "个人信息", icon: <User size={14} /> },
  { id: "ai", label: "AI 设置", icon: <Sparkles size={14} /> },
  { id: "data", label: "数据管理", icon: <Database size={14} /> },
];

export default function SettingsPage({ onClose }: SettingsPageProps) {
  const settings = useSettingsStore();
  const { documents, userInfo, setUserInfo } = useAppStore();
  const { messages } = useChatStore();
  const [testStatus, setTestStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [exportStatus, setExportStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [importStatus, setImportStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleTestConnection() {
    setTestStatus("loading");
    setTestMessage("");
    try {
      const url = `${settings.baseUrl.replace(/\/$/, "")}/v1/models`;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (settings.apiKey) headers["Authorization"] = `Bearer ${settings.apiKey}`;
      const response = await fetch(url, { headers });
      if (response.ok) { setTestStatus("success"); setTestMessage("连接成功！"); }
      else { setTestStatus("error"); setTestMessage(`连接失败: ${response.status}`); }
    } catch (error) {
      setTestStatus("error");
      setTestMessage(error instanceof Error ? error.message : "连接失败");
    }
  }

  async function handleExport() {
    setExportStatus("loading");
    try {
      const data = {
        version: "0.4.0", exportDate: new Date().toISOString(),
        documents, messages,
        settings: { apiProvider: settings.apiProvider, baseUrl: settings.baseUrl, model: settings.model, embeddingModel: settings.embeddingModel },
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mohe-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportStatus("success");
      setTimeout(() => setExportStatus("idle"), 2000);
    } catch { setExportStatus("error"); setTimeout(() => setExportStatus("idle"), 2000); }
  }

  async function handleImport() {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "application/json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setImportStatus("loading");
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!data.version || !data.documents) throw new Error("无效的备份文件");
        setImportStatus("success");
        setTimeout(() => setImportStatus("idle"), 2000);
      } catch { setImportStatus("error"); setTimeout(() => setImportStatus("idle"), 2000); }
    };
    input.click();
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUserInfo({ avatar: result });
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setUserInfo({ avatar: event.target?.result as string });
    };
    reader.readAsDataURL(file);
  }

  const totalWords = documents.reduce((sum, doc) => sum + doc.content.length, 0);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ${
        mounted ? "bg-black/70 backdrop-blur-md" : "bg-transparent"
      }`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={modalRef}
        className={`w-[600px] max-h-[85vh] flex flex-col transition-all duration-500 ease-out ${
          mounted ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
        }`}
        style={{
          background: "linear-gradient(145deg, rgba(15,21,32,0.95) 0%, rgba(10,14,23,0.98) 100%)",
          border: "1px solid rgba(37,51,71,0.6)",
          borderRadius: "16px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid rgba(30,41,59,0.8)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(59,130,246,0.15) 100%)",
                border: "1px solid rgba(6,182,212,0.3)",
                boxShadow: "0 0 20px rgba(6,182,212,0.1)",
              }}
            >
              <Sparkles size={16} className="text-cyan" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary tracking-tight">设置</h2>
              <p className="text-[11px] text-text-muted mt-0.5">配置你的墨核工作空间</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary transition-all duration-200 hover:bg-white/5"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-4" style={{ borderBottom: "1px solid rgba(30,41,59,0.5)" }}>
          <div className="flex items-center gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium transition-all duration-200 rounded-lg ${
                  activeTab === tab.id
                    ? "text-text-primary"
                    : "text-text-muted hover:text-text-tertiary"
                }`}
              >
                {activeTab === tab.id && (
                  <div
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: "linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(6,182,212,0.08) 100%)",
                      border: "1px solid rgba(59,130,246,0.2)",
                    }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {tab.icon}
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6 animate-in">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, #1a2332 0%, #0f1520 100%)",
                      border: "1px solid rgba(37,51,71,0.8)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                    }}
                  >
                    {userInfo.avatar.startsWith("data:") ? (
                      <img src={userInfo.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{userInfo.avatar}</span>
                    )}
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      title="选择表情"
                    >
                      <Smile size={14} className="text-white" />
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      title="上传图片"
                    >
                      <Camera size={14} className="text-white" />
                    </button>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </div>

                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-text-muted uppercase tracking-wider mb-1.5">
                      用户名
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="text"
                        value={userInfo.username}
                        onChange={(e) => setUserInfo({ username: e.target.value })}
                        placeholder="输入你的用户名"
                        maxLength={20}
                        className="w-full rounded-lg py-2 pl-9 pr-4 text-sm text-text-primary outline-none transition-all duration-200"
                        style={{
                          background: "rgba(30,41,59,0.6)",
                          border: "1px solid rgba(51,65,85,0.6)",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)";
                          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "rgba(51,65,85,0.6)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div
                  className="rounded-xl p-3"
                  style={{
                    background: "rgba(26,35,50,0.8)",
                    border: "1px solid rgba(37,51,71,0.8)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                  }}
                >
                  <div className="grid grid-cols-8 gap-1">
                    {EMOJI_AVATARS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => { setUserInfo({ avatar: emoji }); setShowEmojiPicker(false); }}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all duration-150 hover:scale-110 ${
                          userInfo.avatar === emoji ? "bg-accent/20 ring-1 ring-accent/40" : "hover:bg-white/5"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Drag & Drop Upload Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                  isDragging ? "scale-[1.02]" : ""
                }`}
                style={{
                  background: isDragging
                    ? "rgba(59,130,246,0.08)"
                    : "rgba(26,35,50,0.4)",
                  border: `1px dashed ${isDragging ? "rgba(59,130,246,0.5)" : "rgba(51,65,85,0.5)"}`,
                }}
              >
                <ImageIcon size={20} className="mx-auto text-text-muted mb-2" />
                <p className="text-xs text-text-tertiary">
                  拖放图片到此处，或 <span className="text-accent">点击上传</span>
                </p>
                <p className="text-[10px] text-text-muted mt-1">支持 JPG、PNG、GIF，最大 5MB</p>
              </div>

              {/* User Info Preview */}
              <div
                className="rounded-xl p-4 flex items-center gap-3"
                style={{
                  background: "rgba(26,35,50,0.5)",
                  border: "1px solid rgba(37,51,71,0.5)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #1a2332 0%, #0f1520 100%)",
                    border: "1px solid rgba(37,51,71,0.8)",
                  }}
                >
                  {userInfo.avatar.startsWith("data:") ? (
                    <img src={userInfo.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{userInfo.avatar}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{userInfo.username}</p>
                  <p className="text-[11px] text-text-muted">墨核用户</p>
                </div>
                <div className="ml-auto">
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(6,182,212,0.1)",
                      color: "#06b6d4",
                      border: "1px solid rgba(6,182,212,0.2)",
                    }}
                  >
                    PRO
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* AI Tab */}
          {activeTab === "ai" && (
            <div className="space-y-5 animate-in">
              {/* Provider Selection */}
              <div>
                <label className="block text-[11px] font-medium text-text-muted uppercase tracking-wider mb-2.5">
                  AI 提供商
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "ollama" as const, icon: <Cpu size={18} />, title: "Ollama", desc: "本地模型 · 隐私优先" },
                    { id: "openai" as const, icon: <Server size={18} />, title: "OpenAI 兼容", desc: "外部 API · 更强能力" },
                  ].map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => settings.setApiProvider(provider.id)}
                      className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-200 ${
                        settings.apiProvider === provider.id
                          ? "text-text-primary"
                          : "text-text-tertiary hover:text-text-secondary"
                      }`}
                      style={{
                        background: settings.apiProvider === provider.id
                          ? "linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(6,182,212,0.08) 100%)"
                          : "rgba(26,35,50,0.5)",
                        border: `1px solid ${settings.apiProvider === provider.id ? "rgba(59,130,246,0.3)" : "rgba(37,51,71,0.6)"}`,
                        boxShadow: settings.apiProvider === provider.id ? "0 0 20px rgba(59,130,246,0.08)" : "none",
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{
                          background: settings.apiProvider === provider.id
                            ? "rgba(59,130,246,0.15)"
                            : "rgba(30,41,59,0.6)",
                        }}
                      >
                        {provider.icon}
                      </div>
                      <div>
                        <div className="text-[13px] font-medium">{provider.title}</div>
                        <div className="text-[11px] text-text-muted mt-0.5">{provider.desc}</div>
                      </div>
                      {settings.apiProvider === provider.id && (
                        <Check size={14} className="ml-auto text-accent" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Base URL */}
              <div>
                <label className="block text-[11px] font-medium text-text-muted uppercase tracking-wider mb-1.5">
                  Base URL
                </label>
                <div className="relative">
                  <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={settings.baseUrl}
                    onChange={(e) => settings.setBaseUrl(e.target.value)}
                    placeholder={settings.apiProvider === "ollama" ? "http://localhost:11434" : "https://api.openai.com"}
                    className="w-full rounded-lg py-2.5 pl-9 pr-4 text-sm text-text-primary outline-none transition-all duration-200"
                    style={{
                      background: "rgba(30,41,59,0.6)",
                      border: "1px solid rgba(51,65,85,0.6)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "rgba(51,65,85,0.6)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-text-muted">
                  {settings.apiProvider === "ollama" ? "Ollama 默认地址: http://localhost:11434" : "支持任何 OpenAI 兼容 API"}
                </p>
              </div>

              {/* API Key */}
              <div>
                <label className="block text-[11px] font-medium text-text-muted uppercase tracking-wider mb-1.5">
                  API Key
                </label>
                <div className="relative">
                  <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="password"
                    value={settings.apiKey}
                    onChange={(e) => settings.setApiKey(e.target.value)}
                    placeholder="输入 API Key（可选）"
                    className="w-full rounded-lg py-2.5 pl-9 pr-4 text-sm text-text-primary outline-none transition-all duration-200"
                    style={{
                      background: "rgba(30,41,59,0.6)",
                      border: "1px solid rgba(51,65,85,0.6)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "rgba(51,65,85,0.6)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-text-muted">Ollama 本地模型无需 API Key</p>
              </div>

              {/* Model */}
              <div>
                <label className="block text-[11px] font-medium text-text-muted uppercase tracking-wider mb-1.5">
                  对话模型
                </label>
                <div className="relative">
                  <Zap size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={settings.model}
                    onChange={(e) => settings.setModel(e.target.value)}
                    placeholder={settings.apiProvider === "ollama" ? "qwen2.5:latest" : "gpt-4o"}
                    className="w-full rounded-lg py-2.5 pl-9 pr-4 text-sm text-text-primary outline-none transition-all duration-200"
                    style={{
                      background: "rgba(30,41,59,0.6)",
                      border: "1px solid rgba(51,65,85,0.6)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "rgba(51,65,85,0.6)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              {/* Embedding Model */}
              <div>
                <label className="block text-[11px] font-medium text-text-muted uppercase tracking-wider mb-1.5">
                  向量嵌入模型
                </label>
                <div className="relative">
                  <Activity size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={settings.embeddingModel}
                    onChange={(e) => settings.setEmbeddingModel(e.target.value)}
                    placeholder={settings.apiProvider === "ollama" ? "nomic-embed-text" : "text-embedding-3-small"}
                    className="w-full rounded-lg py-2.5 pl-9 pr-4 text-sm text-text-primary outline-none transition-all duration-200"
                    style={{
                      background: "rgba(30,41,59,0.6)",
                      border: "1px solid rgba(51,65,85,0.6)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "rgba(51,65,85,0.6)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-text-muted">用于 RAG 知识库的文档向量化</p>
              </div>

              {/* Test Connection */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleTestConnection}
                  disabled={testStatus === "loading"}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium text-text-secondary transition-all duration-200 disabled:opacity-50"
                  style={{
                    background: "rgba(26,35,50,0.6)",
                    border: "1px solid rgba(37,51,71,0.8)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.3)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(37,51,71,0.8)"; }}
                >
                  {testStatus === "loading" ? (
                    <span className="w-3.5 h-3.5 border-2 border-text-muted border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Server size={14} />
                  )}
                  测试连接
                </button>
                {testStatus === "success" && (
                  <span className="flex items-center gap-1 text-[11px] text-success">
                    <Check size={12} /> {testMessage}
                  </span>
                )}
                {testStatus === "error" && (
                  <span className="text-[11px] text-danger">{testMessage}</span>
                )}
              </div>
            </div>
          )}

          {/* Data Tab */}
          {activeTab === "data" && (
            <div className="space-y-5 animate-in">
              {/* Stats */}
              <div>
                <h3 className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                  <HardDrive size={13} />
                  数据统计
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: documents.length, label: "文档数量", icon: <FileText size={14} /> },
                    { value: messages.length, label: "对话消息", icon: <MessageSquare size={14} /> },
                    { value: `${(totalWords / 1024).toFixed(1)}KB`, label: "数据大小", icon: <Activity size={14} /> },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="rounded-xl p-4 transition-all duration-200"
                      style={{
                        background: "rgba(26,35,50,0.5)",
                        border: "1px solid rgba(37,51,71,0.5)",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-text-muted">{stat.icon}</span>
                      </div>
                      <div className="text-xl font-bold text-text-primary tracking-tight">{stat.value}</div>
                      <div className="text-[11px] text-text-muted mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export */}
              <div
                className="rounded-xl p-4"
                style={{
                  background: "rgba(26,35,50,0.5)",
                  border: "1px solid rgba(37,51,71,0.5)",
                }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}
                  >
                    <Download size={14} className="text-success" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-medium text-text-primary">导出备份</h3>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      将所有文档、对话记录和设置导出为 JSON 文件
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleExport}
                  disabled={exportStatus === "loading"}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium text-white transition-all duration-200 disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, rgba(16,185,129,0.8) 0%, rgba(5,150,105,0.8) 100%)",
                    boxShadow: "0 2px 10px rgba(16,185,129,0.2)",
                  }}
                >
                  {exportStatus === "loading" ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                      导出中...
                    </>
                  ) : exportStatus === "success" ? (
                    <><Check size={14} /> 导出成功</>
                  ) : (
                    <><Download size={14} /> 导出数据</>
                  )}
                </button>
              </div>

              {/* Import */}
              <div
                className="rounded-xl p-4"
                style={{
                  background: "rgba(26,35,50,0.5)",
                  border: "1px solid rgba(37,51,71,0.5)",
                }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}
                  >
                    <Upload size={14} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-medium text-text-primary">导入备份</h3>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      从 JSON 备份文件恢复数据。注意：导入将覆盖当前所有数据
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleImport}
                  disabled={importStatus === "loading"}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium text-text-secondary transition-all duration-200 disabled:opacity-50"
                  style={{
                    background: "rgba(30,41,59,0.6)",
                    border: "1px solid rgba(51,65,85,0.6)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.3)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(51,65,85,0.6)"; }}
                >
                  {importStatus === "loading" ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-text-muted border-t-transparent rounded-full animate-spin" />
                      导入中...
                    </>
                  ) : importStatus === "success" ? (
                    <><Check size={14} /> 导入成功</>
                  ) : (
                    <><Upload size={14} /> 选择文件</>
                  )}
                </button>
                {importStatus === "error" && (
                  <p className="text-[11px] text-danger mt-2">导入失败，请检查文件格式</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: "1px solid rgba(30,41,59,0.8)" }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[13px] font-medium text-text-tertiary transition-all duration-200"
            style={{ background: "rgba(30,41,59,0.4)", border: "1px solid rgba(51,65,85,0.4)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(30,41,59,0.7)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(30,41,59,0.4)"; }}
          >
            取消
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-[13px] font-medium text-white transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, rgba(59,130,246,0.9) 0%, rgba(37,99,235,0.9) 100%)",
              boxShadow: "0 2px 10px rgba(59,130,246,0.25)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(59,130,246,0.35)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 10px rgba(59,130,246,0.25)"; }}
          >
            保存设置
          </button>
        </div>
      </div>

      <style>{`
        @keyframes animate-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
          animation: animate-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
