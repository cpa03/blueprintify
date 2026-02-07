import { useMemo, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { motion } from "framer-motion";
import clsx from "clsx";

import "highlight.js/styles/github-dark.css";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  isStreaming?: boolean;
  streamingChunk?: string;
}

const components = {
  code: memo(({ className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || "");
    const isInline = !match;

    return (
      <code
        className={clsx(
          className,
          isInline &&
            "bg-dark-800 px-1.5 py-0.5 rounded text-sm font-mono text-primary-400",
          !isInline && "block",
        )}
        {...props}
      >
        {children}
      </code>
    );
  }),

  pre: memo(({ children, ...props }: any) => (
    <pre
      className="bg-dark-900 rounded-lg p-4 overflow-x-auto border border-dark-700 font-mono text-sm"
      {...props}
    >
      {children}
    </pre>
  )),

  table: memo(({ children, ...props }: any) => (
    <div className="overflow-x-auto my-4">
      <table
        className="min-w-full border-collapse border border-dark-700 rounded-lg overflow-hidden"
        {...props}
      >
        {children}
      </table>
    </div>
  )),

  thead: memo(({ children, ...props }: any) => (
    <thead className="bg-dark-800 border-b border-dark-700" {...props}>
      {children}
    </thead>
  )),

  tbody: memo(({ children, ...props }: any) => (
    <tbody className="divide-y divide-dark-700" {...props}>
      {children}
    </tbody>
  )),

  th: memo(({ children, ...props }: any) => (
    <th className="px-4 py-3 text-left font-semibold text-dark-200" {...props}>
      {children}
    </th>
  )),

  td: memo(({ children, ...props }: any) => (
    <td className="px-4 py-3 text-dark-300" {...props}>
      {children}
    </td>
  )),

  blockquote: memo(({ children, ...props }: any) => (
    <blockquote
      className="border-l-4 border-primary-500 pl-4 py-2 my-4 bg-dark-800/50 rounded-r-lg text-dark-300 italic"
      {...props}
    >
      {children}
    </blockquote>
  )),

  h1: memo(({ children, ...props }: any) => (
    <h1
      className="text-3xl font-bold text-white mb-4 mt-6 first:mt-0"
      {...props}
    >
      {children}
    </h1>
  )),

  h2: memo(({ children, ...props }: any) => (
    <h2
      className="text-2xl font-bold text-white mb-3 mt-5 first:mt-0"
      {...props}
    >
      {children}
    </h2>
  )),

  h3: memo(({ children, ...props }: any) => (
    <h3
      className="text-xl font-semibold text-white mb-2 mt-4 first:mt-0"
      {...props}
    >
      {children}
    </h3>
  )),

  h4: memo(({ children, ...props }: any) => (
    <h4
      className="text-lg font-semibold text-white mb-2 mt-3 first:mt-0"
      {...props}
    >
      {children}
    </h4>
  )),

  h5: memo(({ children, ...props }: any) => (
    <h5
      className="text-base font-semibold text-white mb-2 mt-3 first:mt-0"
      {...props}
    >
      {children}
    </h5>
  )),

  h6: memo(({ children, ...props }: any) => (
    <h6
      className="text-sm font-semibold text-dark-200 mb-2 mt-3 first:mt-0"
      {...props}
    >
      {children}
    </h6>
  )),

  // Paragraphs
  p: memo(({ children, ...props }: any) => (
    <p className="text-dark-300 mb-4 leading-relaxed last:mb-0" {...props}>
      {children}
    </p>
  )),

  ul: memo(({ children, ...props }: any) => (
    <ul
      className="list-disc list-inside mb-4 text-dark-300 space-y-1"
      {...props}
    >
      {children}
    </ul>
  )),

  ol: memo(({ children, ...props }: any) => (
    <ol
      className="list-decimal list-inside mb-4 text-dark-300 space-y-1"
      {...props}
    >
      {children}
    </ol>
  )),

  li: memo(({ children, ...props }: any) => (
    <li className="leading-relaxed" {...props}>
      {children}
    </li>
  )),

  a: memo(({ children, href, ...props }: any) => (
    <a
      href={href}
      className="text-primary-400 hover:text-primary-300 underline transition-colors duration-200"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  )),

  hr: memo((props: any) => <hr className="border-dark-700 my-6" {...props} />),

  img: memo(({ src, alt, ...props }: any) => (
    <img
      src={src}
      alt={alt}
      className="max-w-full h-auto rounded-lg border border-dark-700 my-4"
      {...props}
    />
  )),
};

export function MarkdownRenderer({
  content,
  className,
  isStreaming = false,
  streamingChunk = "",
}: MarkdownRendererProps) {
  const displayContent = useMemo(() => {
    if (isStreaming && streamingChunk) {
      return content + streamingChunk;
    }
    return content;
  }, [content, isStreaming, streamingChunk]);

  const markdownConfig = useMemo(
    () => ({
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeRaw, rehypeHighlight],
      components,
    }),
    [],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={clsx(
        "prose prose-in prose-lg max-w-none",
        "prose-headings:text-white prose-headings:font-semibold",
        "prose-p:text-dark-300 prose-p:leading-relaxed",
        "prose-code:text-primary-400 prose-code:bg-dark-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono",
        "prose-pre:bg-dark-900 prose-pre:border prose-pre:border-dark-700 prose-pre:rounded-lg",
        "prose-blockquote:border-l-primary-500 prose-blockquote:text-dark-300 prose-blockquote:bg-dark-800/50 prose-blockquote:rounded-r-lg prose-blockquote:italic",
        "prose-strong:text-white prose-em:text-dark-400",
        "prose-hr:border-dark-700",
        "prose-td:text-dark-300 prose-th:text-dark-200 prose-th:font-semibold",
        "prose-table:border-dark-700",
        "prose-thead:bg-dark-800 prose-thead:border-b prose-thead:border-dark-700",
        "prose-tbody:divide-y prose-tbody:divide-dark-700",
        "prose-a:text-primary-400 prose-a:no-underline hover:prose-a:text-primary-300 hover:prose-a:underline",
        className,
      )}
    >
      <ReactMarkdown {...markdownConfig}>
        {displayContent || "*No content yet...*"}
      </ReactMarkdown>

      {isStreaming && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-primary-400 text-sm mt-4"
        >
          <div className="animate-pulse">Generating...</div>
          <div className="flex gap-1">
            <div
              className="w-1 h-1 bg-primary-400 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-1 h-1 bg-primary-400 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-1 h-1 bg-primary-400 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default memo(MarkdownRenderer);
