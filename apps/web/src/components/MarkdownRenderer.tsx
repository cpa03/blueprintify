/**
 * @fileoverview Markdown rendering component with syntax highlighting and security sanitization.
 *
 * This component provides:
 * - ReactMarkdown-based rendering with custom styling
 * - Syntax highlighting for code blocks using PrismLight
 * - Copy-to-clipboard functionality for code blocks
 * - XSS protection via DOMPurify sanitization
 * - GFM (GitHub Flavored Markdown) support
 *
 * Custom renderers are provided for all common markdown elements including:
 * headings, paragraphs, lists, tables, blockquotes, code blocks, links, and images.
 *
 * @module components/MarkdownRenderer
 * @see {@link sanitizeHtml} for XSS protection
 * @see {@link copyToClipboard} for clipboard functionality
 */
import React, { useState, useCallback, memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { copyToClipboard } from "../lib/export";
import { sanitizeHtml } from "../lib/security";
import { TIMEOUTS } from "../config/constants";
import type { Components } from "react-markdown";

/**
 * Props for the MarkdownRenderer component.
 */
export interface MarkdownRendererProps {
  /** The markdown content to render */
  content: string;
  /** Optional CSS class name to apply to the container */
  className?: string;
}

/**
 * Header component for code blocks with language label and copy button.
 * Displays the programming language and provides one-click copy functionality.
 *
 * @param props - Component props
 * @param props.language - The programming language for syntax highlighting
 * @param props.code - The code content to copy
 */
const CodeBlockHeader = memo(function CodeBlockHeader({
  language,
  code,
}: {
  language: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), TIMEOUTS.COPY_FEEDBACK);
    }
  }, [code]);

  return (
    <div
      className="absolute top-0 right-0 left-0 flex items-center justify-between px-3 py-2 bg-dark-800/90 backdrop-blur-sm rounded-t-lg border-b border-dark-700/50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="text-xs text-dark-400 font-mono uppercase tracking-wide">
        {language}
      </span>
      <motion.button
        onClick={handleCopy}
        className={clsx(
          "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50",
          copied
            ? "bg-accent-emerald/20 text-accent-emerald"
            : isHovered
              ? "bg-primary-500/20 text-dark-300"
              : "bg-dark-700/50 text-dark-400"
        )}
        animate={{
          scale: 1,
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label={copied ? "Copied to clipboard" : "Copy code to clipboard"}
        title={copied ? "Copied!" : "Copy code"}
      >
        <AnimatePresence mode="wait" initial={false}>
          {copied ? (
            <motion.svg
              key="check"
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          ) : (
            <motion.svg
              key="copy"
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </motion.svg>
          )}
        </AnimatePresence>
        <span>{copied ? "Copied!" : "Copy"}</span>
      </motion.button>
    </div>
  );
});

/**
 * Main markdown renderer component with custom styling and syntax highlighting.
 *
 * Features:
 * - Sanitizes HTML content for XSS protection
 * - Memoizes sanitized content and components for performance
 * - Provides custom renderers for all markdown elements
 *
 * @param props - Component props
 * @param props.content - The markdown content to render
 * @param props.className - Optional CSS class name
 * @returns The rendered markdown content
 */
