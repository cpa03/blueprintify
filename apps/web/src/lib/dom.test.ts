import { describe, it, expect } from "vitest";
import { isEditableField } from "./dom";

describe("isEditableField", () => {
  it("returns true for input elements", () => {
    const input = document.createElement("input");
    expect(isEditableField(input)).toBe(true);
  });

  it("returns true for textarea elements", () => {
    const textarea = document.createElement("textarea");
    expect(isEditableField(textarea)).toBe(true);
  });

  it("returns true for a contenteditable element", () => {
    const div = document.createElement("div");
    div.setAttribute("contenteditable", "true");
    expect(isEditableField(div)).toBe(true);
  });

  it("returns true for a child element inside a contenteditable region", () => {
    const container = document.createElement("div");
    container.setAttribute("contenteditable", "true");
    const child = document.createElement("span");
    container.appendChild(child);
    expect(isEditableField(child)).toBe(true);
  });

  it("returns false for non-editable elements", () => {
    const div = document.createElement("div");
    expect(isEditableField(div)).toBe(false);
  });

  it("returns false for non-element EventTargets", () => {
    expect(isEditableField(null)).toBe(false);
    expect(isEditableField(document)).toBe(false);
    expect(isEditableField(window)).toBe(false);
  });
});
