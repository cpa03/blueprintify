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
import * as motion from "framer-motion/m";
import { AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { copyToClipboard } from "../lib/export";
import { sanitizeHtml } from "../lib/security";
import {
  TIMEOUTS,
  ACCESSIBILITY_LABELS,
  SPRING_CONFIG,
  MARKDOWN_COPY_LABELS,
} from "../config/constants";
import { MARKDOWN, ICON } from "../config/styles";
import { HeadingAnchor } from "./HeadingAnchor";
import { generateSlug, childrenToText } from "../utils/slug";
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
  const [copyAnnouncement, setCopyAnnouncement] = useState("");

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopied(true);
      setCopyAnnouncement("Copied to clipboard");
      setTimeout(() => {
        setCopied(false);
        setCopyAnnouncement("");
      }, TIMEOUTS.COPY_FEEDBACK);
    }
  }, [code]);

  return (
    <div
      className={MARKDOWN.CODE_HEADER}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Screen reader announcement for copy action — provides explicit
          feedback so screen reader users know the code was successfully
          copied to the clipboard. Without this, only visual users see the
          "Copied!" feedback via the button text change. */}
      <div className="sr-only" role="status" aria-live="assertive" aria-atomic="true">
        {copyAnnouncement}
      </div>
      <span className={MARKDOWN.CODE_LANGUAGE}>{language}</span>
      <motion.button
        onClick={handleCopy}
        className={clsx(
          MARKDOWN.COPY_BUTTON_BASE,
          copied
            ? MARKDOWN.COPY_BUTTON_COPIED
            : isHovered
              ? MARKDOWN.COPY_BUTTON_HOVER
              : MARKDOWN.COPY_BUTTON_IDLE
        )}
        animate={{
          scale: 1,
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label={
          copied ? ACCESSIBILITY_LABELS.MARKDOWN.COPIED : ACCESSIBILITY_LABELS.MARKDOWN.COPY_CODE
        }
        title={
          copied
            ? ACCESSIBILITY_LABELS.MARKDOWN.COPIED_TITLE
            : ACCESSIBILITY_LABELS.MARKDOWN.COPY_CODE_TITLE
        }
      >
        <AnimatePresence mode="wait" initial={false}>
          {copied ? (
            <motion.svg
              key="check"
              className={ICON.SM}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", ...SPRING_CONFIG.CHECKMARK_ICON }}
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
              className={ICON.SM}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", ...SPRING_CONFIG.CHECKMARK_ICON }}
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
        <span>{copied ? MARKDOWN_COPY_LABELS.COPIED : MARKDOWN_COPY_LABELS.COPY}</span>
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
function MarkdownRendererComponent({ content, className }: MarkdownRendererProps) {
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
          <div className={MARKDOWN.CODE_WRAPPER}>
            <CodeBlockHeader language={language} code={codeString} />
            <SyntaxHighlighter
              style={oneDark}
              language={language}
              PreTag="div"
              className={MARKDOWN.SYNTAX_HIGHLIGHTER}
              showLineNumbers
              wrapLines
              {...props}
            >
              {codeString}
            </SyntaxHighlighter>
          </div>
        ) : (
          <code className={clsx(MARKDOWN.INLINE_CODE, className)} {...props}>
            {children}
          </code>
        );
      },
      blockquote({ children }) {
        return <blockquote className={MARKDOWN.BLOCKQUOTE}>{children}</blockquote>;
      },
      table({ children }) {
        return (
          <div className={MARKDOWN.TABLE_CONTAINER}>
            <table className={MARKDOWN.TABLE}>{children}</table>
          </div>
        );
      },
      thead({ children }) {
        return <thead className={MARKDOWN.TABLE_HEAD}>{children}</thead>;
      },
      th({ children }) {
        return <th className={MARKDOWN.TABLE_TH}>{children}</th>;
      },
      td({ children }) {
        return <td className={MARKDOWN.TABLE_TD}>{children}</td>;
      },
      tr({ children }) {
        return <tr className={MARKDOWN.TABLE_TR}>{children}</tr>;
      },
      h1({ children }) {
        const text = childrenToText(children);
        const slug = generateSlug(text);
        return (
          <h1 id={slug} className={MARKDOWN.H1}>
            <HeadingAnchor headingText={text}>{children}</HeadingAnchor>
          </h1>
        );
      },
      h2({ children }) {
        const text = childrenToText(children);
        const slug = generateSlug(text);
        return (
          <h2 id={slug} className={MARKDOWN.H2}>
            <HeadingAnchor headingText={text}>{children}</HeadingAnchor>
          </h2>
        );
      },
      h3({ children }) {
        const text = childrenToText(children);
        const slug = generateSlug(text);
        return (
          <h3 id={slug} className={MARKDOWN.H3}>
            <HeadingAnchor headingText={text}>{children}</HeadingAnchor>
          </h3>
        );
      },
      h4({ children }) {
        const text = childrenToText(children);
        const slug = generateSlug(text);
        return (
          <h4 id={slug} className={MARKDOWN.H4}>
            <HeadingAnchor headingText={text}>{children}</HeadingAnchor>
          </h4>
        );
      },
      h5({ children }) {
        const text = childrenToText(children);
        const slug = generateSlug(text);
        return (
          <h5 id={slug} className={MARKDOWN.H5}>
            <HeadingAnchor headingText={text}>{children}</HeadingAnchor>
          </h5>
        );
      },
      h6({ children }) {
        const text = childrenToText(children);
        const slug = generateSlug(text);
        return (
          <h6 id={slug} className={MARKDOWN.H6}>
            <HeadingAnchor headingText={text}>{children}</HeadingAnchor>
          </h6>
        );
      },
      p({ children }) {
        return <p className={MARKDOWN.PARAGRAPH}>{children}</p>;
      },
      ul({ children }) {
        return <ul className={MARKDOWN.UL}>{children}</ul>;
      },
      ol({ children }) {
        return <ol className={MARKDOWN.OL}>{children}</ol>;
      },
      li({ children }) {
        return <li className={MARKDOWN.LI}>{children}</li>;
      },
      a({ children, href }) {
        return (
          <a
            href={href}
            className={`${MARKDOWN.LINK} group inline-flex items-center gap-0.5`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
            <span className="sr-only">{ACCESSIBILITY_LABELS.MARKDOWN.OPENS_IN_NEW_TAB}</span>
            {/* External link indicator — visible on hover/focus to signal the
                link opens in a new tab, matching the Header pattern. */}
            <svg
              className="w-3 h-3 opacity-0 group-hover:opacity-60 group-focus-visible:opacity-60 transition-all duration-200 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6m4-3h6v6m-10 4L21 3"
              />
            </svg>
          </a>
        );
      },
      img({ src, alt }) {
        return (
          <img
            src={src}
            alt={alt ?? ""}
            className={MARKDOWN.IMAGE}
            loading="lazy"
            decoding="async"
          />
        );
      },
      hr() {
        return <hr className={MARKDOWN.HR} />;
      },
    }),
    []
  );

  return (
    <div className={clsx(MARKDOWN.CONTENT_WRAPPER, className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
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