function MarkdownRendererComponent({
  content,
  className,
}: MarkdownRendererProps) {

  // Memoize sanitized content to avoid unnecessary DOMPurify calls
  const sanitizedContent = useMemo(() => sanitizeHtml(content), [content]);

  // Memoize ReactMarkdown components to prevent unnecessary re-renders
  const markdownComponents = useMemo<Components>(
    () => ({
      code({
        inline,
        className,
        children,
        ...props
      }: {
        inline?: boolean;
        className?: string;
        children?: React.ReactNode;
      }) {
        const match = /language-(\w+)/.exec(className || "");
        const language = match?.[1] ?? "";
        const codeString = String(children).replace(/\n$/, "");

        return !inline && match ? (
          <div className="relative my-4 group">
            <CodeBlockHeader language={language} code={codeString} />
            <SyntaxHighlighter
              style={oneDark}
              language={language}
              PreTag="div"
              className="!mt-0 !rounded-t-none !rounded-lg overflow-x-auto pt-12"
              showLineNumbers
              wrapLines
              {...props}
            >
              {codeString}
            </SyntaxHighlighter>
          </div>
        ) : (
          <code
            className={clsx(
              "bg-dark-800 px-1.5 py-0.5 rounded text-sm font-mono text-primary-400",
              className,
            )}
            {...props}
          >
            {children}
          </code>
        );
      },
      blockquote({ children }) {
        return (
          <blockquote className="border-l-4 border-purple-500 pl-4 py-2 my-4 bg-dark-800/50 rounded-r-md italic text-dark-300">
            {children}
          </blockquote>
        );
      },
      table({ children }) {
        return (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full border-collapse border border-dark-700 rounded-lg overflow-hidden">
              {children}
            </table>
          </div>
        );
      },
      thead({ children }) {
        return <thead className="bg-dark-800">{children}</thead>;
      },
      th({ children }) {
        return (
          <th className="border border-dark-700 px-4 py-3 text-left font-semibold text-white">
            {children}
          </th>
        );
      },
      td({ children }) {
        return (
          <td className="border border-dark-700 px-4 py-3 text-dark-300">
            {children}
          </td>
        );
      },
      tr({ children }) {
        return (
          <tr className="hover:bg-dark-800/50 transition-colors">{children}</tr>
        );
      },
      h1({ children }) {
        return (
          <h1 className="text-3xl font-bold text-white mb-4 mt-6 pb-2 border-b border-dark-700">
            {children}
          </h1>
        );
      },
      h2({ children }) {
        return (
          <h2 className="text-2xl font-bold text-white mb-3 mt-6">
            {children}
          </h2>
        );
      },
      h3({ children }) {
        return (
          <h3 className="text-xl font-semibold text-white mb-2 mt-5">
            {children}
          </h3>
        );
      },
      h4({ children }) {
        return (
          <h4 className="text-lg font-semibold text-white mb-2 mt-4">
            {children}
          </h4>
        );
      },
      h5({ children }) {
        return (
          <h5 className="text-base font-semibold text-white mb-2 mt-4">
            {children}
          </h5>
        );
      },
      h6({ children }) {
        return (
          <h6 className="text-sm font-semibold text-white mb-2 mt-4">
            {children}
          </h6>
        );
      },
      p({ children }) {
        return <p className="text-dark-300 mb-4 leading-relaxed">{children}</p>;
      },
      ul({ children }) {
        return (
          <ul className="list-disc list-inside mb-4 text-dark-300 space-y-2">
            {children}
          </ul>
        );
      },
      ol({ children }) {
        return (
          <ol className="list-decimal list-inside mb-4 text-dark-300 space-y-2">
            {children}
          </ol>
        );
      },
      li({ children }) {
        return <li className="leading-relaxed">{children}</li>;
      },
      a({ children, href }) {
        return (
          <a
            href={href}
            className="text-primary-400 hover:text-purple-400 transition-colors underline decoration-2 underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        );
      },
      img({ src, alt }) {
        return (
          <img
            src={src}
            alt={alt}
            className="max-w-full h-auto rounded-lg shadow-lg my-4"
            loading="lazy"
          />
        );
      },
      hr() {
        return <hr className="border-t border-dark-700 my-8" />;
      },
    }),
    [],
  );

  return (
    <div className={clsx("markdown-content", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={markdownComponents}
      >
        {sanitizedContent}
      </ReactMarkdown>
    </div>
  );
}

/**
 * Memoized MarkdownRenderer component for optimal re-render performance.
 * Exported as the default MarkdownRenderer component.
 */
export const MarkdownRenderer = memo(MarkdownRendererComponent);
