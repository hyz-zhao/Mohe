import {
  Search,
  Library,
  Tag,
  Network,
  Star,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
  Settings,
  FileText,
  MoreHorizontal,
  X,
  RotateCcw,
  Trash,
} from "lucide-react";
import { useEditorStore } from "@/stores/editorStore";
import { useAppStore } from "@/stores/appStore";
import { useState, useMemo } from "react";
import SettingsPage from "./SettingsPage";

interface ActivityItem {
  icon: React.ReactNode;
  label: string;
  id: string;
}

const activityItems: ActivityItem[] = [
  { icon: <Search size={20} />, label: "搜索", id: "search" },
  { icon: <Library size={20} />, label: "资源管理器", id: "explorer" },
  { icon: <Tag size={20} />, label: "标签", id: "tags" },
  { icon: <Network size={20} />, label: "图谱", id: "graph" },
  { icon: <Star size={20} />, label: "收藏", id: "starred" },
  { icon: <Trash2 size={20} />, label: "回收站", id: "trash" },
];

export default function Sidebar() {
  const { setCurrentDocId, currentDocId } = useEditorStore();
  const { userInfo, addDocument, documents, touchDocument } = useAppStore();
  const [showSettings, setShowSettings] = useState(false);
  const [activeActivity, setActiveActivity] = useState("explorer");

  return (
    <div className="flex h-full shrink-0">
      {/* Activity Bar */}
      <aside className="w-12 bg-bg-deepest border-r border-border-default flex flex-col items-center py-2 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm mb-3">
          M
        </div>

        <div className="flex flex-col items-center gap-1 flex-1">
          {activityItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveActivity(item.id)}
              className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors relative ${
                activeActivity === item.id
                  ? "text-text-primary"
                  : "text-text-muted hover:text-text-secondary"
              }`}
              title={item.label}
            >
              {activeActivity === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-r" />
              )}
              {item.icon}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => setShowSettings(true)}
            className="w-10 h-10 flex items-center justify-center rounded-md text-text-muted hover:text-text-secondary transition-colors"
            title="设置"
          >
            <Settings size={20} />
          </button>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium overflow-hidden mt-1"
            style={{
              background: userInfo.avatar.startsWith("data:")
                ? "none"
                : "linear-gradient(to-br, #b8860b, #d4a017)",
            }}
          >
            {userInfo.avatar.startsWith("data:") ? (
              <img src={userInfo.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm">{userInfo.avatar || "👤"}</span>
            )}
          </div>
        </div>
      </aside>

      {/* Side Panel */}
      <aside className="w-64 bg-bg-sidebar border-r border-border-default flex flex-col shrink-0 overflow-hidden">
        <div className="h-9 flex items-center justify-between px-4 shrink-0 border-b border-border-default">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            {activityItems.find((i) => i.id === activeActivity)?.label || "资源管理器"}
          </span>
          <button className="text-text-muted hover:text-text-secondary transition-colors">
            <MoreHorizontal size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeActivity === "explorer" && (
            <ExplorerPanel
              documents={documents}
              currentDocId={currentDocId}
              onDocClick={(id) => { touchDocument(id); setCurrentDocId(id); }}
              onNewDoc={() => {
                const newDoc = {
                  id: Date.now().toString(),
                  title: "未命名文档",
                  content: "",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                };
                addDocument(newDoc);
                setCurrentDocId(newDoc.id);
              }}
            />
          )}
          {activeActivity === "search" && <SearchPanel />}
          {activeActivity === "tags" && <TagsPanel />}
          {activeActivity === "graph" && <GraphPanel />}
          {activeActivity === "starred" && <StarredPanel />}
          {activeActivity === "trash" && <TrashPanel />}
        </div>
      </aside>

      {showSettings && <SettingsPage onClose={() => setShowSettings(false)} />}
    </div>
  );
}

/* ─── Explorer Panel ─── */
function ExplorerPanel({
  documents, currentDocId, onDocClick, onNewDoc,
}: {
  documents: { id: string; title: string; starred?: boolean }[];
  currentDocId: string | null;
  onDocClick: (id: string) => void;
  onNewDoc: () => void;
}) {
  const { trashDocument, toggleStar } = useAppStore();
  const [expanded, setExpanded] = useState({ docs: true, project: true });

  return (
    <div className="py-1">
      <button
        onClick={onNewDoc}
        className="flex items-center gap-2 w-full px-4 py-1.5 text-xs text-text-tertiary hover:bg-bg-hover hover:text-text-secondary transition-colors"
      >
        <Plus size={12} />
        <span>新建文档</span>
      </button>

      <div className="mt-1">
        <button
          onClick={() => setExpanded((e) => ({ ...e, docs: !e.docs }))}
          className="flex items-center gap-1 px-4 py-1 text-text-secondary text-xs font-medium w-full hover:bg-bg-hover transition-colors"
        >
          {expanded.docs ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          <span>文档</span>
          <span className="ml-auto text-text-muted text-[10px]">{documents.length}</span>
        </button>
        {expanded.docs && documents.map((doc) => (
          <div
            key={doc.id}
            className={`flex items-center gap-1.5 w-full text-left px-4 py-1 text-xs transition-colors group ${
              currentDocId === doc.id
                ? "bg-bg-active text-text-primary"
                : "text-text-tertiary hover:bg-bg-hover hover:text-text-secondary"
            }`}
          >
            <button
              onClick={() => onDocClick(doc.id)}
              className="flex items-center gap-1.5 flex-1 min-w-0"
            >
              <FileText size={12} className="text-text-muted shrink-0" />
              <span className="truncate">{doc.title}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                trashDocument(doc.id);
              }}
              className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger transition-all shrink-0"
              title="删除"
            >
              <Trash size={10} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleStar(doc.id);
              }}
              className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-amber-400 transition-all shrink-0"
              title="收藏"
            >
              <Star size={10} className={doc.starred ? "text-amber-400 fill-amber-400" : ""} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-1">
        <button
          onClick={() => setExpanded((e) => ({ ...e, project: !e.project }))}
          className="flex items-center gap-1 px-4 py-1 text-text-secondary text-xs font-medium w-full hover:bg-bg-hover transition-colors"
        >
          {expanded.project ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          <span>项目文件</span>
        </button>
        {expanded.project && [
          ".gitignore",
          "软件设计说明书_SDD.md",
          "设计开发文档.md",
          "index.html",
          "package.json",
          "README.md",
          "tailwind.config.js",
          "tsconfig.json",
          "vite.config.ts",
        ].map((file) => (
          <button
            key={file}
            className="flex items-center gap-1.5 w-full text-left px-4 py-1 text-xs text-text-tertiary hover:bg-bg-hover hover:text-text-secondary transition-colors"
          >
            <FileText size={12} className="text-text-muted shrink-0" />
            <span className="truncate">{file}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Search Panel ─── */
function SearchPanel() {
  const { documents, setCurrentDocId, touchDocument } = useAppStore();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return documents
      .filter((d) => d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q))
      .map((d) => {
        const idx = d.content.toLowerCase().indexOf(q);
        const snippet = idx >= 0
          ? d.content.slice(Math.max(0, idx - 30), idx + query.length + 30)
          : d.content.slice(0, 80);
        return { ...d, snippet };
      });
  }, [query, documents]);

  return (
    <div className="p-2">
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索文档..."
          className="w-full pl-9 pr-3 py-2 bg-bg-input border border-border-input rounded-md text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {query && (
        <div className="text-[10px] text-text-muted mb-2 px-1">
          找到 {results.length} 个结果
        </div>
      )}

      <div className="space-y-1">
        {results.map((doc) => (
          <button
            key={doc.id}
            onClick={() => { touchDocument(doc.id); setCurrentDocId(doc.id); }}
            className="w-full text-left p-2 rounded-md hover:bg-bg-hover transition-colors group"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <FileText size={11} className="text-text-muted shrink-0" />
              <span className="text-xs text-text-primary font-medium truncate">{doc.title}</span>
            </div>
            <p className="text-[10px] text-text-muted truncate pl-4">
              {doc.snippet}
            </p>
          </button>
        ))}
        {query && results.length === 0 && (
          <div className="text-center py-8 text-text-muted text-xs">
            没有找到匹配的文档
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Tags Panel ─── */
function TagsPanel() {
  const { tags, documents, addTag, removeTag, renameTag, toggleTagOnDoc, setCurrentDocId, touchDocument } = useAppStore();
  const [newTagName, setNewTagName] = useState("");
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [expandedTag, setExpandedTag] = useState<string | null>(null);

  const tagColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

  function handleAddTag() {
    if (!newTagName.trim()) return;
    const color = tagColors[tags.length % tagColors.length];
    addTag(newTagName.trim(), color);
    setNewTagName("");
  }

  function handleRename(id: string) {
    if (editName.trim()) renameTag(id, editName.trim());
    setEditingTagId(null);
  }

  return (
    <div className="p-2">
      {/* Add Tag */}
      <div className="flex gap-1.5 mb-3">
        <input
          type="text"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
          placeholder="新建标签..."
          className="flex-1 px-2.5 py-1.5 bg-bg-input border border-border-input rounded-md text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
        />
        <button
          onClick={handleAddTag}
          className="px-2 py-1.5 bg-accent text-white rounded-md text-xs hover:bg-accent-hover transition-colors"
        >
          <Plus size={12} />
        </button>
      </div>

      {/* Tag List */}
      <div className="space-y-0.5">
        {tags.map((tag) => {
          const tagDocs = documents.filter((d) => tag.docIds.includes(d.id));
          const isExpanded = expandedTag === tag.id;

          return (
            <div key={tag.id}>
              <div className="flex items-center gap-1.5 px-1 py-1 rounded group hover:bg-bg-hover transition-colors">
                <button
                  onClick={() => setExpandedTag(isExpanded ? null : tag.id)}
                  className="shrink-0 text-text-muted"
                >
                  {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
                {editingTagId === tag.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => handleRename(tag.id)}
                    onKeyDown={(e) => e.key === "Enter" && handleRename(tag.id)}
                    className="flex-1 px-1 py-0.5 bg-bg-input border border-border-input rounded text-xs text-text-primary focus:outline-none focus:border-accent"
                    autoFocus
                  />
                ) : (
                  <span
                    className="flex-1 text-xs text-text-secondary truncate cursor-pointer"
                    onDoubleClick={() => { setEditingTagId(tag.id); setEditName(tag.name); }}
                  >
                    {tag.name}
                  </span>
                )}
                <span className="text-[10px] text-text-muted mr-1">{tagDocs.length}</span>
                <button
                  onClick={() => removeTag(tag.id)}
                  className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger transition-all"
                >
                  <X size={10} />
                </button>
              </div>

              {isExpanded && tagDocs.length > 0 && (
                <div className="ml-5 mt-0.5 space-y-0.5 border-l border-border-default pl-2">
                  {tagDocs.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => { touchDocument(doc.id); setCurrentDocId(doc.id); }}
                      className="flex items-center gap-1.5 w-full text-left px-1 py-1 rounded text-xs text-text-tertiary hover:bg-bg-hover hover:text-text-secondary transition-colors"
                    >
                      <FileText size={10} className="text-text-muted shrink-0" />
                      <span className="truncate">{doc.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {tags.length === 0 && (
        <div className="text-center py-8 text-text-muted text-xs">
          暂无标签，点击上方输入框创建
        </div>
      )}
    </div>
  );
}

/* ─── Graph Panel ─── */
function GraphPanel() {
  const { documents, tags, setCurrentDocId, touchDocument } = useAppStore();

  // Build graph: nodes = documents, edges = shared tags
  const nodes = documents.map((d) => ({ id: d.id, title: d.title }));
  const edges: { from: string; to: string; label: string }[] = [];

  tags.forEach((tag) => {
    for (let i = 0; i < tag.docIds.length; i++) {
      for (let j = i + 1; j < tag.docIds.length; j++) {
        const from = tag.docIds[i];
        const to = tag.docIds[j];
        if (!edges.find((e) => (e.from === from && e.to === to) || (e.from === to && e.to === from))) {
          edges.push({ from, to, label: tag.name });
        }
      }
    }
  });

  // Simple force-directed layout simulation
  const positions = useMemo(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    const w = 220, h = 300;
    nodes.forEach((n, i) => {
      const angle = (i / nodes.length) * Math.PI * 2;
      const r = Math.min(w, h) * 0.35;
      pos[n.id] = { x: w / 2 + Math.cos(angle) * r, y: h / 2 + Math.sin(angle) * r };
    });
    return pos;
  }, [nodes]);

  return (
    <div className="p-2">
      <div className="relative w-full bg-bg-card rounded-lg border border-border-card overflow-hidden" style={{ height: 300 }}>
        <svg width="100%" height="100%" viewBox="0 0 220 300">
          {/* Edges */}
          {edges.map((edge, i) => {
            const from = positions[edge.from];
            const to = positions[edge.to];
            if (!from || !to) return null;
            return (
              <g key={`edge-${i}`}>
                <line
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke="#d5cdc4" strokeWidth="1" strokeDasharray="3,3"
                />
                <text
                  x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 4}
                  fill="#b0a89e" fontSize="6" textAnchor="middle"
                >
                  {edge.label}
                </text>
              </g>
            );
          })}
          {/* Nodes */}
          {nodes.map((node) => {
            const pos = positions[node.id];
            if (!pos) return null;
            return (
              <g
                key={node.id}
                className="cursor-pointer"
                onClick={() => { touchDocument(node.id); setCurrentDocId(node.id); }}
              >
                <circle cx={pos.x} cy={pos.y} r="14" fill="#faf7f4" stroke="#b8860b" strokeWidth="1.5" />
                <text x={pos.x} y={pos.y + 1} fill="#2c2825" fontSize="7" textAnchor="middle" dominantBaseline="middle">
                  {node.title.slice(0, 2)}
                </text>
                <text x={pos.x} y={pos.y + 22} fill="#8a8279" fontSize="6" textAnchor="middle">
                  {node.title.length > 6 ? node.title.slice(0, 6) + "…" : node.title}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 px-1">
        <div className="text-[10px] text-text-muted mb-1.5">节点关系</div>
        {edges.length === 0 ? (
          <div className="text-[10px] text-text-muted text-center py-4">
            给文档添加相同标签后，节点之间会建立关联
          </div>
        ) : (
          <div className="space-y-1">
            {edges.map((edge, i) => {
              const fromDoc = documents.find((d) => d.id === edge.from);
              const toDoc = documents.find((d) => d.id === edge.to);
              return (
                <div key={i} className="flex items-center gap-1 text-[10px] text-text-tertiary">
                  <span className="truncate">{fromDoc?.title}</span>
                  <span className="text-accent shrink-0">—{edge.label}—</span>
                  <span className="truncate">{toDoc?.title}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Starred Panel ─── */
function StarredPanel() {
  const { documents, setCurrentDocId, touchDocument, toggleStar } = useAppStore();
  const starredDocs = documents.filter((d) => d.starred);

  return (
    <div className="p-2">
      {starredDocs.length === 0 ? (
        <div className="text-center py-12">
          <Star size={24} className="mx-auto text-text-muted opacity-30 mb-2" />
          <div className="text-xs text-text-muted">暂无收藏文档</div>
          <div className="text-[10px] text-text-muted mt-1">点击文档标题旁的星标收藏</div>
        </div>
      ) : (
        <div className="space-y-0.5">
          {starredDocs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded group hover:bg-bg-hover transition-colors"
            >
              <button
                onClick={() => { touchDocument(doc.id); setCurrentDocId(doc.id); }}
                className="flex items-center gap-1.5 flex-1 min-w-0"
              >
                <Star size={11} className="text-amber-400 fill-amber-400 shrink-0" />
                <span className="text-xs text-text-secondary truncate">{doc.title}</span>
              </button>
              <button
                onClick={() => toggleStar(doc.id)}
                className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger transition-all shrink-0"
                title="取消收藏"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Trash Panel ─── */
function TrashPanel() {
  const { trashedDocs, restoreDocument, permanentlyDelete, clearTrash } = useAppStore();

  return (
    <div className="p-2">
      {trashedDocs.length > 0 && (
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[10px] text-text-muted">{trashedDocs.length} 个文档</span>
          <button
            onClick={clearTrash}
            className="text-[10px] text-danger hover:text-red-400 transition-colors flex items-center gap-1"
          >
            <Trash size={10} />
            清空
          </button>
        </div>
      )}

      {trashedDocs.length === 0 ? (
        <div className="text-center py-12">
          <Trash2 size={24} className="mx-auto text-text-muted opacity-30 mb-2" />
          <div className="text-xs text-text-muted">回收站是空的</div>
        </div>
      ) : (
        <div className="space-y-0.5">
          {trashedDocs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded group hover:bg-bg-hover transition-colors"
            >
              <FileText size={11} className="text-text-muted shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-text-secondary truncate">{doc.title}</div>
                <div className="text-[10px] text-text-muted">
                  删除于 {new Date(doc.deleted_at).toLocaleDateString("zh-CN")}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => restoreDocument(doc.id)}
                  className="p-1 text-text-muted hover:text-green-400 transition-colors"
                  title="恢复"
                >
                  <RotateCcw size={11} />
                </button>
                <button
                  onClick={() => permanentlyDelete(doc.id)}
                  className="p-1 text-text-muted hover:text-danger transition-colors"
                  title="永久删除"
                >
                  <Trash size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
