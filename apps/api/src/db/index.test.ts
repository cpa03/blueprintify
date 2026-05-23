import { describe, it, expect } from "vitest";
import {
  serializeJSON,
  deserializeJSON,
  DatabaseError,
  DatabaseValidationError,
  DatabaseNotFoundError,
} from "./index";

describe("Utility Functions", () => {
  describe("serializeJSON", () => {
    it("should serialize object to JSON string", () => {
      const obj = { name: "test", value: 123 };
      const result = serializeJSON(obj);
      expect(result).toBe('{"name":"test","value":123}');
    });

    it("should serialize array to JSON string", () => {
      const arr = [1, 2, 3];
      const result = serializeJSON(arr);
      expect(result).toBe("[1,2,3]");
    });

    it("should serialize null", () => {
      const result = serializeJSON(null);
      expect(result).toBe("null");
    });

    it("should serialize undefined", () => {
      const result = serializeJSON(undefined);
      expect(result).toBe(undefined);
    });
  });

  describe("deserializeJSON", () => {
    it("should deserialize JSON string to object", () => {
      const result = deserializeJSON<{ name: string; value: number }>(
        '{"name":"test","value":123}'
      );
      expect(result).toEqual({ name: "test", value: 123 });
    });

    it("should deserialize JSON array", () => {
      const result = deserializeJSON<number[]>("[1,2,3]");
      expect(result).toEqual([1, 2, 3]);
    });

    it("should throw DatabaseError for invalid JSON", () => {
      expect(() => deserializeJSON("invalid json")).toThrow(DatabaseError);
    });

    it("should include cause in error for debugging", () => {
      try {
        deserializeJSON("{invalid}");
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(DatabaseError);
        expect((error as DatabaseError).cause).toBeDefined();
      }
    });
  });
});

describe("Error Classes", () => {
  describe("DatabaseError", () => {
    it("should create error with message", () => {
      const error = new DatabaseError("Test error");
      expect(error.message).toBe("Test error");
      expect(error.name).toBe("DatabaseError");
    });

    it("should create error with cause", () => {
      const cause = new Error("Original error");
      const error = new DatabaseError("Wrapped error", cause);
      expect(error.cause).toBe(cause);
    });
  });

  describe("DatabaseValidationError", () => {
    it("should create validation error", () => {
      const error = new DatabaseValidationError("Invalid data");
      expect(error.message).toBe("Invalid data");
      expect(error.name).toBe("DatabaseValidationError");
      expect(error).toBeInstanceOf(DatabaseError);
    });
  });

  describe("DatabaseNotFoundError", () => {
    it("should create not found error", () => {
      const error = new DatabaseNotFoundError("Resource not found");
      expect(error.message).toBe("Resource not found");
      expect(error.name).toBe("DatabaseNotFoundError");
      expect(error).toBeInstanceOf(DatabaseError);
    });
  });
});
