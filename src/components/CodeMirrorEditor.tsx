import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightActiveLine, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightSpecialChars } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldGutter, foldKeymap, indentOnInput } from "@codemirror/language";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { lintKeymap } from "@codemirror/lint";

interface CodeMirrorEditorProps {
  content: string;
  onChange: (value: string) => void;
  editable?: boolean;
}

export default function CodeMirrorEditor({ content, onChange, editable = true }: CodeMirrorEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChange(update.state.doc.toString());
      }
    });

    const state = EditorState.create({
      doc: content,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        foldGutter(),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        rectangularSelection(),
        crosshairCursor(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...foldKeymap,
          ...completionKeymap,
          ...lintKeymap,
          indentWithTab,
        ]),
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        updateListener,
        EditorView.theme({
          "&": {
            height: "100%",
            fontSize: "15px",
            lineHeight: "1.7",
            backgroundColor: "transparent",
            color: "#cbd5e1",
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          },
          ".cm-content": {
            caretColor: "#3b82f6",
            padding: "0",
          },
          ".cm-cursor, .cm-dropCursor": {
            borderLeftColor: "#3b82f6",
          },
          "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
            backgroundColor: "#1a3a5c",
          },
          ".cm-panels": {
            backgroundColor: "#1a2332",
            color: "#cbd5e1",
          },
          ".cm-panels.cm-panels-top": {
            borderBottom: "1px solid #253347",
          },
          ".cm-panels.cm-panels-bottom": {
            borderTop: "1px solid #253347",
          },
          ".cm-searchMatch": {
            backgroundColor: "#1a3a5c",
            outline: "1px solid #3b82f6",
          },
          ".cm-searchMatch.cm-searchMatch-selected": {
            backgroundColor: "#2563eb",
          },
          ".cm-activeLine": {
            backgroundColor: "#1e2d42",
          },
          ".cm-selectionMatch": {
            backgroundColor: "#1a3a5c",
          },
          "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
            backgroundColor: "#1a3a5c",
            outline: "1px solid #3b82f6",
          },
          ".cm-gutters": {
            backgroundColor: "#0f1520",
            color: "#64748b",
            border: "none",
          },
          ".cm-activeLineGutter": {
            backgroundColor: "#1e2d42",
            color: "#94a3b8",
          },
          ".cm-foldPlaceholder": {
            backgroundColor: "#1e293b",
            color: "#94a3b8",
            border: "1px solid #334155",
            borderRadius: "4px",
          },
          ".cm-tooltip": {
            backgroundColor: "#1a2332",
            border: "1px solid #253347",
            borderRadius: "8px",
            color: "#cbd5e1",
          },
          ".cm-tooltip .cm-tooltip-arrow:before": {
            borderTopColor: "#253347",
            borderBottomColor: "#253347",
          },
          ".cm-tooltip .cm-tooltip-arrow:after": {
            borderTopColor: "#1a2332",
            borderBottomColor: "#1a2332",
          },
          ".cm-tooltip-autocomplete": {
            "& > ul > li[aria-selected]": {
              backgroundColor: "#1a3a5c",
              color: "#f1f5f9",
            },
          },
          ".cm-line": {
            padding: "0 0 0 8px",
          },
          ".cm-scroller": {
            overflow: "auto",
          },
          ".cm-placeholder": {
            color: "#64748b",
          },
        }),
        EditorState.readOnly.of(!editable),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

  // Sync external content changes (when switching documents)
  useEffect(() => {
    if (viewRef.current) {
      const view = viewRef.current;
      const currentContent = view.state.doc.toString();
      if (currentContent !== content) {
        view.dispatch({
          changes: {
            from: 0,
            to: currentContent.length,
            insert: content,
          },
        });
      }
    }
  }, [content]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-auto"
      style={{ minHeight: "500px" }}
    />
  );
}
