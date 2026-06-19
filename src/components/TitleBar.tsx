import { Clock, Copy, Star, MoreHorizontal, User } from "lucide-react";
import { useAppStore } from "@/stores/appStore";

export default function TitleBar() {
  const { userInfo } = useAppStore();

  return (
    <header className="h-10 flex items-center justify-between px-4 bg-bg-sidebar border-b border-border-default shrink-0">
      {/* macOS-style traffic light dots */}
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <div className="w-3 h-3 rounded-full bg-[#28c840]" />
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
          <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center shrink-0" style={{ background: userInfo.avatar.startsWith("data:") ? "none" : "linear-gradient(to-br, #0ea5e9, #06b6d4)" }}>
            {userInfo.avatar.startsWith("data:") ? (
              <img src={userInfo.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm">{userInfo.avatar || "👤"}</span>
            )}
          </div>
          <span className="text-xs text-text-secondary truncate max-w-[100px]">{userInfo.username || "用户"}</span>
          <button className="p-1 text-text-muted hover:text-text-secondary transition-colors rounded hover:bg-bg-hover">
            <User size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
