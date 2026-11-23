import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Designers from "../pages/Designers";

const mockFrom = vi.fn();

vi.mock("../supabaseClient", () => ({
  supabase: {
    from: (...args) => mockFrom(...args),
  },
}));

vi.mock("../hooks/useAuth", () => ({
  useCurrentUser: () => ({ data: { id: "user-1" }, isLoading: false }),
  useUserProfile: () => ({ data: { city: "Hyderabad" }, isLoading: false }),
}));

vi.mock("../hooks/useGeolocation", () => ({
  useGeolocation: () => ({
    getPosition: vi.fn(),
    coordinates: null,
    permissionDenied: false,
  }),
}));

describe("Designers Directory Server-Side Pagination and Filter Reset", () => {
  let queryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("fetches page 0 with range and sets hasMore when 21 items are returned", async () => {
    // Return 21 designers so hasNextPage is true
    const mockBatch1 = Array.from({ length: 21 }, (_, i) => ({
      id: i + 1,
      name: `Designer ${i + 1}`,
      city: "Hyderabad",
      designer_type: "interior",
      is_verified: true,
      is_public: true,
      is_subscription_active: true,
      rating_avg: 4.8,
      priority_score: 100 - i,
    }));

    const mockBatch2 = Array.from({ length: 5 }, (_, i) => ({
      id: i + 22,
      name: `Designer ${i + 22}`,
      city: "Hyderabad",
      designer_type: "interior",
      is_verified: true,
      is_public: true,
      is_subscription_active: true,
      rating_avg: 4.8,
      priority_score: 50 - i,
    }));

    const rangeMock = vi
      .fn()
      .mockResolvedValueOnce({
        data: mockBatch1,
        error: null,
      })
      .mockResolvedValueOnce({
        data: mockBatch2,
        error: null,
      });

    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: rangeMock,
    };
    mockFrom.mockReturnValue(builder);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Designers />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Should render first 20 items and Load More button
    expect(await screen.findByText("Designer 1")).toBeInTheDocument();
    expect(screen.getByText("Designer 20")).toBeInTheDocument();
    expect(screen.queryByText("Designer 21")).not.toBeInTheDocument();

    const loadMoreBtn = screen.getByRole("button", { name: /load more designers/i });
    expect(loadMoreBtn).toBeInTheDocument();

    // Verify range call on page 0 was 0 to 20 (for 20 cards + 1 peek)
    expect(rangeMock).toHaveBeenCalledWith(0, 20);

    // Clicking Load More fetches next range (20 to 40)
    fireEvent.click(loadMoreBtn);

    await waitFor(() => {
      expect(rangeMock).toHaveBeenCalledWith(20, 40);
    });
  });

  it("resets pagination to page 0 when search filter changes", async () => {
    const mockData = [
      {
        id: 1,
        name: "Studio Luxe",
        city: "Hyderabad",
        designer_type: "interior",
        is_verified: true,
        is_public: true,
        is_subscription_active: true,
        rating_avg: 4.9,
        priority_score: 95,
      },
    ];

    const rangeMock = vi.fn().mockResolvedValue({
      data: mockData,
      error: null,
    });

    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: rangeMock,
    };
    mockFrom.mockReturnValue(builder);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Designers />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText("Studio Luxe")).toBeInTheDocument();
    expect(rangeMock).toHaveBeenCalledWith(0, 20);

    // Type in search bar
    const searchInput = screen.getByPlaceholderText(/search by name or style/i);
    fireEvent.change(searchInput, { target: { value: "Minimal" } });

    // Debounced query should re-trigger range(0, 20)
    await waitFor(() => {
      expect(builder.ilike).toHaveBeenCalledWith("name", "%Minimal%");
      expect(rangeMock).toHaveBeenLastCalledWith(0, 20);
    });
  });
});
