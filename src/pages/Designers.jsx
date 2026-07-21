import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import SkeletonCard from "../components/SkeletonCard"; // Import Skeleton
import { motion, AnimatePresence } from "framer-motion";

const Designers = () => {
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  // FILTERS
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedType, setSelectedType] = useState("All");

  const cities = [
    "All",
    "Hyderabad",
    "Bangalore",
    "Mumbai",
    "Delhi",
    "Chennai",
    "Kolkata",
  ];
  const types = [
    { label: "All Types", value: "All" },
    { label: "Interior Designer", value: "interior" },
    { label: "Commercial Designer", value: "commercial" },
  ];

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) setSelectedType(categoryParam);
    fetchDesigners();
  }, [searchParams]);

  const fetchDesigners = async () => {
    try {
      const { data, error } = await supabase
        .from("designers")
        .select("*")
        .eq("is_verified", true)
        .order("priority_score", { ascending: false })
        .order("rating_avg", { ascending: false });

      if (error) throw error;

      // --- NEW LOGIC: Filter out Expired & Private Profiles ---
      const now = new Date();
      const validDesigners = (data || []).filter((designer) => {
        // 1. Check Visibility (Must be Public)
        if (designer.is_public === false) return false;

        // 2. Check Subscription (Must not be expired)
        if (designer.subscription_end) {
          const endDate = new Date(designer.subscription_end);
          if (endDate < now) return false; // Hide if expired
        }

        return true;
      });

      setDesigners(validDesigners);
    } catch (error) {
      console.error("Error fetching designers:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredDesigners = designers.filter((designer) => {
    const matchesSearch =
      designer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (designer.style_tags &&
        designer.style_tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ));
    const matchesCity =
      selectedCity === "All" || designer.city === selectedCity;
    const matchesType =
      selectedType === "All" ||
      designer.designer_type === selectedType ||
      designer.designer_type === "both";
    return matchesSearch && matchesCity && matchesType;
  });

  // Handle Clear Filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCity("All");
    setSelectedType("All");
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-4 pb-20 px-8">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 animate-fade-in">
          Find Your Perfect <span className="text-brand-accent">Designer</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Browse verified top-tier designers for your dream home or office
          space.
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="max-w-7xl mx-auto border border-gray-200 rounded-2xl p-4 md:p-6 mb-12 shadow-2xl sticky top-24 z-30 backdrop-blur-xl bg-white/90">
        <div className="flex flex-col md:flex-row gap-4">
          {/* City Filter */}
          <div className="w-full md:w-48 relative">
            <MapPin
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              size={18}
            />
            <select
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-8 text-gray-900 focus:outline-none focus:border-brand-accent appearance-none cursor-pointer"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="w-full md:w-56 relative">
            <Layout
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              size={18}
            />
            <select
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-8 text-gray-900 focus:outline-none focus:border-brand-accent appearance-none cursor-pointer"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {types.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by name or style (e.g. Modern)..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-900 focus:outline-none focus:border-brand-accent transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* GRID SECTION */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <SkeletonCard key={n} />
            ))}
          </div>
        ) : filteredDesigners.length === 0 ? (
          /* IMPROVED EMPTY STATE */
          <div className="col-span-full py-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <Search size={32} className="text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No designers found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm.trim() === ""
                ? "No designers found for your selected filters"
                : `We couldn't find matches for "${searchTerm}"`}
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-brand-accent text-white rounded-lg font-bold hover:bg-orange-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          /* DESIGNER CARDS */
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
            {filteredDesigners.map((designer) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={designer.id}
              >
                <Link
                  to={`/designers/${designer.id}`}
                  className="group relative bg-white border border-gray-100 rounded-3xl p-8 hover:border-brand-accent/50 transition-all hover:shadow-2xl hover:-translate-y-1 flex flex-col h-full"
                >
                {/* Header: Logo & Name */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center text-xl font-bold text-brand-accent border border-gray-100 overflow-hidden shrink-0">
                    {designer.logo_url ? (
                      <img
                        src={designer.logo_url}
                        alt={designer.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      designer.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-accent transition-colors truncate">
                        {designer.name}
                      </h3>
                      {designer.is_verified && (
                        <CheckCircle
                          size={16}
                          className="text-brand-accent shrink-0"
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <MapPin size={14} /> {designer.city}
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
                      {designer.rating_avg > 0
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
                      {designer.experience_years
                        ? `${designer.experience_years}+ Years`
                        : "Fresher"}
                    </div>
                  </div>
                </div>

                {/* Badge & Tags */}
                <div className="flex-1 mb-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {/* Badge */}
                    {designer.designer_type && (
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
                    {/* Style Tags */}
                    {designer.style_tags &&
                      designer.style_tags.slice(0, 2).map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] uppercase font-bold px-2 py-1 rounded border border-gray-200 bg-white/5 text-gray-600 flex items-center gap-1"
                        >
                          <Tag size={10} /> {tag}
                        </span>
                      ))}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {designer.bio}
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
      </div>
    </div>
  );
};

export default Designers;