import { render, screen, configure } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary";

// ErrorFallback is lazy-loaded behind framer-motion, so findBy* has to wait out
// a dynamic import plus the animation transform. Measured 4281ms on a 4-core
// runner with 8 competing processes, so both the 1s findBy* budget and the 5s
// per-test budget fire early. Scoped to this file on purpose: a module-level
// configure() only reaches this file's module registry, so the other 83 suites
// keep failing fast and still catch a real multi-second render regression.
configure({ asyncUtilTimeout: 10000 });
vi.setConfig({ testTimeout: 15000, hookTimeout: 15000 });

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

  it("accepts custom fallback prop", () => {
    const fallback = <div data-testid="fallback">Custom Fallback</div>;
    const onError = vi.fn();

    function ChildWithError(): JSX.Element {
      throw new Error("Error");
    }

    render(
      <ErrorBoundary fallback={fallback} onError={onError}>
        <ChildWithError />
      </ErrorBoundary>
    );

    expect(screen.getByTestId("fallback")).toBeInTheDocument();
  });

  it("renders default fallback UI when no custom fallback provided", async () => {
    const onError = vi.fn();

    function ChildWithError(): JSX.Element {
      throw new Error("Error");
    }

    render(
      <ErrorBoundary onError={onError}>
        <ChildWithError />
      </ErrorBoundary>
    );

    // ErrorFallback is lazy-loaded, so we need to wait for the
    // framer-motion animated fallback to fully load (buttons appear)
    expect(await screen.findByRole("button", { name: /try again/i })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /reload page/i })).toBeInTheDocument();
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
