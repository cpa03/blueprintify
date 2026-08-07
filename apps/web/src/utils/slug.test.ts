/**
 * @fileoverview Tests for heading slug and ReactNode text extraction
 * utilities in utils/slug.ts (issue #954).
 *
 * Covers:
 * - generateSlug: kebab-case, punctuation stripping, underscore/space
 *   collapsing, consecutive-hyphen collapse, edge-trim, SSR-empty input
 * - childrenToText: strings, numbers, arrays, nested React elements
 */

import { describe, expect, it } from "vitest";
import { createElement, type ReactNode } from "react";
import { generateSlug, childrenToText } from "./slug";

describe("generateSlug", () => {
  it("lowercases and kebab-cases plain text", () => {
    expect(generateSlug("Deployment Architecture")).toBe("deployment-architecture");
  });

  it("strips punctuation and non-word characters", () => {
    expect(generateSlug("Hello, World!")).toBe("hello-world");
    expect(generateSlug("C# & TypeScript")).toBe("c-typescript");
  });

  it("replaces underscores and spaces with hyphens", () => {
    expect(generateSlug("error_handling")).toBe("error-handling");
    expect(generateSlug("two  spaces")).toBe("two-spaces");
  });

  it("collapses consecutive hyphens", () => {
    expect(generateSlug("a---b")).toBe("a-b");
  });

  it("trims leading and trailing hyphens", () => {
    expect(generateSlug("-leading-")).toBe("leading");
    expect(generateSlug("trailing-")).toBe("trailing");
  });

  it("returns an empty string for empty or whitespace-only input", () => {
    expect(generateSlug("")).toBe("");
    expect(generateSlug("   ")).toBe("");
  });

  it("preserves existing hyphens (GitHub-style kebab case)", () => {
    expect(generateSlug("React Hooks - Deep Dive")).toBe("react-hooks-deep-dive");
  });

  it("is idempotent on already-slugified input", () => {
    expect(generateSlug("data-fetching-strategy")).toBe("data-fetching-strategy");
  });
});

describe("childrenToText", () => {
  it("returns empty string for null and undefined", () => {
    expect(childrenToText(null)).toBe("");
    expect(childrenToText(undefined)).toBe("");
  });

  it("stringifies strings and numbers", () => {
    expect(childrenToText("Deployment")).toBe("Deployment");
    expect(childrenToText(42)).toBe("42");
  });

  it("joins array children", () => {
    expect(childrenToText(["a", "b", "c"])).toBe("abc");
  });

  it("handles nested React elements with plain text children", () => {
    const node: ReactNode = createElement("code", null, "inline");
    expect(childrenToText(node)).toBe("inline");
  });

  it("recursively extracts text from deeply nested elements", () => {
    const node: ReactNode = createElement(
      "p",
      null,
      createElement("a", null, [createElement("code", null, "hooks"), " & "]),
      "more"
    );
    expect(childrenToText(node)).toBe("hooks & more");
  });

  it("returns empty string for elements without children", () => {
    const node: ReactNode = createElement("br");
    expect(childrenToText(node)).toBe("");
  });

  it("handles mixed string and element arrays", () => {
    const node: ReactNode = ["Deploy ", createElement("em", null, "fast")];
    expect(childrenToText(node)).toBe("Deploy fast");
  });
});
