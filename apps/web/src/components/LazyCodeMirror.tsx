import { useState, useEffect, memo, forwardRef } from "react";
import type { Extension } from "@codemirror/state";
import type { ReactCodeMirrorProps, ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { isDev } from "../config/env";
import { ACCESSIBILITY_LABELS } from "../config/constants/content";

interface LazyCodeMirrorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

type CodeMirrorComponent = React.ForwardRefExoticComponent<
  ReactCodeMirrorProps & React.RefAttributes<ReactCodeMirrorRef>
> | null;

const LINE_COUNT = 16;
const GUTTER_NUMBERS = Array.from({ length: LINE_COUNT }, (_, i) => i + 1);

const LINE_WIDTHS = [92, 78, 85, 60, 95, 72, 88, 55, 80, 70, 90, 65, 82, 75, 58, 87];
const LINE_INDENTS = [0, 0, 2, 0, 4, 0, 2, 0, 6, 0, 0, 3, 0, 2, 0, 4];

function EditorSkeleton(): JSX.Element {
  return (
    <div
      className="editor-skeleton"
      role="status"
      aria-live="polite"
      aria-label={ACCESSIBILITY_LABELS.LAZY_CODEMIRROR.LOADING}
    >
      <div className="editor-skeleton-gutter" aria-hidden="true">
        {GUTTER_NUMBERS.map((n) => (
          <div key={n} className="editor-skeleton-line-number">
            {n}
          </div>
        ))}
      </div>
      <div className="editor-skeleton-code" aria-hidden="true">
        {LINE_WIDTHS.map((widthPct, i) => (
          <div key={i} className="editor-skeleton-code-line">
            <div
              className="skeleton-block"
              style={{
                width: `${widthPct}%`,
                height: "14px",
                marginLeft: `${(LINE_INDENTS[i] ?? 0) * 12}px`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

const LazyCodeMirrorComponent = forwardRef<ReactCodeMirrorRef, LazyCodeMirrorProps>(
  function LazyCodeMirrorComponent({ value, onChange, className }, ref) {
    const [CodeMirrorComponent, setCodeMirrorComponent] = useState<CodeMirrorComponent>(null);
    const [extensions, setExtensions] = useState<Extension[]>([]);
    const [theme, setTheme] = useState<Extension | undefined>(undefined);

    useEffect(() => {
      let isMounted = true;

      const loadCodeMirror = async () => {
        try {
          const [{ default: CodeMirror }, { markdown }, { oneDark }] = await Promise.all([
            import("@uiw/react-codemirror"),
            import("@codemirror/lang-markdown"),
            import("@codemirror/theme-one-dark"),
          ]);

          if (isMounted) {
            setCodeMirrorComponent(CodeMirror as unknown as CodeMirrorComponent);
            setExtensions([markdown()]);
            setTheme(oneDark);
          }
        } catch (error) {
          if (isDev()) {
            console.error("Failed to load CodeMirror:", error);
          }
        }
      };

      loadCodeMirror();

      return () => {
        isMounted = false;
      };
    }, []);

    if (!CodeMirrorComponent) {
      return <EditorSkeleton />;
    }

    return (
      <CodeMirrorComponent
        ref={ref}
        value={value}
        onChange={onChange}
        extensions={extensions}
        theme={theme}
        className={className}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
        }}
      />
    );
  }
);

export const LazyCodeMirror = memo(LazyCodeMirrorComponent);
