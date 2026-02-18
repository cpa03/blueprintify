import { useState, useEffect } from "react";

interface LazyCodeMirrorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function LazyCodeMirror({
  value,
  onChange,
  className,
}: LazyCodeMirrorProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [CodeMirrorComponent, setCodeMirrorComponent] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [extensions, setExtensions] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [theme, setTheme] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    const loadCodeMirror = async () => {
      try {
        const [{ default: CodeMirror }, { markdown }, { oneDark }] =
          await Promise.all([
            import(
              /* webpackChunkName: "codemirror-main" */ "@uiw/react-codemirror"
            ),
            import(
              /* webpackChunkName: "codemirror-markdown" */ "@codemirror/lang-markdown"
            ),
            import(
              /* webpackChunkName: "codemirror-theme" */ "@codemirror/theme-one-dark"
            ),
          ]);

        if (isMounted) {
          setCodeMirrorComponent(() => CodeMirror);
          setExtensions([markdown()]);
          setTheme(oneDark);
        }
      } catch (error) {
        console.error("Failed to load CodeMirror:", error);
      }
    };

    loadCodeMirror();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!CodeMirrorComponent) {
    return (
      <div className={`flex items-center justify-center ${className || ""}`}>
        <div className="flex flex-col items-center gap-2 text-dark-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <span className="text-sm">Loading editor...</span>
        </div>
      </div>
    );
  }

  return (
    <CodeMirrorComponent
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
