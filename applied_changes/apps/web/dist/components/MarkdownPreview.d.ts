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
export declare function MarkdownPreview({ content, className, viewMode, }: MarkdownPreviewProps): import("react/jsx-runtime").JSX.Element;
export {};
