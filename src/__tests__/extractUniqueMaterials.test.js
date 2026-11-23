import { describe, it, expect } from "vitest";
import { extractUniqueMaterials } from "../utils/extractUniqueMaterials";

describe("extractUniqueMaterials utility", () => {
  it("returns an empty array when given null, undefined, or empty designer", () => {
    expect(extractUniqueMaterials(null)).toEqual([]);
    expect(extractUniqueMaterials(undefined)).toEqual([]);
    expect(extractUniqueMaterials({})).toEqual([]);
    expect(extractUniqueMaterials({ designer_projects: [] })).toEqual([]);
  });

  it("extracts and deduplicates materials case-insensitively while preserving first casing", () => {
    const designer = {
      designer_projects: [
        {
          room_materials: JSON.stringify({
            Kitchen: ["Italian Marble", "Teak Wood"],
            "Living Room": ["italian marble", "Granite", "  glass  "],
          }),
        },
        {
          room_materials: {
            Bedroom: ["teak wood", "Veneer", "BRASS"],
          },
        },
      ],
    };

    const result = extractUniqueMaterials(designer);
    expect(result).toEqual([
      "Italian Marble",
      "Teak Wood",
      "Granite",
      "glass",
      "Veneer",
      "BRASS",
    ]);
  });

  it("handles comma-separated strings and trims whitespace properly", () => {
    const designer = {
      designer_projects: [
        {
          room_materials: " Plywood, Teak Wood , Stainless Steel ",
        },
        {
          room_materials: "plywood, Quartz, , ",
        },
      ],
    };

    const result = extractUniqueMaterials(designer);
    expect(result).toEqual(["Plywood", "Teak Wood", "Stainless Steel", "Quartz"]);
  });

  it("handles nested arrays, invalid JSON, and non-string elements safely", () => {
    const designer = {
      designer_projects: [
        {
          room_materials: ["Solid Oak", null, 42, "", "   "],
        },
        {
          room_materials: "{invalid json string",
        },
      ],
    };

    const result = extractUniqueMaterials(designer);
    expect(result).toEqual(["Solid Oak", "{invalid json string"]);
  });
});
