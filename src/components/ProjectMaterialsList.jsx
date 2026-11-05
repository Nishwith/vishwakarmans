import React from "react";
import { getRoomMaterials } from "../utils/projectMaterials";

const ProjectMaterialsList = ({ roomMaterials, room }) => {
  const materials = getRoomMaterials(roomMaterials, room);
  if (materials.length === 0) return null;

  return (
    <section className="space-y-3" aria-labelledby="project-materials-heading">
      <h4 id="project-materials-heading" className="text-xs font-bold uppercase tracking-widest text-gray-400">
        Materials Used
      </h4>
      <p className="text-sm font-bold text-gray-900 font-serif">{room}</p>
      <ul className="flex flex-wrap gap-2" aria-label={`Materials used in ${room}`}>
        {materials.map((material) => (
          <li
            key={material.toLocaleLowerCase()}
            className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm md:text-base font-medium text-gray-700"
          >
            {material}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ProjectMaterialsList;
