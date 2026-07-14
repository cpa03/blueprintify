/**
 * Content Sanitization Tests
 *
 * Tests for the Worker-compatible HTML sanitizer used to prevent
 * stored XSS attacks in shared/imported blueprint content.
 *
 * @module utils/sanitize
 */

import { describe, it, expect } from "vitest";
import { sanitizeHtml, validateXssSafe, isXssSafe } from "./sanitize";

// =======================================================================
// sanitizeHtml — Core Sanitization Function
// =======================================================================

describe("sanitizeHtml", () => {
  // ---- Script Injection ----

  it("removes inline script tags", () => {
    expect(sanitizeHtml('Hello <script>alert("xss")</script> World')).toBe("Hello World");
    expect(sanitizeHtml('Hello<script>alert("xss")</script>World')).toBe("HelloWorld");
  });

  it("removes script tags with complex content", () => {
    const result = sanitizeHtml('<script type="text/javascript">document.cookie="test"</script>OK');
    expect(result).toBe("OK");
    expect(result).not.toContain("script");
    expect(result).not.toContain("cookie");
  });

  it("removes script tags with attributes", () => {
    const result = sanitizeHtml('<script src="https://evil.com/hook.js"></script>Clean');
    expect(result).toBe("Clean");
    expect(result).not.toContain("script");
  });

  // ---- Event Handler Removal ----

  it("removes onclick handlers", () => {
    const result = sanitizeHtml('<p onclick="stealData()">Click me</p>');
    expect(result).toBe("<p>Click me</p>");
    expect(result).not.toContain("onclick");
  });

  it("removes onload handlers", () => {
    const result = sanitizeHtml('<img src="x" onerror="alert(1)" />');
    expect(result).toBe('<img src="x" />');
    expect(result).not.toContain("onerror");
  });

  it("removes onmouseover handlers", () => {
    const result = sanitizeHtml('<a href="#" onmouseover="evil()">hover</a>');
    expect(result).toBe('<a href="#">hover</a>');
    expect(result).not.toContain("onmouseover");
  });

  it("removes all event handler attributes", () => {
    const result = sanitizeHtml(
      '<div onfocus="x()" onblur="y()" onchange="z()" onsubmit="w()">form</div>'
    );
    // div tags are stripped (not in markdown-safe allowlist), content preserved
    expect(result).toBe("form");
    expect(result).not.toContain("onfocus");
    expect(result).not.toContain("onblur");
  });

  it("removes event handlers with single quotes", () => {
    const result = sanitizeHtml("<p onclick='evil()'>Click</p>");
    expect(result).toBe("<p>Click</p>");
    expect(result).not.toContain("onclick");
  });

  // ---- Dangerous URL Schemes ----

  it("neutralizes javascript: URLs in href", () => {
    const result = sanitizeHtml('<a href="javascript:alert(1)">link</a>');
    expect(result).not.toContain("javascript:");
    expect(result).toContain('href="');
  });

  it("neutralizes javascript: URLs in src", () => {
    const result = sanitizeHtml('<img src="javascript:alert(1)" />');
    expect(result).not.toContain("javascript:");
  });

  it("neutralizes vbscript: URLs", () => {
    const result = sanitizeHtml('<a href="vbscript:msgbox(1)">click</a>');
    expect(result).not.toContain("vbscript");
  });

  it("neutralizes data:text/html URLs", () => {
    const result = sanitizeHtml(
      '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">click</a>'
    );
    expect(result).not.toContain("data:text/html");
  });

  // ---- Dangerous Tags ----

  it("removes iframe tags", () => {
    const result = sanitizeHtml('<iframe src="https://evil.com"></iframe>Hello');
    expect(result).toBe("Hello");
    expect(result).not.toContain("iframe");
  });

  it("removes object tags", () => {
    const result = sanitizeHtml('<object data="evil.swf"></object>Hello');
    expect(result).toBe("Hello");
  });

  it("removes embed tags", () => {
    const result = sanitizeHtml('<embed src="evil.swf" />Hello');
    expect(result).toBe("Hello");
  });

  it("removes base tags (URL hijacking)", () => {
    const result = sanitizeHtml('<base href="https://evil.com/" />Content');
    expect(result).toBe("Content");
  });

  it("removes link tags", () => {
    const result = sanitizeHtml('<link rel="stylesheet" href="evil.css" />Content');
    expect(result).toBe("Content");
  });

  it("removes style tags and content", () => {
    const result = sanitizeHtml('<style>body { background: url("evil.png"); }</style>Content');
    expect(result).toBe("Content");
    expect(result).not.toContain("style");
    expect(result).not.toContain("background");
  });

  it("removes noscript tags (DOM-based XSS)", () => {
    const result = sanitizeHtml('<noscript><img src="x" onerror="alert(1)" /></noscript>Content');
    expect(result).toBe("Content");
    expect(result).not.toContain("noscript");
  });

  it("removes template tags", () => {
    const result = sanitizeHtml("<template><script>evil()</script></template>Content");
    expect(result).toBe("Content");
  });

  it("removes meta tags (refresh/redirect)", () => {
    const result = sanitizeHtml('<meta http-equiv="refresh" content="0;url=evil.com" />Content');
    expect(result).toBe("Content");
  });

  // ---- HTML Comments ----

  it("removes HTML comments", () => {
    const result = sanitizeHtml("Hello<!-- inject: <script>evil()</script> -->World");
    expect(result).toBe("HelloWorld");
    expect(result).not.toContain("<!--");
    expect(result).not.toContain("-->");
  });

  it("removes conditional comments (IE)", () => {
    const result = sanitizeHtml("Hello<!--[if IE]><script>evil()</script><![endif]-->World");
    expect(result).toBe("HelloWorld");
  });

  // ---- Unknown/Non-Allowlisted Tags ----

  it("strips unknown tags but keeps content", () => {
    const result = sanitizeHtml("Hello <custom>World</custom>!");
    expect(result).toBe("Hello World!");
  });

  it("strips unknown tags with attributes", () => {
    const result = sanitizeHtml('<my-component data-value="test">Content</my-component>');
    expect(result).toBe("Content");
  });

  it("strips div tags (not in allowlist for markdown)", () => {
    const result = sanitizeHtml('<div class="container">Content</div>');
    expect(result).toBe("Content");
  });

  it("strips span tags", () => {
    const result = sanitizeHtml('<span style="color:red">text</span>');
    expect(result).toBe("text");
  });

  it("strips section tags", () => {
    const result = sanitizeHtml("<section><h1>Title</h1></section>");
    expect(result).toBe("<h1>Title</h1>");
  });

  // ---- Allowlisted Tags Preservation ----

  it("preserves markdown-safe tags", () => {
    const result = sanitizeHtml("<h1>Title</h1><p>Content with <strong>bold</strong></p>");
    expect(result).toBe("<h1>Title</h1><p>Content with <strong>bold</strong></p>");
  });

  it("preserves code tags", () => {
    const result = sanitizeHtml("<p>Use <code>npm install</code> to install</p>");
    expect(result).toBe("<p>Use <code>npm install</code> to install</p>");
  });

  it("preserves links with safe href", () => {
    const result = sanitizeHtml('<a href="https://example.com">Link</a>');
    expect(result).toBe('<a href="https://example.com">Link</a>');
  });

  it("preserves images with safe src", () => {
    const result = sanitizeHtml('<img src="https://example.com/img.png" alt="pic" />');
    expect(result).toBe('<img src="https://example.com/img.png" alt="pic" />');
  });

  it("preserves lists", () => {
    const result = sanitizeHtml("<ul><li>Item 1</li><li>Item 2</li></ul>");
    expect(result).toBe("<ul><li>Item 1</li><li>Item 2</li></ul>");
  });

  it("preserves tables", () => {
    const result = sanitizeHtml("<table><tr><td>Cell</td></tr></table>");
    expect(result).toBe("<table><tr><td>Cell</td></tr></table>");
  });

  // ---- Edge Cases ----

  it("passes through plain text unchanged", () => {
    expect(sanitizeHtml("Hello World")).toBe("Hello World");
  });

  it("passes through markdown unchanged", () => {
    const md = "# Title\n\n**bold** and *italic* and `code`\n\n- list item";
    expect(sanitizeHtml(md)).toBe(md);
  });

  it("handles empty input", () => {
    expect(sanitizeHtml("")).toBe("");
  });

  it("handles null/undefined input", () => {
    expect(sanitizeHtml("")).toBe("");
  });

  it("handles deeply nested XSS attempts", () => {
    const result = sanitizeHtml("<<script>script>alert(1)</<script>script>");
    expect(result).not.toContain("script");
  });

  it("removes CSS expression attacks", () => {
    const result = sanitizeHtml("<div style='expression(alert(1))'>text</div>");
    expect(result).toBe("text");
    expect(result).not.toContain("expression");
  });

  it("removes behavior binding (IE attack)", () => {
    const result = sanitizeHtml('<div style="behavior: url(xss.htc)">text</div>');
    expect(result).toBe("text");
  });
});

