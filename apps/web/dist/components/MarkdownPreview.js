import { jsx as _jsx } from "react/jsx-runtime";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import clsx from "clsx";
/**
 * MarkdownPreview component - Renders markdown content with syntax highlighting
 */
export function MarkdownPreview({ content, className, viewMode = "half", }) {
    return (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: clsx("h-full overflow-y-auto p-6", viewMode === "half" ? "w-1/2" : "w-full", className), children: _jsx("div", { className: "markdown-content prose prose-invert max-w-none", children: content ? (_jsx(ReactMarkdown, { children: content })) : (_jsx("div", { className: "text-dark-500 italic", children: "*No content yet...*" })) }) }));
}
