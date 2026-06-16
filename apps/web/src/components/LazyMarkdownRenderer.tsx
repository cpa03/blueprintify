import React, { useState, useEffect, memo } from "react";
import type { MarkdownRendererProps } from "./MarkdownRenderer";
import { isDev } from "../config/env";
import { DEBUG_MESSAGES, SKELETON_LAYOUT } from "../config/constants/content";

interface LazyMarkdownRendererProps extends MarkdownRendererProps {
  fallback?: React.ReactNode;
}

function MarkdownPreviewSkeleton(): JSX.Element {
  return (
    <div className="preview-skeleton" aria-hidden="true">
      <div className="skeleton-block preview-skeleton-heading" />
      {SKELETON_LAYOUT.PREVIEW_LINE_WIDTHS.map((w, i) => (
        <div key={i} className="skeleton-block preview-skeleton-line" style={{ width: w }} />
      ))}
      <div
        className="skeleton-block preview-skeleton-code-block"
        style={{ width: SKELETON_LAYOUT.PREVIEW_CODE_WIDTH }}
      />
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
          console.error(DEBUG_MESSAGES.LOAD_FAILED("MarkdownRenderer"), error);
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
