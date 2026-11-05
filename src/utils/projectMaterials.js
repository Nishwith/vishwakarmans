const parseStoredMaterials = (value) => {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  if (!trimmed) return [];

  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
};

const splitMaterialValue = (value) => {
  const parsed = parseStoredMaterials(value);
  if (Array.isArray(parsed)) return parsed.flatMap(splitMaterialValue);
  if (typeof parsed === "string") return parsed.split(",");
  return [];
};

export const normalizeMaterials = (value) => {
  const seen = new Set();
  return splitMaterialValue(value).reduce((materials, entry) => {
    if (typeof entry !== "string") return materials;
    const material = entry.trim();
    if (!material) return materials;

    const dedupeKey = material.toLocaleLowerCase();
    if (seen.has(dedupeKey)) return materials;
    seen.add(dedupeKey);
    materials.push(material);
    return materials;
  }, []);
};

export const getRoomMaterials = (storedRoomMaterials, room) => {
  const parsed = parseStoredMaterials(storedRoomMaterials);
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    return normalizeMaterials(parsed[room]);
  }

  // Accept legacy project-level arrays/text as well as room-keyed JSON.
  return normalizeMaterials(parsed);
};
