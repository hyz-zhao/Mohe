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
            color: "#5a534d",
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          },
          ".cm-content": {
            caretColor: "#b8860b",
            padding: "0",
          },
          ".cm-cursor, .cm-dropCursor": {
            borderLeftColor: "#b8860b",
          },
          "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
            backgroundColor: "#e8e0d6",
          },
          ".cm-panels": {
            backgroundColor: "#faf7f4",
            color: "#5a534d",
          },
          ".cm-panels.cm-panels-top": {
            borderBottom: "1px solid #e8e2db",
          },
          ".cm-panels.cm-panels-bottom": {
            borderTop: "1px solid #e8e2db",
          },
          ".cm-searchMatch": {
            backgroundColor: "#e8e0d6",
            outline: "1px solid #b8860b",
          },
          ".cm-searchMatch.cm-searchMatch-selected": {
            backgroundColor: "#d4a017",
          },
          ".cm-activeLine": {
            backgroundColor: "#f0ebe5",
          },
          ".cm-selectionMatch": {
            backgroundColor: "#e8e0d6",
          },
          "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
            backgroundColor: "#e8e0d6",
            outline: "1px solid #b8860b",
          },
          ".cm-gutters": {
            backgroundColor: "#f5f0eb",
            color: "#b0a89e",
            border: "none",
          },
          ".cm-activeLineGutter": {
            backgroundColor: "#f0ebe5",
            color: "#8a8279",
          },
          ".cm-foldPlaceholder": {
            backgroundColor: "#f8f5f1",
            color: "#8a8279",
            border: "1px solid #d5cdc4",
            borderRadius: "4px",
          },
          ".cm-tooltip": {
            backgroundColor: "#faf7f4",
            border: "1px solid #e8e2db",
            borderRadius: "8px",
            color: "#5a534d",
          },
          ".cm-tooltip .cm-tooltip-arrow:before": {
            borderTopColor: "#e8e2db",
            borderBottomColor: "#e8e2db",
          },
          ".cm-tooltip .cm-tooltip-arrow:after": {
            borderTopColor: "#faf7f4",
            borderBottomColor: "#faf7f4",
          },
          ".cm-tooltip-autocomplete": {
            "& > ul > li[aria-selected]": {
              backgroundColor: "#e8e0d6",
              color: "#2c2825",
            },
          },
          ".cm-line": {
            padding: "0 0 0 8px",
          },
          ".cm-scroller": {
            overflow: "auto",
          },
          ".cm-placeholder": {
            color: "#b0a89e",
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
