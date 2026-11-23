import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CompareDesigners from "../pages/CompareDesigners";
import { supabase } from "../supabaseClient";

vi.mock("../supabaseClient", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock("../utils/r2Storage", () => ({
  resolveMediaUrl: vi.fn((url) => url || ""),
}));

describe("CompareDesigners Materials Row & Comparison Modal", () => {
  const mockDesigners = [
    {
      id: "1",
      name: "Studio Alpha",
      city: "Hyderabad",
      designer_type: "interior",
      about_text: "Top studio",
      logo_url: "alpha.jpg",
      style_tags: ["Modern", "Minimal"],
      experience_years: 5,
      projects_completed: 12,
      rating_avg: 4.8,
      is_verified: true,
      designer_projects: [
        {
          id: "p1",
          title: "Luxury Villa",
          room_materials: JSON.stringify({
            Kitchen: ["Italian Marble", "Teak Wood"],
            Living: ["Glass", "Brass", "Veneer", "Granite", "Quartz"],
          }),
          project_images: [],
        },
      ],
    },
    {
      id: "2",
      name: "Beta Designs",
      city: "Bangalore",
      designer_type: "commercial",
      about_text: "Commercial pros",
      logo_url: "beta.jpg",
      style_tags: ["Industrial"],
      experience_years: 8,
      projects_completed: 20,
      rating_avg: 4.9,
      is_verified: true,
      designer_projects: [
        {
          id: "p2",
          title: "Tech Office",
          room_materials: "Steel, Exposed Brick",
          project_images: [],
        },
      ],
    },
    {
      id: "3",
      name: "Gamma Interiors",
      city: "Kolkata",
      designer_type: "interior",
      about_text: "Boutique",
      logo_url: null,
      style_tags: [],
      experience_years: 2,
      projects_completed: 4,
      rating_avg: 4.5,
      is_verified: true,
      designer_projects: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({
          data: mockDesigners,
          error: null,
        }),
      }),
    });
  });

  const renderComponent = (ids = "1,2,3") => {
    return render(
      <MemoryRouter initialEntries={[`/compare?ids=${ids}`]}>
        <Routes>
          <Route path="/compare" element={<CompareDesigners />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it("renders the Materials Used row with 5 chips and +N more for designer 1", async () => {
    renderComponent();

    expect(await screen.findByText("Studio Alpha")).toBeInTheDocument();
    expect(screen.getByText("Materials Used")).toBeInTheDocument();

    // Studio Alpha has 7 materials: Italian Marble, Teak Wood, Glass, Brass, Veneer, Granite, Quartz
    // First 5 chips should be visible:
    expect(screen.getByText("Italian Marble")).toBeInTheDocument();
    expect(screen.getByText("Teak Wood")).toBeInTheDocument();
    expect(screen.getByText("Glass")).toBeInTheDocument();
    expect(screen.getByText("Brass")).toBeInTheDocument();
    expect(screen.getByText("Veneer")).toBeInTheDocument();

    // +2 more button should be rendered
    const moreBtn = screen.getByTestId("more-materials-btn-1");
    expect(moreBtn).toHaveTextContent("+2 more");

    // Beta Designs has 2 materials: Steel, Exposed Brick
    expect(screen.getByText("Steel")).toBeInTheDocument();
    expect(screen.getByText("Exposed Brick")).toBeInTheDocument();

    // Gamma Interiors has 0 materials -> "Not specified"
    expect(screen.getByText("Not specified")).toBeInTheDocument();
  });

  it("opens modal on +N more click, shows all designers, and closes on Escape", async () => {
    renderComponent();

    const moreBtn = await screen.findByTestId("more-materials-btn-1");
    fireEvent.click(moreBtn);

    // Modal should now be open
    const modal = screen.getByRole("dialog", { name: /materials used comparison/i });
    expect(modal).toBeInTheDocument();

    // In modal, all materials for Studio Alpha are visible, including Granite and Quartz
    const alphaCol = screen.getByTestId("modal-materials-column-1");
    expect(alphaCol).toHaveTextContent("Granite");
    expect(alphaCol).toHaveTextContent("Quartz");

    // Beta Designs column in modal
    const betaCol = screen.getByTestId("modal-materials-column-2");
    expect(betaCol).toHaveTextContent("Steel");
    expect(betaCol).toHaveTextContent("Exposed Brick");

    // Gamma Interiors column in modal
    const gammaCol = screen.getByTestId("modal-materials-column-3");
    expect(gammaCol).toHaveTextContent("No materials specified in projects");

    // Press Escape to close modal
    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: /materials used comparison/i })).not.toBeInTheDocument();
    });
  });

  it("closes modal on Close button click", async () => {
    renderComponent();

    const moreBtn = await screen.findByTestId("more-materials-btn-1");
    fireEvent.click(moreBtn);

    const closeBtn = screen.getByRole("button", { name: /close modal/i });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: /materials used comparison/i })).not.toBeInTheDocument();
    });
  });
});
