/**
 * Lazy Markdown Renderer Component
 *
 * Lazy-loads the MarkdownRenderer component for better performance.
 * Displays a fallback while loading and renders markdown content with
 * syntax highlighting and GFM support.
 *
 * @module components/LazyMarkdownRenderer
 * @see {@link MarkdownRenderer} - Full markdown renderer
 *
 * @param {LazyMarkdownRendererProps} props - Component props
 * @param {string} props.content - Markdown content to render
 * @param {string} [props.className] - Additional CSS classes
 * @param {ReactNode} [props.fallback] - Fallback content while loading
 * @returns {JSX.Element} Lazy-loaded markdown renderer
 *
 * @example
 * ```tsx
 * <LazyMarkdownRenderer
 *   content="# Hello World\n\nThis is **bold** text"
 *   className="prose dark:prose-invert"
 * />
 * ```
 */

import React, { useState, useEffect, memo } from "react";
import type { MarkdownRendererProps } from "./MarkdownRenderer";
import { isDev } from "../config/env";

interface LazyMarkdownRendererProps extends MarkdownRendererProps {
  fallback?: React.ReactNode;
}

function LazyMarkdownRendererComponent({
  content,
  className,
  fallback,
}: LazyMarkdownRendererProps) {
  const [MarkdownComponent, setMarkdownComponent] =
    useState<React.ComponentType<MarkdownRendererProps> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadMarkdownRenderer = async () => {
      try {
        const { MarkdownRenderer } = await import("./MarkdownRenderer");
        if (isMounted) {
          setMarkdownComponent(() => MarkdownRenderer);
          setIsLoading(false);
        }
      } catch (error) {
        if (isDev()) {
          console.error("Failed to load MarkdownRenderer:", error);
        }
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMarkdownRenderer();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading || !MarkdownComponent) {
    return (
      <div className={`flex items-center justify-center ${className || ""}`}>
        {fallback || (
          <div className="flex flex-col items-center gap-2 text-dark-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <span className="text-sm">Loading preview...</span>
          </div>
        )}
      </div>
    );
  }

  return <MarkdownComponent content={content} className={className} />;
}

export const LazyMarkdownRenderer = memo(LazyMarkdownRendererComponent);
