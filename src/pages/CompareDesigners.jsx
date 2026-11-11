import React, { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Briefcase,
  CheckCircle,
  Tag,
  ArrowRight,
  Sparkles,
  Loader2,
  Building,
  Home,
  Layout,
  ExternalLink,
  Video,
  Play,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { getYouTubeEmbedUrl } from "../utils/publicDesignerVideo";

const CompareDesigners = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    designerName: "",
    images: [],
    currentIndex: 0,
  });

  const idsParam = searchParams.get("ids") || "";
  const designerIds = idsParam
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  useEffect(() => {
    if (designerIds.length === 0) {
      setLoading(false);
      return;
    }

    const fetchComparedProfiles = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("designers")
          .select(
            "id, name, city, designer_type, about_text, logo_url, style_tags, experience_years, projects_completed, rating_avg, is_verified, service_area_lat, service_area_lng, website_url, video_link, video_link_1, video_link_2, videos_approved, designer_projects(id, title, project_images(image_url, is_cover))"
          )
          .in("id", designerIds);

        if (error) throw error;

        // Keep order matching query parameter
        const sorted = (data || []).sort(
          (a, b) => designerIds.indexOf(String(a.id)) - designerIds.indexOf(String(b.id))
        );
        setDesigners(sorted);
      } catch (err) {
        console.error("Error loading comparison profiles:", err);
        toast.error("Failed to load designer profiles for comparison.");
      } finally {
        setLoading(false);
      }
    };

    fetchComparedProfiles();
  }, [idsParam]);

  const getPortfolioThumbnails = (designer) => {
    const images = [];
    (designer?.designer_projects || []).forEach((proj) => {
      (proj?.project_images || []).forEach((img) => {
        if (img?.image_url && images.length < 3) {
          images.push(img.image_url);
        }
      });
    });
    return images;
  };

  const getVideoLinks = (designer) => {
    if (!designer?.videos_approved) return [];
    const links = [];
    const v1 = designer?.video_link_1 || designer?.video_link;
    const v2 = designer?.video_link_2;
    if (v1 && v1.trim()) links.push(v1.trim());
    if (v2 && v2.trim() && v2.trim() !== v1?.trim()) links.push(v2.trim());
    return links;
  };

  const getAllPortfolioImages = (designer) => {
    const images = [];
    (designer?.designer_projects || []).forEach((proj) => {
      (proj?.project_images || []).forEach((img) => {
        if (img?.image_url) {
          images.push({
            url: img.image_url,
            title: proj.title || "Portfolio Project",
          });
        }
      });
    });
    return images;
  };

  const openPreview = (designer, initialIndex = 0) => {
    const allImages = getAllPortfolioImages(designer);
    if (allImages.length === 0) return;
    setPreviewModal({
      isOpen: true,
      designerName: designer.name || "Designer Portfolio",
      images: allImages,
      currentIndex: Math.min(initialIndex, allImages.length - 1),
    });
  };

  const closePreview = () => {
    setPreviewModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handlePrevImage = () => {
    setPreviewModal((prev) => {
      if (prev.images.length === 0) return prev;
      return {
        ...prev,
        currentIndex:
          (prev.currentIndex - 1 + prev.images.length) % prev.images.length,
      };
    });
  };

  const handleNextImage = () => {
    setPreviewModal((prev) => {
      if (prev.images.length === 0) return prev;
      return {
        ...prev,
        currentIndex: (prev.currentIndex + 1) % prev.images.length,
      };
    });
  };

  useEffect(() => {
    if (!previewModal.isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closePreview();
      if (e.key === "ArrowLeft") handlePrevImage();
      if (e.key === "ArrowRight") handleNextImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewModal.isOpen, previewModal.images.length]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
        <Loader2 className="animate-spin text-brand-accent mb-3" size={36} />
        <p className="text-gray-500 font-medium">Loading comparative analysis...</p>
      </div>
    );
  }

  if (designers.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-gray-200 rounded-3xl p-10 shadow-sm">
          <Sparkles className="mx-auto text-brand-accent mb-4" size={40} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Designers Selected</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
            Select 2 or 3 verified designers from the marketplace to compare their experience, ratings, completed projects, and style specializations side-by-side.
          </p>
          <Link
            to="/designers"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-accent text-white font-bold rounded-xl shadow-md hover:bg-orange-600 transition-all"
          >
            <ArrowLeft size={16} /> Browse Designers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Link & Header */}
        <div className="mb-8">
          <Link
            to="/designers"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-brand-accent transition-colors mb-4"
          >
            <ArrowLeft size={16} /> Back to Designers
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                <Sparkles className="text-brand-accent" size={28} /> Compare Designers
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Side-by-side evaluation of credentials, ratings, and past performance.
              </p>
            </div>
            <span className="self-start sm:self-auto px-3.5 py-1.5 bg-brand-accent/10 border border-brand-accent/20 text-brand-accent font-bold text-xs rounded-full">
              Comparing {designers.length} profile{designers.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* COMPARISON TABLE */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  <th className="p-6 text-xs font-bold uppercase tracking-wider text-gray-400 w-1/4">
                    Metric / Profile
                  </th>
                  {designers.map((designer) => (
                    <th key={designer.id} className="p-6 text-left align-top w-1/3">
                      <div className="flex flex-col gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                          {designer.logo_url ? (
                            <img
                              src={designer.logo_url}
                              alt={designer.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-xl text-brand-accent">
                              {designer.name?.[0] || "?"}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-lg text-gray-900 leading-tight">
                              {designer.name}
                            </h3>
                            {designer.is_verified && (
                              <CheckCircle size={16} className="text-brand-accent shrink-0" />
                            )}
                          </div>
                          <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin size={12} className="text-gray-400" /> {designer.city || "Unknown City"}
                          </span>
                        </div>
                        <Link
                          to={`/designers/${designer.id}`}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-accent text-white font-bold text-xs rounded-xl shadow-xs hover:bg-orange-600 transition-colors w-full"
                        >
                          View Profile <ArrowRight size={13} />
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {/* Designer Type */}
                <tr>
                  <td className="p-6 font-bold text-gray-900 bg-gray-50/30">Specialization</td>
                  {designers.map((d) => (
                    <td key={d.id} className="p-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-100">
                        {d.designer_type === "commercial" ? (
                          <><Building size={12} /> Commercial</>
                        ) : d.designer_type === "both" ? (
                          <><Layout size={12} /> Interior & Commercial</>
                        ) : (
                          <><Home size={12} /> Interior</>
                        )}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Rating */}
                <tr>
                  <td className="p-6 font-bold text-gray-900 bg-gray-50/30">Rating</td>
                  {designers.map((d) => (
                    <td key={d.id} className="p-6">
                      <div className="flex items-center gap-1 text-yellow-500 font-bold text-base">
                        <Star size={16} fill="currentColor" />
                        <span>{(d.rating_avg || 0) > 0 ? Number(d.rating_avg).toFixed(1) : "New / Unrated"}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Experience */}
                <tr>
                  <td className="p-6 font-bold text-gray-900 bg-gray-50/30">Experience</td>
                  {designers.map((d) => (
                    <td key={d.id} className="p-6">
                      <div className="flex items-center gap-1.5 text-gray-900 font-bold">
                        <Clock size={16} className="text-brand-accent" />
                        <span>{d.experience_years ? `${d.experience_years} Years` : "Fresher"}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Projects Completed */}
                <tr>
                  <td className="p-6 font-bold text-gray-900 bg-gray-50/30">Projects Completed</td>
                  {designers.map((d) => (
                    <td key={d.id} className="p-6">
                      <span className="text-lg font-extrabold text-gray-900 font-mono">
                        {d.projects_completed || 0}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* City / Base Area */}
                <tr>
                  <td className="p-6 font-bold text-gray-900 bg-gray-50/30">Primary City</td>
                  {designers.map((d) => (
                    <td key={d.id} className="p-6 font-medium text-gray-800">
                      {d.city || "Not specified"}
                    </td>
                  ))}
                </tr>

                {/* Style Tags */}
                <tr>
                  <td className="p-6 font-bold text-gray-900 bg-gray-50/30">Style Tags</td>
                  {designers.map((d) => (
                    <td key={d.id} className="p-6">
                      <div className="flex flex-wrap gap-1.5">
                        {Array.isArray(d.style_tags) && d.style_tags.length > 0 ? (
                          d.style_tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-md border border-gray-200"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 italic">None specified</span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Bio / About */}
                <tr>
                  <td className="p-6 font-bold text-gray-900 bg-gray-50/30">About / Overview</td>
                  {designers.map((d) => (
                    <td key={d.id} className="p-6 text-xs text-gray-600 leading-relaxed">
                      {d.about_text ? (
                        <p className="line-clamp-4">{d.about_text}</p>
                      ) : (
                        <span className="italic text-gray-400">No description provided</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Portfolio Preview */}
                <tr>
                  <td className="p-6 font-bold text-gray-900 bg-gray-50/30">
                    <div>
                      <p>Portfolio Preview</p>
                      <span className="text-[11px] font-normal text-gray-400 block mt-0.5">
                        Click thumbnail to open full preview
                      </span>
                    </div>
                  </td>
                  {designers.map((d) => {
                    const thumbnails = getPortfolioThumbnails(d);
                    const totalImages = getAllPortfolioImages(d).length;
                    return (
                      <td key={d.id} className="p-6">
                        {thumbnails.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              {thumbnails.map((src, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => openPreview(d, idx)}
                                  className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 cursor-pointer hover:border-brand-accent hover:shadow-md transition-all group relative focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                                  title="Click to view full preview"
                                >
                                  <img
                                    src={src}
                                    alt={`Portfolio ${idx + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                  />
                                </button>
                              ))}
                            </div>
                            {totalImages > 3 && (
                              <button
                                type="button"
                                onClick={() => openPreview(d, 0)}
                                className="text-xs font-semibold text-brand-accent hover:underline text-left inline-flex items-center gap-1 cursor-pointer w-fit"
                              >
                                View all {totalImages} photos →
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No project photos yet</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Video Showcase */}
                <tr>
                  <td className="p-6 font-bold text-gray-900 bg-gray-50/30">Video Showcase</td>
                  {designers.map((d) => {
                    const videos = getVideoLinks(d);
                    return (
                      <td key={d.id} className="p-6">
                        {videos.length > 0 ? (
                          <div className="flex flex-col gap-3 max-w-xs">
                            {videos.map((vUrl, idx) => {
                              const embedUrl = getYouTubeEmbedUrl(vUrl);
                              return (
                                <div key={idx} className="space-y-1">
                                  {embedUrl ? (
                                    <iframe
                                      src={embedUrl}
                                      title={`Video ${idx + 1}`}
                                      className="w-full aspect-video rounded-xl border border-gray-200"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                    />
                                  ) : (
                                    <a
                                      href={vUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-accent hover:underline bg-brand-accent/5 px-2.5 py-1.5 rounded-lg border border-brand-accent/15"
                                    >
                                      <Play size={12} fill="currentColor" /> Watch Video {idx + 1}
                                    </a>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No approved videos</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FULL-SCREEN PORTFOLIO IMAGE CAROUSEL OVERLAY */}
      {previewModal.isOpen && previewModal.images.length > 0 && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Portfolio Image Preview"
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in transition-all"
          onClick={closePreview}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between text-white w-full max-w-7xl mx-auto z-20 pb-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="font-bold text-lg text-white tracking-wide">
                {previewModal.designerName}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {previewModal.images[previewModal.currentIndex]?.title} • Image{" "}
                {previewModal.currentIndex + 1} of {previewModal.images.length}
              </p>
            </div>

            <button
              type="button"
              onClick={closePreview}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/40"
              title="Close preview (Esc)"
              aria-label="Close image preview"
            >
              <X size={22} />
            </button>
          </div>

          {/* Main Carousel Display with Previous / Next Arrows */}
          <div
            className="relative flex-1 flex items-center justify-center my-auto overflow-hidden w-full max-w-7xl mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {previewModal.images.length > 1 && (
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-2 sm:left-6 z-20 p-3.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all backdrop-blur-sm cursor-pointer shadow-xl active:scale-95 border border-white/10 hover:border-white/30"
                title="Previous image (Left arrow)"
                aria-label="Previous image"
              >
                <ChevronLeft size={26} />
              </button>
            )}

            <div className="flex items-center justify-center max-h-[76vh] max-w-[90vw]">
              <img
                src={previewModal.images[previewModal.currentIndex]?.url}
                alt={
                  previewModal.images[previewModal.currentIndex]?.title ||
                  "Portfolio item"
                }
                className="max-h-[76vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl select-none"
              />
            </div>

            {previewModal.images.length > 1 && (
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-2 sm:right-6 z-20 p-3.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all backdrop-blur-sm cursor-pointer shadow-xl active:scale-95 border border-white/10 hover:border-white/30"
                title="Next image (Right arrow)"
                aria-label="Next image"
              >
                <ChevronRight size={26} />
              </button>
            )}
          </div>

          {/* Bottom Thumbnail Strip */}
          {previewModal.images.length > 1 && (
            <div
              className="flex items-center justify-center gap-2 overflow-x-auto py-2 z-20 max-w-full mx-auto px-4"
              onClick={(e) => e.stopPropagation()}
            >
              {previewModal.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    setPreviewModal((prev) => ({ ...prev, currentIndex: idx }))
                  }
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    idx === previewModal.currentIndex
                      ? "border-brand-accent scale-105 shadow-lg"
                      : "border-transparent opacity-40 hover:opacity-100"
                  }`}
                  aria-label={`Go to image ${idx + 1}`}
                >
                  <img
                    src={img.url}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompareDesigners;

