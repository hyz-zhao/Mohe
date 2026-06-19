import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Editor from "@/components/Editor";
import RightPanel from "@/components/RightPanel";
import TitleBar from "@/components/TitleBar";
import { useEditorStore } from "@/stores/editorStore";
import { initTools } from "@/services/initTools";

export default function App() {
  const { rightPanelCollapsed } = useEditorStore();

  useEffect(() => {
    initTools();
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-bg-deepest overflow-hidden">
      {/* Title Bar */}
      <TitleBar />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Center Area */}
        <div className="flex flex-1 min-w-0 overflow-hidden">
          {/* Editor */}
          <Editor />
        </div>

        {/* Right Panel */}
        {!rightPanelCollapsed && <RightPanel />}
      </div>
    </div>
  );
}
