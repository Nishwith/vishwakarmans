import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi } from "vitest";
import CityCategoryPage, {
  formatDisplayTerm,
  mapCategoryToDb,
} from "../pages/CityCategoryPage";

// Mock the child Designers component to focus test on CityCategoryPage logic & SEO
vi.mock("../pages/Designers", () => ({
  default: vi.fn(({ formattedCity, category, hideHeader }) => (
    <div data-testid="mock-designers-grid">
      <span>Mock Designers Grid</span>
      <span data-testid="grid-city">{formattedCity}</span>
      <span data-testid="grid-category">{category}</span>
      <span data-testid="grid-hide-header">{String(hideHeader)}</span>
    </div>
  )),
}));

describe("CityCategoryPage helper functions", () => {
  it("formats category and city parameters replacing hyphens and capitalizing words", () => {
    expect(formatDisplayTerm("commercial")).toBe("Commercial");
    expect(formatDisplayTerm("hyderabad")).toBe("Hyderabad");
    expect(formatDisplayTerm("home-interior")).toBe("Home Interior");
    expect(formatDisplayTerm("new-delhi")).toBe("New Delhi");
  });

  it("maps URL category to strict database categories", () => {
    // home and interior -> Interior
    expect(mapCategoryToDb("home")).toBe("Interior");
    expect(mapCategoryToDb("interior")).toBe("Interior");
    expect(mapCategoryToDb("home-interior")).toBe("Interior");

    // office, commercial, and exterior -> Commercial
    expect(mapCategoryToDb("office")).toBe("Commercial");
    expect(mapCategoryToDb("commercial")).toBe("Commercial");
    expect(mapCategoryToDb("exterior")).toBe("Commercial");
    expect(mapCategoryToDb("office-spaces")).toBe("Commercial");
  });
});

describe("CityCategoryPage Component Rendering", () => {
  const renderWithRouter = (initialRoute) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return render(
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[initialRoute]}>
            <Routes>
              <Route
                path="/designers/:category/:city"
                element={<CityCategoryPage />}
              />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </HelmetProvider>
    );
  };

  it("renders H1, semantic description, and passes mapped props to designer grid", () => {
    renderWithRouter("/designers/commercial/hyderabad");

    // Check H1
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Best Commercial Designers in Hyderabad");

    // Check description paragraph
    expect(
      screen.getByText(/Find the best commercial designers in Hyderabad/i)
    ).toBeInTheDocument();

    // Check designer grid received formatted city and mapped DB category
    expect(screen.getByTestId("grid-city")).toHaveTextContent("Hyderabad");
    expect(screen.getByTestId("grid-category")).toHaveTextContent("Commercial");
    expect(screen.getByTestId("grid-hide-header")).toHaveTextContent("true");
  });

  it("correctly handles interior category and hyphenated cities", () => {
    renderWithRouter("/designers/home/new-delhi");

    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Best Home Designers in New Delhi");

    expect(screen.getByTestId("grid-city")).toHaveTextContent("New Delhi");
    expect(screen.getByTestId("grid-category")).toHaveTextContent("Interior");
  });
});
