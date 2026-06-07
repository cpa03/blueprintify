/**
 * Lazy CodeMirror Component
 *
 * Lazy-loads the CodeMirror editor for better initial page load performance.
 * Provides syntax-highlighted markdown editing with real-time content updates.
 *
 * @module components/LazyCodeMirror
 * @see {@link ReactCodeMirrorProps} - CodeMirror props interface
 *
 * @param {LazyCodeMirrorProps} props - Component props
 * @param {string} props.value - Editor content
 * @param {(value: string) => void} props.onChange - Content change callback
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Lazy-loaded CodeMirror editor
 *
 * @example
 * ```tsx
 * <LazyCodeMirror
 *   value="# My Blueprint\n\n## Tasks"
 *   onChange={(content) => console.log(content)}
 *   className="h-96"
 * />
 * ```
 */

import { useState, useEffect, memo, forwardRef } from "react";
import type { Extension } from "@codemirror/state";
import type { ReactCodeMirrorProps, ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { isDev } from "../config/env";
import { LOADING_MESSAGES } from "../config/constants";

interface LazyCodeMirrorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

type CodeMirrorComponent = React.ForwardRefExoticComponent<
  ReactCodeMirrorProps & React.RefAttributes<ReactCodeMirrorRef>
> | null;

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
      return (
        <div
          role="status"
          aria-live="polite"
          aria-label="Loading code editor"
          className={`flex items-center justify-center ${className || ""}`}
        >
          <div className="flex flex-col items-center gap-2 text-dark-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <span className="text-sm">{LOADING_MESSAGES.EDITOR}</span>
          </div>
        </div>
      );
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
