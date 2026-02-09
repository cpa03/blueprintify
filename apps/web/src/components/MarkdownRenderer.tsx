import React from "react";
import ReactMarkdown from "react-markdown";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import clsx from "clsx";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  return (
    <div className={clsx("markdown-content", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
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
            const language = match ? match[1] : "";

            return !inline && match ? (
              <div className="relative my-4">
                <div className="absolute top-0 right-0 px-3 py-1 text-xs text-dark-300 bg-dark-800 rounded-bl-md">
                  {language}
                </div>
                <SyntaxHighlighter
                  style={oneDark}
                  language={language}
                  PreTag="div"
                  className="!mt-0 !rounded-lg overflow-x-auto"
                  showLineNumbers
                  wrapLines
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
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
              <tr className="hover:bg-dark-800/50 transition-colors">
                {children}
              </tr>
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
            return (
              <p className="text-dark-300 mb-4 leading-relaxed">{children}</p>
            );
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
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
