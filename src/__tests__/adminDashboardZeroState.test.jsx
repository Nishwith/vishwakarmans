import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminDashboard from "../pages/AdminDashboard";
import { RequireAdmin } from "../components/AuthRoutes";

const mocks = vi.hoisted(() => ({
  userId: "admin-user-id",
  role: "admin",
  from: vi.fn(),
  rpc: vi.fn(),
}));

const mockAuth = vi.hoisted(() => ({
  getSession: vi.fn(async () => ({
    data: { session: { user: { id: mocks.userId } } },
    error: null,
  })),
  getUser: vi.fn(async () => ({
    data: { user: { id: mocks.userId } },
    error: null,
  })),
  onAuthStateChange: vi.fn(() => ({
    data: { subscription: { unsubscribe: vi.fn() } },
  })),
  signOut: vi.fn(async () => ({ error: null })),
}));

const mockSupabase = vi.hoisted(() => ({
  auth: mockAuth,
  from: mocks.from,
  rpc: mocks.rpc,
  functions: { invoke: vi.fn(async () => ({ data: { success: true }, error: null })) },
  storage: {
    from: () => ({
      upload: vi.fn(async () => ({ data: {}, error: null })),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: "https://example.test/logo.png" } })),
    }),
  },
}));

vi.mock("../supabaseClient", () => ({ supabase: mockSupabase }));
vi.mock("../services/supabaseClient", () => ({ supabase: mockSupabase }));

vi.mock("react-hot-toast", () => ({
  default: Object.assign(vi.fn(), {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  }),
}));

describe("AdminDashboard Zero-State and Null-Safety", () => {
  let queryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    });

    mocks.from.mockImplementation((table) => {
      if (table === "users") {
        return {
          select: vi.fn((_cols, options) => {
            if (options?.head) {
              return {
                eq: vi.fn(() => Promise.resolve({ count: 0, error: null })),
              };
            }
            return {
              eq: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: { role: "admin" }, error: null })),
                maybeSingle: vi.fn(() => Promise.resolve({ data: { role: "admin" }, error: null })),
              })),
            };
          }),
        };
      }
      if (table === "designers") {
        return {
          select: vi.fn((_cols, options) => {
            if (options?.head) {
              return {
                eq: vi.fn(() => Promise.resolve({ count: 0, error: null })),
              };
            }
            return {
              order: vi.fn(() => Promise.resolve({ data: [], error: null })),
            };
          }),
        };
      }
      if (table === "designer_applications" || table === "contact_messages") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
            order: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        };
      }
      return {
        select: vi.fn(() => Promise.resolve({ data: [], error: null })),
      };
    });
  });

  it("renders cleanly on completely empty database without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/admin"]}>
          <Routes>
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Total Clients")).toBeInTheDocument();
      expect(screen.getByText("Total Designers")).toBeInTheDocument();
      expect(screen.getByText("Verified Designers")).toBeInTheDocument();
      expect(screen.getByText("Inbox Messages")).toBeInTheDocument();
    });

    expect(screen.getByText("Pending Featured Requests")).toBeInTheDocument();
    expect(screen.getByText("No pending feature requests.")).toBeInTheDocument();
    expect(screen.getByText("Live Leaderboard")).toBeInTheDocument();
    expect(screen.getByText("No active featured designers.")).toBeInTheDocument();
  });

  it("handles designer records with missing/null properties without throwing", async () => {
    mocks.from.mockImplementation((table) => {
      if (table === "users") {
        return {
          select: vi.fn((_cols, options) => {
            if (options?.head) {
              return { eq: vi.fn(() => Promise.resolve({ count: 1, error: null })) };
            }
            return {
              eq: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: { role: "admin" }, error: null })),
                maybeSingle: vi.fn(() => Promise.resolve({ data: { role: "admin" }, error: null })),
              })),
            };
          }),
        };
      }
      if (table === "designers") {
        return {
          select: vi.fn((_cols, options) => {
            if (options?.head) {
              return { eq: vi.fn(() => Promise.resolve({ count: 1, error: null })) };
            }
            return {
              order: vi.fn(() =>
                Promise.resolve({
                  data: [
                    {
                      id: "malformed-1",
                      name: null,
                      email: null,
                      phone: null,
                      city: null,
                      is_verified: true,
                      featured_status: "featured",
                      featured_expiry: null,
                      priority_score: null,
                    },
                    {
                      id: "malformed-2",
                      name: undefined,
                      email: undefined,
                      phone: 9876543210, // numeric phone edge case
                      city: "Hyderabad",
                      is_verified: false,
                      featured_status: "requested",
                      priority_score: 50,
                    },
                  ],
                  error: null,
                })
              ),
            };
          }),
        };
      }
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      };
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/admin"]}>
          <Routes>
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Total Clients")).toBeInTheDocument();
      expect(screen.getByText("Pending Featured Requests")).toBeInTheDocument();
    });

    // Should safely display the fallback without throwing TypeError: Cannot read properties of undefined (reading 'toLowerCase')
    expect(screen.getByText("Unnamed Designer")).toBeInTheDocument();
  });

  it("allows RequireAdmin to evaluate admin authorization when user profile is null", async () => {
    // When DB is wiped clean, getUser returns user, but users table has no row
    mocks.from.mockImplementation((table) => {
      if (table === "users") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: null, error: { code: "PGRST116" } })),
              maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
            })),
          })),
        };
      }
      return {
        select: vi.fn(() => Promise.resolve({ data: [], error: null })),
      };
    });

    // Server admin check RPC succeeds
    mocks.rpc.mockImplementation((fn) => {
      if (fn === "is_admin") return Promise.resolve({ data: true, error: null });
      return Promise.resolve({ data: null, error: null });
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/admin"]}>
          <Routes>
            <Route element={<RequireAdmin />}>
              <Route path="/admin" element={<div>Admin Content Reached</div>} />
            </Route>
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Admin Content Reached")).toBeInTheDocument();
    });
  });

  it("instantly redirects to /login when session is missing in RequireAdmin", async () => {
    mockAuth.getSession.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/admin"]}>
          <Routes>
            <Route element={<RequireAdmin />}>
              <Route path="/admin" element={<div>Admin Content Reached</div>} />
            </Route>
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Login Page")).toBeInTheDocument();
    });
  });
});

