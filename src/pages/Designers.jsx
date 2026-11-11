import React, { useEffect, useState, useRef, useMemo } from "react";
import { supabase } from "../supabaseClient";
import {
  Search,
  MapPin,
  Star,
  Clock,
  Tag,
  Layout,
  Building,
  Home,
  CheckCircle,
  ArrowRight,
  ChevronDown,
  Globe,
  Building2,
  Navigation,
  Loader2,
  X,
  SlidersHorizontal,
  Briefcase,
  Award,
  Filter,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import SkeletonCard from "../components/SkeletonCard";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrentUser, useUserProfile } from "../hooks/useAuth";
import { useGeolocation, DEFAULT_COORDINATES } from "../hooks/useGeolocation";
import { isDesignerPubliclyEligible } from "../utils/designerVisibility";
import { PUBLIC_DESIGNER_CARD_COLUMNS } from "../utils/publicDesignerVideo";

// Haversine distance calculation helper (in meters)
const getDistanceBetweenCoords = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// --- CUSTOM CITY DROPDOWN COMPONENT WITH LOCATION ICONS ---
const CityDropdown = ({ selectedCity, setSelectedCity, cities }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getCityIcon = (city) => {
    if (city === "All") return <Globe size={16} className={selectedCity === city ? "text-brand-accent" : "text-gray-400"} />;
    return <Building2 size={16} className={selectedCity === city ? "text-brand-accent" : "text-gray-400"} />;
  };

  return (
    <div className="w-full md:w-52 relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-gray-50 border rounded-xl py-3 px-4 flex items-center justify-between text-sm font-medium text-gray-900 transition-all cursor-pointer ${
          isOpen || selectedCity !== "All"
            ? "border-brand-accent ring-2 ring-brand-accent/20 bg-white"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <MapPin size={18} className={selectedCity !== "All" ? "text-brand-accent" : "text-gray-500"} />
          <span className={selectedCity !== "All" ? "font-bold text-brand-accent" : "text-gray-700"}>
            {selectedCity === "All" ? "All Cities" : selectedCity}
          </span>
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-brand-accent" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-200 max-h-60 overflow-y-auto">
          {cities.map((city) => {
            const isSelected = selectedCity === city;
            return (
              <button
                key={city}
                type="button"
                onClick={() => {
                  setSelectedCity(city);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                  isSelected
                    ? "bg-brand-accent/10 text-brand-accent font-bold"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {getCityIcon(city)}
                <span className="flex-1">{city === "All" ? "All Cities" : city}</span>
                {isSelected && <CheckCircle size={14} className="text-brand-accent ml-auto shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Designers = () => {
  const { data: user } = useCurrentUser();
  const { data: profile } = useUserProfile(user?.id);
  const { getPosition, coordinates, permissionDenied } = useGeolocation();
  const navigate = useNavigate();

  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  // PRIMARY FILTERS & SORTING
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState(() => profile?.city || "All");
  const [selectedType, setSelectedType] = useState("All");
  const [sortBy, setSortBy] = useState("featured"); // "featured", "distance", "rating", "experience"

  // PAGINATION
  const PAGE_SIZE = 20;
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // USER GEOLOCATION COORDINATES FOR DISTANCE CALCULATION
  const [userCoords, setUserCoords] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);

  // ADVANCED FILTERS
  const [radiusKm, setRadiusKm] = useState(50);
  const [minRating, setMinRating] = useState(0);
  const [minExperience, setMinExperience] = useState(0);
  const [minProjects, setMinProjects] = useState(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // COMPARE TOOL STATE
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedCompareIds, setSelectedCompareIds] = useState([]);

  const cities = [
    "All",
    "Hyderabad",
    "Bangalore",
    "Mumbai",
    "Delhi",
    "Chennai",
    "Kolkata",
    ...(profile?.city && !["Hyderabad", "Bangalore", "Mumbai", "Delhi", "Chennai", "Kolkata"].includes(profile.city) ? [profile.city] : []),
  ];

  const categoryPills = [
    { label: "All Categories", value: "All" },
    { label: "Interior", value: "interior" },
    { label: "Commercial", value: "commercial" },
  ];

  const radiusOptions = [
    { label: "5 km", value: 5 },
    { label: "10 km", value: 10 },
    { label: "25 km", value: 25 },
    { label: "50 km", value: 50 },
    { label: "100 km", value: 100 },
  ];

  const ratingOptions = [
    { label: "All Ratings", value: 0 },
    { label: "4.0+ Stars", value: 4.0 },
    { label: "4.5+ Stars", value: 4.5 },
    { label: "4.8+ Stars", value: 4.8 },
  ];

  const experienceOptions = [
    { label: "Any Experience", value: 0 },
    { label: "2+ Years", value: 2 },
    { label: "5+ Years", value: 5 },
    { label: "10+ Years", value: 10 },
  ];

  const projectCountOptions = [
    { label: "Any Count", value: 0 },
    { label: "5+ Projects", value: 5 },
    { label: "10+ Projects", value: 10 },
    { label: "25+ Projects", value: 25 },
  ];

  useEffect(() => {
    if (profile?.city) {
      setSelectedCity(profile.city);
    }
  }, [profile?.city]);

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) setSelectedType(categoryParam);
    fetchDesigners(0, false);
  }, [searchParams]);

  const fetchDesigners = async (targetPage = 0, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    try {
      const from = targetPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("designers")
        .select(PUBLIC_DESIGNER_CARD_COLUMNS)
        .eq("is_verified", true)
        .eq("is_public", true)
        .eq("is_subscription_active", true)
        .order("priority_score", { ascending: false })
        .order("rating_avg", { ascending: false });

      if (typeof query.range === "function") {
        query = query.range(from, to);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter out Expired Profiles
      const now = new Date();
      const validDesigners = (data || []).filter((designer) => isDesignerPubliclyEligible(designer, now));

      // Sort Active Featured Designers to top
      validDesigners.sort((a, b) => {
        const isAFeatured =
          a.featured_status === "featured" &&
          a.featured_expiry &&
          new Date(a.featured_expiry) > now;
        const isBFeatured =
          b.featured_status === "featured" &&
          b.featured_expiry &&
          new Date(b.featured_expiry) > now;

        if (isAFeatured && !isBFeatured) return -1;
        if (!isAFeatured && isBFeatured) return 1;
        return 0;
      });

      if (append) {
        setDesigners((prev) => [...prev, ...validDesigners]);
      } else {
        setDesigners(validDesigners);
      }

      setPage(targetPage);
      setHasMore((data || []).length === PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching designers:", error.message);
      if (!append) setDesigners([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Trigger Geolocation API and query nearby designers via RPC or sort by distance
  const handleSortChange = async (newSort) => {
    setSortBy(newSort);
    if (newSort === "distance") {
      setGeoLoading(true);
      try {
        const coords = await getPosition();
        setUserCoords(coords);
        toast.success(
          coords.isFallback
            ? "Sorting by distance from default location (Hyderabad)!"
            : "Sorting by distance from your location!"
        );
      } catch (err) {
        toast.error("Could not obtain location for distance sorting.");
      } finally {
        setGeoLoading(false);
      }
    }
  };

  // Legacy compat support if invoked
  const handleFindNearby = async (targetRadiusKm = radiusKm) => {
    await handleSortChange("distance");
  };

  const handleClearNearby = () => {
    setSortBy("featured");
    setUserCoords(null);
    setSelectedCity("All");
    fetchDesigners();
    toast.success("Distance sort cleared.");
  };

  const handleRadiusChange = (newRadius) => {
    setRadiusKm(newRadius);
  };

  // Compare selection toggle (Max 3)
  const toggleCompareDesigner = (designerId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const strId = String(designerId);
    setSelectedCompareIds((prev) => {
      if (prev.includes(strId)) {
        return prev.filter((id) => id !== strId);
      }
      if (prev.length >= 3) {
        toast.error("You can compare up to 3 designers at a time.");
        return prev;
      }
      return [...prev, strId];
    });
  };

  // Client-side composite filtering across Category, City, Rating, Experience, Projects & Search, plus Distance Calculation & Sorting
  const filteredDesigners = useMemo(() => {
    const list = (designers || []).filter((designer) => {
      if (!designer) return false;
      // 1. Search Query
      const name = (designer.name || "").toLowerCase();
      const search = (searchTerm || "").toLowerCase().trim();
      const matchesSearch =
        !search ||
        name.includes(search) ||
        (Array.isArray(designer.style_tags) &&
          designer.style_tags.some((tag) =>
            (tag || "").toLowerCase().includes(search)
          ));

      // 2. City
      const matchesCity =
        selectedCity === "All" || selectedCity === "Other" || designer.city === selectedCity;

      // 3. Category / Designer Type
      const matchesType =
        selectedType === "All" ||
        designer.designer_type === selectedType ||
        designer.designer_type === "both";

      // 4. Minimum Rating
      const rating = Number(designer.rating_avg) || 0;
      const matchesRating = minRating === 0 || rating >= minRating;

      // 5. Minimum Experience
      const experience = Number(designer.experience_years) || 0;
      const matchesExperience = minExperience === 0 || experience >= minExperience;

      // 6. Minimum Projects Completed
      const projects = Number(designer.projects_completed) || 0;
      const matchesProjects = minProjects === 0 || projects >= minProjects;

      return (
        matchesSearch &&
        matchesCity &&
        matchesType &&
        matchesRating &&
        matchesExperience &&
        matchesProjects
      );
    });

    // Compute distance if user coordinates are active
    const enrichedList = list.map((d) => {
      let distanceMeters = d.dist_meters != null ? d.dist_meters : null;
      if (
        distanceMeters == null &&
        userCoords?.latitude != null &&
        userCoords?.longitude != null &&
        d.service_area_lat != null &&
        d.service_area_lng != null
      ) {
        const dLat = parseFloat(d.service_area_lat);
        const dLng = parseFloat(d.service_area_lng);
        // Exclude 0,0 default / unset coordinates or invalid numbers
        if (!isNaN(dLat) && !isNaN(dLng) && (Math.abs(dLat) > 0.0001 || Math.abs(dLng) > 0.0001)) {
          distanceMeters = getDistanceBetweenCoords(
            userCoords.latitude,
            userCoords.longitude,
            dLat,
            dLng
          );
        }
      }
      return { ...d, dist_meters: distanceMeters };
    });

    // Apply Sorting
    if (sortBy === "distance") {
      enrichedList.sort((a, b) => {
        if (a.dist_meters == null && b.dist_meters == null) return 0;
        if (a.dist_meters == null) return 1;
        if (b.dist_meters == null) return -1;
        return a.dist_meters - b.dist_meters;
      });
    } else if (sortBy === "rating") {
      enrichedList.sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0));
    } else if (sortBy === "experience") {
      enrichedList.sort((a, b) => (b.experience_years || 0) - (a.experience_years || 0));
    }

    return enrichedList;
  }, [designers, searchTerm, selectedCity, selectedType, minRating, minExperience, minProjects, userCoords, sortBy]);

  // Count active non-default advanced filters
  const activeAdvancedFilterCount = useMemo(() => {
    let count = 0;
    if (minRating > 0) count++;
    if (minExperience > 0) count++;
    if (minProjects > 0) count++;
    if (sortBy === "distance") count++;
    return count;
  }, [minRating, minExperience, minProjects, sortBy]);

  // Handle Clear Filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCity("All");
    setSelectedType("All");
    setMinRating(0);
    setMinExperience(0);
    setMinProjects(0);
    setRadiusKm(50);
    setSortBy("featured");
    setUserCoords(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:px-8 md:py-10">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-8 md:mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 animate-fade-in">
          Find Your Perfect <span className="text-brand-accent">Designer</span>
        </h1>
        <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
          Browse verified top-tier designers for your dream home or office space.
        </p>
      </div>

      {/* FILTER CONTROL CARD */}
      <div className="max-w-7xl mx-auto bg-white border border-gray-200 rounded-3xl p-5 md:p-6 mb-8 shadow-xl sticky top-4 md:top-20 z-30 backdrop-blur-xl bg-white/95">
        {/* ROW 1: SEARCH, CATEGORY PILLS, CITY, & ADVANCED TOGGLE */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
          {/* Search Input */}
          <div className="flex-1 relative min-w-[240px]">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name or style (e.g. Modern, Luxury)..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-sm text-gray-900 focus:outline-none focus:border-brand-accent focus:bg-white transition-all min-h-[46px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Tabs/Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-xl border border-gray-200 shrink-0 overflow-x-auto">
            {categoryPills.map((pill) => {
              const active = selectedType === pill.value;
              return (
                <button
                  key={pill.value}
                  type="button"
                  onClick={() => setSelectedType(pill.value)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? "bg-brand-accent text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          {/* City Dropdown */}
          <CityDropdown
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            cities={cities}
          />

          {/* Sort By Dropdown */}
          <div className="w-full md:w-56 relative">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-semibold text-gray-900 focus:outline-none focus:border-brand-accent cursor-pointer min-h-[46px]"
              aria-label="Sort Designers"
            >
              <option value="featured">Sort by: Featured First</option>
              <option value="distance">Sort by: Distance (Near to Far)</option>
              <option value="rating">Sort by: Highest Rating</option>
              <option value="experience">Sort by: Most Experience</option>
            </select>
          </div>

          {/* Advanced Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-4 py-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[46px] shrink-0 ${
              showAdvancedFilters || activeAdvancedFilterCount > 0
                ? "bg-brand-accent/10 border-brand-accent text-brand-accent"
                : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300"
            }`}
          >
            <SlidersHorizontal size={16} />
            <span>Filters</span>
            {activeAdvancedFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-brand-accent text-white text-[11px] font-bold flex items-center justify-center">
                {activeAdvancedFilterCount}
              </span>
            )}
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${showAdvancedFilters ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* ROW 2: ADVANCED FILTERS DRAWER */}
        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-gray-100 mt-5 pt-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Distance Radius */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                    <Navigation size={13} className="text-brand-accent" />
                    Distance Radius
                  </label>
                  <select
                    value={radiusKm}
                    onChange={(e) => handleRadiusChange(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-brand-accent cursor-pointer"
                  >
                    {radiusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        Within {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Minimum Rating */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                    <Star size={13} className="text-yellow-500" />
                    Minimum Rating
                  </label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-brand-accent cursor-pointer"
                  >
                    {ratingOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Experience */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                    <Clock size={13} className="text-brand-accent" />
                    Experience
                  </label>
                  <select
                    value={minExperience}
                    onChange={(e) => setMinExperience(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-brand-accent cursor-pointer"
                  >
                    {experienceOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Projects Completed */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                    <Award size={13} className="text-brand-accent" />
                    Completed Projects
                  </label>
                  <select
                    value={minProjects}
                    onChange={(e) => setMinProjects(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-brand-accent cursor-pointer"
                  >
                    {projectCountOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reset All Advanced Filters Bar */}
              {activeAdvancedFilterCount > 0 && (
                <div className="flex justify-end mt-4 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setMinRating(0);
                      setMinExperience(0);
                      setMinProjects(0);
                      setRadiusKm(50);
                    }}
                    className="text-xs font-bold text-gray-500 hover:text-brand-accent flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    Reset Advanced Filters
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DISTANCE SORT STATUS BAR */}
      {sortBy === "distance" && (
        <div className="max-w-7xl mx-auto mb-6 flex flex-wrap items-center gap-3">
          <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 animate-fade-in shadow-xs">
            <CheckCircle size={14} className="text-emerald-600" />
            <span>
              Sorted by distance (near to far) {userCoords?.isFallback ? "• Default: Hyderabad" : "• Live GPS"}
            </span>
            <button
              type="button"
              onClick={handleClearNearby}
              className="ml-2 hover:text-emerald-950 font-bold"
              title="Reset to default sort"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* GRID SECTION */}
      <div className="max-w-7xl mx-auto">
        {loading || geoLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <SkeletonCard key={n} />
            ))}
          </div>
        ) : (filteredDesigners?.length || 0) === 0 ? (
          /* POLISHED EMPTY STATE */
          <div className="col-span-full py-20 text-center flex flex-col items-center bg-white border border-gray-100 rounded-3xl p-8 shadow-xs">
            <div className="w-20 h-20 bg-orange-50 border border-orange-100 rounded-full flex items-center justify-center mb-4">
              <Search size={32} className="text-brand-accent" />
            </div>
            {selectedCity !== "All" && selectedCity !== "Other" ? (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No designers found in {selectedCity}
                </h3>
                <p className="text-gray-500 mb-6 text-sm">
                  We don't have registered designers matching this filter in {selectedCity} yet.
                </p>
                <button
                  onClick={() => setSelectedCity("All")}
                  className="px-6 py-2.5 bg-brand-accent text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-md cursor-pointer"
                >
                  View in All Cities
                </button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No designers match your filters
                </h3>
                <p className="text-gray-500 mb-6 text-sm max-w-md">
                  {searchTerm.trim()
                     ? `No designers found matching "${searchTerm}". Try adjusting your keywords or clearing some filters.`
                    : "Try relaxing your minimum rating, experience, or completed project filters to discover more talent."}
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 bg-brand-accent text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-md cursor-pointer"
                >
                  Clear All Filters
                </button>
              </>
            )}
          </div>
        ) : (
          /* DESIGNER CARDS */
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <AnimatePresence>
              {filteredDesigners?.map((designer) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  key={designer?.id}
                >
                  <Link
                    to={`/designers/${designer?.id}`}
                    className="group relative bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 hover:border-brand-accent/50 transition-all hover:shadow-2xl hover:-translate-y-1 flex flex-col h-full"
                  >
                    {/* Header: Logo & Name */}
                    <div className="flex items-start gap-4 mb-4">
                      {/* Compare Checkbox Overlay in Compare Mode */}
                      {isCompareMode && (
                        <div
                          onClick={(e) => toggleCompareDesigner(designer.id, e)}
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                            selectedCompareIds.includes(String(designer.id))
                              ? "bg-brand-accent border-brand-accent text-white"
                              : "bg-white border-gray-300 hover:border-brand-accent text-transparent"
                          }`}
                        >
                          <Check size={14} className="stroke-[3]" />
                        </div>
                      )}

                      <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center text-xl font-bold text-brand-accent border border-gray-100 overflow-hidden shrink-0">
                        {designer?.logo_url ? (
                          <img
                            src={designer.logo_url}
                            alt={designer?.name || "Designer"}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          designer?.name?.charAt(0) || "?"
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-accent transition-colors truncate">
                            {designer?.name || "Unnamed Designer"}
                          </h3>
                          {designer?.is_verified && (
                            <CheckCircle
                              size={16}
                              className="text-brand-accent shrink-0"
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                          <MapPin size={14} className="text-gray-400" />
                          <span>{designer?.city || "Unknown City"}</span>
                          {designer?.dist_meters != null && (
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                              {(designer.dist_meters / 1000).toFixed(1)} km away
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                          Rating
                        </p>
                        <div className="flex items-center gap-1 text-yellow-500 font-bold">
                          <Star size={16} fill="currentColor" />{" "}
                          {(designer?.rating_avg || 0) > 0
                            ? designer.rating_avg.toFixed(1)
                            : "New"}
                        </div>
                      </div>
                      <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                          Experience
                        </p>
                        <div className="flex items-center gap-1 text-gray-900 font-bold">
                          <Clock size={16} className="text-brand-accent" />
                          {designer?.experience_years
                            ? `${designer.experience_years}+ Years`
                            : "Fresher"}
                        </div>
                      </div>
                    </div>

                    {/* Badge & Tags */}
                    <div className="flex-1 mb-6">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {designer?.designer_type && (
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-1 rounded border flex items-center gap-1 ${
                              designer.designer_type === "commercial"
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                : designer.designer_type === "both"
                                ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                : "bg-green-500/10 text-green-400 border-green-500/20"
                            }`}
                          >
                            {designer.designer_type === "commercial" ? (
                              <Building size={12} />
                            ) : designer.designer_type === "both" ? (
                              <Layout size={12} />
                            ) : (
                              <Home size={12} />
                            )}
                            {designer.designer_type === "commercial"
                              ? "Commercial Specialist"
                              : designer.designer_type === "both"
                              ? "Interior & Commercial"
                              : "Interior Specialist"}
                          </span>
                        )}
                        {Array.isArray(designer?.style_tags) &&
                          designer.style_tags.slice(0, 2).map((tag, i) => (
                            <span
                              key={i}
                              className="text-[10px] uppercase font-bold px-2 py-1 rounded border border-gray-200 bg-white/5 text-gray-600 flex items-center gap-1"
                            >
                              <Tag size={10} /> {tag}
                            </span>
                          ))}
                      </div>
                      <p className="text-sm font-medium text-gray-700">
                        Projects Completed: <span className="font-bold text-gray-900">{designer?.projects_completed || 0}</span>
                      </p>
                    </div>

                    {/* Action */}
                    <div className="w-full py-3 bg-white border border-brand-accent text-brand-accent rounded-xl text-center font-bold group-hover:bg-brand-accent group-hover:text-white transition-all flex items-center justify-center gap-2">
                      View Profile <ArrowRight size={18} />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* PAGINATION / LOAD MORE */}
        {!loading && !geoLoading && hasMore && (
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => fetchDesigners(page + 1, true)}
              disabled={loadingMore}
              className="px-8 py-3.5 bg-white border-2 border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white rounded-2xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 inline-flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Loading more designers...</span>
                </>
              ) : (
                <span>Load More Designers</span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* TRUE FLOATING ACTION BUTTON (FAB) FOR COMPARE */}
      <div className="fixed bottom-6 right-6 z-50">
        {selectedCompareIds.length >= 2 ? (
          <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => navigate(`/compare?ids=${selectedCompareIds.join(",")}`)}
              className="flex items-center gap-2.5 bg-brand-accent hover:bg-orange-600 text-white px-6 py-3.5 rounded-full shadow-2xl transition-all font-bold cursor-pointer active:scale-95 border border-white/20"
              aria-label="Compare Now"
            >
              <Sparkles size={18} />
              <span>Compare Now ({selectedCompareIds.length}/3)</span>
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCompareIds([]);
                setIsCompareMode(false);
              }}
              className="p-3.5 bg-gray-900/90 hover:bg-gray-900 text-gray-300 hover:text-white rounded-full shadow-xl transition-all cursor-pointer backdrop-blur-md border border-white/10"
              title="Clear selection"
              aria-label="Clear selection"
            >
              <X size={16} />
            </button>
          </div>
        ) : selectedCompareIds.length === 1 ? (
          <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => {
                if (!isCompareMode) setIsCompareMode(true);
              }}
              className="flex items-center gap-2.5 bg-gray-900 hover:bg-black text-white px-5 py-3 rounded-full shadow-2xl transition-all font-semibold cursor-pointer active:scale-95 border border-white/15"
              aria-label="Compare (1/3) - Select 1 more"
            >
              <Sparkles size={18} className="text-brand-accent" />
              <span>Compare (1/3) • Select 1 more</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCompareIds([]);
                setIsCompareMode(false);
              }}
              className="p-3 bg-gray-900/90 hover:bg-gray-900 text-gray-300 hover:text-white rounded-full shadow-xl transition-all cursor-pointer backdrop-blur-md border border-white/10"
              title="Clear selection"
              aria-label="Clear selection"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsCompareMode(!isCompareMode)}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-full shadow-2xl transition-all font-semibold cursor-pointer active:scale-95 border ${
              isCompareMode
                ? "bg-brand-accent hover:bg-orange-600 text-white border-white/20"
                : "bg-gray-900/95 hover:bg-black text-white border-white/15 backdrop-blur-md"
            }`}
            aria-label={isCompareMode ? "Compare (0/3)" : "Compare Designers"}
          >
            <Sparkles size={18} className={isCompareMode ? "text-white" : "text-brand-accent"} />
            <span>{isCompareMode ? "Compare (0/3)" : "Compare Designers"}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Designers;
