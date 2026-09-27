import { useState, useEffect, memo, forwardRef } from "react";
import type { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import type { ReactCodeMirrorProps, ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { isDev } from "../config/env";
import { ACCESSIBILITY_LABELS, DEBUG_MESSAGES, SKELETON_LAYOUT } from "../config/constants/content";
import { FOCUS_ANNOUNCER } from "../config/constants/accessibility";

interface LazyCodeMirrorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  /** Accessible name for the editor's contenteditable region (WCAG 4.1.2).
   *  Without it, screen readers announce an unlabeled text editor. */
  ariaLabel?: string;
}

type CodeMirrorComponent = React.ForwardRefExoticComponent<
  ReactCodeMirrorProps & React.RefAttributes<ReactCodeMirrorRef>
> | null;

const GUTTER_NUMBERS = Array.from({ length: SKELETON_LAYOUT.EDITOR_LINE_COUNT }, (_, i) => i + 1);

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
        {SKELETON_LAYOUT.EDITOR_LINE_WIDTHS.map((widthPct, i) => (
          <div key={i} className="editor-skeleton-code-line">
            <div
              className="skeleton-block"
              style={{
                width: `${widthPct}%`,
                height: `${SKELETON_LAYOUT.EDITOR_LINE_HEIGHT_PX}px`,
                marginLeft: `${(SKELETON_LAYOUT.EDITOR_LINE_INDENTS[i] ?? 0) * SKELETON_LAYOUT.EDITOR_INDENT_MULTIPLIER_PX}px`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

const LazyCodeMirrorComponent = forwardRef<ReactCodeMirrorRef, LazyCodeMirrorProps>(
  function LazyCodeMirrorComponent({ value, onChange, className, ariaLabel }, ref) {
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
            setExtensions([
              markdown(),
              // Name the editor's contenteditable for screen readers; without
              // this CodeMirror announces an unlabeled text editor.
              ...(ariaLabel ? [EditorView.contentAttributes.of({ "aria-label": ariaLabel })] : []),
            ]);
            setTheme(oneDark);
          }
        } catch (error) {
          if (isDev()) {
            console.error(DEBUG_MESSAGES.LOAD_FAILED("CodeMirror"), error);
          }
        }
      };

      loadCodeMirror();

      return () => {
        isMounted = false;
      };
    }, [ariaLabel]);

    if (!CodeMirrorComponent) {
      return <EditorSkeleton />;
    }

    return (
      <>
        <div role="status" aria-live="polite" className={FOCUS_ANNOUNCER.LIVE_REGION_CLASS}>
          {ACCESSIBILITY_LABELS.LAZY_CODEMIRROR.READY}
        </div>
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
      </>
    );
  }
);

export const LazyCodeMirror = memo(LazyCodeMirrorComponent);
