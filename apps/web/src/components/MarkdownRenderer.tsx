import { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import remarkGfm from "remark-gfm";
import clsx from "clsx";
import type { Components } from "react-markdown";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  isStreaming?: boolean;
  streamingCursor?: boolean;
}

export const MarkdownRenderer = memo<MarkdownRendererProps>(
  ({ content, className, isStreaming = false, streamingCursor = true }) => {
    const processedContent = useMemo(() => {
      if (!isStreaming) return content;

      // Add streaming cursor to the last line if actively streaming
      if (streamingCursor && content.length > 0) {
        const lines = content.split("\n");
        const lastLine = lines[lines.length - 1];
        if (lastLine && !lastLine.endsWith("```")) {
          lines[lines.length - 1] = lastLine + " ▊";
          return lines.join("\n");
        }
      }
      return content;
    }, [content, isStreaming, streamingCursor]);

    const components = useMemo(
      (): Components => ({
        code: ({ className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || "");
          const language = match ? match[1] : "";
          const isInline = !className;

          return !isInline && language ? (
            <div className="relative group">
              <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="text-xs bg-dark-700 text-dark-300 px-2 py-1 rounded hover:bg-dark-600 transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      String(children).replace(/\n$/, ""),
                    );
                  }}
                >
                  Copy
                </button>
              </div>
              <SyntaxHighlighter
                style={oneDark as any}
                language={language}
                PreTag="div"
                className="!mt-0 !rounded-lg !bg-dark-900"
                customStyle={
                  {
                    margin: 0,
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    lineHeight: "1.5",
                  } as any
                }
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code
              className={clsx(
                "px-1.5 py-0.5 rounded text-sm font-mono bg-dark-800 text-dark-200",
                className,
              )}
              {...props}
            >
              {children}
            </code>
          );
        },

        h1: ({ children, ...props }) => (
          <h1
            className="text-3xl font-bold text-white mb-4 mt-6 first:mt-0 border-b border-dark-700 pb-2"
            {...props}
          >
            {children}
          </h1>
        ),

        h2: ({ children, ...props }) => (
          <h2
            className="text-2xl font-semibold text-white mb-3 mt-5 first:mt-0"
            {...props}
          >
            {children}
          </h2>
        ),

        h3: ({ children, ...props }) => (
          <h3
            className="text-xl font-semibold text-white mb-2 mt-4 first:mt-0"
            {...props}
          >
            {children}
          </h3>
        ),

        h4: ({ children, ...props }) => (
          <h4
            className="text-lg font-semibold text-white mb-2 mt-3 first:mt-0"
            {...props}
          >
            {children}
          </h4>
        ),

        p: ({ children, ...props }) => (
          <p
            className="text-dark-200 leading-relaxed mb-4 last:mb-0"
            {...props}
          >
            {children}
          </p>
        ),

        ul: ({ children, ...props }) => (
          <ul
            className="list-disc list-inside text-dark-200 mb-4 space-y-1"
            {...props}
          >
            {children}
          </ul>
        ),

        ol: ({ children, ...props }) => (
          <ol
            className="list-decimal list-inside text-dark-200 mb-4 space-y-1"
            {...props}
          >
            {children}
          </ol>
        ),

        li: ({ children, ...props }) => (
          <li className="leading-relaxed" {...props}>
            {children}
          </li>
        ),

        blockquote: ({ children, ...props }) => (
          <blockquote
            className="border-l-4 border-primary-500 pl-4 py-2 my-4 bg-dark-800/50 rounded-r-lg text-dark-300 italic"
            {...props}
          >
            {children}
          </blockquote>
        ),

        table: ({ children, ...props }) => (
          <div className="overflow-x-auto my-4">
            <table
              className="min-w-full border-collapse border border-dark-700 rounded-lg overflow-hidden"
              {...props}
            >
              {children}
            </table>
          </div>
        ),

        thead: ({ children, ...props }) => (
          <thead className="bg-dark-800" {...props}>
            {children}
          </thead>
        ),

        th: ({ children, ...props }) => (
          <th
            className="border border-dark-700 px-4 py-2 text-left font-semibold text-white"
            {...props}
          >
            {children}
          </th>
        ),

        td: ({ children, ...props }) => (
          <td
            className="border border-dark-700 px-4 py-2 text-dark-200"
            {...props}
          >
            {children}
          </td>
        ),

        tbody: ({ children, ...props }) => (
          <tbody className="bg-dark-900/50" {...props}>
            {children}
          </tbody>
        ),

        a: ({ children, href, ...props }) => (
          <a
            href={href}
            className="text-primary-400 hover:text-primary-300 underline transition-colors"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          >
            {children}
          </a>
        ),

        hr: ({ ...props }) => (
          <hr className="border-dark-700 my-6" {...props} />
        ),

        strong: ({ children, ...props }) => (
          <strong className="text-white font-semibold" {...props}>
            {children}
          </strong>
        ),

        em: ({ children, ...props }) => (
          <em className="text-dark-100 italic" {...props}>
            {children}
          </em>
        ),
      }),
      [],
    );

    return (
      <div className={clsx("prose prose-invert max-w-none", className)}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={components}
          className="markdown-content"
        >
          {processedContent || "*No content yet...*"}
        </ReactMarkdown>

        {/* Streaming animation indicator */}
        {isStreaming && (
          <div className="flex items-center gap-2 mt-4 text-dark-400 text-sm">
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-primary-500 rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-primary-500 rounded-full animate-pulse delay-75"></div>
              <div className="w-1 h-1 bg-primary-500 rounded-full animate-pulse delay-150"></div>
            </div>
            <span>Generating...</span>
          </div>
        )}
      </div>
    );
  },
);

MarkdownRenderer.displayName = "MarkdownRenderer";
