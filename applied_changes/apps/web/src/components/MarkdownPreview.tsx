import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import clsx from "clsx";

interface MarkdownPreviewProps {
  content: string;
  className?: string;
  /**
   * View mode for styling
   * - full: takes full width
   * - half: takes half width (for split view)
   */
  viewMode?: "full" | "half";
}

/**
 * MarkdownPreview component - Renders markdown content with syntax highlighting
 */
export function MarkdownPreview({
  content,
  className,
  viewMode = "half",
}: MarkdownPreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={clsx(
        "h-full overflow-y-auto p-6",
        viewMode === "half" ? "w-1/2" : "w-full",
        className,
      )}
    >
      <div className="markdown-content prose prose-invert max-w-none">
        {content ? (
          <ReactMarkdown>{content}</ReactMarkdown>
        ) : (
          <div className="text-dark-500 italic">*No content yet...*</div>
        )}
      </div>
    </motion.div>
  );
}
