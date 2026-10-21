import { describe, it, expect } from "vitest";
import { VALIDATION_MESSAGES, STEP_INFO_LABELS, FORM_LIMITS } from "./validation";
import { VALIDATION_LIMITS } from "@blueprint/shared/config";

describe("VALIDATION_MESSAGES grammar", () => {
  it("uses singular 'character' when the minimum is 1", () => {
    expect(VALIDATION_MESSAGES.PROJECT_NAME_MIN_LENGTH(1)).toBe(
      "Project name must be at least 1 character"
    );
  });

  it("keeps plural 'characters' for minimums above 1", () => {
    expect(VALIDATION_MESSAGES.DESCRIPTION_MIN_LENGTH(10)).toBe(
      "Description must be at least 10 characters"
    );
    expect(VALIDATION_MESSAGES.PROJECT_NAME_MIN_LENGTH(2)).toBe(
      "Project name must be at least 2 characters"
    );
  });

  it("inflects CHARACTERS_NEEDED for singular and plural remainders", () => {
    expect(VALIDATION_MESSAGES.CHARACTERS_NEEDED(1)).toBe("1 more character needed");
    expect(VALIDATION_MESSAGES.CHARACTERS_NEEDED(2)).toBe("2 more characters needed");
  });
});

describe("STEP_INFO_LABELS accuracy", () => {
  it("announces the real project name minimum, not a stale hardcoded value", () => {
    expect(STEP_INFO_LABELS.PROJECT_NAME_INVALID).toContain(
      `${VALIDATION_LIMITS.PROJECT_NAME.MIN} character`
    );
    expect(STEP_INFO_LABELS.PROJECT_NAME_INVALID).not.toContain("3 characters");
  });

  it("announces the real description minimum from the shared config", () => {
    expect(STEP_INFO_LABELS.DESCRIPTION_INVALID).toContain(
      `${VALIDATION_LIMITS.DESCRIPTION.MIN} characters`
    );
  });

  it("keeps FORM_LIMITS in sync with the shared VALIDATION_LIMITS source of truth", () => {
    expect(FORM_LIMITS.PROJECT_NAME.MIN).toBe(VALIDATION_LIMITS.PROJECT_NAME.MIN);
    expect(FORM_LIMITS.DESCRIPTION.MIN).toBe(VALIDATION_LIMITS.DESCRIPTION.MIN);
  });
});
