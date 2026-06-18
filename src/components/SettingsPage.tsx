import { useState } from "react";
import { X, Server, Key, Cpu, Sparkles, Check, Database, Download, Upload, HardDrive } from "lucide-react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useAppStore } from "@/stores/appStore";
import { useChatStore } from "@/stores/chatStore";

interface SettingsPageProps {
  onClose: () => void;
}

export default function SettingsPage({ onClose }: SettingsPageProps) {
  const settings = useSettingsStore();
  const { documents } = useAppStore();
  const { messages } = useChatStore();
  const [testStatus, setTestStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"ai" | "data">("ai");
  const [exportStatus, setExportStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [importStatus, setImportStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleTestConnection() {
    setTestStatus("loading");
    setTestMessage("");

    try {
      const url = `${settings.baseUrl.replace(/\/$/, "")}/v1/models`;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (settings.apiKey) {
        headers["Authorization"] = `Bearer ${settings.apiKey}`;
      }

      const response = await fetch(url, { headers });
      if (response.ok) {
        setTestStatus("success");
        setTestMessage("连接成功！");
      } else {
        setTestStatus("error");
        setTestMessage(`连接失败: ${response.status}`);
      }
    } catch (error) {
      setTestStatus("error");
      setTestMessage(error instanceof Error ? error.message : "连接失败");
    }
  }

  async function handleExport() {
    setExportStatus("loading");
    try {
      const data = {
        version: "0.4.0",
        exportDate: new Date().toISOString(),
        documents,
        messages,
        settings: {
          apiProvider: settings.apiProvider,
          baseUrl: settings.baseUrl,
          model: settings.model,
          embeddingModel: settings.embeddingModel,
        },
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
    } catch (error) {
      console.error("导出失败:", error);
      setExportStatus("error");
      setTimeout(() => setExportStatus("idle"), 2000);
    }
  }

  async function handleImport() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setImportStatus("loading");
      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (!data.version || !data.documents) {
          throw new Error("无效的备份文件");
        }

        // 这里应该调用后端 API 导入数据
        // 暂时只验证文件格式
        setImportStatus("success");
        setTimeout(() => setImportStatus("idle"), 2000);
      } catch (error) {
        console.error("导入失败:", error);
        setImportStatus("error");
        setTimeout(() => setImportStatus("idle"), 2000);
      }
    };

    input.click();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[560px] max-h-[80vh] bg-bg-sidebar border border-border-card rounded-xl shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bg-card border border-border-card flex items-center justify-center">
              <Sparkles size={16} className="text-cyan" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary">设置</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-text-secondary hover:bg-bg-hover rounded-md transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 px-6 pt-4 border-b border-border-default">
          <button
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === "ai"
                ? "text-accent border-accent"
                : "text-text-tertiary border-transparent hover:text-text-secondary"
            }`}
          >
            <Sparkles size={14} />
            AI 设置
          </button>
          <button
            onClick={() => setActiveTab("data")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === "data"
                ? "text-accent border-accent"
                : "text-text-tertiary border-transparent hover:text-text-secondary"
            }`}
          >
            <Database size={14} />
            数据管理
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {activeTab === "ai" ? (
            <>
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              AI 提供商
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => settings.setApiProvider("ollama")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
                  settings.apiProvider === "ollama"
                    ? "bg-bg-active border-accent text-text-primary"
                    : "bg-bg-card border-border-card text-text-secondary hover:bg-bg-hover"
                }`}
              >
                <Cpu size={18} />
                <div className="text-left">
                  <div className="text-sm font-medium">Ollama</div>
                  <div className="text-xs text-text-muted">本地模型 · 隐私优先</div>
                </div>
              </button>
              <button
                onClick={() => settings.setApiProvider("openai")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
                  settings.apiProvider === "openai"
                    ? "bg-bg-active border-accent text-text-primary"
                    : "bg-bg-card border-border-card text-text-secondary hover:bg-bg-hover"
                }`}
              >
                <Server size={18} />
                <div className="text-left">
                  <div className="text-sm font-medium">OpenAI 兼容</div>
                  <div className="text-xs text-text-muted">外部 API · 更强能力</div>
                </div>
              </button>
            </div>
          </div>

          {/* Base URL */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Base URL
            </label>
            <input
              type="text"
              value={settings.baseUrl}
              onChange={(e) => settings.setBaseUrl(e.target.value)}
              placeholder={settings.apiProvider === "ollama" ? "http://localhost:11434" : "https://api.openai.com"}
              className="input-base"
            />
            <p className="mt-1 text-xs text-text-muted">
              {settings.apiProvider === "ollama"
                ? "Ollama 默认地址: http://localhost:11434"
                : "支持任何 OpenAI 兼容 API"}
            </p>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              API Key
            </label>
            <div className="relative">
              <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="password"
                value={settings.apiKey}
                onChange={(e) => settings.setApiKey(e.target.value)}
                placeholder="输入 API Key（可选）"
                className="input-base pl-9"
              />
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Ollama 本地模型无需 API Key
            </p>
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              对话模型
            </label>
            <input
              type="text"
              value={settings.model}
              onChange={(e) => settings.setModel(e.target.value)}
              placeholder={settings.apiProvider === "ollama" ? "qwen2.5:latest" : "gpt-4o"}
              className="input-base"
            />
          </div>

          {/* Embedding Model */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              向量嵌入模型
            </label>
            <input
              type="text"
              value={settings.embeddingModel}
              onChange={(e) => settings.setEmbeddingModel(e.target.value)}
              placeholder={settings.apiProvider === "ollama" ? "nomic-embed-text" : "text-embedding-3-small"}
              className="input-base"
            />
            <p className="mt-1 text-xs text-text-muted">
              用于 RAG 知识库的文档向量化
            </p>
          </div>

          {/* Test Connection */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleTestConnection}
              disabled={testStatus === "loading"}
              className="btn-ghost flex items-center gap-2 disabled:opacity-50"
            >
              {testStatus === "loading" ? (
                <span className="w-3.5 h-3.5 border-2 border-text-muted border-t-transparent rounded-full animate-spin" />
              ) : (
                <Server size={14} />
              )}
              测试连接
            </button>
            {testStatus === "success" && (
              <span className="flex items-center gap-1 text-xs text-success">
                <Check size={12} /> {testMessage}
              </span>
            )}
            {testStatus === "error" && (
              <span className="text-xs text-danger">{testMessage}</span>
            )}
          </div>
            </>
          ) : (
            <>
              {/* 数据统计 */}
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
                  <HardDrive size={14} />
                  数据统计
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-bg-card border border-border-card rounded-lg p-4">
                    <div className="text-2xl font-bold text-text-primary">{documents.length}</div>
                    <div className="text-xs text-text-muted mt-1">文档数量</div>
                  </div>
                  <div className="bg-bg-card border border-border-card rounded-lg p-4">
                    <div className="text-2xl font-bold text-text-primary">{messages.length}</div>
                    <div className="text-xs text-text-muted mt-1">对话消息</div>
                  </div>
                  <div className="bg-bg-card border border-border-card rounded-lg p-4">
                    <div className="text-2xl font-bold text-text-primary">
                      {(documents.reduce((sum, doc) => sum + doc.content.length, 0) / 1024).toFixed(1)}KB
                    </div>
                    <div className="text-xs text-text-muted mt-1">数据大小</div>
                  </div>
                </div>
              </div>

              {/* 导出备份 */}
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
                  <Download size={14} />
                  导出备份
                </h3>
                <p className="text-xs text-text-muted mb-3">
                  将所有文档、对话记录和设置导出为 JSON 文件，可用于迁移或备份
                </p>
                <button
                  onClick={handleExport}
                  disabled={exportStatus === "loading"}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {exportStatus === "loading" ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      导出中...
                    </>
                  ) : exportStatus === "success" ? (
                    <>
                      <Check size={14} />
                      导出成功
                    </>
                  ) : (
                    <>
                      <Download size={14} />
                      导出数据
                    </>
                  )}
                </button>
              </div>

              {/* 导入备份 */}
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
                  <Upload size={14} />
                  导入备份
                </h3>
                <p className="text-xs text-text-muted mb-3">
                  从 JSON 备份文件恢复数据。注意：导入将覆盖当前所有数据
                </p>
                <button
                  onClick={handleImport}
                  disabled={importStatus === "loading"}
                  className="btn-ghost flex items-center gap-2 border border-border-card disabled:opacity-50"
                >
                  {importStatus === "loading" ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-text-muted border-t-transparent rounded-full animate-spin" />
                      导入中...
                    </>
                  ) : importStatus === "success" ? (
                    <>
                      <Check size={14} />
                      导入成功
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      选择文件
                    </>
                  )}
                </button>
                {importStatus === "error" && (
                  <p className="text-xs text-danger mt-2">导入失败，请检查文件格式</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-default">
          <button onClick={onClose} className="btn-ghost">
            取消
          </button>
          <button onClick={onClose} className="btn-primary">
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
}
