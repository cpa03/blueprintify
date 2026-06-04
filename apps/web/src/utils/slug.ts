import type { ReactNode } from "react";

/**
 * Generates a URL-safe slug from heading text.
 * Follows GitHub-style heading anchor conventions (kebab-case,
 * stripped punctuation, collapsed hyphens).
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word chars except spaces/hyphens
    .replace(/[_\s]+/g, "-") // Replace underscores/spaces with hyphens
    .replace(/-{2,}/g, "-") // Collapse consecutive hyphens
    .replace(/^-+|-+$/g, ""); // Trim leading/trailing hyphens
}

/**
 * Extracts plain text from a ReactNode, recursively traversing
 * nested elements. Used to get heading text for slug generation
 * when children may include inline code, bold, or links.
 */
export function childrenToText(node: ReactNode): string {
  if (node == null) return "";

  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(childrenToText).join("");
  }

  // Handle React element with children prop
  if (typeof node === "object" && "props" in node) {
    return childrenToText((node as { props?: { children?: ReactNode } }).props?.children);
  }

  return "";
}
