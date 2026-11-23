import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AdminDashboard from "../pages/AdminDashboard";

const { mockFrom, mockAuth } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockAuth: {
    getSession: vi.fn(),
    getUser: vi.fn(),
    signOut: vi.fn(),
  },
}));

vi.mock("../supabaseClient", () => ({
  supabase: {
    from: (...args) => mockFrom(...args),
    auth: mockAuth,
  },
}));

vi.mock("../utils/r2Storage", () => ({
  resolveMediaUrl: vi.fn((url) => url || ""),
}));

describe("AdminDashboard Server-Side Pagination", () => {
  let queryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    mockAuth.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: "admin-123" },
        },
      },
      error: null,
    });
  });

  it("paginates applications tab with 25 items per page and navigates pages", async () => {
    // Generate 30 applications to ensure > 25 items and pagination is triggered
    const mockApps = Array.from({ length: 30 }, (_, i) => ({
      id: `app-${i + 1}`,
      user_id: `user-${i + 1}`,
      org_name: `Architecture Studio ${i + 1}`,
      designer_type: "interior",
      city: "Hyderabad",
      phone: "9876543210",
      email: `designer${i + 1}@example.com`,
      status: "pending",
      created_at: new Date(Date.now() - i * 1000).toISOString(),
    }));

    mockFrom.mockImplementation((table) => {
      if (table === "users") {
        return {
          select: vi.fn((_cols, opts) => {
            if (opts?.head) {
              return {
                eq: vi.fn().mockResolvedValue({ count: 10, error: null }),
              };
            }
            return {
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { role: "admin" },
                  error: null,
                }),
              }),
            };
          }),
        };
      }
      if (table === "designer_applications") {
        const builder = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          range: vi.fn().mockResolvedValue({
            data: mockApps,
            count: 30,
            error: null,
          }),
        };
        return builder;
      }
      if (table === "designers") {
        return {
          select: vi.fn((_cols, opts) => {
            if (opts?.head) {
              return {
                eq: vi.fn().mockResolvedValue({ count: 5, error: null }),
              };
            }
            return {
              order: vi.fn().mockReturnThis(),
              range: vi.fn().mockResolvedValue({
                data: [],
                count: 0,
                error: null,
              }),
            };
          }),
        };
      }
      if (table === "contact_messages") {
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          range: vi.fn().mockResolvedValue({
            data: [],
            count: 0,
            error: null,
          }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
      };
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Switch to Requests (applications) tab
    const requestsBtns = await screen.findAllByRole("button", { name: /requests/i });
    fireEvent.click(requestsBtns[0]);

    // Should display Architecture Studio 1 through 25
    expect(await screen.findByText("Architecture Studio 1")).toBeInTheDocument();
    expect(screen.getByText("Architecture Studio 25")).toBeInTheDocument();
    // Item 26 should be on page 2
    expect(screen.queryByText("Architecture Studio 26")).not.toBeInTheDocument();

    // Check pagination display: Showing 1 to 25 of 30 results
    expect(screen.getByText(/Showing/i)).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();

    // Click Next button
    const nextBtn = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextBtn);

    // Now page 2 should be active: showing Architecture Studio 26 through 30
    expect(await screen.findByText("Architecture Studio 26")).toBeInTheDocument();
    expect(screen.getByText("Architecture Studio 30")).toBeInTheDocument();
    expect(screen.queryByText("Architecture Studio 1")).not.toBeInTheDocument();
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
  });
});
