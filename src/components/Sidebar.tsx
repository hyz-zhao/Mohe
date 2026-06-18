import {
  Home,
  Library,
  Tag,
  Network,
  Star,
  Trash2,
  FolderOpen,
  Plus,
  ChevronDown,
  Settings,
} from "lucide-react";
import { useEditorStore } from "@/stores/editorStore";
import { useState } from "react";
import SettingsPage from "./SettingsPage";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const navItems: NavItem[] = [
  { icon: <Home size={18} />, label: "首页" },
  { icon: <Library size={18} />, label: "知识库", active: true },
  { icon: <Tag size={18} />, label: "标签" },
  { icon: <Network size={18} />, label: "图谱" },
  { icon: <Star size={18} />, label: "收藏" },
  { icon: <Trash2 size={18} />, label: "回收站" },
];

const knowledgeBases = [
  { icon: <FolderOpen size={16} />, label: "产品设计体系" },
  { icon: <FolderOpen size={16} />, label: "技术文档库" },
  { icon: <FolderOpen size={16} />, label: "商业洞察" },
  { icon: <FolderOpen size={16} />, label: "个人成长" },
  { icon: <FolderOpen size={16} />, label: "读书笔记" },
];

export default function Sidebar() {
  const { sidebarCollapsed } = useEditorStore();
  const [showSettings, setShowSettings] = useState(false);

  if (sidebarCollapsed) {
    return (
      <>
        <aside className="w-12 bg-bg-sidebar border-r border-border-default flex flex-col items-center py-3 gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm mb-2">
            M
          </div>
          <button className="w-8 h-8 rounded-md flex items-center justify-center text-text-tertiary hover:bg-bg-hover hover:text-text-secondary transition-colors">
            <Plus size={16} />
          </button>
          <button className="w-8 h-8 rounded-md flex items-center justify-center text-text-tertiary hover:bg-bg-hover hover:text-text-secondary transition-colors">
            <Home size={16} />
          </button>
          <button className="w-8 h-8 rounded-md flex items-center justify-center text-accent bg-bg-active">
            <Library size={16} />
          </button>
        </aside>
        {showSettings && <SettingsPage onClose={() => setShowSettings(false)} />}
      </>
    );
  }

  return (
    <aside className="w-60 bg-bg-sidebar border-r border-border-default flex flex-col shrink-0 select-none">
      {/* Logo */}
      <div className="h-12 flex items-center gap-2.5 px-4">
        <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm">
          M
        </div>
        <span className="text-text-primary font-semibold text-base">
          墨核
        </span>
      </div>

      {/* New Document Button */}
      <div className="px-3 mb-2">
        <button className="w-full flex items-center justify-between px-3 py-2 bg-bg-card border border-border-card rounded-md text-text-secondary text-sm hover:bg-bg-hover transition-colors">
          <span className="flex items-center gap-2">
            <Plus size={14} />
            新建文档
          </span>
          <ChevronDown size={14} className="text-text-muted" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-2 flex-1 overflow-y-auto">
        {navItems.map((item) => (
          <div
            key={item.label}
            className={`sidebar-item ${item.active ? "active" : ""}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}

        {/* Divider */}
        <div className="h-px bg-border-default my-3 mx-2" />

        {/* Knowledge Bases */}
        <div className="px-3 py-1 text-xs text-text-muted font-medium uppercase tracking-wider">
          知识库
        </div>
        {knowledgeBases.map((kb) => (
          <div key={kb.label} className="sidebar-item">
            <span className="text-text-tertiary">{kb.icon}</span>
            <span>{kb.label}</span>
          </div>
        ))}
        <div className="sidebar-item">
          <Plus size={16} />
          <span>更多知识库</span>
        </div>
      </nav>

      {/* User Info */}
      <div className="p-3 border-t border-border-default">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-cyan flex items-center justify-center text-white text-xs font-medium">
            王
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-text-primary truncate">王不留行</div>
            <div className="text-xs text-text-muted">PRO</div>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="text-text-muted hover:text-text-secondary transition-colors"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>
      {showSettings && <SettingsPage onClose={() => setShowSettings(false)} />}
    </aside>
  );
}
