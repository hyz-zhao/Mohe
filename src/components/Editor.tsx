import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/stores/appStore";
import { useEditorStore } from "@/stores/editorStore";
import { List, Edit3, Eye, MoreHorizontal, Tag, Plus } from "lucide-react";
import CodeMirrorEditor from "./CodeMirrorEditor";
import katex from "katex";
import mermaid from "mermaid";

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  securityLevel: "loose",
  themeVariables: {
    primaryColor: "#1a3a5c",
    primaryTextColor: "#f1f5f9",
    primaryBorderColor: "#3b82f6",
    lineColor: "#64748b",
    secondaryColor: "#1e293b",
    tertiaryColor: "#0f1520",
  },
});

export default function Editor() {
  const { documents, updateDocument } = useAppStore();
  const { currentDocId, viewMode, setViewMode } = useEditorStore();

  const doc = documents.find((d) => d.id === currentDocId);

  const [content, setContent] = useState(doc?.content ?? "");

  useEffect(() => {
    if (doc) {
      setContent(doc.content);
    }
  }, [currentDocId, doc?.id]);

  function handleContentChange(value: string) {
    setContent(value);
    if (currentDocId) {
      updateDocument(currentDocId, { content: value });
    }
  }

  if (!doc) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-main">
        <div className="text-center">
          <div className="text-4xl mb-3 opacity-20">📝</div>
          <p className="text-text-muted text-sm">选择一个文档开始编辑</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-bg-main min-w-0">
      {/* Editor Toolbar */}
      <div className="h-10 flex items-center justify-between px-4 border-b border-border-default shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("edit")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "edit"
                ? "bg-bg-active text-text-primary"
                : "text-text-muted hover:text-text-secondary hover:bg-bg-hover"
            }`}
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => setViewMode("split")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "split"
                ? "bg-bg-active text-text-primary"
                : "text-text-muted hover:text-text-secondary hover:bg-bg-hover"
            }`}
          >
            <List size={14} />
          </button>
          <button
            onClick={() => setViewMode("preview")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "preview"
                ? "bg-bg-active text-text-primary"
                : "text-text-muted hover:text-text-secondary hover:bg-bg-hover"
            }`}
          >
            <Eye size={14} />
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button className="btn-ghost flex items-center gap-1.5">
            <Tag size={12} />
            <span className="text-xs">设计原则</span>
          </button>
          <button className="btn-ghost flex items-center gap-1.5">
            <Tag size={12} />
            <span className="text-xs">方法论</span>
          </button>
          <button className="btn-ghost">
            <Plus size={12} />
          </button>
          <button className="btn-ghost">
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[720px] mx-auto px-12 py-8">
          {/* Title */}
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            {doc.title}
          </h1>

          {/* Tags */}
          <div className="flex items-center gap-2 mb-6">
            <span className="px-2 py-0.5 bg-bg-card border border-border-card rounded text-xs text-text-tertiary">
              # 设计原则
            </span>
            <span className="px-2 py-0.5 bg-bg-card border border-border-card rounded text-xs text-text-tertiary">
              # 方法论
            </span>
            <button className="text-xs text-text-muted hover:text-text-link transition-colors">
              + 添加标签
            </button>
          </div>

          <div className="h-px bg-border-default mb-6" />

          {/* CodeMirror Editor */}
          {viewMode === "edit" || viewMode === "split" ? (
            <div className="min-h-[500px]">
              <CodeMirrorEditor
                content={content}
                onChange={handleContentChange}
              />
            </div>
          ) : null}

          {/* Markdown Preview */}
          {viewMode === "preview" || viewMode === "split" ? (
            <div className="prose prose-invert max-w-none">
              <MarkdownPreview content={content} />
            </div>
          ) : null}
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-7 flex items-center justify-between px-4 border-t border-border-default text-xs text-text-muted shrink-0 bg-bg-sidebar">
        <div className="flex items-center gap-4">
          <span>字数: {content.replace(/\s/g, "").length.toLocaleString()}</span>
          <span>链接: 12</span>
          <span>引用: 4</span>
          <span>图片: 2</span>
        </div>
        <div className="flex items-center gap-3">
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}

function MarkdownPreview({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inBlockquote = false;
  let blockquoteLines: string[] = [];
  let inCodeBlock = false;
  let codeBlockLang = "";
  let codeBlockLines: string[] = [];
  let codeBlockStart = 0;

  function flushBlockquote() {
    if (blockquoteLines.length > 0) {
      elements.push(
        <blockquote
          key={`bq-${elements.length}`}
          className="border-l-[3px] border-accent bg-bg-card rounded-lg px-4 py-3 my-4 text-text-secondary italic"
        >
          {blockquoteLines.map((line, i) => (
            <p key={i} className="mb-1 last:mb-0">
              {line.replace(/^>\s?/, "")}
            </p>
          ))}
        </blockquote>
      );
      blockquoteLines = [];
    }
  }

  function flushCodeBlock() {
    if (codeBlockLines.length > 0) {
      const code = codeBlockLines.join("\n");
      if (codeBlockLang === "mermaid") {
        elements.push(
          <MermaidBlock key={`mermaid-${codeBlockStart}`} code={code} />
        );
      } else if (codeBlockLang === "math" || codeBlockLang === "latex") {
        elements.push(
          <KatexBlock key={`katex-${codeBlockStart}`} code={code} displayMode />
        );
      } else {
        elements.push(
          <pre
            key={`code-${codeBlockStart}`}
            className="bg-[#0d1117] rounded-lg p-4 my-4 overflow-x-auto text-sm text-text-secondary font-mono"
          >
            <code>{code}</code>
          </pre>
        );
      }
      codeBlockLines = [];
      codeBlockLang = "";
    }
  }

  lines.forEach((line, i) => {
    // Code block toggle
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        inCodeBlock = false;
        flushCodeBlock();
      } else {
        flushBlockquote();
        inCodeBlock = true;
        codeBlockLang = line.slice(3).trim().toLowerCase();
        codeBlockStart = i;
        codeBlockLines = [];
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      return;
    }

    // Inline math: $...$
    let processedLine = line;

    if (line.startsWith("# ")) {
      flushBlockquote();
      elements.push(
        <h1 key={i} className="text-2xl font-bold text-text-primary mt-8 mb-4">
          <InlineMath text={line.replace("# ", "")} />
        </h1>
      );
    } else if (line.startsWith("## ")) {
      flushBlockquote();
      elements.push(
        <h2 key={i} className="text-xl font-bold text-text-primary mt-6 mb-3">
          <InlineMath text={line.replace("## ", "")} />
        </h2>
      );
    } else if (line.startsWith("### ")) {
      flushBlockquote();
      elements.push(
        <h3 key={i} className="text-lg font-semibold text-text-primary mt-5 mb-2">
          <InlineMath text={line.replace("### ", "")} />
        </h3>
      );
    } else if (line.startsWith("> ")) {
      inBlockquote = true;
      blockquoteLines.push(line);
    } else {
      if (inBlockquote) {
        inBlockquote = false;
        flushBlockquote();
      }
      if (line.trim() === "") {
        elements.push(<div key={i} className="h-4" />);
      } else {
        elements.push(
          <p key={i} className="text-base text-text-secondary leading-[1.7] mb-3">
            <InlineMath text={processedLine} />
          </p>
        );
      }
    }
  });

  if (inCodeBlock) flushCodeBlock();
  flushBlockquote();

  return <div>{elements}</div>;
}

/**
 * 行内 KaTeX 公式渲染
 * 支持 $...$ 语法
 */
function InlineMath({ text }: { text: string }) {
  const parts = text.split(/(\$[^$]+\$)/g);

  if (!parts.some((p) => p.startsWith("$") && p.endsWith("$") && p.length > 2)) {
    return <>{text}</>;
  }

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
          const formula = part.slice(1, -1);
          try {
            const html = katex.renderToString(formula, {
              throwOnError: false,
              displayMode: false,
            });
            return (
              <span
                key={i}
                className="inline-block mx-0.5 text-text-primary"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return <span key={i} className="text-danger">{part}</span>;
          }
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

/**
 * 块级 KaTeX 公式渲染
 */
function KatexBlock({ code, displayMode = true }: { code: string; displayMode?: boolean }) {
  try {
    const html = katex.renderToString(code, {
      throwOnError: false,
      displayMode,
    });
    return (
      <div
        className="my-4 p-4 bg-bg-card rounded-lg text-center overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch {
    return <div className="my-4 p-4 bg-bg-card rounded-lg text-danger">公式渲染失败: {code}</div>;
  }
}

/**
 * Mermaid 图表渲染
 */
function MermaidBlock({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    mermaid
      .render(id, code)
      .then(({ svg }) => {
        if (!cancelled) setSvg(svg);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "渲染失败");
      });

    return () => {
      cancelled = true;
    };
  }, [code]);

  if (error) {
    return (
      <div className="my-4 p-4 bg-bg-card rounded-lg border border-border-card">
        <div className="text-xs text-danger mb-2">Mermaid 渲染失败</div>
        <pre className="text-xs text-text-muted font-mono whitespace-pre-wrap">{code}</pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-4 p-4 bg-bg-card rounded-lg border border-border-card flex items-center justify-center overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
