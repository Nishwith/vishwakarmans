/**
 * Extracts and deduplicates unique materials across all projects for a designer.
 * Case-insensitively deduplicates while preserving the first encountered casing.
 * Trims whitespace and filters out blank or non-string values.
 * Handles room-keyed JSON, arrays, and comma-separated strings.
 */
export const extractUniqueMaterials = (designer) => {
  if (!designer) return [];

  const projects = designer.designer_projects || designer.projects || [];
  const seen = new Set();
  const uniqueMaterials = [];

  const addMaterial = (raw) => {
    if (typeof raw !== "string") return;
    const trimmed = raw.trim();
    if (!trimmed) return;

    const lowerKey = trimmed.toLowerCase();
    if (!seen.has(lowerKey)) {
      seen.add(lowerKey);
      uniqueMaterials.push(trimmed);
    }
  };

  const processValue = (val) => {
    if (!val) return;

    if (Array.isArray(val)) {
      val.forEach(processValue);
      return;
    }

    if (typeof val === "object") {
      Object.values(val).forEach(processValue);
      return;
    }

    if (typeof val === "string") {
      const trimmed = val.trim();
      if (!trimmed) return;

      // Handle JSON string object or array
      if (
        (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
        (trimmed.startsWith("[") && trimmed.endsWith("]"))
      ) {
        try {
          const parsed = JSON.parse(trimmed);
          processValue(parsed);
          return;
        } catch {
          // Fall back to comma-separated parsing
        }
      }

      // Split comma-separated string
      trimmed.split(",").forEach(addMaterial);
    }
  };

  projects.forEach((proj) => {
    if (proj?.room_materials != null) {
      processValue(proj.room_materials);
    }
  });

  return uniqueMaterials;
};

export default extractUniqueMaterials;
