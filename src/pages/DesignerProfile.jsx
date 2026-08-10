import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";


import {
  MapPin,
  Star,
  CheckCircle,
  ArrowLeft,
  Loader2,
  Video,
  Phone,
  Mail,
  Clock,
  Layout,
  Briefcase,
  Home,
  XCircle,
  Maximize2,
  MessageSquare,
  Star as StarIcon,
  Send,
  ChevronLeft,
  ChevronRight,
  Lock,
  Play,
  X,
  Globe,
  Tag,
  FolderGit2
} from "lucide-react";
import { motion } from "framer-motion";
import LeadWizardModal from "../components/LeadWizardModal";

// --- HELPER: SMART EMBED URL ---
const getEmbedUrl = (url) => {
  if (!url) return null;
  try {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.split("v=")[1]?.split("&")[0] || url.split("/").pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("vimeo.com")) {
      const videoId = url.split("/").pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  } catch {
    return null;
  }
};

const parseProjectCategory = (catStr) => {
  try {
    return JSON.parse(catStr);
  } catch (e) {
    return { categories: [catStr], description: "" };
  }
};

// --- SUB-COMPONENT: SIMPLE PUBLIC PROJECT CARD ---
const PublicProjectCard = ({ project, onClick }) => {
  const images = [...(project.project_images || [])].sort((a, b) => {
    if (a.is_cover && !b.is_cover) return -1;
    if (!a.is_cover && b.is_cover) return 1;
    return 0;
  });
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = (e) => {
    e.stopPropagation();
    if (images.length > 1) setCurrentIndex((prev) => (prev + 1) % images.length);
  };
  const prevImage = (e) => {
    e.stopPropagation();
    if (images.length > 1) setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    
    <div 
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-300 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
      onClick={() => onClick(project)}
    >
      {/* Image Slider */}
      <div className="h-64 sm:h-48 relative bg-gray-100 overflow-hidden shrink-0">
        <img 
          src={images[currentIndex]?.image_url || "/placeholder.jpg"} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          alt={project.title} 
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/30 text-white hover:bg-white hover:text-gray-900 rounded-full backdrop-blur-md transition-all z-20 opacity-0 group-hover:opacity-100 shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/30 text-white hover:bg-white hover:text-gray-900 rounded-full backdrop-blur-md transition-all z-20 opacity-0 group-hover:opacity-100 shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full shadow-sm transition-all duration-300 ${
                    idx === currentIndex ? "bg-white w-4" : "bg-white/50 w-1.5"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-gray-900 font-bold text-lg truncate mb-1">{project.title}</h3>
        {project.place && (
          <p className="text-gray-500 text-sm flex items-center gap-1.5 font-medium">
            <MapPin size={14} className="text-brand-accent" /> {project.place}
          </p>
        )}
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: FULL SCREEN PROJECT DETAIL MODAL (z-200) ---
const ProjectDetailModal = ({ project, onClose }) => {
  const images = [...(project.project_images || [])].sort((a, b) => {
    if (a.is_cover && !b.is_cover) return -1;
    if (!a.is_cover && b.is_cover) return 1;
    return 0;
  });
  const parsedData = parseProjectCategory(project.project_category);
  const description = parsedData.description || "";
  const place = project.place || "";

  let roomMaterialsObj = null;
  if (project.room_materials) {
    if (typeof project.room_materials === "object") {
      roomMaterialsObj = project.room_materials;
    } else if (typeof project.room_materials === "string") {
      try {
        roomMaterialsObj = JSON.parse(project.room_materials);
      } catch {
        roomMaterialsObj = null;
      }
    }
  }

  // Extract available rooms
  const roomsWithImages = [...new Set(images.map(img => img.room_category).filter(Boolean))];
  const availableRooms = roomsWithImages.length > 0 ? roomsWithImages : parsedData.categories || [];

  const [activeRoom, setActiveRoom] = useState("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Filter images based on selected category
  const filteredImages = activeRoom === "All" 
    ? images 
    : images.filter(img => img.room_category === activeRoom);
  
  const displayImages = filteredImages.length > 0 ? filteredImages : images;

  const nextImage = () => {
    if (displayImages.length > 1) setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    if (displayImages.length > 1) setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const handleRoomChange = (room) => {
    setActiveRoom(room);
    setCurrentIndex(0); // Reset to first image of new category
  };

  const activeRoomMaterialsRaw =
    activeRoom !== "All" && roomMaterialsObj ? roomMaterialsObj[activeRoom] : null;

  const activeRoomMaterials = Array.isArray(activeRoomMaterialsRaw)
    ? activeRoomMaterialsRaw.join(", ")
    : typeof activeRoomMaterialsRaw === "string"
    ? activeRoomMaterialsRaw.trim()
    : null;

  const hasRoomMaterials = Boolean(activeRoomMaterials);

  return (
    <div className="fixed inset-0 z-[200] bg-gray-900/80 backdrop-blur-md flex items-center justify-center p-2 md:p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-[90rem] h-[95vh] md:h-[85vh] rounded-3xl md:rounded-[2.5rem] overflow-hidden flex flex-col-reverse md:flex-row relative shadow-2xl animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 md:top-6 md:right-6 z-50 p-2 bg-white text-gray-900 border border-gray-200 md:border-transparent md:bg-white/10 hover:bg-gray-100 md:hover:bg-white md:text-white md:hover:text-gray-900 rounded-full backdrop-blur-md transition-all shadow-lg"
        >
          <X size={24} />
        </button>

        {/* LEFT ASIDE: Info & Categories */}
        <div className="w-full md:w-[35%] lg:w-[30%] bg-gray-50 flex flex-col h-full overflow-y-auto border-r border-gray-200">
          <div className="p-8 md:p-10 flex-1 flex flex-col">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">{project.title}</h2>
            
            {place && (
              <p className="text-gray-600 font-medium flex items-center gap-2 mb-8 bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm inline-flex w-fit">
                <MapPin size={18} className="text-brand-accent" /> {place}
              </p>
            )}

            {availableRooms.length > 0 && (
              <div className="mb-10">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Explore by Category</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleRoomChange("All")}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                      activeRoom === "All" 
                      ? "bg-gray-900 text-white border-gray-900 shadow-md" 
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    All Photos
                  </button>
                  {availableRooms.map(room => (
                    <button
                      key={room}
                      onClick={() => handleRoomChange(room)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                        activeRoom === room 
                        ? "bg-brand-accent text-white border-brand-accent shadow-md" 
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {room}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Contextual Description vs. Materials Block */}
            <div className="mt-auto pt-8 border-t border-gray-200">
              {activeRoom !== "All" && hasRoomMaterials ? (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Materials Used
                  </h4>
                  <div className="text-sm md:text-base">
                    <span className="font-bold text-gray-900 font-serif">{activeRoom}: </span>
                    <span className="text-gray-700 font-light leading-relaxed">{activeRoomMaterials}</span>
                  </div>
                </div>
              ) : description ? (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                    Project Details
                  </h4>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                    {description}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* RIGHT MAIN: Image Viewer (Theater Mode) */}
        <div className="w-full md:w-[65%] lg:w-[70%] bg-gray-950 relative flex flex-col min-h-[55vh] h-[55vh] md:h-full">
          <div className="flex-1 relative flex items-center justify-center p-4 md:p-8 overflow-hidden">
            <img 
              src={displayImages[currentIndex]?.image_url || "/placeholder.jpg"} 
              alt={project.title}
              className=" h-full object-cover cursor-pointer hover:opacity-90 transition-opacity rounded-xl shadow-2xl animate-in fade-in duration-500"
              loading="lazy"
              onClick={() => setIsFullscreen(true)}
            />
            
            {displayImages[currentIndex]?.room_category && (
               <div className="absolute top-6 left-6 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-lg border border-white/10 tracking-wider uppercase">
                 {displayImages[currentIndex].room_category}
               </div>
            )}

            {displayImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 bg-black/40 text-white hover:bg-white hover:text-gray-900 rounded-full backdrop-blur-md transition-all z-20 shadow-lg border border-white/10"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 bg-black/40 text-white hover:bg-white hover:text-gray-900 rounded-full backdrop-blur-md transition-all z-20 shadow-lg border border-white/10"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {displayImages.length > 1 && (
            <div className="h-16 lg:h-28 bg-gray-900 border-t border-white/10 p-4 flex items-center gap-3 overflow-x-auto no-scrollbar shrink-0">
              {displayImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative h-full aspect-video rounded-lg overflow-hidden shrink-0 transition-all border-2 ${
                    currentIndex === idx ? "border-brand-accent opacity-100" : "border-transparent opacity-40 hover:opacity-100"
                  }`}
                >
                  <img src={img.image_url} className="w-full h-full object-cover" alt={`thumb-${idx}`} loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX OVERLAY */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }} 
            className="absolute top-6 right-6 z-50 p-3 bg-white/10 text-white hover:bg-white hover:text-gray-900 rounded-full backdrop-blur-md transition-all shadow-lg"
          >
            <X size={24}/>
          </button>
          
          {displayImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-4 bg-white/10 text-white hover:bg-white hover:text-gray-900 rounded-full backdrop-blur-md transition-all z-50 shadow-lg"
              >
                <ChevronLeft size={28}/>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-4 bg-white/10 text-white hover:bg-white hover:text-gray-900 rounded-full backdrop-blur-md transition-all z-50 shadow-lg"
              >
                <ChevronRight size={28}/>
              </button>
            </>
          )}

          <img 
            src={displayImages[currentIndex]?.image_url || "/placeholder.jpg"} 
            alt="Fullscreen View"
            className="max-w-full max-h-full object-contain animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

// --- REVIEWS SECTION COMPONENT ---
const ReviewsSection = ({ designerId, currentUser, connectionStatus, onReviewSubmitted }) => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setReview] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("designer_id", designerId)
        .order("created_at", { ascending: false });
      setReviews(data || []);
    };
    fetchReviews();
  }, [designerId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!currentUser) return toast.error("Please login to leave a review");
    if (connectionStatus !== "accepted")
      return toast.error("You must be a connected client to leave a review.");

    setSubmitting(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        designer_id: designerId,
        client_id: currentUser.id,
        client_name: currentUser.user_metadata?.full_name || "Verified Client",
        rating: newReview.rating,
        comment: newReview.comment,
      });

      if (error) throw error;
      toast.success("Review submitted!");
      setReview({ rating: 5, comment: "" });
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("designer_id", designerId)
        .order("created_at", { ascending: false });
      setReviews(data || []);
      // ponytail: refresh parent's designer.rating_avg (BUG-008)
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const canReview = currentUser && connectionStatus === "accepted";

  return (
    <div className="mt-4 pt-12 border-t border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
        <MessageSquare className="text-brand-accent" /> Client Reviews (
        {reviews.length})
      </h2>
      {canReview ? (
        <form
          onSubmit={handleSubmitReview}
          className="bg-white border border-gray-200 p-6 rounded-xl mb-10 shadow-lg animate-fade-in"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Share your experience
          </h3>
          <div className="mb-4">
            <div className="flex gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setReview({ ...newReview, rating: star })}
                  className={`${
                    newReview.rating >= star
                      ? "text-yellow-500"
                      : "text-gray-600"
                  } transition-colors hover:scale-110`}
                >
                  <StarIcon
                    fill={newReview.rating >= star ? "currentColor" : "none"}
                    size={28}
                  />
                </button>
              ))}
            </div>
          </div>
          <textarea
            placeholder="How was your experience working with this designer?"
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 focus:border-brand-accent outline-none mb-4 min-h-25"
            value={newReview.comment}
            onChange={(e) =>
              setReview({ ...newReview, comment: e.target.value })
            }
            required
          ></textarea>
          <button
            disabled={submitting}
            className="px-6 py-2 bg-brand-accent text-white font-bold rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Send size={18} />
            )}{" "}
            Submit Review
          </button>
        </form>
      ) : (
        <div className="bg-white border border-gray-100 p-8 rounded-xl text-center mb-10 shadow-sm">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Lock className="text-gray-500" size={24} />
          </div>
          <h3 className="text-gray-900 font-bold mb-1">Reviews are restricted</h3>
          <p className="text-gray-500 text-sm">
            {!currentUser
              ? "Please login to view your connection status."
              : "Only clients who have successfully connected and worked with this designer can leave a review."}
          </p>
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        {reviews.length === 0 ? (
          <div className="col-span-full border border-dashed border-gray-200 rounded-2xl p-10 text-center bg-gray-50/50">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="text-gray-400" size={22} />
            </div>
            <h4 className="text-gray-900 font-bold mb-1">No reviews yet</h4>
            <p className="text-gray-500 text-sm">Complete a project to request feedback from your clients!</p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-gray-50 border border-gray-100 p-5 rounded-xl"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    {rev.client_name}{" "}
                    <CheckCircle
                      size={12}
                      className="text-green-500"
                      title="Verified Client"
                    />
                  </h4>
                  <p className="text-xs text-gray-500">
                    {new Date(rev.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      size={14}
                      fill={i < rev.rating ? "currentColor" : "none"}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 text-sm">{rev.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- MAIN PROFILE PAGE ---
const DesignerProfile = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  
  const [designer, setDesigner] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showLeadWizard, setShowLeadWizard] = useState(false);

  const viewLoggedRef = useRef(null);

  useEffect(() => {
    const numericId = Number(id);
    if (!id || isNaN(numericId) || viewLoggedRef.current === id) return;

    viewLoggedRef.current = id;
    supabase.rpc('increment_profile_view', { target_designer_id: numericId })
      .then(({ error }) => {
        if (error) console.error("Failed to increment profile view:", error);
      });
  }, [id]);

  // Unified state object
  const [connection, setConnection] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);

      const { data: designerData, error } = await supabase
        .from("designers")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        setLoading(false);
        return;
      }
      setDesigner(designerData);

      const { data: projectsData } = await supabase
        .from("designer_projects")
        .select(`*, project_images(image_url, is_cover, room_category)`)
        .eq("designer_id", id)
        .order("created_at", { ascending: false });
      setProjects(projectsData || []);

      if (user) {
        // Fetch client profile details from users table
        const { data: prof } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        setClientProfile(prof);

        // Fetch the whole row, order by updated_at so if multiple exist, grab latest
        const { data: conn } = await supabase
          .from("connections")
          .select("*")
          .eq("client_id", user.id)
          .eq("designer_id", id)
          .order('updated_at', { ascending: false }) 
          .limit(1) 
          .maybeSingle();

        if (conn) {
          setConnection(conn);
        } else {
          setConnection(null); 
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  // Handle Connect to Nuke old row and create new Request
  const handleConnect = async (leadDetails) => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setIsSending(true);

    const formattedMessage = `Project Scope: ${leadDetails.scope}\nPreferred Style: ${leadDetails.style}\nBudget Range: ${leadDetails.budget}\nTimeline: ${leadDetails.timeline}\n\nClient Message:\n${leadDetails.message || "No additional message provided."}`;

    const payload = {
      client_id: currentUser.id,
      designer_id: id,
      status: "pending",
      client_name: clientProfile?.full_name || currentUser.user_metadata?.full_name || "Homeowner",
      client_email: currentUser.email,
      client_phone: clientProfile?.phone || "Not provided",
      message: formattedMessage,
      updated_at: new Date().toISOString()
    };

    try {
      // 💥 physically clear out old row so connection is fresh 
      await supabase
        .from("connections")
        .delete()
        .eq("client_id", currentUser.id)
        .eq("designer_id", id);

      const { data, error } = await supabase
        .from("connections")
        .insert([payload])
        .select()
        .single();
        
      if (error) throw error;
      
      setConnection(data);
      setShowLeadWizard(false);
      toast.success("New connection request sent!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <Loader2 className="animate-spin text-brand-accent mb-2" size={48} />
        <p className="text-sm font-semibold text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (!designer) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
          <XCircle size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Designer Not Found</h1>
        <p className="text-gray-500 text-sm max-w-md mb-6 leading-relaxed">
          The designer profile you are looking for does not exist or may have been removed.
        </p>
        <button
          onClick={() => navigate("/designers")}
          className="px-6 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
        >
          Back to Designers
        </button>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
      className="min-h-screen bg-gray-50 pt-4 pb-20 overflow-hidden"
    >
      {/* HEADER */}
      <motion.div variants={itemVariants} className="relative bg-white border-b border-gray-100 pb-6 pt-0 px-4 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-900 flex items-center gap-2 mb-6 transition-colors group text-sm font-medium"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back
          </button>
          <div className="flex flex-col md:flex-row items-start gap-6">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-20 h-20 md:w-32 md:h-32 bg-gray-50 rounded-3xl border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center text-3xl font-bold text-brand-accent shadow-xl"
            >
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
            </motion.div>
            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
                    {designer.name}
                    {designer.is_verified && (
                      <CheckCircle size={28} className="text-brand-accent" />
                    )}
                    {designer.featured_status === "featured" && (
                      <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/50 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                        Featured
                      </span>
                    )}
                  </h1>
                  <div className="flex items-center gap-4 mt-3 text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={18} /> {designer.city}
                    </span>
                    <span
                      className={`text-xs uppercase font-bold px-3 py-1 rounded-full border flex items-center gap-2 ${
                        designer.designer_type === "commercial"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : designer.designer_type === "both"
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          : "bg-brand-accent/10 text-brand-accent border-brand-accent/20"
                      }`}
                    >
                      {designer.designer_type === "commercial" ? (
                        <Briefcase size={12} />
                      ) : designer.designer_type === "both" ? (
                        <Layout size={12} />
                      ) : (
                        <Home size={12} />
                      )}{" "}
                      {designer.designer_type === "commercial"
                        ? "Commercial Designer"
                        : designer.designer_type === "both"
                        ? "Interior & Commercial"
                        : "Interior Designer"}
                    </span>
                  </div>
                  
                </div>
                <div className="hidden md:block">
                  {/* Both accepted and on_hold are "connected" concepts but we display them differently */}
                  {connection?.status === "accepted" ? (
                    <button className="px-6 py-3 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl font-bold flex items-center gap-2 cursor-default">
                      <CheckCircle size={20} /> Connected
                    </button>
                  ) : connection?.status === "on_hold" ? (
                    <button disabled className="px-6 py-3 bg-orange-50 text-orange-600 border border-orange-200 rounded-xl font-bold flex items-center gap-2 cursor-not-allowed">
                      <Clock size={18} /> Request On Hold
                    </button>
                  ) : connection?.status === "pending" ? (
                    <button
                      disabled
                      className="px-6 py-3 bg-gray-100 text-gray-500 border border-gray-200 rounded-xl font-bold cursor-not-allowed"
                    >
                      Request Sent
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (!currentUser) return navigate("/login");
                        if (!clientProfile?.profile_completed || !clientProfile?.phone) return navigate("/complete-profile");
                        setShowLeadWizard(true);
                      }}
                      disabled={isSending}
                      className="px-8 py-3 bg-brand-accent hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
                    >
                      {isSending ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        "Connect Now"
                      )}
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-8 mt-4 border-t border-gray-200 pt-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                    Experience
                  </p>
                  <p className="text-lg md:text-xl text-gray-900 font-bold flex items-center gap-2">
                    <Clock size={18} className="text-brand-accent" />{" "}
                    {designer.experience_years
                      ? `${designer.experience_years}+ Years`
                      : "Fresher"}
                  </p>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                    Rating
                  </p>
                  <div className="flex items-center gap-2 text-lg md:text-xl text-gray-900 font-bold">
                    <Star
                      size={18}
                      className="text-yellow-500"
                      fill="currentColor"
                    />{" "}
                    {designer.rating_avg > 0
                      ? designer.rating_avg.toFixed(1)
                      : "New"}
                  </div>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                    Portfolio
                  </p>
                  <p className="text-lg md:text-xl text-gray-900 font-bold flex items-center gap-2">
                    <FolderGit2 size={18} className="text-brand-accent" />{" "}
                    {designer.projects_completed} Projects
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CONTENT GRID */}
      <div className="max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Featured Projects
            </h2>
            {projects.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center text-gray-500 shadow-sm">
                No projects uploaded yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {projects.map((proj) => (
                  <PublicProjectCard
                    key={proj.id}
                    project={proj}
                    onClick={setSelectedProject}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {designer.about_text && (
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About the Firm
              </h2>
              <div className="prose prose-invert max-w-none text-gray-600 leading-loose whitespace-pre-wrap text-lg">
                {designer.about_text}
              </div>
            </motion.div>
          )}

          {designer.style_tags && designer.style_tags.length > 0 && (
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Layout size={24} className="text-brand-accent" /> Specialist In
              </h2>
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-wrap gap-3">
                  {designer.style_tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 font-medium flex items-center gap-2"
                    >
                      <CheckCircle size={14} className="text-brand-accent" />{" "}
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* --- VIDEO SECTION --- */}
          {(designer.video_link || designer.video_link_2) && (
            <motion.div variants={itemVariants} className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Play size={24} className="text-brand-accent" /> Video Showcase
              </h2>
              <div
                className={`grid gap-6 ${
                  designer.video_link && designer.video_link_2
                    ? "grid-cols-1 md:grid-cols-2"
                    : "grid-cols-1"
                }`}
              >
                {designer.video_link && (
                  <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
                    <iframe
                      src={getEmbedUrl(designer.video_link)}
                      className="w-full h-full"
                      title="Video 1"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
                {designer.video_link_2 && (
                  <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
                    <iframe
                      src={getEmbedUrl(designer.video_link_2)}
                      className="w-full h-full"
                      title="Video 2"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          <motion.div variants={itemVariants}>
            <ReviewsSection
              designerId={id}
              currentUser={currentUser}
              connectionStatus={connection?.status}
              onReviewSubmitted={async () => {
                const { data } = await supabase.from("designers").select("*").eq("id", id).single();
                if (data) setDesigner(data);
              }}
            />
          </motion.div>
        </div>

        {/* CONTACT BOX */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <div className="sticky top-28 bg-white border border-gray-100 rounded-3xl p-8 shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Interested?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Connect with {designer.name} to start your project.
            </p>
            
            {connection?.status === "accepted" || connection?.status === "on_hold" ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                  <h4 className="font-bold text-green-700 mb-2 flex items-center gap-2">
                    <CheckCircle size={16} /> Contact Details
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>📧 {designer.email}</p>
                    <p>📞 {designer.phone}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/connect")}
                  className="w-full py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                >
                  Go to My Connections
                </button>
              </div>
            ) : (
              <button
                onClick={() => currentUser ? setShowLeadWizard(true) : navigate("/login")}
                // Block button if Pending
                disabled={isSending || connection?.status === "pending"}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 ${
                  connection?.status === "pending"
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-brand-accent hover:bg-orange-600 text-white shadow-lg"
                }`}
              >
                {isSending ? (
                  <Loader2 className="animate-spin" />
                ) : connection?.status === "pending" ? (
                  "Request Pending..."
                ) : (
                  "Send Connection Request"
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* FULL SCREEN PROJECT MODAL */}
      {selectedProject && (
        <ProjectDetailModal 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
        />
      )}

      <LeadWizardModal
        isOpen={showLeadWizard}
        onClose={() => setShowLeadWizard(false)}
        onSubmit={handleConnect}
        isSubmitting={isSending}
        designerName={designer.name}
      />
    </motion.div>
  );
};

export default DesignerProfile;