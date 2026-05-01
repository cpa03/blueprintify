import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary";

describe("ErrorBoundary", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("renders children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Test Child</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("accepts children prop with multiple elements", () => {
    render(
      <ErrorBoundary>
        <span>First</span>
        <span>Second</span>
      </ErrorBoundary>
    );

    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });

  it("accepts onError callback prop", () => {
    const onError = vi.fn();

    function ChildWithError(): JSX.Element {
      throw new Error("Test error");
    }

    render(
      <ErrorBoundary onError={onError}>
        <ChildWithError />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
  });

  it("passes error and errorInfo to onError callback", () => {
    const onError = vi.fn();

    function ChildWithError(): JSX.Element {
      throw new Error("Test error message");
    }

    render(
      <ErrorBoundary onError={onError}>
        <ChildWithError />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
    const calls = onError.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const [error, errorInfo] = calls[0]!;
    expect(error).toBeInstanceOf(Error);
    expect(errorInfo).toBeDefined();
  });

  it("renders default fallback UI when no custom fallback provided", () => {
    const onError = vi.fn();

    function ChildWithError(): JSX.Element {
      throw new Error("Error");
    }

    render(
      <ErrorBoundary onError={onError}>
        <ChildWithError />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset application/i })).toBeInTheDocument();
  });

  it("calls onError when error is thrown in nested component", () => {
    const onError = vi.fn();

    function DeeplyNestedError(): JSX.Element {
      throw new Error("Deep error");
    }

    function ParentComponent(): JSX.Element {
      return (
        <div>
          <span>Parent</span>
          <DeeplyNestedError />
        </div>
      );
    }

    render(
      <ErrorBoundary onError={onError}>
        <ParentComponent />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
  });

  it("handles non-Error thrown values", () => {
    const onError = vi.fn();

    function ThrowString(): JSX.Element {
      throw "string error";
    }

    render(
      <ErrorBoundary onError={onError}>
        <ThrowString />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
  });

  it("handles thrown objects", () => {
    const onError = vi.fn();

    function ThrowObject(): JSX.Element {
      throw { code: "ERR_TEST", message: "Object error" };
    }

    render(
      <ErrorBoundary onError={onError}>
        <ThrowObject />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
  });
});
