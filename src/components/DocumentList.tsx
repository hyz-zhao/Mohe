import { Search, SlidersHorizontal, Star, MoreVertical, FileText } from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { useEditorStore } from "@/stores/editorStore";

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "今天 " + d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  if (days === 1) return "昨天 " + d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" }) + " " + d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

export default function DocumentList() {
  const { documents, searchQuery, activeTab, setSearchQuery, setActiveTab } = useAppStore();
  const { setCurrentDocId } = useEditorStore();

  const pinnedDocs = documents.filter((d) => d.pinned);
  const regularDocs = documents.filter((d) => !d.pinned);

  const tabs = [
    { key: "all" as const, label: "全部" },
    { key: "mine" as const, label: "我创建的" },
    { key: "starred" as const, label: "收藏" },
  ];

  function handleDocClick(id: string) {
    setCurrentDocId(id);
  }

  return (
    <div className="flex flex-col h-full bg-bg-main">
      {/* Search */}
      <div className="px-4 pt-3 pb-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="搜索文档"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-base pl-9 pr-8"
          />
          <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors">
            <SlidersHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              activeTab === tab.key
                ? "bg-bg-active text-text-primary"
                : "text-text-tertiary hover:bg-bg-hover hover:text-text-secondary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto px-2">
        {/* Pinned */}
        {pinnedDocs.length > 0 && (
          <div className="mb-2">
            <div className="px-2 py-1 text-xs text-text-muted font-medium">置顶</div>
            {pinnedDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => handleDocClick(doc.id)}
                className="sidebar-item group"
              >
                <FileText size={16} className="text-text-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-text-primary truncate">{doc.title}</div>
                  <div className="text-xs text-text-muted">{formatDate(doc.updated_at)}</div>
                </div>
                <Star size={14} className="text-accent fill-accent shrink-0" />
              </div>
            ))}
          </div>
        )}

        {/* Regular */}
        {regularDocs.length > 0 && (
          <div>
            <div className="px-2 py-1 text-xs text-text-muted font-medium">文档</div>
            {regularDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => handleDocClick(doc.id)}
                className="sidebar-item group"
              >
                <FileText size={16} className="text-text-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-text-primary truncate">{doc.title}</div>
                  <div className="text-xs text-text-muted">{formatDate(doc.updated_at)}</div>
                </div>
                <MoreVertical size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
