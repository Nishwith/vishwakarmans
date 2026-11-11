import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import {
  Users,
  CheckCircle,
  XCircle,
  Loader2,
  LogOut,
  ShieldAlert,
  MapPin,
  Phone,
  Mail,
  UserPlus,
  FileText,
  Eye,
  Briefcase,
  Star,
  Image as ImageIcon,
  BarChart3,
  Save,
  ArrowUpCircle,
  Search,
  Calendar,
  Clock,
  ChevronUp,
  ChevronDown,
  X as CloseIcon,
  Zap,
  Video,
  Tag,
  Filter,
  AlertTriangle,
  MessageSquare,
  Trash2,
  CheckSquare,
  Upload,
  Globe,
  CalendarClock,
  ShieldCheck,
  ExternalLink,
  EyeOff,
  Play,
  Download
} from "lucide-react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { signOut } from "../services/authService";
import { getYouTubeEmbedUrl } from "../utils/publicDesignerVideo";
import {
  onboardDesignerApplicationWithSuccess,
  rejectDesignerApplication,
  verifyDesignerProfile,
} from "../services/designerApplicationAdminService";
import {
  updateContactMessageStatusWithSecureRpc,
  deleteContactMessageWithSecureRpc,
} from "../services/adminOperationsService";
import { resolveAdminAuthorization } from "../services/phase1aAuthorizationService";
import { setDesignerPublicVisibility } from "../services/designerVisibilityAdminService";

