import React, {
  memo,
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
import ReactMarkdown, { Components } from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { ErrorBoundary } from "./ErrorBoundary";
import clsx from "clsx";

interface StreamingMarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
  className?: string;
  maxLines?: number;
  onRenderComplete?: () => void;
  onError?: (error: Error) => void;
}

const MemoizedReactMarkdown = memo(ReactMarkdown);

const MarkdownComponents: Components = {
  code: memo(({ className, children, inline, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || "");
    const isInline = inline || !match;

    if (isInline) {
      return (
        <code
          className="px-1.5 py-0.5 bg-dark-800 rounded text-sm font-mono text-indigo-400"
          {...props}
        >
          {children}
        </code>
      );
    }

    return (
      <div className="relative group">
        <pre
          className={clsx(
            "bg-dark-800 rounded-lg p-4 overflow-x-auto",
            "border border-dark-700",
            "font-mono text-sm text-gray-300",
          )}
        >
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-dark-500 bg-dark-900 px-2 py-1 rounded">
            {match?.[1]}
          </span>
        </div>
      </div>
    );
  }),

  pre: memo(({ children }) => {
    return <>{children}</>;
  }),

  blockquote: memo(({ children }) => (
    <blockquote className="border-l-4 border-indigo-500 pl-4 py-2 my-4 bg-indigo-500/5 rounded-r">
      {children}
    </blockquote>
  )),

  h1: memo(({ children }) => (
    <h1 className="text-3xl font-bold text-white mb-4 mt-6 first:mt-0">
      {children}
    </h1>
  )),

  h2: memo(({ children }) => (
    <h2 className="text-2xl font-bold text-white mb-3 mt-5 first:mt-0">
      {children}
    </h2>
  )),

  h3: memo(({ children }) => (
    <h3 className="text-xl font-semibold text-white mb-2 mt-4 first:mt-0">
      {children}
    </h3>
  )),

  p: memo(({ children }) => (
    <p className="text-gray-300 mb-4 leading-relaxed last:mb-0">{children}</p>
  )),

  ul: memo(({ children }) => (
    <ul className="list-disc list-inside mb-4 text-gray-300 space-y-1">
      {children}
    </ul>
  )),

  ol: memo(({ children }) => (
    <ol className="list-decimal list-inside mb-4 text-gray-300 space-y-1">
      {children}
    </ol>
  )),

  li: memo(({ children }) => <li className="leading-relaxed">{children}</li>),

  table: memo(({ children }) => (
    <div className="overflow-x-auto mb-4">
      <table className="min-w-full border border-dark-700 rounded-lg overflow-hidden">
        {children}
      </table>
    </div>
  )),

  thead: memo(({ children }) => (
    <thead className="bg-dark-800">{children}</thead>
  )),

  tbody: memo(({ children }) => (
    <tbody className="divide-y divide-dark-700">{children}</tbody>
  )),

  tr: memo(({ children }) => (
    <tr className="hover:bg-dark-800/50 transition-colors">{children}</tr>
  )),

  th: memo(({ children }) => (
    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">
      {children}
    </th>
  )),

  td: memo(({ children }) => (
    <td className="px-4 py-3 text-sm text-gray-400">{children}</td>
  )),

  a: memo(({ children, href }) => (
    <a
      href={href}
      className="text-indigo-400 hover:text-indigo-300 underline transition-colors"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  )),

  strong: memo(({ children }) => (
    <strong className="font-semibold text-white">{children}</strong>
  )),

  em: memo(({ children }) => (
    <em className="italic text-gray-300">{children}</em>
  )),

  hr: memo(() => <hr className="border-dark-700 my-6" />),
};

export const StreamingMarkdownRenderer: React.FC<
  StreamingMarkdownRendererProps
