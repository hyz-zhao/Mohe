import { ChevronLeft, ChevronRight, Clock, Copy, Star, MoreHorizontal, User } from "lucide-react";
import { useAppStore } from "@/stores/appStore";

export default function TitleBar() {
  const { userInfo } = useAppStore();

  return (
    <header className="h-10 flex items-center justify-between px-4 bg-bg-sidebar border-b border-border-default shrink-0">
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
        <div className="ml-2 pl-2 border-l border-border-default flex items-center gap-2">
          <span className="text-xs text-text-secondary flex items-center gap-1.5">
            <span className="inline-block w-5 h-5 rounded-full bg-bg-card border border-border-card flex items-center justify-center text-sm overflow-hidden">
              {userInfo.avatar.startsWith("data:") ? (
                <img src={userInfo.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                userInfo.avatar
              )}
            </span>
            {userInfo.username}
          </span>
          <button className="p-1 text-text-muted hover:text-text-secondary transition-colors rounded hover:bg-bg-hover">
            <User size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
