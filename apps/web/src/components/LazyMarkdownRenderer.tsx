import React, { useState, useEffect, memo } from "react";
import type { MarkdownRendererProps } from "./MarkdownRenderer";
import { isDev } from "../config/env";

interface LazyMarkdownRendererProps extends MarkdownRendererProps {
  fallback?: React.ReactNode;
}

function MarkdownPreviewSkeleton(): JSX.Element {
  return (
    <div className="preview-skeleton" aria-hidden="true">
      <div className="skeleton-block preview-skeleton-heading" />
      <div className="skeleton-block preview-skeleton-line" style={{ width: "88%" }} />
      <div className="skeleton-block preview-skeleton-line" style={{ width: "72%" }} />
      <div className="skeleton-block preview-skeleton-line" style={{ width: "95%" }} />
      <div className="skeleton-block preview-skeleton-line" style={{ width: "60%" }} />

      <div className="skeleton-block preview-skeleton-subheading" />

      <div className="skeleton-block preview-skeleton-line" style={{ width: "82%" }} />
      <div className="skeleton-block preview-skeleton-line" style={{ width: "70%" }} />
      <div className="skeleton-block preview-skeleton-line" style={{ width: "90%" }} />
      <div className="skeleton-block preview-skeleton-line" style={{ width: "55%" }} />
      <div className="skeleton-block preview-skeleton-line" style={{ width: "78%" }} />

      <div className="skeleton-block preview-skeleton-code-block" style={{ width: "92%" }} />
    </div>
  );
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
    return fallback ? <>{fallback}</> : <MarkdownPreviewSkeleton />;
  }

  return <MarkdownComponent content={content} className={className} />;
}

export const LazyMarkdownRenderer = memo(LazyMarkdownRendererComponent);
