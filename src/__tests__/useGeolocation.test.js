import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGeolocation, DEFAULT_COORDINATES } from "../hooks/useGeolocation";

describe("useGeolocation hook", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns user coordinates when geolocation permission is granted", async () => {
    const mockGetCurrentPosition = vi.fn((success) => {
      success({
        coords: {
          latitude: 12.9716,
          longitude: 77.5946,
        },
      });
    });

    vi.stubGlobal("navigator", {
      ...globalThis.navigator,
      geolocation: {
        getCurrentPosition: mockGetCurrentPosition,
      },
    });

    const { result } = renderHook(() => useGeolocation());

    let coords;
    await act(async () => {
      coords = await result.current.getPosition();
    });

    expect(mockGetCurrentPosition).toHaveBeenCalled();
    expect(coords.latitude).toBe(12.9716);
    expect(coords.longitude).toBe(77.5946);
    expect(coords.isFallback).toBe(false);
    expect(result.current.permissionDenied).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("falls back to default Hyderabad coordinates when geolocation permission is denied", async () => {
    const mockGetCurrentPosition = vi.fn((_success, error) => {
      error({
        code: 1, // PERMISSION_DENIED
        message: "User denied Geolocation",
      });
    });

    vi.stubGlobal("navigator", {
      ...globalThis.navigator,
      geolocation: {
        getCurrentPosition: mockGetCurrentPosition,
      },
    });

    const { result } = renderHook(() => useGeolocation());

    let coords;
    await act(async () => {
      coords = await result.current.getPosition();
    });

    expect(coords.latitude).toBe(DEFAULT_COORDINATES.latitude);
    expect(coords.longitude).toBe(DEFAULT_COORDINATES.longitude);
    expect(coords.isFallback).toBe(true);
    expect(result.current.permissionDenied).toBe(true);
    expect(result.current.error).toMatch(/permission denied/i);
  });
});

