import React from "react";
import { useParams } from "react-router-dom";
import SEO from "../components/SEO";
import Designers from "./Designers";

export const formatDisplayTerm = (str) => {
  if (!str) return "";
  return str
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const mapCategoryToDb = (cat) => {
  const normalized = (cat || "").toLowerCase().trim();
  if (
    normalized === "home" ||
    normalized === "interior" ||
    normalized.includes("home") ||
    normalized.includes("interior")
  ) {
    return "Interior";
  }
  if (
    normalized === "office" ||
    normalized === "commercial" ||
    normalized === "exterior" ||
    normalized.includes("office") ||
    normalized.includes("commercial") ||
    normalized.includes("exterior")
  ) {
    return "Commercial";
  }
  return "Interior";
};

export const getPageHeading = (formattedCategory, formattedCity) => {
  const cleanCat = (formattedCategory || "").replace(/\bdesigners?\b/gi, "").trim();
  return `Best ${cleanCat || formattedCategory} Designers in ${formattedCity}`;
};

const CityCategoryPage = () => {
  const { category, city } = useParams();

  const formattedCategory = formatDisplayTerm(category);
  const formattedCity = formatDisplayTerm(city);
  const mappedCategory = mapCategoryToDb(category);
  const normalizedCategorySlug = mappedCategory.toLowerCase();
  const normalizedCitySlug = (city || "").toLowerCase().trim().replace(/\s+/g, "-");
  const headingText = getPageHeading(formattedCategory, formattedCity);

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={`Top ${formattedCategory} Designers in ${formattedCity} | Vishwakarmans`}
        description={`Find the best ${formattedCategory} designers in ${formattedCity}. Browse premium portfolios for your next project.`}
        keywords={`${formattedCategory} designers ${formattedCity}, top ${formattedCategory} interiors, Vishwakarmans`}
        canonical={`https://vishwakarmans.com/designers/${normalizedCategorySlug}/${normalizedCitySlug}`}
      />

      <div className="max-w-7xl mx-auto pt-8 pb-2 px-4 sm:px-6 md:px-8 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 animate-fade-in">
          {headingText}
        </h1>
        <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
          Find the best {formattedCategory.toLowerCase()} designers in {formattedCity}. Browse premium portfolios, compare verified designers, and connect for your next project.
        </p>
      </div>

      <Designers
        formattedCity={formattedCity}
        city={formattedCity}
        category={mappedCategory}
        mappedCategory={mappedCategory}
        hideHeader={true}
      />
    </div>
  );
};

export default CityCategoryPage;
