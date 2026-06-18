import { ChevronLeft, ChevronRight, Clock, Copy, Star, MoreHorizontal } from "lucide-react";

export default function TitleBar() {
  return (
    <header className="h-10 flex items-center justify-between px-4 bg-bg-sidebar border-b border-border-default shrink-0 select-none">
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-2">
        <button className="p-1 text-text-muted hover:text-text-secondary transition-colors">
          <ChevronLeft size={14} />
        </button>
        <nav className="flex items-center gap-1.5 text-xs text-text-tertiary">
          <span className="hover:text-text-secondary cursor-pointer transition-colors">知识库</span>
          <span className="text-text-muted">/</span>
          <span className="hover:text-text-secondary cursor-pointer transition-colors">产品设计体系</span>
          <span className="text-text-muted">/</span>
          <span className="text-text-primary">设计原则</span>
        </nav>
        <button className="p-1 text-text-muted hover:text-text-secondary transition-colors">
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-text-muted mr-2">已保存</span>
        <button className="p-1.5 text-text-muted hover:text-text-secondary transition-colors rounded hover:bg-bg-hover">
          <Clock size={14} />
        </button>
        <button className="p-1.5 text-text-muted hover:text-text-secondary transition-colors rounded hover:bg-bg-hover">
          <Copy size={14} />
        </button>
        <button className="p-1.5 text-text-muted hover:text-text-secondary transition-colors rounded hover:bg-bg-hover">
          <Star size={14} />
        </button>
        <button className="p-1.5 text-text-muted hover:text-text-secondary transition-colors rounded hover:bg-bg-hover">
          <MoreHorizontal size={14} />
        </button>
      </div>
    </header>
  );
}
