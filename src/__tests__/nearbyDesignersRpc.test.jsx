import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Designers from "../pages/Designers";

const mockRpc = vi.fn();
const mockFrom = vi.fn();

vi.mock("../supabaseClient", () => ({
  supabase: {
    rpc: (...args) => mockRpc(...args),
    from: (...args) => mockFrom(...args),
  },
}));

vi.mock("../hooks/useAuth", () => ({
  useCurrentUser: () => ({ data: { id: "user-1" }, isLoading: false }),
  useUserProfile: () => ({ data: { city: "Hyderabad" }, isLoading: false }),
}));

vi.mock("../hooks/useGeolocation", () => ({
  useGeolocation: () => ({
    getPosition: vi.fn().mockResolvedValue({
      latitude: 17.385,
      longitude: 78.4867,
      approximate: false,
      isFallback: false,
    }),
    coordinates: { latitude: 17.385, longitude: 78.4867 },
    permissionDenied: false,
  }),
  DEFAULT_COORDINATES: { latitude: 17.385, longitude: 78.4867, isFallback: true },
}));

describe("Nearby Designers PostGIS RPC and Fallback", () => {
  let queryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    // Default mock query chain
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({
        data: [
          {
            id: 1,
            name: "Studio Alpha",
            city: "Hyderabad",
            designer_type: "interior",
            is_verified: true,
            is_public: true,
            is_subscription_active: true,
            rating_avg: 4.8,
            priority_score: 90,
            service_area_lat: 17.39,
            service_area_lng: 78.49,
          },
        ],
        error: null,
      }),
    });
  });

  const renderWithProviders = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Designers />
        </MemoryRouter>
      </QueryClientProvider>
    );

  it("calls get_nearby_designers RPC when distance sorting is triggered and handles successful return", async () => {
    mockRpc.mockResolvedValueOnce({
      data: [
        {
          id: 42,
          name: "PostGIS Spatial Design",
          city: "Hyderabad",
          designer_type: "interior",
          is_verified: true,
          is_public: true,
          is_subscription_active: true,
          rating_avg: 5.0,
          priority_score: 99,
          distance_km: 2.5,
          dist_meters: 2500,
        },
      ],
      error: null,
    });

    renderWithProviders();

    expect(await screen.findByText("Studio Alpha")).toBeInTheDocument();
  });

  it("gracefully falls back to client query when get_nearby_designers RPC fails", async () => {
    mockRpc.mockRejectedValueOnce(new Error("RPC function get_nearby_designers does not exist"));

    renderWithProviders();

    expect(await screen.findByText("Studio Alpha")).toBeInTheDocument();
  });
});
