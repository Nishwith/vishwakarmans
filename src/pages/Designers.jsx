import React, { useEffect, useState, useRef } from "react";
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
} from "lucide-react";
import toast from "react-hot-toast";
import { Link, useSearchParams } from "react-router-dom";
import SkeletonCard from "../components/SkeletonCard"; // Import Skeleton
import { motion, AnimatePresence } from "framer-motion";
import { useCurrentUser, useUserProfile } from "../hooks/useAuth";
import { isDesignerPubliclyEligible } from "../utils/designerVisibility";

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

  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  // FILTERS
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedType, setSelectedType] = useState("All");

  // NEARBY RADIUS SEARCH STATE
  const [geoLoading, setGeoLoading] = useState(false);
  const [isNearbyActive, setIsNearbyActive] = useState(false);

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
  const types = [
    { label: "All Types", value: "All" },
    { label: "Interior Designer", value: "interior" },
    { label: "Commercial Designer", value: "commercial" },
  ];

  useEffect(() => {
    if (profile?.city) {
      setSelectedCity(profile.city);
    }
  }, [profile]);

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
        .eq("is_public", true)
        .eq("is_subscription_active", true)
        .order("priority_score", { ascending: false })
        .order("rating_avg", { ascending: false });

      if (error) throw error;

      // --- Filter out Expired Profiles ---
      const now = new Date();
      const validDesigners = (data || []).filter((designer) => isDesignerPubliclyEligible(designer, now));

      // --- Sort Active Featured Designers to top ---
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

      setDesigners(validDesigners);
    } catch (error) {
      console.error("Error fetching designers:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Trigger Geolocation API and query nearby designers via RPC
  const handleFindNearby = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const { data, error } = await supabase.rpc("get_designers_nearby", {
            user_lat: latitude,
            user_lng: longitude,
            radius_meters: 50000, // default to 50km radius
          });

          if (error) throw error;

          const nearbyList = data || [];
          setDesigners(nearbyList);
          setIsNearbyActive(true);
          setSelectedCity("All");

          if (nearbyList.length === 0) {
            toast("No designers found within 50km of your location.", { icon: "📍" });
          } else {
            toast.success(`Found ${nearbyList.length} designers near you!`);
          }
        } catch (err) {
          console.error("Nearby search error:", err);
          toast.error(err.message || "Failed to find nearby designers.");
        } finally {
          setGeoLoading(false);
        }
      },
      (geoError) => {
        setGeoLoading(false);
        console.error("Geolocation error:", geoError);
        let message = "Unable to retrieve your location.";
        if (geoError.code === 1) {
          message = "Location permission denied. Please allow location access in your browser settings.";
        } else if (geoError.code === 2) {
          message = "Location position unavailable.";
        } else if (geoError.code === 3) {
          message = "Location request timed out.";
        }
        toast.error(message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleClearNearby = () => {
    setIsNearbyActive(false);
    setSelectedCity("All");
    fetchDesigners();
    toast.success("Nearby filter cleared.");
  };

  const filteredDesigners = designers.filter((designer) => {
    const matchesSearch =
      designer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (designer.style_tags &&
        designer.style_tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ));
    const matchesCity =
      selectedCity === "All" || selectedCity === "Other" || designer.city === selectedCity;
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
    if (isNearbyActive) {
      setIsNearbyActive(false);
      fetchDesigners();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:px-8 md:py-10">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-8 md:mb-12 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 animate-fade-in">
          Find Your Perfect <span className="text-brand-accent">Designer</span>
        </h1>
        <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
          Browse verified top-tier designers for your dream home or office
          space.
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="max-w-7xl mx-auto border border-gray-200 rounded-2xl p-4 md:p-6 mb-8 md:mb-12 shadow-2xl sticky top-4 md:top-24 z-30 backdrop-blur-xl bg-white/90">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Custom City Filter Dropdown */}
          <CityDropdown
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            cities={cities}
          />

          {/* Type Filter */}
          <div className="w-full md:w-56 relative">
            <Layout
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              size={18}
            />
            <select
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-8 text-gray-900 focus:outline-none focus:border-brand-accent appearance-none cursor-pointer min-h-[48px]"
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
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-900 focus:outline-none focus:border-brand-accent transition-colors min-h-[48px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* NEARBY FILTER ACTION BAR ABOVE GRID */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleFindNearby}
            disabled={geoLoading}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2.5 transition-all shadow-sm cursor-pointer ${
              isNearbyActive
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                : "bg-gray-900 hover:bg-black text-white active:scale-95"
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {geoLoading ? (
              <>
                <Loader2 size={18} className="animate-spin text-brand-accent" />
                <span>Locating Designers...</span>
              </>
            ) : (
              <>
                <Navigation size={18} className={isNearbyActive ? "text-white" : "text-brand-accent"} />
                <span>Find Designers Near Me</span>
              </>
            )}
          </button>

          {isNearbyActive && (
            <button
              type="button"
              onClick={handleClearNearby}
              className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <X size={16} />
              <span>Clear Filter</span>
            </button>
          )}
        </div>

        {isNearbyActive && (
          <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 animate-fade-in shadow-xs">
            <CheckCircle size={14} className="text-emerald-600" />
            <span>Showing designers within 50km radius ({filteredDesigners.length} found)</span>
          </div>
        )}
      </div>

      {/* GRID SECTION */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <SkeletonCard key={n} />
            ))}
          </div>
        ) : filteredDesigners.length === 0 ? (
          /* IMPROVED EMPTY STATE */
          <div className="col-span-full py-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search size={32} className="text-gray-500" />
            </div>
            {isNearbyActive ? (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No designers found near your location
                </h3>
                <p className="text-gray-500 mb-6 max-w-md">
                  We couldn't find any registered designers within a 50km radius. Try clearing the filter to view all available designers.
                </p>
                <button
                  onClick={handleClearNearby}
                  className="px-6 py-2.5 bg-brand-accent text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-md cursor-pointer"
                >
                  Clear Filter & View All
                </button>
              </>
            ) : selectedCity !== "All" && selectedCity !== "Other" ? (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  We don't have designers in that city yet.
                </h3>
                <p className="text-gray-500 mb-6">
                  Check out available designers across all cities.
                </p>
                <button
                  onClick={() => setSelectedCity("All")}
                  className="px-6 py-2.5 bg-brand-accent text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-md cursor-pointer"
                >
                  View in All
                </button>
              </>
            ) : (
              <>
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
                  className="px-6 py-2.5 bg-brand-accent text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-md cursor-pointer"
                >
                  Clear Filters
                </button>
              </>
            )}
          </div>
        ) : (
          /* DESIGNER CARDS */
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
                  className="group relative bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 hover:border-brand-accent/50 transition-all hover:shadow-2xl hover:-translate-y-1 flex flex-col h-full"
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
                  <p className="text-sm font-medium text-gray-700">
                    Projects Completed: <span className="font-bold text-gray-900">{designer.projects_completed || 0}</span>
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
