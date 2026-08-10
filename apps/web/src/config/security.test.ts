/**
 * Security Configuration Tests
 *
 * Regression locks for the Content Security Policy shipped to production
 * (`apps/web/vercel.json` header + `CSP_DIRECTIVES` in ./security.ts).
 *
 * Issue #955 — the previous policy whitelisted a stale inline-handler hash
 * (`sha256-87uI7LZJ8azkq44HKb4qqF/0VgaCUXD27d5/XHXT3yQ=`) that matched
 * nothing in the built HTML and lacked `'unsafe-inline'` for styles, which
 * blocked the async stylesheet `onload` switches and the critical CSS —
 * fonts/main styles never activated in production.
 */

import { describe, it, expect } from "vitest";
import { HTTP_HEADER_NAMES } from "@blueprint/shared/config";
import { SECURITY_HEADERS, SECURITY_CONFIG } from "./security";

// CSP_DIRECTIVES is exposed via the aggregate SECURITY_CONFIG export.
const CSP_DIRECTIVES = SECURITY_CONFIG.CSP_DIRECTIVES;

describe("Security Configuration - Content Security Policy", () => {
  describe("script-src", () => {
    const directive = CSP_DIRECTIVES.SCRIPT_SRC.join(" ");

    it("never allows 'unsafe-inline' — inline handlers only via verified hashes", () => {
      expect(directive).not.toContain("'unsafe-inline'");
    });

    it("whitelists the preloadCssPlugin onload handler hash", () => {
      // sha256("this.media='all';this.onload=null")
      expect(directive).toContain("'sha256-p5PnWJvMOnsZyLjxblLBMDwBfOASHA7CQcLYb5mwepY='");
    });

    it("whitelists the fonts.googleapis.com onload handler hash", () => {
      // sha256 of the index.html font stylesheet onload attribute value
      expect(directive).toContain("'sha256-0J0eLBGw8ud/UAeoy6YUEYy1j5N+6CTyFGIzTUiVskY='");
    });

    it("does not contain the stale hash that broke production async CSS loading", () => {
      expect(directive).not.toContain("87uI7LZJ8azkq44HKb4qqF/0VgaCUXD27d5/XHXT3yQ=");
    });
  });

  describe("style-src", () => {
    const directive = CSP_DIRECTIVES.STYLE_SRC.join(" ");

    it("allows the inline critical CSS block and inline style attributes", () => {
      expect(directive).toContain("'unsafe-inline'");
    });

    it("allows Google Fonts stylesheets", () => {
      expect(directive).toContain("https://fonts.googleapis.com");
    });
  });

  describe("font-src", () => {
    it("allows Google Fonts woff2 delivery", () => {
      expect(CSP_DIRECTIVES.FONT_SRC).toContain("https://fonts.gstatic.com");
    });
  });

  describe("rendered header", () => {
    const header = SECURITY_HEADERS[HTTP_HEADER_NAMES.CONTENT_SECURITY_POLICY];

    it("hardens framing, object embedding and form actions", () => {
      expect(header).toContain("default-src 'self'");
      expect(header).toContain("object-src 'none'");
      expect(header).toContain("frame-ancestors 'none'");
      expect(header).toContain("form-action 'self'");
    });

    it("serializes every directive in the canonical form", () => {
      expect(header).toContain("script-src 'self' 'unsafe-hashes'");
    });
  });
});
