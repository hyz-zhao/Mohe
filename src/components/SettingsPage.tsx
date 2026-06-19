import { useState, useRef, useEffect } from "react";
import {
  X, Server, Key, Cpu, Sparkles, Check, Database, Download, Upload,
  HardDrive, User, Camera, Smile, Zap, Globe, Image as ImageIcon,
  FileText, MessageSquare, Activity, ArrowRight, Circle
} from "lucide-react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useAppStore } from "@/stores/appStore";
import { useChatStore } from "@/stores/chatStore";

interface SettingsPageProps {
  onClose: () => void;
}

const EMOJI_AVATARS = [
  "", "‍💻", "👩‍", "🧙", "", "🐱", "🐺", "🦉",
  "", "⚡", "🔥", "💎", "🌊", "🍃", "🌙", "☀️",
  "", "🎨", "", "📚", "", "🚀", "", "🏔️",
];

type TabId = "profile" | "ai" | "data";

const TABS: { id: TabId; label: string; icon: React.ReactNode; code: string }[] = [
  { id: "profile", label: "个人信息", icon: <User size={15} />, code: "01" },
  { id: "ai", label: "AI 配置", icon: <Cpu size={15} />, code: "02" },
  { id: "data", label: "数据管理", icon: <Database size={15} />, code: "03" },
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
  const [mounted, setMounted] = useState(false);
  const [tabKey, setTabKey] = useState(0);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const switchTab = (tab: TabId) => {
    setActiveTab(tab);
    setTabKey((k) => k + 1);
  };

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
      setTimeout(() => setExportStatus("idle"), 2500);
    } catch { setExportStatus("error"); setTimeout(() => setExportStatus("idle"), 2500); }
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
        setTimeout(() => setImportStatus("idle"), 2500);
      } catch { setImportStatus("error"); setTimeout(() => setImportStatus("idle"), 2500); }
    };
    input.click();
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setUserInfo({ avatar: event.target?.result as string });
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
    <div className="mohe-settings-root">
      {/* Ambient background orbs */}
      <div className="mohe-ambient-orb mohe-ambient-orb--1" />
      <div className="mohe-ambient-orb mohe-ambient-orb--2" />

      <div
        className={`mohe-overlay ${mounted ? "mohe-overlay--visible" : ""}`}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className={`mohe-modal ${mounted ? "mohe-modal--visible" : ""}`}>
          {/* Grid overlay decoration */}
          <div className="mohe-grid-overlay" />

          {/* Header */}
          <header className="mohe-header">
            <div className="mohe-header__brand">
              <div className="mohe-header__icon">
                <Sparkles size={16} />
              </div>
              <div>
                <h2 className="mohe-header__title">设置</h2>
                <p className="mohe-header__subtitle">CONFIGURATION PANEL</p>
              </div>
            </div>
            <button className="mohe-close-btn" onClick={onClose}>
              <X size={16} />
            </button>
          </header>

          {/* Tab Navigation */}
          <nav className="mohe-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className={`mohe-tab ${activeTab === tab.id ? "mohe-tab--active" : ""}`}
              >
                <span className="mohe-tab__code">{tab.code}</span>
                <span className="mohe-tab__icon">{tab.icon}</span>
                <span className="mohe-tab__label">{tab.label}</span>
                {activeTab === tab.id && (
                  <span className="mohe-tab__indicator">
                    <Circle size={5} fill="currentColor" />
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="mohe-content" key={tabKey}>
            {/* ═══════════════ PROFILE TAB ═══════════════ */}
            {activeTab === "profile" && (
              <div className="mohe-panel mohe-panel--profile">
                {/* Large avatar area */}
                <div className="mohe-avatar-section">
                  <div className="mohe-avatar-frame">
                    <div className="mohe-avatar-corner mohe-avatar-corner--tl" />
                    <div className="mohe-avatar-corner mohe-avatar-corner--tr" />
                    <div className="mohe-avatar-corner mohe-avatar-corner--bl" />
                    <div className="mohe-avatar-corner mohe-avatar-corner--br" />

                    <div className="mohe-avatar">
                      {userInfo.avatar.startsWith("data:") ? (
                        <img src={userInfo.avatar} alt="avatar" className="mohe-avatar__img" />
                      ) : (
                        <span className="mohe-avatar__emoji">{userInfo.avatar}</span>
                      )}
                    </div>

                    <div className="mohe-avatar__overlay">
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="mohe-avatar__action"
                        title="选择表情"
                      >
                        <Smile size={15} />
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="mohe-avatar__action"
                        title="上传图片"
                      >
                        <Camera size={15} />
                      </button>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </div>

                  {/* Identity info */}
                  <div className="mohe-identity">
                    <div className="mohe-identity__label">IDENTITY</div>
                    <div className="mohe-input-group">
                      <User size={14} className="mohe-input-icon" />
                      <input
                        type="text"
                        value={userInfo.username}
                        onChange={(e) => setUserInfo({ username: e.target.value })}
                        placeholder="输入用户名"
                        maxLength={20}
                        className="mohe-input"
                      />
                    </div>

                    {/* Preview card */}
                    <div className="mohe-preview-card">
                      <div className="mohe-preview-avatar">
                        {userInfo.avatar.startsWith("data:") ? (
                          <img src={userInfo.avatar} alt="" className="mohe-preview-avatar__img" />
                        ) : (
                          <span>{userInfo.avatar}</span>
                        )}
                      </div>
                      <div className="mohe-preview-info">
                        <span className="mohe-preview-name">{userInfo.username || "未命名"}</span>
                        <span className="mohe-preview-role">墨核用户</span>
                      </div>
                      <div className="mohe-preview-badge">PRO</div>
                    </div>
                  </div>
                </div>

                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div className="mohe-emoji-picker">
                    <div className="mohe-emoji-picker__header">
                      <span>选择头像</span>
                      <span className="mohe-emoji-picker__count">{EMOJI_AVATARS.filter(Boolean).length} 个</span>
                    </div>
                    <div className="mohe-emoji-grid">
                      {EMOJI_AVATARS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => { setUserInfo({ avatar: emoji }); setShowEmojiPicker(false); }}
                          className={`mohe-emoji-btn ${userInfo.avatar === emoji ? "mohe-emoji-btn--active" : ""}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`mohe-upload-zone ${isDragging ? "mohe-upload-zone--active" : ""}`}
                >
                  <div className="mohe-upload-zone__content">
                    <ImageIcon size={22} className="mohe-upload-zone__icon" />
                    <p className="mohe-upload-zone__text">
                      拖放图片到此处，或 <span className="mohe-accent-text">点击上传</span>
                    </p>
                    <p className="mohe-upload-zone__hint">JPG / PNG / GIF · 最大 5MB</p>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════ AI TAB ═══════════════ */}
            {activeTab === "ai" && (
              <div className="mohe-panel mohe-panel--ai">
                {/* Provider Selection */}
                <div className="mohe-field">
                  <label className="mohe-label">
                    <span className="mohe-label__code">AI.01</span>
                    <span>提供商</span>
                  </label>
                  <div className="mohe-provider-grid">
                    {[
                      { id: "ollama" as const, icon: <Cpu size={18} />, title: "Ollama", desc: "本地模型 · 隐私优先", tag: "LOCAL" },
                      { id: "openai" as const, icon: <Server size={18} />, title: "OpenAI 兼容", desc: "外部 API · 更强能力", tag: "CLOUD" },
                    ].map((provider) => (
                      <button
                        key={provider.id}
                        onClick={() => settings.setApiProvider(provider.id)}
                        className={`mohe-provider-card ${settings.apiProvider === provider.id ? "mohe-provider-card--active" : ""}`}
                      >
                        <div className="mohe-provider-card__tag">{provider.tag}</div>
                        <div className="mohe-provider-card__icon">{provider.icon}</div>
                        <div className="mohe-provider-card__info">
                          <div className="mohe-provider-card__title">{provider.title}</div>
                          <div className="mohe-provider-card__desc">{provider.desc}</div>
                        </div>
                        {settings.apiProvider === provider.id && (
                          <div className="mohe-provider-card__check">
                            <Check size={13} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Base URL */}
                <div className="mohe-field">
                  <label className="mohe-label">
                    <span className="mohe-label__code">AI.02</span>
                    <span>Base URL</span>
                  </label>
                  <div className="mohe-input-group">
                    <Globe size={14} className="mohe-input-icon" />
                    <input
                      type="text"
                      value={settings.baseUrl}
                      onChange={(e) => settings.setBaseUrl(e.target.value)}
                      placeholder={settings.apiProvider === "ollama" ? "http://localhost:11434" : "https://api.openai.com"}
                      className="mohe-input"
                    />
                  </div>
                  <p className="mohe-hint">
                    {settings.apiProvider === "ollama" ? "Ollama 默认地址: http://localhost:11434" : "支持任何 OpenAI 兼容 API"}
                  </p>
                </div>

                {/* API Key */}
                <div className="mohe-field">
                  <label className="mohe-label">
                    <span className="mohe-label__code">AI.03</span>
                    <span>API Key</span>
                  </label>
                  <div className="mohe-input-group">
                    <Key size={14} className="mohe-input-icon" />
                    <input
                      type="password"
                      value={settings.apiKey}
                      onChange={(e) => settings.setApiKey(e.target.value)}
                      placeholder="输入 API Key（可选）"
                      className="mohe-input"
                    />
                  </div>
                  <p className="mohe-hint">Ollama 本地模型无需 API Key</p>
                </div>

                {/* Model */}
                <div className="mohe-field">
                  <label className="mohe-label">
                    <span className="mohe-label__code">AI.04</span>
                    <span>对话模型</span>
                  </label>
                  <div className="mohe-input-group">
                    <Zap size={14} className="mohe-input-icon" />
                    <input
                      type="text"
                      value={settings.model}
                      onChange={(e) => settings.setModel(e.target.value)}
                      placeholder={settings.apiProvider === "ollama" ? "qwen2.5:latest" : "gpt-4o"}
                      className="mohe-input"
                    />
                  </div>
                </div>

                {/* Embedding Model */}
                <div className="mohe-field">
                  <label className="mohe-label">
                    <span className="mohe-label__code">AI.05</span>
                    <span>向量嵌入模型</span>
                  </label>
                  <div className="mohe-input-group">
                    <Activity size={14} className="mohe-input-icon" />
                    <input
                      type="text"
                      value={settings.embeddingModel}
                      onChange={(e) => settings.setEmbeddingModel(e.target.value)}
                      placeholder={settings.apiProvider === "ollama" ? "nomic-embed-text" : "text-embedding-3-small"}
                      className="mohe-input"
                    />
                  </div>
                  <p className="mohe-hint">用于 RAG 知识库的文档向量化</p>
                </div>

                {/* Test Connection */}
                <div className="mohe-field mohe-field--action">
                  <button
                    onClick={handleTestConnection}
                    disabled={testStatus === "loading"}
                    className="mohe-test-btn"
                  >
                    {testStatus === "loading" ? (
                      <span className="mohe-spinner" />
                    ) : (
                      <Server size={14} />
                    )}
                    <span>测试连接</span>
                    <ArrowRight size={13} className="mohe-test-btn__arrow" />
                  </button>
                  {testStatus === "success" && (
                    <span className="mohe-status mohe-status--success">
                      <Check size={11} /> {testMessage}
                    </span>
                  )}
                  {testStatus === "error" && (
                    <span className="mohe-status mohe-status--error">{testMessage}</span>
                  )}
                </div>
              </div>
            )}

            {/* ═══════════════ DATA TAB ═══════════════ */}
            {activeTab === "data" && (
              <div className="mohe-panel mohe-panel--data">
                {/* Stats */}
                <div className="mohe-field">
                  <label className="mohe-label">
                    <span className="mohe-label__code">DT.01</span>
                    <span>数据统计</span>
                  </label>
                  <div className="mohe-stats-grid">
                    {[
                      { value: documents.length, label: "文档数量", icon: <FileText size={14} /> },
                      { value: messages.length, label: "对话消息", icon: <MessageSquare size={14} /> },
                      { value: `${(totalWords / 1024).toFixed(1)}KB`, label: "数据大小", icon: <Activity size={14} /> },
                    ].map((stat, i) => (
                      <div key={i} className="mohe-stat-card">
                        <div className="mohe-stat-card__icon">{stat.icon}</div>
                        <div className="mohe-stat-card__value">{stat.value}</div>
                        <div className="mohe-stat-card__label">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Export */}
                <div className="mohe-field">
                  <label className="mohe-label">
                    <span className="mohe-label__code">DT.02</span>
                    <span>导出备份</span>
                  </label>
                  <p className="mohe-hint mohe-hint--mb">将所有文档、对话记录和设置导出为 JSON 文件</p>
                  <button
                    onClick={handleExport}
                    disabled={exportStatus === "loading"}
                    className="mohe-export-btn"
                  >
                    {exportStatus === "loading" ? (
                      <>
                        <span className="mohe-spinner mohe-spinner--light" />
                        <span>导出中...</span>
                      </>
                    ) : exportStatus === "success" ? (
                      <>
                        <Check size={14} />
                        <span>导出成功</span>
                      </>
                    ) : (
                      <>
                        <Download size={14} />
                        <span>导出数据</span>
                        <ArrowRight size={13} className="mohe-export-btn__arrow" />
                      </>
                    )}
                  </button>
                </div>

                {/* Import */}
                <div className="mohe-field">
                  <label className="mohe-label">
                    <span className="mohe-label__code">DT.03</span>
                    <span>导入备份</span>
                  </label>
                  <p className="mohe-hint mohe-hint--mb">从 JSON 备份文件恢复数据。注意：导入将覆盖当前所有数据</p>
                  <button
                    onClick={handleImport}
                    disabled={importStatus === "loading"}
                    className="mohe-import-btn"
                  >
                    {importStatus === "loading" ? (
                      <>
                        <span className="mohe-spinner" />
                        <span>导入中...</span>
                      </>
                    ) : importStatus === "success" ? (
                      <>
                        <Check size={14} />
                        <span>导入成功</span>
                      </>
                    ) : (
                      <>
                        <Upload size={14} />
                        <span>选择文件</span>
                        <ArrowRight size={13} className="mohe-import-btn__arrow" />
                      </>
                    )}
                  </button>
                  {importStatus === "error" && (
                    <p className="mohe-status mohe-status--error mohe-status--mt">导入失败，请检查文件格式</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="mohe-footer">
            <div className="mohe-footer__status">
              <span className="mohe-footer__dot" />
              <span>系统就绪</span>
            </div>
            <div className="mohe-footer__actions">
              <button className="mohe-btn-ghost" onClick={onClose}>取消</button>
              <button className="mohe-btn-primary" onClick={onClose}>
                保存设置
                <ArrowRight size={13} />
              </button>
            </div>
          </footer>
        </div>
      </div>

      <style>{`
        /* ═══════════════════════════════════════════
           OBSIDIAN OBSERVATORY — Settings Panel
           ═══════════════════════════════════════════ */

        .mohe-settings-root {
          position: fixed;
          inset: 0;
          z-index: 50;
          overflow: hidden;
        }

        /* Ambient orbs */
        .mohe-ambient-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          z-index: 0;
        }
        .mohe-ambient-orb--1 {
          width: 500px;
          height: 500px;
          top: -150px;
          right: -100px;
          background: radial-gradient(circle, rgba(217,165,80,0.06) 0%, transparent 70%);
        }
        .mohe-ambient-orb--2 {
          width: 400px;
          height: 400px;
          bottom: -100px;
          left: -80px;
          background: radial-gradient(circle, rgba(180,140,60,0.04) 0%, transparent 70%);
        }

        /* Overlay */
        .mohe-overlay {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(5,7,12,0.75);
          backdrop-filter: blur(8px);
          opacity: 0;
          transition: opacity 0.4s ease;
          z-index: 1;
        }
        .mohe-overlay--visible {
          opacity: 1;
        }

        /* Modal */
        .mohe-modal {
          position: relative;
          width: 620px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          background: linear-gradient(165deg, #0e1219 0%, #0a0d14 40%, #080b10 100%);
          border: 1px solid rgba(217,165,80,0.08);
          border-radius: 14px;
          box-shadow:
            0 30px 80px rgba(0,0,0,0.7),
            0 0 0 1px rgba(255,255,255,0.02),
            inset 0 1px 0 rgba(255,255,255,0.03);
          opacity: 0;
          transform: scale(0.96) translateY(12px);
          transition: all 0.45s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          z-index: 2;
        }
        .mohe-modal--visible {
          opacity: 1;
          transform: scale(1) translateY(0);
        }

        /* Grid overlay */
        .mohe-grid-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(217,165,80,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(217,165,80,0.015) 1px, transparent 1px);
          background-size: 40px 40px;
          z-index: 0;
        }

        /* Header */
        .mohe-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          position: relative;
          z-index: 1;
        }
        .mohe-header__brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .mohe-header__icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(217,165,80,0.12), rgba(217,165,80,0.04));
          border: 1px solid rgba(217,165,80,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #d9a550;
        }
        .mohe-header__title {
          font-size: 16px;
          font-weight: 600;
          color: #f0ece4;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }
        .mohe-header__subtitle {
          font-size: 9px;
          font-weight: 500;
          color: rgba(217,165,80,0.4);
          letter-spacing: 0.15em;
          font-family: "SF Mono", "Fira Code", monospace;
          margin-top: 2px;
        }
        .mohe-close-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: #5a5e68;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .mohe-close-btn:hover {
          background: rgba(255,255,255,0.05);
          color: #f0ece4;
        }

        /* Tabs */
        .mohe-tabs {
          display: flex;
          gap: 2px;
          padding: 12px 24px 0;
          position: relative;
          z-index: 1;
        }
        .mohe-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border: none;
          background: transparent;
          color: #4a4e58;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border-radius: 8px 8px 0 0;
          transition: all 0.2s ease;
          position: relative;
        }
        .mohe-tab:hover {
          color: #8a8e98;
          background: rgba(255,255,255,0.02);
        }
        .mohe-tab--active {
          color: #f0ece4;
          background: rgba(217,165,80,0.06);
        }
        .mohe-tab__code {
          font-size: 9px;
          font-family: "SF Mono", "Fira Code", monospace;
          color: rgba(217,165,80,0.35);
          letter-spacing: 0.05em;
        }
        .mohe-tab--active .mohe-tab__code {
          color: rgba(217,165,80,0.6);
        }
        .mohe-tab__icon {
          display: flex;
          align-items: center;
        }
        .mohe-tab__indicator {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          color: #d9a550;
        }

        /* Content */
        .mohe-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px 24px;
          position: relative;
          z-index: 1;
        }

        /* Panel animation */
        .mohe-panel {
          animation: mohe-panel-in 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes mohe-panel-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Field */
        .mohe-field {
          margin-bottom: 20px;
        }
        .mohe-field--action {
          margin-bottom: 0;
        }
        .mohe-label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          font-weight: 600;
          color: #8a8e98;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 10px;
        }
        .mohe-label__code {
          font-family: "SF Mono", "Fira Code", monospace;
          font-size: 9px;
          color: rgba(217,165,80,0.4);
          letter-spacing: 0.05em;
        }

        /* Input */
        .mohe-input-group {
          position: relative;
          display: flex;
          align-items: center;
        }
        .mohe-input-icon {
          position: absolute;
          left: 12px;
          color: #3a3e48;
          pointer-events: none;
          transition: color 0.2s ease;
        }
        .mohe-input {
          width: 100%;
          padding: 10px 14px 10px 38px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          color: #f0ece4;
          font-size: 13px;
          outline: none;
          transition: all 0.2s ease;
        }
        .mohe-input::placeholder {
          color: #3a3e48;
        }
        .mohe-input:focus {
          border-color: rgba(217,165,80,0.3);
          background: rgba(217,165,80,0.02);
          box-shadow: 0 0 0 3px rgba(217,165,80,0.06);
        }
        .mohe-input:focus + .mohe-input-icon,
        .mohe-input:focus ~ .mohe-input-icon {
          color: rgba(217,165,80,0.5);
        }
        .mohe-hint {
          font-size: 11px;
          color: #3a3e48;
          margin-top: 6px;
          line-height: 1.4;
        }
        .mohe-hint--mb {
          margin-bottom: 10px;
        }

        /* Provider Cards */
        .mohe-provider-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .mohe-provider-card {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: rgba(255,255,255,0.015);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 10px;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s ease;
          color: #6a6e78;
        }
        .mohe-provider-card:hover {
          border-color: rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.025);
        }
        .mohe-provider-card--active {
          border-color: rgba(217,165,80,0.25);
          background: rgba(217,165,80,0.04);
          color: #f0ece4;
          box-shadow: 0 0 24px rgba(217,165,80,0.04);
        }
        .mohe-provider-card__tag {
          position: absolute;
          top: 8px;
          right: 10px;
          font-size: 8px;
          font-family: "SF Mono", "Fira Code", monospace;
          letter-spacing: 0.1em;
          color: rgba(217,165,80,0.3);
        }
        .mohe-provider-card--active .mohe-provider-card__tag {
          color: rgba(217,165,80,0.5);
        }
        .mohe-provider-card__icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(255,255,255,0.03);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #5a5e68;
        }
        .mohe-provider-card--active .mohe-provider-card__icon {
          background: rgba(217,165,80,0.08);
          color: #d9a550;
        }
        .mohe-provider-card__title {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 2px;
        }
        .mohe-provider-card__desc {
          font-size: 10px;
          color: #4a4e58;
        }
        .mohe-provider-card--active .mohe-provider-card__desc {
          color: #6a6e78;
        }
        .mohe-provider-card__check {
          margin-left: auto;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(217,165,80,0.15);
          color: #d9a550;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* Test Button */
        .mohe-test-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 18px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 8px;
          color: #8a8e98;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .mohe-test-btn:hover {
          border-color: rgba(217,165,80,0.2);
          color: #c0b898;
          background: rgba(217,165,80,0.04);
        }
        .mohe-test-btn__arrow {
          opacity: 0;
          transform: translateX(-4px);
          transition: all 0.2s ease;
          color: rgba(217,165,80,0.5);
        }
        .mohe-test-btn:hover .mohe-test-btn__arrow {
          opacity: 1;
          transform: translateX(0);
        }
        .mohe-test-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Status */
        .mohe-status {
          font-size: 11px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .mohe-status--success {
          color: #6abf69;
        }
        .mohe-status--error {
          color: #d96060;
        }
        .mohe-status--mt {
          margin-top: 8px;
        }

        /* Spinner */
        .mohe-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.1);
          border-top-color: #d9a550;
          border-radius: 50%;
          animation: mohe-spin 0.7s linear infinite;
        }
        .mohe-spinner--light {
          border-color: rgba(255,255,255,0.2);
          border-top-color: #fff;
        }
        @keyframes mohe-spin {
          to { transform: rotate(360deg); }
        }

        /* Stats */
        .mohe-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .mohe-stat-card {
          padding: 16px;
          background: rgba(255,255,255,0.015);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 10px;
          transition: all 0.2s ease;
        }
        .mohe-stat-card:hover {
          border-color: rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.025);
        }
        .mohe-stat-card__icon {
          color: #3a3e48;
          margin-bottom: 10px;
        }
        .mohe-stat-card__value {
          font-size: 22px;
          font-weight: 700;
          color: #f0ece4;
          letter-spacing: -0.03em;
          line-height: 1;
          font-family: "SF Mono", "Fira Code", monospace;
        }
        .mohe-stat-card__label {
          font-size: 10px;
          color: #3a3e48;
          margin-top: 6px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        /* Export / Import buttons */
        .mohe-export-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: linear-gradient(135deg, rgba(106,191,105,0.85), rgba(80,170,80,0.85));
          border: none;
          border-radius: 8px;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 12px rgba(106,191,105,0.15);
        }
        .mohe-export-btn:hover {
          box-shadow: 0 4px 20px rgba(106,191,105,0.25);
          transform: translateY(-1px);
        }
        .mohe-export-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .mohe-export-btn__arrow {
          opacity: 0;
          transform: translateX(-4px);
          transition: all 0.2s ease;
        }
        .mohe-export-btn:hover .mohe-export-btn__arrow {
          opacity: 1;
          transform: translateX(0);
        }

        .mohe-import-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 8px;
          color: #8a8e98;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .mohe-import-btn:hover {
          border-color: rgba(217,165,80,0.2);
          color: #c0b898;
          background: rgba(217,165,80,0.04);
        }
        .mohe-import-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .mohe-import-btn__arrow {
          opacity: 0;
          transform: translateX(-4px);
          transition: all 0.2s ease;
          color: rgba(217,165,80,0.5);
        }
        .mohe-import-btn:hover .mohe-import-btn__arrow {
          opacity: 1;
          transform: translateX(0);
        }

        /* ═══════════ PROFILE ═══════════ */
        .mohe-panel--profile {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .mohe-avatar-section {
          display: flex;
          gap: 28px;
          align-items: flex-start;
        }

        .mohe-avatar-frame {
          position: relative;
          flex-shrink: 0;
        }
        .mohe-avatar-corner {
          position: absolute;
          width: 12px;
          height: 12px;
          border-color: rgba(217,165,80,0.25);
          border-style: solid;
          border-width: 0;
          z-index: 2;
        }
        .mohe-avatar-corner--tl { top: -2px; left: -2px; border-top-width: 1.5px; border-left-width: 1.5px; }
        .mohe-avatar-corner--tr { top: -2px; right: -2px; border-top-width: 1.5px; border-right-width: 1.5px; }
        .mohe-avatar-corner--bl { bottom: -2px; left: -2px; border-bottom-width: 1.5px; border-left-width: 1.5px; }
        .mohe-avatar-corner--br { bottom: -2px; right: -2px; border-bottom-width: 1.5px; border-right-width: 1.5px; }

        .mohe-avatar {
          width: 88px;
          height: 88px;
          border-radius: 14px;
          background: linear-gradient(145deg, #141820 0%, #0e1118 100%);
          border: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(0,0,0,0.4);
        }
        .mohe-avatar__emoji {
          font-size: 36px;
          line-height: 1;
        }
        .mohe-avatar__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .mohe-avatar__overlay {
          position: absolute;
          inset: 0;
          border-radius: 14px;
          background: rgba(0,0,0,0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .mohe-avatar-frame:hover .mohe-avatar__overlay {
          opacity: 1;
        }
        .mohe-avatar__action {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: none;
          background: rgba(255,255,255,0.1);
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }
        .mohe-avatar__action:hover {
          background: rgba(255,255,255,0.2);
          transform: scale(1.08);
        }

        .mohe-identity {
          flex: 1;
          padding-top: 4px;
        }
        .mohe-identity__label {
          font-size: 9px;
          font-family: "SF Mono", "Fira Code", monospace;
          letter-spacing: 0.15em;
          color: rgba(217,165,80,0.35);
          margin-bottom: 10px;
          text-transform: uppercase;
        }
        .mohe-identity .mohe-input-group {
          margin-bottom: 14px;
        }

        .mohe-preview-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: rgba(255,255,255,0.015);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 10px;
        }
        .mohe-preview-avatar {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: linear-gradient(145deg, #141820, #0e1118);
          border: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          overflow: hidden;
          flex-shrink: 0;
        }
        .mohe-preview-avatar__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .mohe-preview-info {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }
        .mohe-preview-name {
          font-size: 13px;
          font-weight: 600;
          color: #f0ece4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .mohe-preview-role {
          font-size: 10px;
          color: #3a3e48;
          margin-top: 1px;
        }
        .mohe-preview-badge {
          font-size: 9px;
          font-weight: 700;
          font-family: "SF Mono", "Fira Code", monospace;
          letter-spacing: 0.1em;
          padding: 3px 8px;
          border-radius: 4px;
          background: rgba(217,165,80,0.1);
          color: rgba(217,165,80,0.7);
          border: 1px solid rgba(217,165,80,0.15);
          flex-shrink: 0;
        }

        /* Emoji Picker */
        .mohe-emoji-picker {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 10px;
          padding: 14px;
        }
        .mohe-emoji-picker__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 11px;
          color: #5a5e68;
        }
        .mohe-emoji-picker__count {
          font-family: "SF Mono", "Fira Code", monospace;
          font-size: 9px;
          color: rgba(217,165,80,0.3);
        }
        .mohe-emoji-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 4px;
        }
        .mohe-emoji-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid transparent;
          background: transparent;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }
        .mohe-emoji-btn:hover {
          background: rgba(255,255,255,0.04);
          transform: scale(1.12);
        }
        .mohe-emoji-btn--active {
          background: rgba(217,165,80,0.1);
          border-color: rgba(217,165,80,0.25);
        }

        /* Upload Zone */
        .mohe-upload-zone {
          border: 1px dashed rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 28px;
          text-align: center;
          cursor: pointer;
          transition: all 0.25s ease;
          background: rgba(255,255,255,0.008);
        }
        .mohe-upload-zone:hover {
          border-color: rgba(217,165,80,0.15);
          background: rgba(217,165,80,0.02);
        }
        .mohe-upload-zone--active {
          border-color: rgba(217,165,80,0.35);
          background: rgba(217,165,80,0.04);
          transform: scale(1.01);
        }
        .mohe-upload-zone__icon {
          color: #2a2e38;
          margin-bottom: 10px;
        }
        .mohe-upload-zone__text {
          font-size: 12px;
          color: #5a5e68;
          margin-bottom: 4px;
        }
        .mohe-upload-zone__hint {
          font-size: 10px;
          color: #2a2e38;
          font-family: "SF Mono", "Fira Code", monospace;
        }
        .mohe-accent-text {
          color: rgba(217,165,80,0.7);
        }

        /* Footer */
        .mohe-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-top: 1px solid rgba(255,255,255,0.04);
          position: relative;
          z-index: 1;
        }
        .mohe-footer__status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          color: #3a3e48;
          font-family: "SF Mono", "Fira Code", monospace;
        }
        .mohe-footer__dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #6abf69;
          box-shadow: 0 0 6px rgba(106,191,105,0.4);
        }
        .mohe-footer__actions {
          display: flex;
          gap: 8px;
        }
        .mohe-btn-ghost {
          padding: 8px 18px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.06);
          background: transparent;
          color: #5a5e68;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .mohe-btn-ghost:hover {
          border-color: rgba(255,255,255,0.12);
          color: #8a8e98;
          background: rgba(255,255,255,0.02);
        }
        .mohe-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 20px;
          border-radius: 8px;
          border: none;
          background: linear-gradient(135deg, #d9a550, #c4923e);
          color: #0a0d14;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 12px rgba(217,165,80,0.2);
        }
        .mohe-btn-primary:hover {
          box-shadow: 0 4px 20px rgba(217,165,80,0.3);
          transform: translateY(-1px);
        }

        /* Scrollbar */
        .mohe-content::-webkit-scrollbar {
          width: 4px;
        }
        .mohe-content::-webkit-scrollbar-track {
          background: transparent;
        }
        .mohe-content::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.06);
          border-radius: 2px;
        }
        .mohe-content::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.1);
        }
      `}</style>
    </div>
  );
}