// --- SUB-COMPONENT: FEATURE REQUEST EVALUATION MODAL ---
const FeatureRequestModal = ({ designer, onClose, onApprove, onReject }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!designer?.id) return;
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*, users!client_id(email, phone)")
        .eq("designer_id", designer.id);

      if (!error && data) setReviews(data);
      setLoading(false);
    };
    fetchReviews();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [designer?.id, onClose]);

  if (!designer) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white border border-gray-200 w-full max-w-3xl rounded-3xl shadow-2xl relative animate-in fade-in zoom-in duration-200 my-auto flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl">
              <Star size={22} className="fill-orange-500" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Evaluate Featured Badge Request
              </h2>
              <p className="text-xs text-gray-500">
                Review designer details and client feedback before approving
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-900 transition-colors"
          >
            <CloseIcon size={22} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6">
          {/* Designer Card Summary */}
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left">
            <div className="w-20 h-20 rounded-2xl bg-white border border-gray-300 overflow-hidden shrink-0 shadow-sm">
              {designer?.logo_url ? (
                <img
                  src={designer.logo_url}
                  alt={designer?.name || "Logo"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-gray-400">
                  {designer?.name?.[0] || "?"}
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-xl font-bold text-gray-900">{designer?.name || "Unnamed Designer"}</h3>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-xs text-gray-600">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin size={14} className="text-gray-400" /> {designer?.city || "N/A"}
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <Phone size={14} className="text-green-500" /> {designer?.phone || "N/A"}
                </span>
                <span className="flex items-center gap-1 font-medium break-all">
                  <Mail size={14} className="text-blue-500" /> {designer?.email || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <CheckSquare size={16} className="text-orange-500" /> Client Reviews & Verification ({(reviews || []).length})
            </h4>

            {loading ? (
              <div className="py-8 text-center text-gray-500 flex items-center justify-center gap-2">
                <Loader2 className="animate-spin text-orange-500" size={20} />
                <span>Fetching client reviews...</span>
              </div>
            ) : reviews.length === 0 ? (
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 border-dashed text-center text-gray-500 text-sm">
                No client reviews submitted for this designer yet.
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                          {rev.client_name}
                          <CheckCircle size={14} className="text-green-500" />
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {new Date(rev.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < rev.rating ? "currentColor" : "none"}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 text-xs italic">"{rev.comment}"</p>
                    
                    {/* Joined Client Contact Details */}
                    <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-200 text-[11px] text-gray-500 font-mono">
                      <span>Email: <strong className="text-gray-800">{rev.users?.email || "N/A"}</strong></span>
                      <span>Phone: <strong className="text-gray-800">{rev.users?.phone || "N/A"}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-5 border-t border-gray-200 bg-gray-50/50 rounded-b-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => onReject(designer.id)}
            className="w-full sm:w-auto px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            Reject Request
          </button>

          <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1 hidden md:inline">
              Approve:
            </span>
            {[30, 90, 180, 365].map((days) => (
              <button
                key={days}
                onClick={() => onApprove(designer.id, days)}
                className="px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: REVIEW MODAL ---
const ReviewModal = ({ designer, onClose, onApprove, onReject }) => {
  if (!designer) return null;
  const projectCount = designer.designer_projects?.[0]?.count || 0;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white border border-gray-200 w-full max-w-2xl rounded-2xl shadow-2xl relative animate-in fade-in zoom-in duration-200 my-auto flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-blue-500" /> Review Profile
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-900 transition-colors"
          >
            <CloseIcon size={24} />
          </button>
        </div>
        
        <div className="p-5 md:p-8 overflow-y-auto space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
            <div className="w-24 h-24 rounded-2xl bg-gray-50 border-2 border-gray-300 overflow-hidden shrink-0 mx-auto md:mx-0 shadow-inner">
              {designer?.logo_url ? (
                <img
                  src={designer.logo_url}
                  alt={designer?.name || "logo"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-3xl text-gray-400 bg-gray-100">
                  {designer?.name?.[0] || "?"}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {designer?.name || "Unnamed Designer"}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                <span className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                  {designer?.designer_type || "Designer"}
                </span>
                <span className="px-3 py-1.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                  <MapPin size={14} className="text-gray-500" /> {designer?.city || "Unknown City"}
                </span>
                {(designer?.experience_years || 0) > 0 && (
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                    <Clock size={14} className="text-gray-500" /> {designer.experience_years} Years Exp
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-3 shadow-sm">
              <div className="flex flex-col gap-1 text-sm">
                <span className="text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                  Email
                </span>
                <span className="text-gray-900 font-mono select-all break-all font-medium">
                  {designer?.email || "N/A"}
                </span>
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <span className="text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                  Phone
                </span>
                <span className="text-gray-900 font-mono select-all font-medium">
                  {designer?.phone || "N/A"}
                </span>
              </div>
              {designer?.website_url && (
                <div className="flex flex-col gap-1 text-sm pt-2 border-t border-gray-200">
                  <span className="text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                    Website
                  </span>
                  <a 
                    href={designer.website_url.startsWith('http') ? designer.website_url : `https://${designer.website_url}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline font-mono truncate font-medium"
                  >
                    {designer.website_url}
                  </a>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-3 shadow-sm">
              <div className="flex flex-col gap-1 text-sm">
                <span className="text-gray-500 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1">
                  <MapPin size={12} className="text-orange-500" /> Service Area (Lat / Lng)
                </span>
                <span className="text-gray-900 font-medium text-sm font-mono">
                  {designer?.service_area_lat && designer?.service_area_lng
                    ? `Lat: ${designer.service_area_lat}, Lng: ${designer.service_area_lng}`
                    : designer?.location || (designer?.city ? `Covering ${designer.city} & surrounding areas` : "Not specified")}
                </span>
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <span className="text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                  Portfolio Projects
                </span>
                <span className="text-gray-900 font-bold text-sm">
                  {projectCount} Projects Uploaded
                </span>
              </div>
            </div>
          </div>

          {/* About / Bio */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2">
              About
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm md:text-base bg-gray-50 p-4 rounded-xl border border-gray-100">
              {designer?.about_text || designer?.bio || "No description provided."}
            </p>
          </div>

          {/* Style Tags */}
          {designer?.style_tags && designer.style_tags.length > 0 && (
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-2 shadow-sm">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Style Tags
              </span>
              <div className="flex flex-wrap gap-2">
                {designer.style_tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-white border border-gray-200 text-gray-700 font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm"
                  >
                    <Tag size={12} className="text-gray-400" /> {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Video Showcase Review */}
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Video size={16} className="text-orange-500" /> Submitted Video Links
            </h3>
            {designer.video_link_1 || designer.video_link || designer.video_link_2 ? (
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                {(designer.video_link_1 || designer.video_link) ? (
                  <a
                    href={designer.video_link_1 || designer.video_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-blue-600 hover:text-blue-800 hover:border-blue-300 shadow-sm transition-all"
                  >
                    <ExternalLink size={16} /> View Video 1
                  </a>
                ) : null}
                {designer.video_link_2 ? (
                  <a
                    href={designer.video_link_2}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-blue-600 hover:text-blue-800 hover:border-blue-300 shadow-sm transition-all"
                  >
                    <ExternalLink size={16} /> View Video 2
                  </a>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No video links submitted</p>
            )}
          </div>
        </div>

        <div className="p-5 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex flex-col md:flex-row gap-4 sticky bottom-0">
          <button
            onClick={() => onApprove(designer.id)}
            className="w-full md:w-2/3 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            <CheckCircle size={20} /> Approve & Publish
          </button>
          
          <button
            onClick={() => onReject(designer.id)}
            className="w-full md:w-1/3 bg-white border-2 border-red-200 hover:border-red-300 text-red-600 hover:bg-red-50 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
          >
            <XCircle size={20} /> Reject Profile
          </button>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: ACTIVE DESIGNER CARD ---
const ActiveDesignerCard = ({
  d,
  navigate,
  handleSetDesignerVisibility,
}) => {
  const [showContact, setShowContact] = useState(false);

  // --- FEATURED BOOST STATUS ---
  let featDaysLeft = null;
  let isFeatured = false;
  if (d?.featured_status === "featured" && d?.featured_expiry) {
    const diff = new Date(d.featured_expiry) - new Date();
    featDaysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (featDaysLeft >= 0) isFeatured = true;
  }

  // --- SUBSCRIPTION STATUS ---
  let subDaysLeft = -1;
  if (d?.subscription_end) {
    subDaysLeft = Math.ceil((new Date(d.subscription_end) - new Date()) / (1000 * 60 * 60 * 24));
  }
  const isSubExpired = subDaysLeft < 0 || !d?.subscription_end;
  const isSubExpiringSoon = !isSubExpired && subDaysLeft < 7;

  return (
    <div
      className={`bg-white p-5 rounded-2xl border flex flex-col gap-4 transition-all shadow-md hover:shadow-xl cursor-pointer ${
        isSubExpired
          ? "border-red-200 bg-red-50/10"
          : isSubExpiringSoon
          ? "border-yellow-200 bg-yellow-50/10"
          : "border-gray-200"
      }`}
      onClick={() => d?.id && navigate(`/designers/${d.id}`)}
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-4 items-center w-full">
          <div className="w-12 h-12 rounded-full bg-gray-50 border-2 border-gray-300 overflow-hidden shrink-0 relative">
            {d?.logo_url ? (
              <img src={d.logo_url} alt="logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-slate-500">
                {d?.name?.[0] || "?"}
              </div>
            )}
            {isFeatured && (
              <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
                <Star size={16} className="text-gray-900 fill-white" />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              {d?.name || "Unnamed Designer"}
            </h3>
            
            <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1.5 items-center">
              <span>{d?.city || "Unknown City"}</span>
              <span>•</span>
              {!d?.is_public && (
                <span className="px-2.5 py-0.5 rounded-full font-bold border bg-gray-100 text-gray-700 border-gray-300 text-xs">
                  Hidden from public
                </span>
              )}
              <span className="text-gray-900 font-medium">{d?.projects_completed || d?.designer_projects?.[0]?.count || 0} Projects</span>
              <span>•</span>
              
              {/* READ-ONLY SUBSCRIPTION STATUS BADGE */}
              {isSubExpired ? (
                <span className="px-2.5 py-0.5 rounded-full font-bold border bg-red-50 text-red-600 border-red-200 text-xs inline-flex items-center gap-1">
                  <XCircle size={12} /> Expired
                </span>
              ) : isSubExpiringSoon ? (
                <span className="px-2.5 py-0.5 rounded-full font-bold border bg-yellow-50 text-yellow-700 border-yellow-200 text-xs inline-flex items-center gap-1">
                  <AlertTriangle size={12} /> Expiring Soon ({subDaysLeft}d)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full font-bold border bg-green-50 text-green-700 border-green-200 text-xs inline-flex items-center gap-1">
                  <CheckCircle size={12} /> Active ({subDaysLeft}d)
                </span>
              )}

              {/* READ-ONLY BOOST / FEATURED STATUS BADGE */}
              {isFeatured && (
                <span className="px-2.5 py-0.5 rounded-full font-bold border bg-purple-50 text-purple-700 border-purple-200 text-xs inline-flex items-center gap-1">
                  <Star size={12} /> Featured ({featDaysLeft}d left)
                </span>
              )}

              {/* READ-ONLY PRIORITY SCORE METRIC BADGE */}
              <span className="px-2.5 py-0.5 rounded-full font-bold border bg-gray-100 text-gray-700 border-gray-200 text-xs inline-flex items-center gap-1 font-mono">
                <Zap size={12} className="text-brand-accent" /> Priority: {d?.priority_score || 0}
              </span>

              {/* VIDEO STATUS BADGE */}
              {d?.videos_approved ? (
                <span className="px-2.5 py-0.5 rounded-full font-bold border bg-emerald-50 text-emerald-700 border-emerald-200 text-xs inline-flex items-center gap-1">
                  <CheckCircle size={12} /> Videos Approved
                </span>
              ) : (d?.video_link_1 || d?.video_link || d?.video_link_2) ? (
                <span className="px-2.5 py-0.5 rounded-full font-bold border bg-amber-50 text-amber-700 border-amber-200 text-xs inline-flex items-center gap-1">
                  <Clock size={12} /> Videos Pending
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div
          className="flex flex-wrap gap-2 justify-end w-full md:w-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (d?.id) navigate(`/admin/manage-designer/${d.id}`);
            }}
            className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <ExternalLink size={16} /> Manage Workspace
          </button>

          <button
            onClick={() => setShowContact(!showContact)}
            className={`p-2 rounded-xl border transition-all ${
              showContact ? "bg-gray-600 text-white border-gray-500" : "bg-gray-100 text-gray-500 border-gray-300 hover:text-gray-900"
            }`}
            title="View Contact"
          >
            {showContact ? <ChevronUp size={18} /> : <Phone size={18} />}
          </button>

          <button
            onClick={() => d?.id && handleSetDesignerVisibility(d.id, !d?.is_public)}
            className={`w-auto px-4 py-2 rounded-xl border transition-colors flex items-center justify-center gap-2 shadow-sm ${
              d?.is_public
                ? "text-amber-700 hover:bg-amber-600 hover:text-white border-amber-200 hover:border-amber-600"
                : "text-green-700 hover:bg-green-600 hover:text-white border-green-200 hover:border-green-600"
            }`}
            title={d?.is_public ? "Hide designer from public discovery" : "Restore public visibility"}
          >
            {d?.is_public ? <><EyeOff size={16} /> Deactivate</> : <><Eye size={16} /> Reactivate</>}
          </button>
        </div>
      </div>

      {showContact && (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div onClick={(e) => e.stopPropagation()} className="cursor-text min-w-0">
              <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Email</p>
              <div className="flex items-center gap-2 text-sm text-gray-900 select-all break-all">
                <Mail size={14} className="text-blue-500 shrink-0" /> {d?.email || "N/A"}
              </div>
            </div>
            <div onClick={(e) => e.stopPropagation()} className="cursor-text">
              <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Phone</p>
              <div className="flex items-center gap-2 text-sm text-gray-900 select-all">
                <Phone size={14} className="text-green-500 shrink-0" /> {d?.phone || "N/A"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- COMPONENT: OVERVIEW TAB ---
const OverviewTab = ({
  stats = {},
  requested = [],
  featured = [],
  onUpdatePriority,
  onToggleFeature,
  onEvaluateRequest,
}) => {
  const [priorityMap, setPriorityMap] = useState(() => {
    const initial = {};
    if (featured && Array.isArray(featured)) {
      featured.forEach((d) => {
        if (d?.id) initial[d.id] = d?.priority_score || 0;
      });
    }
    return initial;
  });

  const [reqSearch] = useState("");
  const [featSearch, setFeatSearch] = useState("");

  const handleSavePriority = (id) => onUpdatePriority(id, priorityMap[id]);
  const getDaysLeft = (dateString) => {
    if (!dateString) return -1;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return -1;
    return Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24));
  };
  const confirmRemoveFeature = (id) => {
    if (window.confirm("Remove Featured Status?"))
      onToggleFeature(id, "none", 0, 0);
  };

  const filteredRequested = (requested || []).filter((d) => {
    if (!d) return false;
    const search = (reqSearch || "").toLowerCase();
    const name = (d.name || "").toLowerCase();
    const email = (d.email || "").toLowerCase();
    return !search || name.includes(search) || email.includes(search);
  });
  const filteredFeatured = (featured || []).filter((d) => {
    if (!d) return false;
    const search = (featSearch || "").toLowerCase();
    const name = (d.name || "").toLowerCase();
    const email = (d.email || "").toLowerCase();
    return !search || name.includes(search) || email.includes(search);
  });

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Clients",
            count: stats?.totalClients || 0,
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            label: "Total Designers",
            count: stats?.totalDesigners || 0,
            icon: Briefcase,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
          },
          {
            label: "Verified Designers",
            count: stats?.verifiedDesigners || 0,
            icon: CheckCircle,
            color: "text-green-500",
            bg: "bg-green-500/10",
          },
          {
            label: "Inbox Messages",
            count: stats?.messages || 0,
            icon: MessageSquare,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-lg flex justify-between items-start"
          >
            <div>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                {stat.label}
              </p>
              <h2 className="text-3xl font-bold text-gray-900 mt-1">
                {stat.count}
              </h2>
            </div>
            <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* PENDING FEATURED REQUESTS SECTION */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl">
              <Star size={20} className="fill-orange-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">
                Pending Featured Requests
              </h3>
              <p className="text-xs text-gray-500">
                Designers requesting featured badge visibility
              </p>
            </div>
          </div>
          {(requested || []).length > 0 && (
            <span className="self-start sm:self-auto bg-orange-50 text-orange-700 border border-orange-200 text-xs font-bold px-3 py-1 rounded-full">
              {(requested || []).length} Pending
            </span>
          )}
        </div>

        {(filteredRequested || []).length === 0 ? (
          <div className="bg-gray-50/50 border border-gray-200 border-dashed rounded-xl p-6 text-center text-gray-500 text-sm">
            No pending feature requests.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRequested.map((d) => (
              <div
                key={d?.id}
                className="bg-gray-50/70 border border-gray-200 p-4 rounded-xl flex items-center justify-between gap-4 hover:border-gray-300 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 overflow-hidden shrink-0 shadow-inner flex items-center justify-center">
                    {d?.logo_url ? (
                      <img src={d.logo_url} alt={d?.name || "Logo"} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-gray-400 text-lg">{d?.name?.[0] || "?"}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm truncate">{d?.name || "Unnamed Designer"}</h4>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin size={12} /> {d?.city || "N/A"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onEvaluateRequest && onEvaluateRequest(d)}
                  className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Star size={14} className="text-yellow-400 fill-yellow-400" /> Evaluate Request
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LEADERBOARD TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-gray-200 flex flex-col gap-3 bg-white">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Star className="text-yellow-500" size={18} /> Live Leaderboard
            </h3>
          </div>
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 text-gray-500"
              size={14}
            />
            <input
              type="text"
              placeholder="Search featured..."
              className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 pl-9 pr-3 text-sm text-gray-900 focus:border-yellow-500 outline-none"
              value={featSearch}
              onChange={(e) => setFeatSearch(e.target.value)}
            />
          </div>
        </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50/50 text-[10px] uppercase font-bold text-gray-500">
                <tr>
                  <th className="p-3 pl-4">Details</th>
                  <th className="p-3">Expires</th>
                  <th className="p-3 text-center">Score</th>
                  <th className="p-3 text-right pr-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {(filteredFeatured || []).length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center">
                      No active featured designers.
                    </td>
                  </tr>
                ) : (
                  (filteredFeatured || []).map((d) => {
                    const daysLeft = getDaysLeft(d?.featured_expiry);
                    return (
                      <tr key={d?.id} className="hover:bg-gray-100/30">
                        <td className="p-3 pl-4">
                          <div className="flex items-center gap-3">
                            {d?.logo_url ? (
                              <img
                                src={d.logo_url}
                                className="w-8 h-8 rounded-full bg-gray-100 object-cover"
                                alt=""
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                {d?.name?.[0] || "?"}
                              </div>
                            )}
                            <div>
                              <p className="text-gray-900 font-bold text-sm">
                                {d?.name || "Unnamed"}
                              </p>
                              <p className="text-[10px] text-gray-500">
                                {d?.phone || "No phone"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div
                            className={`text-xs font-bold flex items-center gap-1 ${
                              daysLeft < 0
                                ? "text-red-400"
                                : daysLeft < 7
                                ? "text-orange-400"
                                : "text-green-400"
                            }`}
                          >
                            <Clock size={12} />{" "}
                            {daysLeft < 0 ? "EXPIRED" : `${daysLeft} days`}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            className="w-12 bg-gray-50 border border-gray-300 rounded p-1 text-center text-gray-900 focus:border-yellow-500 outline-none font-mono text-xs"
                            value={priorityMap[d?.id] ?? 0}
                            onChange={(e) =>
                              setPriorityMap({
                                ...priorityMap,
                                [d?.id]: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </td>
                        <td className="p-3 text-right pr-4 flex justify-end gap-2">
                          <button
                            onClick={() => d?.id && handleSavePriority(d.id)}
                            className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-600 hover:text-gray-900 rounded transition-colors"
                            title="Save Rank"
                          >
                            <Save size={14} />
                          </button>
                          <button
                            onClick={() => d?.id && confirmRemoveFeature(d.id)}
                            className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white rounded transition-colors"
                            title="Remove Feature"
                          >
                            <XCircle size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
};

const AdminOnboardDesigner = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [newTag, setNewTag] = useState("");
  
  const [form, setForm] = useState({
    email: "",
    password: "vishavakarmans@designer",
    fullName: "",
    orgName: "",  
    city: "Hyderabad",
    phone: "",
    designer_type: "interior",
    experience_years: 0,
    projects_completed: 0,
    service_area_lat: "",
    service_area_lng: "",
    about_text: "",
    style_tags: [],
    video_link: "",
    video_link_2: "",
    is_verified: true,
  });

  const addTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !form.style_tags.includes(trimmed)) {
      setForm((prev) => ({ ...prev, style_tags: [...prev.style_tags, trimmed] }));
      setNewTag("");
    }
  };

  const removeTag = (tag) => {
    setForm((prev) => ({
      ...prev,
      style_tags: prev.style_tags.filter((t) => t !== tag),
    }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const expYears = parseInt(form.experience_years) || 0;
    if (expYears < 0) {
      toast.error("Experience cannot be a negative value.");
      return;
    }

    setLoading(true);

    try {
      let logoUrl = "";
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop() || 'png';
        const fileName = `logos/admin_upload_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("portfolio").upload(fileName, logoFile);
        if (uploadError) throw uploadError;
        logoUrl = supabase.storage.from("portfolio").getPublicUrl(fileName).data.publicUrl;
      }

      const payload = {
        email: form.email.trim(),
        password: form.password,
        name: form.orgName.trim() || form.fullName.trim(),
        full_name: form.fullName.trim(), 
        org_name: form.orgName.trim(),
        city: form.city,
        phone: form.phone.trim(), 
        designer_type: form.designer_type,
        experience_years: expYears,
        projects_completed: parseInt(form.projects_completed || 0),
        service_area_lat: form.service_area_lat,
        service_area_lng: form.service_area_lng,
        about_text: form.about_text.trim(),
        style_tags: form.style_tags,
        video_link_1: form.video_link.trim() || null,
        video_link_2: form.video_link_2.trim() || null,
        video_link: form.video_link.trim() || null,
        logo_url: logoUrl,
        is_verified: true,
        featured_status: "standard",
      };

      const { data, error } = await supabase.functions.invoke('admin-onboard', { body: payload });
      if (error) {
        let serverErrorMsg = error.message;
        if (error.context) {
          try {
            const errorBody = await error.context.json();
            if (errorBody?.error) {
              serverErrorMsg = errorBody.error;
            } else if (errorBody?.message) {
              serverErrorMsg = errorBody.message;
            }
          } catch {
            // non-json body in context
          }
        }
        throw new Error(serverErrorMsg);
      }
      if (data?.error) {
        throw new Error(data.error);
      }

      // Map additional fields to designers table & users location
      const designerUpdates = {
        is_subscription_active: false,
        subscription_end: null,
        is_public: false,
        about_text: form.about_text.trim(),
        style_tags: form.style_tags,
        video_link: form.video_link.trim() || null,
        video_link_2: form.video_link_2.trim() || null,
      };

      const latNum = parseFloat(form.service_area_lat);
      const lngNum = parseFloat(form.service_area_lng);
      if (!isNaN(latNum) && !isNaN(lngNum)) {
        designerUpdates.location_coords = `POINT(${lngNum} ${latNum})`;
      }

      const { error: dUpdateError } = await supabase
        .from("designers")
        .update(designerUpdates)
        .eq("email", form.email.trim());

      if (dUpdateError) {
        console.warn("Could not update extended designer fields:", dUpdateError);
      }

      // If user_id is returned and lat/lng provided, update users table location
      if (data?.user_id && !isNaN(latNum) && !isNaN(lngNum)) {
        await supabase
          .from("users")
          .update({ location: `POINT(${lngNum} ${latNum})` })
          .eq("id", data.user_id);
      }

      toast.success("VIP Account created with Pending Payment status!");
      setForm({
        email: "",
        password: "vishavakarmans@designer",
        fullName: "",
        orgName: "", 
        city: "Hyderabad",
        phone: "", 
        designer_type: "interior",
        experience_years: 0,
        projects_completed: 0,
        service_area_lat: "",
        service_area_lng: "",
        about_text: "",
        style_tags: [],
        video_link: "",
        video_link_2: "",
        is_verified: true,
      });
      setLogoFile(null);
      setNewTag("");
      if (typeof onSuccess === "function") {
        onSuccess();
      }
    } catch (error) {
      toast.error(error.message || "Failed to create designer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8 border-b border-gray-100 pb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Zap className="text-orange-500" /> White-Glove Onboarding
        </h2>
        <p className="text-gray-500">Create an instant, auto-confirmed profile for a VIP designer.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ShieldCheck size={16} /> Admin Privileges
          </h3>
          <div className="flex flex-col sm:flex-row gap-6">
            <label className="flex items-center gap-2 text-gray-900 font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_verified}
                onChange={(e) => setForm({ ...form, is_verified: e.target.checked })}
                className="w-5 h-5 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
              />
              <CheckCircle size={18} className={form.is_verified ? "text-green-500" : "text-gray-400"} /> Auto-Verify Profile
            </label>
          </div>
        </div>

        {/* Credentials & Agency Name */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Owner's Full Name (User)</label>
            <input
              type="text"
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-brand-accent transition-colors"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Agency Name (Public)</label>
            <input
              type="text"
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-brand-accent transition-colors"
              value={form.orgName}
              onChange={(e) => setForm({ ...form, orgName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Account Email</label>
            <input
              type="email"
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-brand-accent transition-colors"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Temporary Password</label>
            <input
              type="text"
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-brand-accent transition-colors font-mono"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 text-gray-400" size={16} />
              <input
                type="tel"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 pl-10 outline-none focus:border-brand-accent transition-colors"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">City</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 text-gray-400" size={16} />
              <select
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 focus:border-brand-accent outline-none appearance-none cursor-pointer transition-colors"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              >
                <option value="Hyderabad">Hyderabad</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Chennai">Chennai</option>
                <option value="Kolkata">Kolkata</option>
              </select>
            </div>
          </div>
        </div>

        {/* Experience & Classification */}
        <div className="grid md:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Designer Type</label>
            <select
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-brand-accent transition-colors cursor-pointer"
              value={form.designer_type}
              onChange={(e) => setForm({ ...form, designer_type: e.target.value })}
            >
              <option value="interior">Interior</option>
              <option value="commercial">Commercial</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Experience (Years)</label>
            <input
              type="number"
              min="0"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-brand-accent transition-colors"
              value={form.experience_years}
              onChange={(e) => setForm({ ...form, experience_years: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Projects Completed</label>
            <input
              type="number"
              min="0"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-brand-accent transition-colors"
              value={form.projects_completed}
              onChange={(e) => setForm({ ...form, projects_completed: e.target.value })}
            />
          </div>
        </div>

        {/* Service Area Coordinates */}
        <div className="pt-4 border-t border-gray-100">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1.5">
            <MapPin size={14} className="text-orange-500" /> Service Area (Coordinates)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <input
                type="number"
                step="any"
                placeholder="Latitude (e.g. 17.3850)"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 outline-none focus:border-brand-accent"
                value={form.service_area_lat}
                onChange={(e) => setForm({ ...form, service_area_lat: e.target.value })}
              />
            </div>
            <div>
              <input
                type="number"
                step="any"
                placeholder="Longitude (e.g. 78.4867)"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 outline-none focus:border-brand-accent"
                value={form.service_area_lng}
                onChange={(e) => setForm({ ...form, service_area_lng: e.target.value })}
              />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">Allows homeowners to discover this designer by geographic proximity.</p>
        </div>

        {/* Agency Logo */}
        <div className="pt-4 border-t border-gray-100">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Agency Logo</label>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center shrink-0">
              {logoFile ? <img src={URL.createObjectURL(logoFile)} className="w-full h-full object-cover" alt="preview" /> : <Upload className="text-gray-400" />}
            </div>
            <input type="file" id="adminLogo" className="hidden" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} />
            <label htmlFor="adminLogo" className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold cursor-pointer hover:bg-gray-800 transition-colors shadow-sm">Browse Image</label>
          </div>
        </div>

        {/* Style Tags */}
        <div className="pt-4 border-t border-gray-100">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Style Tags</label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Add style tag (e.g. Modern, Minimalist, Luxury)..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 outline-none focus:border-brand-accent"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleTagKeyDown}
            />
            <button
              type="button"
              onClick={addTag}
              className="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(form.style_tags || []).map((tag) => (
              <span
                key={tag}
                className="bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-red-600 transition-colors cursor-pointer"
                >
                  <CloseIcon size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Video Links */}
        <div className="pt-4 border-t border-gray-100 space-y-4">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <Video size={14} className="text-orange-500" /> Video Showcases (Optional)
          </label>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Video Link 1 (YouTube URL)</label>
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 outline-none focus:border-brand-accent"
                value={form.video_link}
                onChange={(e) => setForm({ ...form, video_link: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Video Link 2 (YouTube / Portfolio)</label>
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 outline-none focus:border-brand-accent"
                value={form.video_link_2}
                onChange={(e) => setForm({ ...form, video_link_2: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* About/Bio */}
        <div className="pt-4 border-t border-gray-100">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">About / Bio Section</label>
          <textarea
            rows="4"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-brand-accent resize-none transition-colors"
            placeholder="Tell homeowners about the firm's history, style, and philosophy..."
            value={form.about_text}
            onChange={(e) => setForm({ ...form, about_text: e.target.value })}
          />
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full py-4 bg-brand-accent hover:bg-orange-600 text-white rounded-xl font-bold text-lg flex justify-center items-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Create VIP Profile"}
        </button>
      </form>
    </div>
  );
};

// --- OPTIONS FOR CUSTOM DROPDOWNS ---
const STATUS_OPTIONS = [
  { label: "All Statuses", value: "All" },
  { label: "Featured", value: "Featured" },
  { label: "Standard", value: "Standard" },
  { label: "Expiring Soon (7d)", value: "expiring" },
  { label: "Expired Subs", value: "Expired Subs" },
  { label: "Featured Expiring (7d)", value: "featured_expiring" },
  { label: "Featured Expired", value: "featured_expired" },
];

const CITY_OPTIONS = ["All", "Hyderabad", "Bangalore", "Mumbai", "Delhi", "Chennai", "Kolkata"];

// --- SUB-COMPONENT: TABLE PAGINATION ---
const TablePagination = ({ currentPage, totalItems, pageSize, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-gray-100 mt-6">
      <div className="text-xs text-gray-500 font-medium">
        Showing <span className="font-bold text-gray-800">{startItem}</span> to{" "}
        <span className="font-bold text-gray-800">{endItem}</span> of{" "}
        <span className="font-bold text-gray-800">{totalItems}</span> results
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          Previous
        </button>
        <span className="text-xs font-bold px-3 py-1 bg-gray-100 rounded-lg text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
};

// --- MAIN ADMIN DASHBOARD ---
const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState({
    applications: [],
    designers: [],
    messages: [],
    totalClients: 0,
    totalDesigners: 0,
    verifiedDesigners: 0,
  });
  const [loading, setLoading] = useState(true);
  const [reviewingDesigner, setReviewingDesigner] = useState(null);
  const [evaluatingFeature, setEvaluatingFeature] = useState(null);
  const navigate = useNavigate();

  const [activeSearch, setActiveSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [videoProcessingForms, setVideoProcessingForms] = useState({});
  const [expandedVideoDesigners, setExpandedVideoDesigners] = useState({});

  const toggleVideoAccordion = (designerId) => {
    setExpandedVideoDesigners((prev) => ({
      ...prev,
      [designerId]: !prev[designerId],
    }));
  };

  // TABLE PAGINATION STATES
  const [activePage, setActivePage] = useState(1);
  const [inboxPage, setInboxPage] = useState(1);
  const [appsPage, setAppsPage] = useState(1);
  const ADMIN_PAGE_SIZE = 10;

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      let isAuthorizedAdmin = false;
      if (import.meta.env.VITE_PHASE1A_ADMIN_AUTH_RPC_ENABLED === "true") {
        try {
          const authorization = await resolveAdminAuthorization(supabase, null);
          isAuthorizedAdmin = authorization.authorized;
        } catch (authorizationError) {
          console.error("Admin authorization check failed:", authorizationError?.code || authorizationError?.message || "Unknown error");
          isAuthorizedAdmin = false;
        }
      } else {
        const { data: role, error: roleError } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();
        if (roleError) throw roleError;
        isAuthorizedAdmin = role?.role === "admin";
      }
      if (!isAuthorizedAdmin) {
        toast.error("Unauthorized");
        navigate("/");
        return;
      }

      let appsQuery = supabase
        .from("designer_applications")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (typeof appsQuery.range === "function") appsQuery = appsQuery.range(0, 99);

      let designersQuery = supabase
        .from("designers")
        .select("*, designer_projects(count)")
        .order("created_at", { ascending: false });
      if (typeof designersQuery.range === "function") designersQuery = designersQuery.range(0, 99);

      let msgsQuery = supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (typeof msgsQuery.range === "function") msgsQuery = msgsQuery.range(0, 99);

      // Fetch ALL data including Messages and real DB counts with .range()
      const [appsRes, designersRes, msgsRes, clientsCount, designersCount, verifiedCount] = await Promise.all([
        appsQuery,
        designersQuery,
        msgsQuery,
        supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("role", "client"),
        supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("role", "designer"),
        supabase
          .from("designers")
          .select("*", { count: "exact", head: true })
          .eq("is_verified", true),
      ]);

      setData({
        applications: Array.isArray(appsRes?.data) ? appsRes.data : [],
        designers: Array.isArray(designersRes?.data) ? designersRes.data : [],
        messages: Array.isArray(msgsRes?.data) ? msgsRes.data : [],
        totalClients: clientsCount?.count ?? 0,
        totalDesigners: designersCount?.count ?? 0,
        verifiedDesigners: verifiedCount?.count ?? 0,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Derived Lists
  const pendingVideoDesigners = useMemo(
    () =>
      (data?.designers || []).filter((d) => {
        const hasVideo = Boolean(
          (d?.video_link_1 || d?.video_link || "").trim() ||
            (d?.video_link_2 || "").trim()
        );
        const hasActiveWorkflow = Boolean(d?.video_status && d?.video_status !== "Not yet open");
        return (hasVideo || hasActiveWorkflow) && !d?.videos_approved;
      }),
    [data?.designers]
  );

  const stats = useMemo(
    () => ({
      totalClients: data?.totalClients || 0,
      totalDesigners: data?.totalDesigners || 0,
      verifiedDesigners: data?.verifiedDesigners || 0,
      collab: (data?.applications || []).length,
      pending: (data?.designers || []).filter((d) => !d?.is_verified).length,
      active: (data?.designers || []).filter((d) => d?.is_verified).length,
      videoPending: pendingVideoDesigners.length,
      requests: (data?.designers || []).filter(
        (d) => d?.featured_status === "requested"
      ).length,
      liveFeatured: (data?.designers || []).filter(
        (d) => d?.featured_status === "featured"
      ).length,
      messages: (data?.messages || []).filter((m) => m?.status === "new").length,
    }),
    [data, pendingVideoDesigners]
  );

  const pendingProfiles = useMemo(
    () => (data?.designers || []).filter((d) => !d?.is_verified),
    [data?.designers]
  );
  const activeProfiles = useMemo(
    () => (data?.designers || []).filter((d) => d?.is_verified),
    [data?.designers]
  );
  const requestedFeatures = useMemo(
    () =>
      (data?.designers || []).filter((d) => d?.featured_status === "requested"),
    [data?.designers]
  );
  const activeFeatured = useMemo(
    () =>
      (data?.designers || [])
        .filter((d) => d?.featured_status === "featured")
        .sort((a, b) => (b?.priority_score || 0) - (a?.priority_score || 0)),
    [data?.designers]
  );

  // Filter Active Designers Logic (Combined Search + City + Status)
  const filteredActiveDesigners = useMemo(() => {
    return (activeProfiles || []).filter((designer) => {
      if (!designer) return false;
      // 1. Search Check
      const searchLower = (activeSearch || "").toLowerCase();
      const name = (designer.name || "").toLowerCase();
      const email = (designer.email || "").toLowerCase();
      const phone = designer.phone ? String(designer.phone).toLowerCase() : "";
      
      const matchesSearch =
        !searchLower ||
        name.includes(searchLower) ||
        email.includes(searchLower) ||
        phone.includes(searchLower);
      if (!matchesSearch) return false;

      // 2. City Check
      const matchesCity = cityFilter === "All" || designer.city === cityFilter;
      if (!matchesCity) return false;

      // 3. Status Check
      const today = new Date();
      if (activeFilter === "all" || activeFilter === "All") return true;
      if (activeFilter === "featured" || activeFilter === "Featured") return designer.featured_status === "featured";
      if (activeFilter === "not_featured" || activeFilter === "Standard") return designer.featured_status !== "featured";

      if (activeFilter === "expiring") {
        if (!designer.subscription_end) return false;
        const diffDays = Math.ceil((new Date(designer.subscription_end) - today) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
      }

      if (activeFilter === "sub_expired" || activeFilter === "Expired Subs") {
        if (!designer.subscription_end) return false;
        return new Date(designer.subscription_end) < today;
      }

      if (activeFilter === "featured_expiring") {
        if (designer.featured_status !== "featured" || !designer.featured_expiry) return false;
        const diffDays = Math.ceil((new Date(designer.featured_expiry) - today) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
      }

      if (activeFilter === "featured_expired") {
        if (!designer.featured_expiry) return false;
        return new Date(designer.featured_expiry) < today;
      }

      return true;
    });
  }, [activeProfiles, activeSearch, activeFilter, cityFilter]);

  useEffect(() => {
    setActivePage(1);
  }, [activeSearch, activeFilter, cityFilter]);

  const paginatedActiveDesigners = useMemo(() => {
    const start = (activePage - 1) * ADMIN_PAGE_SIZE;
    return (filteredActiveDesigners || []).slice(start, start + ADMIN_PAGE_SIZE);
  }, [filteredActiveDesigners, activePage]);

  const paginatedApplications = useMemo(() => {
    const start = (appsPage - 1) * ADMIN_PAGE_SIZE;
    return (data?.applications || []).slice(start, start + ADMIN_PAGE_SIZE);
  }, [data?.applications, appsPage]);

  const paginatedMessages = useMemo(() => {
    const start = (inboxPage - 1) * ADMIN_PAGE_SIZE;
    return (data?.messages || []).slice(start, start + ADMIN_PAGE_SIZE);
  }, [data?.messages, inboxPage]);

  // --- ACTIONS ---
  const handleMessageStatus = async (id, status) => {
    try {
      await updateContactMessageStatusWithSecureRpc(supabase, id, status);
      setData((prev) => ({
        ...prev,
        messages: (prev?.messages || []).map((m) => (m.id === id ? { ...m, status } : m)),
      }));
      toast.success("Message status updated");
    } catch (err) {
      toast.error(err.message || "Failed to update message status");
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await deleteContactMessageWithSecureRpc(supabase, id);
      setData((prev) => ({
        ...prev,
        messages: (prev?.messages || []).filter((m) => m.id !== id),
      }));
      toast.success("Message deleted");
    } catch (err) {
      toast.error(err.message || "Failed to delete message");
    }
  };

  const getVideoForm = useCallback(
    (designer) => {
      const form = videoProcessingForms[designer.id];
      if (form) return form;
      return {
        status: designer.video_status || "Not yet open",
        published1: "",
        published2: "",
      };
    },
    [videoProcessingForms]
  );

  const updateVideoForm = (designerId, patch) => {
    setVideoProcessingForms((prev) => {
      const current = prev[designerId] || {
        status: "Not yet open",
        published1: "",
        published2: "",
      };
      return {
        ...prev,
        [designerId]: {
          ...current,
          ...patch,
        },
      };
    });
  };

  const handleVideoStatusChange = async (designer, newStatus) => {
    if (!window.confirm("Are you sure you want to update this video status?")) return;
    updateVideoForm(designer.id, { status: newStatus });

    const currentForm = getVideoForm(designer);
    const adminInputLink1 = (currentForm.published1 || "").trim();
    const adminInputLink2 = (currentForm.published2 || "").trim();

    let finalLink1 = adminInputLink1 ? adminInputLink1 : (designer.video_link_1 || designer.video_link || null);
    let finalLink2 = adminInputLink2 ? adminInputLink2 : (designer.video_link_2 || null);

    // Smart Auto-Shift: If slot 1 is empty but slot 2 has a link, move it to slot 1.
    if (!finalLink1 && finalLink2) {
      finalLink1 = finalLink2;
      finalLink2 = null;
    }

    const payload = {
      video_status: newStatus,
      videos_approved: newStatus === "Approved",
      video_link_1: finalLink1,
      video_link_2: finalLink2,
      video_link: finalLink1,
    };

    try {
      const { error } = await supabase
        .from("designers")
        .update(payload)
        .eq("id", designer.id);

      if (error) throw error;

      setData((prev) => ({
        ...prev,
        designers: (prev?.designers || []).map((d) =>
          d.id === designer.id ? { ...d, ...payload } : d
        ),
      }));

      toast.success(
        newStatus === "Approved"
          ? `Videos approved and published for ${designer.name}!`
          : `Video status saved as "${newStatus}" for ${designer.name}`
      );
    } catch (err) {
      toast.error(err.message || "Failed to update video status");
    }
  };

  const handleSaveVideoProcessing = async (designer, forceApproved = true, alreadyConfirmed = false) => {
    if (!alreadyConfirmed) {
      if (!window.confirm("Are you sure you want to publish & save this video workflow?")) return;
    }
    const currentForm = getVideoForm(designer);
    const newStatus = forceApproved ? "Approved" : (currentForm.status || "Approved");

    const adminInputLink1 = (currentForm.published1 || "").trim();
    const adminInputLink2 = (currentForm.published2 || "").trim();

    let finalLink1 = adminInputLink1 ? adminInputLink1 : (designer.video_link_1 || designer.video_link || null);
    let finalLink2 = adminInputLink2 ? adminInputLink2 : (designer.video_link_2 || null);

    // Smart Auto-Shift: If slot 1 is empty but slot 2 has a link, move it to slot 1.
    if (!finalLink1 && finalLink2) {
      finalLink1 = finalLink2;
      finalLink2 = null;
    }

    const payload = {
      video_status: newStatus,
      videos_approved: newStatus === "Approved",
      video_link_1: finalLink1,
      video_link_2: finalLink2,
      video_link: finalLink1,
    };

    try {
      const { error } = await supabase
        .from("designers")
        .update(payload)
        .eq("id", designer.id);

      if (error) throw error;

      setData((prev) => ({
        ...prev,
        designers: (prev?.designers || []).map((d) =>
          d.id === designer.id ? { ...d, ...payload } : d
        ),
      }));

      toast.success(`Videos published & saved for ${designer.name}!`);
    } catch (err) {
      toast.error(err.message || "Failed to update video workflow.");
    }
  };

  const handleApproveVideos = async (designerId) => {
    const designer = (data?.designers || []).find((d) => d.id === designerId);
    if (!designer) return;
    await handleSaveVideoProcessing(designer, true);
  };

  const handleUpdateVideoLink = async (designerId, videoLink) => {
    const { error } = await supabase
      .from("designers")
      .update({ video_link: videoLink || null })
      .eq("id", designerId);

    if (error) {
      toast.error("Failed to update video link: " + error.message);
      throw error;
    }

    setData((prev) => ({
      ...prev,
      designers: (prev?.designers || []).map((d) =>
        d.id === designerId ? { ...d, video_link: videoLink || null } : d
      ),
    }));
    toast.success("Official YouTube URL updated successfully!");
  };

  const updatePriority = async (id, score) => {
    const { error } = await supabase
      .from("designers")
      .update({ priority_score: score })
      .eq("id", id);
    if (!error) {
      toast.success("Rank Updated");
      setData((prev) => ({
        ...prev,
        designers: (prev?.designers || []).map((d) =>
          d.id === id ? { ...d, priority_score: score } : d
        ),
      }));
    } else {
      console.error(error);
      toast.error("Save Failed");
    }
  };

  const toggleFeature = async (
    id,
    status,
    initialScore = 0,
    durationDays = 0
  ) => {
    let expiry = null;
    if (status === "featured" && durationDays > 0) {
      const designer = (data?.designers || []).find((d) => d?.id === id);
      const currentExpiry = designer?.featured_expiry
        ? new Date(designer.featured_expiry)
        : null;
      const now = new Date();
      let baseDate = currentExpiry && currentExpiry > now ? currentExpiry : now;
      const newDate = new Date(baseDate);
      newDate.setDate(newDate.getDate() + durationDays);
      expiry = newDate.toISOString();
    }
    const { error } = await supabase
      .from("designers")
      .update({
        featured_status: status,
        priority_score: initialScore,
        featured_expiry: expiry,
      })
      .eq("id", id);
    if (!error) {
      toast.success(
        status === "featured"
          ? `Boosted for ${durationDays} days!`
          : "Status Updated"
      );
      fetchAllData();
    } else {
      console.error(error);
      toast.error("Update Failed");
    }
  };

  const handleApproveFeatureRequest = async (id, days) => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);

    const { error } = await supabase
      .from("designers")
      .update({
        featured_status: "featured",
        featured_expiry: expiry.toISOString(),
        priority_score: 100,
      })
      .eq("id", id);

    if (!error) {
      toast.success(`Featured Badge approved for ${days} days!`);
      setEvaluatingFeature(null);
      fetchAllData();
    } else {
      toast.error("Failed to approve request.");
    }
  };

  const handleRejectFeatureRequest = async (id) => {
    const { error } = await supabase
      .from("designers")
      .update({
        featured_status: "standard",
      })
      .eq("id", id);

    if (!error) {
      toast.success("Featured Request rejected.");
      setEvaluatingFeature(null);
      fetchAllData();
    } else {
      toast.error("Failed to reject request.");
    }
  };

  const handleRenewSubscription = async (id) => {
    if (!window.confirm("Approve a 1-year subscription for this designer?")) return;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(startDate.getFullYear() + 1);

    try {
      const { error } = await supabase
        .from("designers")
        .update({
          is_verified: true,
          is_subscription_active: true,
          subscription_start: startDate.toISOString(),
          subscription_end: endDate.toISOString(),
          renewal_requested: false,
          is_public: true 
        })
        .eq("id", id);

      if (error) throw error;
      toast.success("Subscription extended by 1 year!");
      fetchAllData();
    } catch (err) {
      console.error("Failed to renew subscription:", err);
      toast.error("Failed to renew subscription.");
    }
  };

  const handleOnboard = async (app) => {
    const toastId = toast.loading("Approving application...");
    try {
      await onboardDesignerApplicationWithSuccess(supabase, app, () => {
        toast.success("Application approved. The designer can now access the dashboard and complete their profile.", { id: toastId });
      });
      setData((prev) => ({
        ...prev,
        applications: (prev?.applications || []).filter((a) => a.id !== app?.id),
      }));
      fetchAllData();
    } catch (err) {
      console.error(`Failed to onboard application ${app?.id ?? "(missing id)"}:`, err);
      toast.error(err.message || "Application approval failed.", { id: toastId });
      fetchAllData();
    }
  };

  // --- Update Designer Approval (Paywall Active) ---
  const handlePublishProfile = async (id) => {
    const toastId = toast.loading("Approving...");

    setData((prev) => ({
      ...prev,
      designers: (prev?.designers || []).map((d) =>
        d.id === id ? { 
          ...d, 
          is_verified: true, 
          is_subscription_active: false,
          subscription_end: null,
          is_public: false
        } : d
      ),
    }));
    setReviewingDesigner(null);
    setActiveTab("active");
    try {
      await verifyDesignerProfile(supabase, id);
      toast.success("Designer Approved (Paywall Active)!", { id: toastId });
      fetchAllData();
    } catch (error) {
      console.error(`Failed to verify designer ${id}:`, error);
      toast.error(error.message || "Designer verification failed.", { id: toastId });
      fetchAllData();
    }
  };

  const handleSetDesignerVisibility = async (id, isPublic) => {
    const action = isPublic ? "restore public visibility for" : "hide";
    const confirmation = isPublic
      ? "Restore this designer's public visibility? Existing verification and subscription state will be preserved."
      : "Hide this designer from public discovery? Their profile and historical data will be preserved.";
    if (!window.confirm(confirmation)) return;

    try {
      const parsedId = Number(id);
      const targetId = !isNaN(parsedId) ? parsedId : id;

      // Explicitly target .eq('id', targetId) and only send clean is_public status
      const { error } = await supabase
        .from("designers")
        .update({ is_public: Boolean(isPublic) })
        .eq("id", targetId);

      if (error) throw error;

      setData((prev) => ({
        ...prev,
        designers: (prev?.designers || []).map((designer) =>
          designer.id === id || designer.id === targetId ? { ...designer, is_public: isPublic } : designer
        ),
      }));
      toast.success(isPublic ? "Designer visibility restored." : "Designer hidden; profile data preserved.");
    } catch (error) {
      console.error(`Failed to ${action} designer ${id}:`, error);
      toast.error(error.message || "Could not update designer visibility.");
    }
  };

  const handleRejectProfile = async (id) => {
    if (!window.confirm("Hide this profile from public discovery? The designer's profile and history will be preserved.")) return;
    try {
      const parsedId = Number(id);
      const targetId = !isNaN(parsedId) ? parsedId : id;

      const { error } = await supabase
        .from("designers")
        .update({ is_public: false })
        .eq("id", targetId);

      if (error) throw error;

      setData((prev) => ({
        ...prev,
        designers: (prev?.designers || []).map((designer) =>
          designer.id === id || designer.id === targetId ? { ...designer, is_public: false } : designer
        ),
      }));
      setReviewingDesigner(null);
      toast.success("Profile hidden; designer data preserved.");
    } catch (error) {
      console.error(`Failed to hide designer profile ${id}:`, error);
      toast.error(error.message || "Could not hide designer profile.");
    }
  };

  const handleRejectApp = async (id) => {
    if (!window.confirm("Reject request?")) return;
    try {
      await rejectDesignerApplication(supabase, id);
      toast.success("Application marked as rejected.");
      fetchAllData();
    } catch (error) {
      console.error("Failed to reject application:", error);
      toast.error("Failed to reject application.");
    }
  };
  
  const handleLogout = async () => {
    try {
      await signOut(queryClient, null, "/login");
    } catch (error) {
      console.warn("Server signout failed, forcing local cleanup", error);
    } finally {
      if (queryClient) {
        queryClient.setQueryData(['auth', 'user'], null);
        queryClient.setQueryData(['auth', 'session'], null);
        queryClient.clear();
      }
      localStorage.clear();
      sessionStorage.clear();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500" size={40} />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row text-gray-900 font-sans overflow-hidden">
      {/* MOBILE NAV */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 z-50 flex justify-around p-3 safe-area-bottom shadow-2xl">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex flex-col items-center gap-1 ${
            activeTab === "overview" ? "text-orange-500" : "text-gray-500"
          }`}
        >
          <BarChart3 size={20} />
          <span className="text-[10px]">Overview</span>
        </button>
        <button
          onClick={() => setActiveTab("applications")}
          className={`flex flex-col items-center gap-1 ${
            activeTab === "applications" ? "text-orange-500" : "text-gray-500"
          }`}
        >
          <UserPlus size={20} />
          <span className="text-[10px]">Requests</span>
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex flex-col items-center gap-1 ${
            activeTab === "pending" ? "text-orange-500" : "text-gray-500"
          }`}
        >
          <Briefcase size={20} />
          <span className="text-[10px]">Verify</span>
        </button>
        <button
          onClick={() => setActiveTab("inbox")}
          className={`flex flex-col items-center gap-1 ${
            activeTab === "inbox" ? "text-orange-500" : "text-gray-500"
          }`}
        >
          <MessageSquare size={20} />
          <span className="text-[10px]">Inbox</span>
        </button>
        {/* NEW: Mobile Video Processing Tab */}
        <button
          onClick={() => setActiveTab("video-processing")}
          className={`flex flex-col items-center gap-1 relative ${
            activeTab === "video-processing" ? "text-orange-500" : "text-gray-500"
          }`}
        >
          <Video size={20} />
          <span className="text-[10px]">Videos</span>
          {stats.videoPending > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] font-bold px-1 rounded-full">
              {stats.videoPending}
            </span>
          )}
        </button>
        {/* NEW: Mobile Onboard Tab */}
        <button
          onClick={() => setActiveTab("onboard")}
          className={`flex flex-col items-center gap-1 ${
            activeTab === "onboard" ? "text-orange-500" : "text-gray-500"
          }`}
        >
          <Zap size={20} />
          <span className="text-[10px]">Onboard</span>
        </button>
      </nav>

      {/* SIDEBAR */}
      <aside className="hidden md:flex w-72 bg-white border-r border-gray-200 p-6 flex-col h-screen sticky top-0">
        <div className="flex items-center gap-3 mb-10 text-orange-500 font-bold text-2xl tracking-tight">
          <ShieldAlert size={28} /> Admin
        </div>
        <nav className="space-y-2 flex-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all font-medium ${
              activeTab === "overview"
                ? "bg-orange-600 text-white shadow-md"
                : "hover:bg-gray-100 text-gray-500"
            }`}
          >
            <BarChart3 size={20} /> Overview
          </button>

          <button
            onClick={() => setActiveTab("applications")}
            className={`w-full flex justify-between px-5 py-3.5 rounded-xl transition-all font-medium ${
              activeTab === "applications"
                ? "bg-orange-600 text-white shadow-md"
                : "hover:bg-gray-100 text-gray-500"
            }`}
          >
            <span className="flex items-center gap-3"><UserPlus size={20} /> Requests</span>{" "}
            {stats.collab > 0 && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${activeTab === 'applications' ? 'bg-white text-orange-600' : 'bg-orange-100 text-orange-600'}`}>
                {stats.collab}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("pending")}
            className={`w-full flex justify-between px-5 py-3.5 rounded-xl transition-all font-medium ${
              activeTab === "pending"
                ? "bg-orange-600 text-white shadow-md"
                : "hover:bg-gray-100 text-gray-500"
            }`}
          >
            <span className="flex items-center gap-3"><Briefcase size={20} /> Verify Profiles</span>{" "}
            {stats.pending > 0 && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${activeTab === 'pending' ? 'bg-white text-orange-600' : 'bg-orange-100 text-orange-600'}`}>
                {stats.pending}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("active")}
            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all font-medium ${
              activeTab === "active"
                ? "bg-orange-600 text-white shadow-md"
                : "hover:bg-gray-100 text-gray-500"
            }`}
          >
            <Users size={20} /> Active Designers
          </button>
          
          {/* NEW: Desktop Onboard Tab */}
          <button
            onClick={() => setActiveTab("onboard")}
            className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all font-medium ${
              activeTab === "onboard"
                ? "bg-orange-600 text-white shadow-md"
                : "hover:bg-gray-100 text-gray-500"
            }`}
          >
            <Zap size={20} /> Onboard VIP
          </button>

          {/* VIDEO PROCESSING TAB */}
          <button
            onClick={() => setActiveTab("video-processing")}
            className={`w-full flex justify-between px-5 py-3.5 rounded-xl transition-all font-medium ${
              activeTab === "video-processing"
                ? "bg-orange-600 text-white shadow-md"
                : "hover:bg-gray-100 text-gray-500"
            }`}
          >
            <span className="flex items-center gap-3">
              <Video size={20} /> Video Processing
            </span>
            {stats.videoPending > 0 && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${activeTab === 'video-processing' ? 'bg-white text-orange-600' : 'bg-amber-100 text-amber-700'}`}>
                {stats.videoPending}
              </span>
            )}
          </button>

          {/* INBOX TAB */}
          <button
            onClick={() => setActiveTab("inbox")}
            className={`w-full flex justify-between px-5 py-3.5 rounded-xl transition-all font-medium ${
              activeTab === "inbox"
                ? "bg-orange-600 text-white shadow-md"
                : "hover:bg-gray-100 text-gray-500"
            }`}
          >
            <span className="flex items-center gap-3">
              <MessageSquare size={20} /> Inbox
            </span>
            {stats.messages > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {stats.messages}
              </span>
            )}
          </button>
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-red-500 hover:bg-red-50 px-4 py-3 rounded-xl font-bold transition-all"
        >
          <LogOut size={20} /> Sign Out
        </button>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto mb-20 md:mb-0 h-[calc(100vh-60px)] md:h-screen">
        <header className="mb-8 hidden md:block">
          <h1 className="text-3xl font-bold text-gray-900 capitalize">
            {activeTab === "pending" ? "Verify Profiles" : 
             activeTab === "onboard" ? "VIP Onboarding" : 
             activeTab === "video-processing" ? "Video Processing" :
             activeTab}
          </h1>
        </header>

        {activeTab === "overview" && (
          <OverviewTab
            stats={stats}
            requested={requestedFeatures}
            featured={activeFeatured}
            onUpdatePriority={updatePriority}
            onToggleFeature={toggleFeature}
            onEvaluateRequest={setEvaluatingFeature}
          />
        )}

        {/* --- VIP ONBOARD TAB --- */}
        {activeTab === "onboard" && (
          <AdminOnboardDesigner onSuccess={fetchAllData} />
        )}

        {activeTab === "applications" && (
          <div className="space-y-4">
            {(data.applications || []).length === 0 && (
              <div className="text-center py-16 bg-gray-50 rounded-3xl border border-gray-200 border-dashed text-gray-500">
                No new requests found.
              </div>
            )}
            {paginatedApplications.map((app) => (
              <div
                key={app?.id}
                className="bg-white p-5 rounded-2xl border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
              >
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {app?.org_name || "Unnamed Application"}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-md bg-orange-50 border border-orange-200 text-xs font-bold text-orange-700 uppercase tracking-wide">
                      {app?.designer_type || "Designer"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} /> {app?.city || "Unknown City"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone size={14} /> {app?.phone || "N/A"}
                    </span>
                    <span className="flex items-center gap-1 text-gray-900 font-medium">
                      <Mail size={14} className="text-gray-500" /> {app?.email || "N/A"}
                    </span>
                  </div>
                  {(app?.website_url || app?.portfolio_link) && (
                    <a
                      href={app.website_url || app.portfolio_link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 font-medium text-sm hover:text-blue-700 hover:underline mt-3 inline-flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100"
                    >
                      View Portfolio
                    </a>
                  )}
                </div>
                <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
                  <button
                    onClick={() => handleOnboard(app)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm text-sm cursor-pointer"
                  >
                    <CheckCircle size={16} /> Approve
                  </button>
                  <button
                    onClick={() => app?.id && handleRejectApp(app.id)}
                    className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 px-5 py-2.5 rounded-xl font-bold transition-colors text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              </div>
            ))}
            <TablePagination
              currentPage={appsPage}
              totalItems={(data?.applications || []).length}
              pageSize={ADMIN_PAGE_SIZE}
              onPageChange={setAppsPage}
            />
          </div>
        )}

        {activeTab === "pending" && (
          <div className="space-y-4">
            {(pendingProfiles || []).length === 0 && (
              <div className="text-center py-16 bg-gray-50 rounded-3xl border border-gray-200 border-dashed text-gray-500">
                No profiles pending.
              </div>
            )}
            {(pendingProfiles || []).map((d) => (
              <div
                key={d?.id}
                className="bg-white p-5 rounded-2xl border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all group"
              >
                {/* Left Side: Avatar + Info */}
                <div className="flex gap-5 items-center w-full">
                  {/* Avatar Area */}
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center relative shadow-inner">
                    {d?.logo_url ? (
                      <img
                        src={d.logo_url}
                        alt="logo"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-400 uppercase">
                          {d?.name?.[0] || "?"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Text Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900 truncate leading-none">
                        {d?.name || "Unnamed"}
                      </h3>
                      {/* Type Badge */}
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 border border-gray-200 text-[10px] uppercase font-bold text-gray-600 tracking-wide">
                        {d?.designer_type || "Designer"}
                      </span>
                    </div>

                    {/* Location & Bio */}
                    <div className="text-xs text-gray-500 flex items-center gap-2 mb-1.5">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-gray-400" />
                        {d?.city || "Unknown City"}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span className="truncate max-w-[200px] italic text-gray-500">
                        {d?.bio || "No bio added"}
                      </span>
                    </div>

                    {/* Project Status Badge */}
                    <div className="flex items-center gap-2">
                      {(d?.designer_projects?.[0]?.count || 0) > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wide">
                          <CheckCircle size={10} />{" "}
                          {d.designer_projects[0].count} Projects
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold uppercase tracking-wide">
                          <AlertTriangle size={10} /> 0 Projects
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Action Button (Review) */}
                <button
                  onClick={() => setReviewingDesigner(d)}
                  className="w-full sm:w-auto bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 whitespace-nowrap"
                >
                  <Eye size={18} /> Review Profile
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "active" && (
          <div className="space-y-6">
            {/* ADMIN FILTERS */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center relative z-20">
              <div className="relative w-full md:w-64">
                <Search
                  className="absolute left-3.5 top-3 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full bg-white border border-gray-200 hover:border-brand-accent rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-brand-accent outline-none shadow-sm transition-all font-medium"
                  value={activeSearch}
                  onChange={(e) => setActiveSearch(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                {/* Status Dropdown */}
                <div className="relative w-full sm:w-64">
                  <button
                    onClick={() => { setIsStatusOpen(!isStatusOpen); setIsCityOpen(false); }}
                    className="w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-white border border-gray-200 hover:border-brand-accent rounded-xl text-sm font-bold text-gray-700 shadow-sm transition-all"
                  >
                    <span>{STATUS_OPTIONS.find(opt => opt.value === activeFilter)?.label || 'All Statuses'}</span>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isStatusOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isStatusOpen && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in max-h-64 overflow-y-auto">
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { setActiveFilter(opt.value); setIsStatusOpen(false); }}
                          className={`w-full text-left px-4 py-3 text-sm transition-colors ${activeFilter === opt.value ? 'bg-orange-50 text-brand-accent font-bold' : 'text-gray-700 hover:bg-gray-50 font-medium'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* City Dropdown */}
                <div className="relative w-full sm:w-48">
                  <button
                    onClick={() => { setIsCityOpen(!isCityOpen); setIsStatusOpen(false); }}
                    className="w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-white border border-gray-200 hover:border-brand-accent rounded-xl text-sm font-bold text-gray-700 shadow-sm transition-all"
                  >
                    <span>{cityFilter === 'All' ? 'All Cities' : cityFilter}</span>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isCityOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isCityOpen && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in max-h-64 overflow-y-auto">
                      {CITY_OPTIONS.map((city) => (
                        <button
                          key={city}
                          onClick={() => { setCityFilter(city); setIsCityOpen(false); }}
                          className={`w-full text-left px-4 py-3 text-sm transition-colors ${cityFilter === city ? 'bg-orange-50 text-brand-accent font-bold' : 'text-gray-700 hover:bg-gray-50 font-medium'}`}
                        >
                          {city === 'All' ? 'All Cities' : city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {(filteredActiveDesigners || []).length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-200 border-dashed">
                  <Filter className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-gray-500">No designers found.</p>
                  <button
                    onClick={() => {
                      setActiveFilter("all");
                      setCityFilter("All");
                      setActiveSearch("");
                    }}
                    className="mt-2 text-brand-accent hover:underline font-medium text-sm"
                  >
                    Reset
                  </button>
                </div>
              ) : (
                paginatedActiveDesigners.map((d) => (
                  <ActiveDesignerCard
                    key={d?.id}
                    d={d}
                    navigate={navigate}
                    toggleFeature={toggleFeature}
                    handleSetDesignerVisibility={handleSetDesignerVisibility}
                    handleRenewSubscription={handleRenewSubscription}
                  />
                ))
              )}
              <TablePagination
                currentPage={activePage}
                totalItems={(filteredActiveDesigners || []).length}
                pageSize={ADMIN_PAGE_SIZE}
                onPageChange={setActivePage}
              />
            </div>
          </div>
        )}

        {/* --- VIDEO PROCESSING TAB --- */}
        {activeTab === "video-processing" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Pending Video Reviews</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Designers who submitted videos awaiting admin review and approval before displaying publicly.
                </p>
              </div>
              <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-full w-fit">
                {pendingVideoDesigners.length} pending
              </span>
            </div>

            {pendingVideoDesigners.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-200 border-dashed">
                <Video className="mx-auto text-gray-400 mb-2" size={36} />
                <p className="text-gray-500 font-medium">All submitted designer videos have been processed!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {pendingVideoDesigners.map((designer) => {
                  const video1 = designer?.video_link_1 || designer?.video_link;
                  const video2 = designer?.video_link_2;
                  const embed1 = video1 ? getYouTubeEmbedUrl(video1) : null;
                  const embed2 = video2 ? getYouTubeEmbedUrl(video2) : null;
                  const form = getVideoForm(designer);
                  const isExpanded = Boolean(expandedVideoDesigners[designer.id]);

                  const statusColors = {
                    "Not yet open": "bg-gray-100 text-gray-700 border-gray-200",
                    Downloaded: "bg-blue-50 text-blue-700 border-blue-200",
                    Editing: "bg-purple-50 text-purple-700 border-purple-200",
                    Uploading: "bg-amber-50 text-amber-700 border-amber-200",
                    Published: "bg-cyan-50 text-cyan-700 border-cyan-200",
                    Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
                  };

                  return (
                    <div
                      key={designer.id}
                      className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all"
                    >
                      {/* ACCORDION CLICKABLE HEADER */}
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleVideoAccordion(designer.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggleVideoAccordion(designer.id);
                          }
                        }}
                        className="flex items-center justify-between gap-4 p-5 hover:bg-gray-50/70 cursor-pointer select-none transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                            {designer.logo_url ? (
                              <img
                                src={designer.logo_url}
                                alt="logo"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-lg text-gray-500">
                                {designer.name?.[0] || "?"}
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                              {designer.name}
                            </h3>
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                              <span>{designer.city || "Unknown City"}</span>
                              <span>•</span>
                              <span>{designer.designer_type || "Designer"}</span>
                              <span>•</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                                  statusColors[form.status] || "bg-gray-100 text-gray-600 border-gray-200"
                                }`}
                              >
                                {form.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-gray-400 hidden sm:inline">
                            {isExpanded ? "Collapse" : "Review Videos"}
                          </span>
                          <div className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </div>
                        </div>
                      </div>

                      {/* ACCORDION CONTENT BODY */}
                      {isExpanded && (
                        <div className="p-6 pt-2 border-t border-gray-100 space-y-6 animate-in fade-in duration-200">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pt-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                              Submitted Videos (Inspect & Download)
                            </h4>
                            <button
                              type="button"
                              onClick={() => handleSaveVideoProcessing(designer, true)}
                              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer w-fit"
                            >
                              <CheckCircle size={15} /> Publish & Save
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Video 1 */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col gap-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-gray-700 uppercase">Raw Video 1</span>
                                {!video1 && (
                                  <span className="px-2 py-0.5 bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold rounded-lg">
                                    Video Removed by Designer
                                  </span>
                                )}
                              </div>
                              {video1 ? (
                                <>
                                  {embed1 ? (
                                    <iframe
                                      src={embed1}
                                      title="Video 1 Preview"
                                      className="w-full aspect-video rounded-lg border border-gray-200"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                    />
                                  ) : (
                                    <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500 px-3 text-center">
                                      Non-embeddable or external link
                                    </div>
                                  )}
                                  <div className="flex items-center justify-between gap-2 mt-1">
                                    <span className="text-xs text-gray-500 truncate">{video1}</span>
                                    <a
                                      href={video1}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download
                                      className="px-2.5 py-1 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-blue-600 shrink-0 inline-flex items-center gap-1"
                                    >
                                      <Download size={12} /> Inspect / Open
                                    </a>
                                  </div>
                                </>
                              ) : (
                                <p className="text-xs text-red-600 italic py-4 font-medium">Video Removed by Designer</p>
                              )}
                            </div>

                            {/* Video 2 */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col gap-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-gray-700 uppercase">Raw Video 2</span>
                                {!video2 && (
                                  <span className="px-2 py-0.5 bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold rounded-lg">
                                    Video Removed by Designer
                                  </span>
                                )}
                              </div>
                              {video2 ? (
                                <>
                                  {embed2 ? (
                                    <iframe
                                      src={embed2}
                                      title="Video 2 Preview"
                                      className="w-full aspect-video rounded-lg border border-gray-200"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                    />
                                  ) : (
                                    <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500 px-3 text-center">
                                      Non-embeddable or external link
                                    </div>
                                  )}
                                  <div className="flex items-center justify-between gap-2 mt-1">
                                    <span className="text-xs text-gray-500 truncate">{video2}</span>
                                    <a
                                      href={video2}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download
                                      className="px-2.5 py-1 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-blue-600 shrink-0 inline-flex items-center gap-1"
                                    >
                                      <Download size={12} /> Inspect / Open
                                    </a>
                                  </div>
                                </>
                              ) : (
                                <p className="text-xs text-red-600 italic py-4 font-medium">Video Removed by Designer</p>
                              )}
                            </div>
                          </div>

                          {/* Processing Controls */}
                          <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200/60 space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                              Video Processing & Final YouTube Links
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                  Status
                                </label>
                                <select
                                  value={form.status || designer.video_status || "Not yet open"}
                                  onChange={(e) => handleVideoStatusChange(designer, e.target.value)}
                                  className="w-full text-xs font-medium bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                  <option value="Not yet open">Not yet open</option>
                                  <option value="Downloaded">Downloaded</option>
                                  <option value="Editing">Editing</option>
                                  <option value="Uploading">Uploading</option>
                                  <option value="Published">Published</option>
                                  <option value="Approved">Approved</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                  Published YouTube Link 1
                                </label>
                                <input
                                  type="url"
                                  value={form.published1}
                                  onChange={(e) => updateVideoForm(designer.id, { published1: e.target.value })}
                                  placeholder="https://youtube.com/watch?v=..."
                                  className="w-full text-xs bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                  Published YouTube Link 2
                                </label>
                                <input
                                  type="url"
                                  value={form.published2}
                                  onChange={(e) => updateVideoForm(designer.id, { published2: e.target.value })}
                                  placeholder="https://youtube.com/watch?v=..."
                                  className="w-full text-xs bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- INBOX TAB --- */}
        {activeTab === "inbox" && (
          <div className="space-y-4">
            {(data?.messages || []).length === 0 && (
              <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-200 border-dashed">
                <MessageSquare
                  className="mx-auto text-gray-400 mb-2"
                  size={32}
                />
                <p className="text-gray-500">Your inbox is empty.</p>
              </div>
            )}
            {paginatedMessages.map((msg) => (
              <div
                key={msg?.id}
                className={`bg-white p-5 rounded-2xl border flex flex-col md:flex-row justify-between gap-4 transition-all ${
                  msg?.status === "new"
                    ? "border-blue-300 shadow-md shadow-blue-100 bg-blue-50/30"
                    : "border-gray-200"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-gray-900">{msg?.name || "Anonymous"}</h3>
                    {msg?.status === "new" && (
                      <span className="bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        NEW
                      </span>
                    )}
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={10} />{" "}
                      {msg?.created_at ? new Date(msg.created_at).toLocaleDateString() : "Recent"}
                    </span>
                  </div>
                  {msg?.email && (
                    <a
                      href={`mailto:${msg.email}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline mb-2 block"
                    >
                      {msg.email}
                    </a>
                  )}
                  <p className="text-gray-700 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
                    "{msg?.message || ""}"
                  </p>
                </div>
                <div className="flex flex-col gap-2 justify-center min-w-30">
                  {msg?.status === "new" ? (
                    <button
                      onClick={() => msg?.id && handleMessageStatus(msg.id, "read")}
                      className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <CheckSquare size={14} /> Mark Read
                    </button>
                  ) : (
                    <span className="text-center text-xs font-bold text-green-700 border border-green-200 rounded-lg py-2 bg-green-50 shadow-sm">
                      Read
                    </span>
                  )}
                  <button
                    onClick={() => msg?.id && handleDeleteMessage(msg.id)}
                    className="bg-white hover:bg-red-50 text-red-600 border border-gray-200 hover:border-red-200 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
            <TablePagination
              currentPage={inboxPage}
              totalItems={(data?.messages || []).length}
              pageSize={ADMIN_PAGE_SIZE}
              onPageChange={setInboxPage}
            />
          </div>
        )}
      </main>

      {reviewingDesigner && (
        <ReviewModal
          designer={reviewingDesigner}
          onClose={() => setReviewingDesigner(null)}
          onApprove={handlePublishProfile}
          onReject={handleRejectProfile}
        />
      )}

      {evaluatingFeature && (
        <FeatureRequestModal
          designer={evaluatingFeature}
          onClose={() => setEvaluatingFeature(null)}
          onApprove={handleApproveFeatureRequest}
          onReject={handleRejectFeatureRequest}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
