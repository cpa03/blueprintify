import React, { useState, useEffect } from "react";
import type { MarkdownRendererProps } from "./MarkdownRenderer";

interface LazyMarkdownRendererProps extends MarkdownRendererProps {
  fallback?: React.ReactNode;
}

export function LazyMarkdownRenderer({
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
        const { MarkdownRenderer } = await import(
          /* webpackChunkName: "markdown-renderer" */
          /* webpackPrefetch: false */
          /* webpackPreload: false */
          "./MarkdownRenderer"
        );
        if (isMounted) {
          setMarkdownComponent(() => MarkdownRenderer);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to load MarkdownRenderer:", error);
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