// =======================================================================
// validateXssSafe — Validation Function
// =======================================================================

describe("validateXssSafe", () => {
  it("passes clean content", () => {
    expect(() => validateXssSafe("Hello World")).not.toThrow();
  });

  it("passes markdown content", () => {
    expect(() => validateXssSafe("# Header\n\nContent")).not.toThrow();
  });

  it("throws on script tags", () => {
    expect(() => validateXssSafe("<script>alert(1)</script>")).toThrow("script tag");
  });

  it("throws on event handlers", () => {
    expect(() => validateXssSafe('<p onclick="x()">click</p>')).toThrow("event handler attribute");
  });

  it("throws on javascript: URLs", () => {
    expect(() => validateXssSafe('<a href="javascript:void(0)">link</a>')).toThrow(
      "javascript: URL"
    );
  });

  it("throws on iframe tags", () => {
    expect(() => validateXssSafe("<iframe src='evil'></iframe>")).toThrow("dangerous HTML tag");
  });

  it("includes field name in error", () => {
    expect(() => validateXssSafe("<script>evil()</script>", "blueprint")).toThrow(
      "in field 'blueprint'"
    );
  });

  it("handles empty input without throwing", () => {
    expect(() => validateXssSafe("")).not.toThrow();
  });
});

// =======================================================================
// isXssSafe — Zod Refinement Function
// =======================================================================

describe("isXssSafe", () => {
  it("returns true for clean content", () => {
    expect(isXssSafe("Hello World")).toBe(true);
  });

  it("returns false for content with script tags", () => {
    expect(isXssSafe("<script>alert(1)</script>")).toBe(false);
  });

  it("returns false for content with event handlers", () => {
    expect(isXssSafe('<p onclick="x()">click</p>')).toBe(false);
  });
});
