/**
 * @fileoverview Tests for the useOnlineStatus hook.
 *
 * Verifies that the hook correctly:
 * - Returns navigator.onLine as initial state
 * - Updates when online/offline events fire
 * - Cleans up event listeners on unmount
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOnlineStatus } from "./useOnlineStatus";

describe("useOnlineStatus", () => {
  beforeEach(() => {
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return isOnline=true when navigator.onLine is true", () => {
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current.isOnline).toBe(true);
  });

  it("should return isOnline=false when navigator.onLine is false", () => {
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: false,
    });

    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current.isOnline).toBe(false);
  });

  it("should update isOnline to false when offline event fires", () => {
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current.isOnline).toBe(true);

    act(() => {
      Object.defineProperty(window.navigator, "onLine", {
        configurable: true,
        value: false,
      });
      window.dispatchEvent(new Event("offline"));
    });

    expect(result.current.isOnline).toBe(false);
  });

  it("should update isOnline to true when online event fires", () => {
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: false,
    });

    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current.isOnline).toBe(false);

    act(() => {
      Object.defineProperty(window.navigator, "onLine", {
        configurable: true,
        value: true,
      });
      window.dispatchEvent(new Event("online"));
    });

    expect(result.current.isOnline).toBe(true);
  });

  it("should remove event listeners on unmount", () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useOnlineStatus());

    expect(addEventListenerSpy).toHaveBeenCalledWith("online", expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith("offline", expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("online", expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith("offline", expect.any(Function));
  });

  it("should use stable handler references via useCallback", () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");

    const { result, unmount } = renderHook(() => useOnlineStatus());

    const calls = addEventListenerSpy.mock.calls as Array<[string, EventListener]>;

    const onlineHandler = calls.find(([event]) => event === "online")?.[1];
    const offlineHandler = calls.find(([event]) => event === "offline")?.[1];

    expect(onlineHandler).toBeDefined();
    expect(offlineHandler).toBeDefined();

    act(() => {
      Object.defineProperty(window.navigator, "onLine", {
        configurable: true,
        value: false,
      });
      offlineHandler!(new Event("offline"));
    });

    expect(result.current.isOnline).toBe(false);

    act(() => {
      Object.defineProperty(window.navigator, "onLine", {
        configurable: true,
        value: true,
      });
      onlineHandler!(new Event("online"));
    });

    expect(result.current.isOnline).toBe(true);

    unmount();
  });
});
