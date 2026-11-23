import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Home from "../pages/Home";
import { DESIGNER_APP_URL } from "../config";

vi.mock("../supabaseClient", () => {
  const createBuilder = () => {
    const builder = {
      select: () => builder,
      eq: () => builder,
      order: () => builder,
      limit: () => Promise.resolve({ data: [], error: null }),
    };
    return builder;
  };
  return {
    supabase: {
      from: () => createBuilder(),
      auth: {
        signOut: vi.fn(),
      },
    },
  };
});

vi.mock("../components/SEO", () => ({
  default: () => null,
}));

let mockUser = null;
let mockProfile = null;

vi.mock("../hooks/useAuth", () => ({
  useCurrentUser: () => ({ data: mockUser, isLoading: false }),
  useUserProfile: () => ({ data: mockProfile, isLoading: false }),
}));

describe("Designer Portal Navigation and Redirection", () => {
  beforeEach(() => {
    mockUser = null;
    mockProfile = null;
  });

  const renderWithProviders = (ui) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{ui}</MemoryRouter>
      </QueryClientProvider>
    );
  };

  it("exports a valid DESIGNER_APP_URL without trailing slashes", () => {
    expect(DESIGNER_APP_URL).toBeTruthy();
    expect(DESIGNER_APP_URL.endsWith("/")).toBe(false);
    expect(DESIGNER_APP_URL).toBe(import.meta.env.VITE_DESIGNER_APP_URL || "https://designers.vishwakarmans.com");
  });

  it("renders 'Go to Dashboard' in Navbar pointing externally to DESIGNER_APP_URL/dashboard for designers", () => {
    mockUser = { id: "designer-1" };
    mockProfile = { id: "designer-1", role: "designer" };

    renderWithProviders(<Navbar />);

    const dashboardLinks = screen.getAllByRole("link", { name: "Go to Dashboard" });
    expect(dashboardLinks.length).toBeGreaterThanOrEqual(1);
    dashboardLinks.forEach((link) => {
      expect(link.tagName).toBe("A");
      expect(link.getAttribute("href")).toBe(`${DESIGNER_APP_URL}/dashboard`);
    });
  });

  it("renders 'Go to Dashboard' in Home hero and bottom CTA pointing externally to DESIGNER_APP_URL/dashboard for designers", async () => {
    mockUser = { id: "designer-1" };
    mockProfile = { id: "designer-1", role: "designer" };

    renderWithProviders(<Home />);

    const dashboardButtons = await screen.findAllByRole("link", { name: /Go to Dashboard/i });
    expect(dashboardButtons.length).toBe(2);
    dashboardButtons.forEach((btn) => {
      expect(btn.tagName).toBe("A");
      expect(btn.getAttribute("href")).toBe(`${DESIGNER_APP_URL}/dashboard`);
    });
  });

  it("renders Footer dashboard link pointing to DESIGNER_APP_URL/dashboard", () => {
    renderWithProviders(<Footer />);

    const footerDashboardLink = screen.getByRole("link", { name: /Dashboard/i });
    expect(footerDashboardLink.tagName).toBe("A");
    expect(footerDashboardLink.getAttribute("href")).toBe(`${DESIGNER_APP_URL}/dashboard`);
  });
});