> = ({
  content,
  isStreaming = false,
  className,
  maxLines,
  onRenderComplete,
  onError,
}) => {
  const [renderError, setRenderError] = useState<Error | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const contentRef = useRef<string>("");
  const renderTimeoutRef = useRef<NodeJS.Timeout>();

  const handleError = useCallback(
    (error: Error) => {
      setRenderError(error);
      onError?.(error);
      console.error("Markdown rendering error:", error);
    },
    [onError],
  );

  const processedContent = useMemo(() => {
    if (!content) return "";

    let processed = content;

    // Truncate if maxLines is specified
    if (maxLines && maxLines > 0) {
      const lines = content.split("\n");
      if (lines.length > maxLines) {
        processed =
          lines.slice(0, maxLines).join("\n") + "\n\n... (content truncated)";
      }
    }

    // Handle incomplete markdown entities when streaming
    if (isStreaming) {
      processed = processed
        .replace(/```([a-zA-Z0-9]*)?$/, "```$1\n```") // Close incomplete code blocks
        .replace(/\*\*([^*]+)$/, "**$1**") // Close incomplete bold
        .replace(/\*([^*]+)$/, "*$1*") // Close incomplete italic
        .replace(/`([^`]+)$/, "`$1`") // Close incomplete inline code
        .replace(/\[([^\]]+)$/, "[$1]()"); // Close incomplete links
    }

    return processed;
  }, [content, maxLines, isStreaming]);

  // Performance optimization: debounce rendering when streaming
  useEffect(() => {
    if (isStreaming) {
      setIsRendering(true);

      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }

      renderTimeoutRef.current = setTimeout(() => {
        setIsRendering(false);
      }, 100);
    } else {
      setIsRendering(false);
    }

    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [processedContent, isStreaming]);

  // Notify when rendering is complete
  useEffect(() => {
    if (!isRendering && contentRef.current !== content) {
      contentRef.current = content;
      onRenderComplete?.();
    }
  }, [isRendering, content, onRenderComplete]);

  if (renderError) {
    return (
      <div className={clsx("p-4", className)}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-lg border border-red-500/20 bg-red-500/5"
        >
          <div className="flex items-center gap-3">
            <div className="text-2xl">⚠️</div>
            <div>
              <h3 className="text-red-400 font-semibold">Markdown Error</h3>
              <p className="text-sm text-red-300">
                Failed to render content: {renderError.message}
              </p>
              <button
                onClick={() => setRenderError(null)}
                className="mt-2 text-xs text-red-400 hover:text-red-300"
              >
                Try Again
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!processedContent) {
    return (
      <div className={clsx("p-6 text-center text-dark-500", className)}>
        <div className="text-4xl mb-2">📝</div>
        <p>No content to display</p>
      </div>
    );
  }

  return (
    <div className={clsx("relative", className)}>
      <ErrorBoundary
        fallback={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">⚠️</div>
              <div>
                <h3 className="text-yellow-400 font-semibold">
                  Render Fallback
                </h3>
                <p className="text-sm text-yellow-300">
                  Content cannot be displayed as markdown
                </p>
              </div>
            </div>
            <pre className="mt-3 p-3 bg-dark-800 rounded text-xs text-gray-400 overflow-auto">
              {processedContent.slice(0, 500)}
              {processedContent.length > 500 && "..."}
            </pre>
          </motion.div>
        }
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={processedContent.slice(0, 100)} // Re-animate on significant content changes
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="markdown-content prose prose-invert max-w-none"
          >
            <MemoizedReactMarkdown
              components={MarkdownComponents}
              remarkPlugins={[]}
              rehypePlugins={[]}
            >
              {processedContent}
            </MemoizedReactMarkdown>
          </motion.div>
        </AnimatePresence>

        {/* Streaming indicator */}
        <AnimatePresence>
          {isStreaming && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute bottom-2 right-2 text-xs text-dark-500 bg-dark-900 px-2 py-1 rounded"
            >
              <span className="inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                Streaming
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading overlay during heavy rendering */}
        <AnimatePresence>
          {isRendering && isStreaming && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-0 right-0 text-xs text-dark-500"
            >
              Processing...
            </motion.div>
          )}
        </AnimatePresence>
      </ErrorBoundary>
    </div>
  );
};
