import React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProjectMaterialsList from "../components/ProjectMaterialsList";
import { getRoomMaterials, normalizeMaterials } from "../utils/projectMaterials";

describe("public project materials", () => {
  it("renders array entries as individual chips in a responsive wrapping list", () => {
    render(
      <ProjectMaterialsList
        room="Kitchen"
        roomMaterials={{ Kitchen: ["Plywood", "Teak Wood", "Marble", "Granite"] }}
      />
    );

    const list = screen.getByRole("list", { name: "Materials used in Kitchen" });
    expect(within(list).getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "Plywood", "Teak Wood", "Marble", "Granite",
    ]);
    expect(list).toHaveClass("flex-wrap");
    expect(within(list).getByText("Plywood")).toHaveClass("md:text-base");
  });

  it("splits comma-separated room values and trims whitespace", () => {
    expect(getRoomMaterials('{"Kitchen":" Plywood, Teak Wood , Marble "}', "Kitchen"))
      .toEqual(["Plywood", "Teak Wood", "Marble"]);
  });

  it("accepts legacy project-level arrays and comma-separated strings", () => {
    expect(getRoomMaterials(["Plywood", "Teak Wood"], "Kitchen"))
      .toEqual(["Plywood", "Teak Wood"]);
    expect(getRoomMaterials("Plywood, Teak Wood", "Kitchen"))
      .toEqual(["Plywood", "Teak Wood"]);
  });

  it.each([null, undefined, "", " ,  , ", { Kitchen: [] }, { Kitchen: null }])(
    "does not render a materials section for empty value %s",
    (roomMaterials) => {
      const { container } = render(<ProjectMaterialsList room="Kitchen" roomMaterials={roomMaterials} />);
      expect(container).toBeEmptyDOMElement();
    }
  );

  it("removes duplicate materials without changing the first spelling", () => {
    expect(normalizeMaterials(["Plywood", " plywood ", "TEAK WOOD", "Teak Wood"]))
      .toEqual(["Plywood", "TEAK WOOD"]);
  });

  it("omits non-string and blank entries", () => {
    expect(normalizeMaterials([" Marble ", "", "  ", null, 42])).toEqual(["Marble"]);
  });
});
