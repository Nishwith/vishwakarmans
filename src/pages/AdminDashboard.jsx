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
  ExternalLink
} from "lucide-react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { signOut } from "../services/authService";

// --- SUB-COMPONENT: FEATURE REQUEST EVALUATION MODAL ---
const FeatureRequestModal = ({ designer, onClose, onApprove, onReject }) => {
  if (!designer) return null;

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
  }, [designer?.id]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-gray-200 w-full max-w-3xl rounded-3xl shadow-2xl relative animate-in fade-in zoom-in duration-200 my-auto flex flex-col max-h-[90vh]">
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
              {designer.logo_url ? (
                <img
                  src={designer.logo_url}
                  alt={designer.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-gray-400">
                  {designer.name?.[0]}
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-xl font-bold text-gray-900">{designer.name}</h3>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-xs text-gray-600">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin size={14} className="text-gray-400" /> {designer.city || "N/A"}
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <Phone size={14} className="text-green-500" /> {designer.phone || "N/A"}
                </span>
                <span className="flex items-center gap-1 font-medium break-all">
                  <Mail size={14} className="text-blue-500" /> {designer.email || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <CheckSquare size={16} className="text-orange-500" /> Client Reviews & Verification ({reviews.length})
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

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-gray-200 w-full max-w-2xl rounded-2xl shadow-2xl relative animate-in fade-in zoom-in duration-200 my-auto flex flex-col max-h-[90vh]">
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
              {designer.logo_url ? (
                <img
                  src={designer.logo_url}
                  alt="logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-3xl text-gray-400 bg-gray-100">
                  {designer.name?.[0]}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {designer.name}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                <span className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                  {designer.designer_type}
                </span>
                <span className="px-3 py-1.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                  <MapPin size={14} className="text-gray-500" /> {designer.city}
                </span>
                {designer.experience_years > 0 && (
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                    <Clock size={14} className="text-gray-500" /> {designer.experience_years} Years Exp
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-xl text-orange-600 border border-orange-200">
                  <ImageIcon size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">
                    Portfolio
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {projectCount} Projects Uploaded
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-3 shadow-sm">
              <div className="flex flex-col gap-1 text-sm">
                <span className="text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                  Email
                </span>
                <span className="text-gray-900 font-mono select-all break-all font-medium">
                  {designer.email}
                </span>
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <span className="text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                  Phone
                </span>
                <span className="text-gray-900 font-mono select-all font-medium">
                  {designer.phone}
                </span>
              </div>
              {designer.website_url && (
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
          </div>

          {((designer.style_tags && designer.style_tags.length > 0) ||
            designer.video_link ||
            designer.video_link_2) && (
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4 shadow-sm">
              {designer.style_tags && designer.style_tags.length > 0 && (
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
              )}
              
              {(designer.video_link || designer.video_link_2) && (
                <div className="flex flex-col gap-2 pt-2">
                  {designer.video_link && (
                    <a
                      href={designer.video_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      <Video size={16} /> View Video Intro 1
                    </a>
                  )}
                  {designer.video_link_2 && (
                    <a
                      href={designer.video_link_2}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      <Video size={16} /> View Video Intro 2
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2 mb-3">
                Short Bio
              </h3>
              <p className="text-gray-600 italic bg-gray-50 p-4 rounded-xl border border-gray-100">
                "{designer.bio || "No bio provided"}"
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2 mb-3">
                About The Firm
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                {designer.about_text || "No description provided."}
              </p>
            </div>
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
  handleDeleteDesigner,
}) => {
  const [showContact, setShowContact] = useState(false);

  // --- FEATURED BOOST STATUS ---
  let featDaysLeft = null;
  let isFeatured = false;
  if (d.featured_status === "featured" && d.featured_expiry) {
    const diff = new Date(d.featured_expiry) - new Date();
    featDaysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (featDaysLeft >= 0) isFeatured = true;
  }

  // --- SUBSCRIPTION STATUS ---
  let subDaysLeft = -1;
  if (d.subscription_end) {
    subDaysLeft = Math.ceil((new Date(d.subscription_end) - new Date()) / (1000 * 60 * 60 * 24));
  }
  const isSubExpired = subDaysLeft < 0 || !d.subscription_end;
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
      onClick={() => navigate(`/designers/${d.id}`)}
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-4 items-center w-full">
          <div className="w-12 h-12 rounded-full bg-gray-50 border-2 border-gray-300 overflow-hidden shrink-0 relative">
            {d.logo_url ? (
              <img src={d.logo_url} alt="logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-slate-500">
                {d.name?.[0]}
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
              {d.name}
            </h3>
            
            <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1.5 items-center">
              <span>{d.city}</span>
              <span>•</span>
              <span className="text-gray-900 font-medium">{d.projects_completed || d.designer_projects?.[0]?.count || 0} Projects</span>
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
                <Zap size={12} className="text-brand-accent" /> Priority: {d.priority_score || 0}
              </span>
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
              navigate(`/admin/manage-designer/${d.id}`);
            }}
            className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
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
            onClick={() => handleDeleteDesigner(d.id)}
            className="w-auto text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl border border-red-200 hover:border-red-500 transition-colors flex items-center justify-center gap-2 shadow-sm"
            title="Delete Designer"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {showContact && (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div onClick={(e) => e.stopPropagation()} className="cursor-text min-w-0">
              <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Email</p>
              <div className="flex items-center gap-2 text-sm text-gray-900 select-all break-all">
                <Mail size={14} className="text-blue-500 shrink-0" /> {d.email}
              </div>
            </div>
            <div onClick={(e) => e.stopPropagation()} className="cursor-text">
              <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Phone</p>
              <div className="flex items-center gap-2 text-sm text-gray-900 select-all">
                <Phone size={14} className="text-green-500 shrink-0" /> {d.phone}
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
  stats,
  requested,
  featured,
  onUpdatePriority,
  onToggleFeature,
  onEvaluateRequest,
}) => {
  const [priorityMap, setPriorityMap] = useState(() => {
    const initial = {};
    if (featured) {
      featured.forEach((d) => (initial[d.id] = d.priority_score || 0));
    }
    return initial;
  });

  const [reqSearch, setReqSearch] = useState("");
  const [featSearch, setFeatSearch] = useState("");

  const handleSavePriority = (id) => onUpdatePriority(id, priorityMap[id]);
  const getDaysLeft = (dateString) => {
    if (!dateString) return -1;
    return Math.ceil(
      (new Date(dateString) - new Date()) / (1000 * 60 * 60 * 24)
    );
  };
  const confirmRemoveFeature = (id) => {
    if (window.confirm("Remove Featured Status?"))
      onToggleFeature(id, "none", 0, 0);
  };

  const filteredRequested = (requested || []).filter(
    (d) =>
      d.name.toLowerCase().includes(reqSearch.toLowerCase()) ||
      d.email?.toLowerCase().includes(reqSearch.toLowerCase())
  );
  const filteredFeatured = (featured || []).filter(
    (d) =>
      d.name.toLowerCase().includes(featSearch.toLowerCase()) ||
      d.email?.toLowerCase().includes(featSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Clients",
            count: stats.totalClients || 0,
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            label: "Total Designers",
            count: stats.totalDesigners || 0,
            icon: Briefcase,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
          },
          {
            label: "Verified Designers",
            count: stats.verifiedDesigners || 0,
            icon: CheckCircle,
            color: "text-green-500",
            bg: "bg-green-500/10",
          },
          {
            label: "Inbox Messages",
            count: stats.messages || 0,
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
                key={d.id}
                className="bg-gray-50/70 border border-gray-200 p-4 rounded-xl flex items-center justify-between gap-4 hover:border-gray-300 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 overflow-hidden shrink-0 shadow-inner flex items-center justify-center">
                    {d.logo_url ? (
                      <img src={d.logo_url} alt={d.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-gray-400 text-lg">{d.name?.[0]}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm truncate">{d.name}</h4>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin size={12} /> {d.city || "N/A"}
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
                {filteredFeatured.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center">
                      No active featured designers.
                    </td>
                  </tr>
                ) : (
                  filteredFeatured.map((d) => {
                    const daysLeft = getDaysLeft(d.featured_expiry);
                    return (
                      <tr key={d.id} className="hover:bg-gray-100/30">
                        <td className="p-3 pl-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={d.logo_url}
                              className="w-8 h-8 rounded-full bg-gray-100 object-cover"
                              alt=""
                            />
                            <div>
                              <p className="text-gray-900 font-bold text-sm">
                                {d.name}
                              </p>
                              <p className="text-[10px] text-gray-500">
                                {d.phone}
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
                            value={priorityMap[d.id] ?? 0}
                            onChange={(e) =>
                              setPriorityMap({
                                ...priorityMap,
                                [d.id]: parseInt(e.target.value),
                              })
                            }
                          />
                        </td>
                        <td className="p-3 text-right pr-4 flex justify-end gap-2">
                          <button
                            onClick={() => handleSavePriority(d.id)}
                            className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-600 hover:text-gray-900 rounded transition-colors"
                            title="Save Rank"
                          >
                            <Save size={14} />
                          </button>
                          <button
                            onClick={() => confirmRemoveFeature(d.id)}
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

const AdminOnboardDesigner = () => {
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  
  const [form, setForm] = useState({
    email: "", password: "vishavakarmans@designer", fullName: "", orgName: "",  
    city: "Hyderabad", phone: "",
    designer_type: "interior", experience_years: 0, projects_completed: 0, about_text: "",
    is_verified: true, featured_status: "standard" 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let logoUrl = "";
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `logos/admin_upload_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("portfolio").upload(fileName, logoFile);
        if (uploadError) throw uploadError;
        logoUrl = supabase.storage.from("portfolio").getPublicUrl(fileName).data.publicUrl;
      }

      const payload = {
        email: form.email, password: form.password, full_name: form.fullName, 
        org_name: form.orgName, city: form.city, phone: form.phone, 
        designer_type: form.designer_type, experience_years: parseInt(form.experience_years),
        projects_completed: parseInt(form.projects_completed || 0),
        about_text: form.about_text, logo_url: logoUrl,
        is_verified: form.is_verified, featured_status: form.featured_status
      };

      const { data, error } = await supabase.functions.invoke('admin-onboard', { body: payload });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      // --- VIP Onboarding: Enforce Pending Payment state ---
      await supabase.from("designers").update({
        is_subscription_active: false,
        subscription_end: null,
        is_public: false
      }).eq("email", form.email);
      // -----------------------------------------------------

      toast.success("VIP Account created with Pending Payment status!");
      setForm({
        email: "", password: "vishavakarmans@designer", fullName: "", orgName: "", 
        city: "Hyderabad", phone: "", 
        designer_type: "interior", experience_years: 0, projects_completed: 0, about_text: "",
        is_verified: true, featured_status: "standard"
      });
      setLogoFile(null);
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
            <Star size={16} /> Admin Privileges
          </h3>
          <div className="flex flex-col sm:flex-row gap-6">
            <label className="flex items-center gap-2 text-gray-900 font-bold cursor-pointer">
              <input type="checkbox" checked={form.is_verified} onChange={(e) => setForm({...form, is_verified: e.target.checked})} className="w-5 h-5 rounded text-orange-600 focus:ring-orange-500 cursor-pointer" />
              <CheckCircle size={18} className={form.is_verified ? "text-green-500" : "text-gray-400"}/> Auto-Verify Profile
            </label>
            <label className="flex items-center gap-2 text-gray-900 font-bold cursor-pointer">
              <input type="checkbox" checked={form.featured_status === "featured"} onChange={(e) => setForm({...form, featured_status: e.target.checked ? "featured" : "standard"})} className="w-5 h-5 rounded text-orange-600 focus:ring-orange-500 cursor-pointer" />
              <Star size={18} className={form.featured_status === "featured" ? "text-yellow-500 fill-yellow-500" : "text-gray-400"}/> Make Featured
            </label>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Owner's Full Name (User)</label><input type="text" required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-brand-accent transition-colors" value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})} /></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Agency Name (Public)</label><input type="text" required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-brand-accent transition-colors" value={form.orgName} onChange={(e) => setForm({...form, orgName: e.target.value})} /></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Account Email</label><input type="email" required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-brand-accent transition-colors" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} /></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Temporary Password</label><input type="text" required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-brand-accent transition-colors font-mono" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} /></div>
          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Phone Number</label>
             <div className="relative">
               <Phone className="absolute left-3 top-3.5 text-gray-400" size={16} />
               <input type="tel" required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 pl-10 outline-none focus:border-brand-accent transition-colors" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
             </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">City</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 text-gray-400" size={16} />
              <select className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 focus:border-brand-accent outline-none appearance-none cursor-pointer transition-colors" value={form.city} onChange={(e) => setForm({...form, city: e.target.value})}>
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

        <div className="grid md:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Designer Type</label><select className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-brand-accent transition-colors cursor-pointer" value={form.designer_type} onChange={(e) => setForm({...form, designer_type: e.target.value})}><option value="interior">Interior</option><option value="commercial">Commercial</option><option value="both">Both</option></select></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Experience (Years)</label><input type="number" min="0" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-brand-accent transition-colors" value={form.experience_years} onChange={(e) => setForm({...form, experience_years: e.target.value})} /></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Projects Completed</label><input type="number" min="0" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-brand-accent transition-colors" value={form.projects_completed} onChange={(e) => setForm({...form, projects_completed: e.target.value})} /></div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Agency Logo</label>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center shrink-0">
              {logoFile ? <img src={URL.createObjectURL(logoFile)} className="w-full h-full object-cover" alt="preview" /> : <Upload className="text-gray-400" />}
            </div>
            <input type="file" id="adminLogo" className="hidden" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} />
            <label htmlFor="adminLogo" className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold cursor-pointer hover:bg-gray-800 transition-colors shadow-sm">Browse Image</label>
          </div>
        </div>

        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Detailed About Section</label><textarea rows="4" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-brand-accent resize-none transition-colors" value={form.about_text} onChange={(e) => setForm({...form, about_text: e.target.value})} /></div>

        <button disabled={loading} type="submit" className="w-full py-4 bg-brand-accent hover:bg-orange-600 text-white rounded-xl font-bold text-lg flex justify-center items-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50">
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

// --- MAIN ADMIN DASHBOARD ---
const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState({
    applications: [],
    designers: [],
    messages: [],
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
      const { data: role } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();
      if (role?.role !== "admin") {
        toast.error("Unauthorized");
        navigate("/");
        return;
      }

      // Fetch ALL data including Messages and real DB counts
      const [appsRes, designersRes, msgsRes, clientsCount, designersCount, verifiedCount] = await Promise.all([
        supabase
          .from("designer_applications")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("designers")
          .select("*, designer_projects(count)")
          .order("created_at", { ascending: false }),
        supabase
          .from("contact_messages")
          .select("*")
          .order("created_at", { ascending: false }),
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
        applications: appsRes.data || [],
        designers: designersRes.data || [],
        messages: msgsRes.data || [],
        totalClients: clientsCount.count || 0,
        totalDesigners: designersCount.count || 0,
        verifiedDesigners: verifiedCount.count || 0,
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
  const stats = useMemo(
    () => ({
      totalClients: data.totalClients || 0,
      totalDesigners: data.totalDesigners || 0,
      verifiedDesigners: data.verifiedDesigners || 0,
      collab: (data.applications || []).length,
      pending: (data.designers || []).filter((d) => !d.is_verified).length,
      active: (data.designers || []).filter((d) => d.is_verified).length,
      requests: (data.designers || []).filter(
        (d) => d.featured_status === "requested"
      ).length,
      liveFeatured: (data.designers || []).filter(
        (d) => d.featured_status === "featured"
      ).length,
      messages: (data.messages || []).filter((m) => m.status === "new").length,
    }),
    [data]
  );

  const pendingProfiles = useMemo(
    () => (data.designers || []).filter((d) => !d.is_verified),
    [data.designers]
  );
  const activeProfiles = useMemo(
    () => (data.designers || []).filter((d) => d.is_verified),
    [data.designers]
  );
  const requestedFeatures = useMemo(
    () =>
      (data.designers || []).filter((d) => d.featured_status === "requested"),
    [data.designers]
  );
  const activeFeatured = useMemo(
    () =>
      (data.designers || [])
        .filter((d) => d.featured_status === "featured")
        .sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0)),
    [data.designers]
  );

  // Filter Active Designers Logic (Combined Search + City + Status)
  const filteredActiveDesigners = useMemo(() => {
    return (activeProfiles || []).filter((designer) => {
      // 1. Search Check
      const searchLower = activeSearch.toLowerCase();
      const matchesSearch =
        designer.name.toLowerCase().includes(searchLower) ||
        (designer.email && designer.email.toLowerCase().includes(searchLower)) ||
        (designer.phone && designer.phone.includes(searchLower));
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

  // --- ACTIONS ---
  const handleMessageStatus = async (id, status) => {
    setData((prev) => ({
      ...prev,
      messages: prev.messages.map((m) => (m.id === id ? { ...m, status } : m)),
    }));
    await supabase.from("contact_messages").update({ status }).eq("id", id);
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    setData((prev) => ({
      ...prev,
      messages: prev.messages.filter((m) => m.id !== id),
    }));
    await supabase.from("contact_messages").delete().eq("id", id);
    toast.success("Message deleted");
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
        designers: prev.designers.map((d) =>
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
      const designer = data.designers.find((d) => d.id === id);
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
      toast.error("Failed to renew subscription.");
    }
  };

  const handleOnboard = async (app) => {
    const toastId = toast.loading("Onboarding...");
    try {
      const { data: existing } = await supabase
        .from("designers")
        .select("id")
        .eq("user_id", app.user_id)
        .maybeSingle();
      if (!existing) {
        const { error: insertError } = await supabase.from("designers").insert({
          user_id: app.user_id,
          name: app.org_name,
          city: app.city,
          email: app.email,
          phone: app.phone,
          designer_type: app.designer_type,
          is_verified: false,
          rating_avg: 0,
          rating_count: 0,
        });
        if (insertError) throw insertError;
      }
      await supabase.from("designer_applications").delete().eq("id", app.id);
      await supabase
        .from("users")
        .update({ role: "designer" })
        .eq("id", app.user_id);
      toast.success("Onboarded!", { id: toastId });
      fetchAllData();
    } catch (err) {
      console.error(err);
      toast.error("Error Onboarding", { id: toastId });
    }
  };

  // --- Update Designer Approval (Paywall Active) ---
  const handlePublishProfile = async (id) => {
    const toastId = toast.loading("Approving...");

    setData((prev) => ({
      ...prev,
      designers: prev.designers.map((d) =>
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
      await supabase
        .from("designers")
        .update({ 
          is_verified: true,
          is_subscription_active: false,
          subscription_end: null,
          is_public: false 
        })
        .eq("id", id);
      toast.success("Designer Approved (Paywall Active)!", { id: toastId });
      fetchAllData();
    } catch {
      toast.error("Failed", { id: toastId });
      fetchAllData();
    }
  };

  const handleDeleteDesigner = async (id) => {
    if (
      !window.confirm(
        "Delete designer? This will revert them to a Client account."
      )
    )
      return;
    try {
      const designer = data.designers.find((d) => d.id === id);
      if (designer?.user_id) {
        await supabase
          .from("users")
          .update({ role: "client" })
          .eq("id", designer.user_id);
      }
      await supabase.from("designers").delete().eq("id", id);
      setData((prev) => ({
        ...prev,
        designers: prev.designers.filter((d) => d.id !== id),
      }));
      setReviewingDesigner(null);
      toast.success("Deleted & Role Reverted");
    } catch (error) {
      console.error(error);
      toast.error("Error deleting");
    }
  };

  const handleRejectApp = async (id) => {
    if (window.confirm("Reject request?")) {
      await supabase.from("designer_applications").delete().eq("id", id);
      fetchAllData();
    }
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
      queryClient.clear();
      localStorage.clear();
      navigate("/login");
    } catch {
      // fallback
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

        {/* --- NEW: ONBOARD VIP TAB --- */}
        {activeTab === "onboard" && (
          <AdminOnboardDesigner />
        )}

        {activeTab === "applications" && (
          <div className="space-y-4">
            {(data.applications || []).length === 0 && (
              <div className="text-center py-16 bg-gray-50 rounded-3xl border border-gray-200 border-dashed text-gray-500">
                No new requests found.
              </div>
            )}
            {(data.applications || []).map((app) => (
              <div
                key={app.id}
                className="bg-white p-5 rounded-2xl border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
              >
                <div className="flex-1 w-full">
                  <h3 className="text-xl font-bold text-gray-900">
                    {app.org_name}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} /> {app.city}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone size={14} /> {app.phone}
                    </span>
                    <span className="flex items-center gap-1 text-gray-900 font-medium">
                      <Mail size={14} className="text-gray-500" /> {app.email}
                    </span>
                  </div>
                  {(app.website_url || app.portfolio_link) && (
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
                <div className="flex gap-3 w-full md:w-auto">
                  <button
                    onClick={() => handleOnboard(app)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <UserPlus size={18} /> Onboard
                  </button>
                  <button
                    onClick={() => handleRejectApp(app.id)}
                    className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 px-5 py-2.5 rounded-xl font-bold transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
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
                key={d.id}
                className="bg-white p-5 rounded-2xl border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all group"
              >
                {/* Left Side: Avatar + Info */}
                <div className="flex gap-5 items-center w-full">
                  {/* Avatar Area */}
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center relative shadow-inner">
                    {d.logo_url ? (
                      <img
                        src={d.logo_url}
                        alt="logo"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-400 uppercase">
                          {d.name?.[0]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Text Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900 truncate leading-none">
                        {d.name}
                      </h3>
                      {/* Type Badge */}
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 border border-gray-200 text-[10px] uppercase font-bold text-gray-600 tracking-wide">
                        {d.designer_type || "Designer"}
                      </span>
                    </div>

                    {/* Location & Bio */}
                    <div className="text-xs text-gray-500 flex items-center gap-2 mb-1.5">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-gray-400" />
                        {d.city || "Unknown City"}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span className="truncate max-w-[200px] italic text-gray-500">
                        {d.bio || "No bio added"}
                      </span>
                    </div>

                    {/* Project Status Badge */}
                    <div className="flex items-center gap-2">
                      {d.designer_projects?.[0]?.count > 0 ? (
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
                (filteredActiveDesigners || []).map((d) => (
                  <ActiveDesignerCard
                    key={d.id}
                    d={d}
                    navigate={navigate}
                    toggleFeature={toggleFeature}
                    handleDeleteDesigner={handleDeleteDesigner}
                    handleRenewSubscription={handleRenewSubscription}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* --- INBOX TAB --- */}
        {activeTab === "inbox" && (
          <div className="space-y-4">
            {(data.messages || []).length === 0 && (
              <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-200 border-dashed">
                <MessageSquare
                  className="mx-auto text-gray-400 mb-2"
                  size={32}
                />
                <p className="text-gray-500">Your inbox is empty.</p>
              </div>
            )}
            {(data.messages || []).map((msg) => (
              <div
                key={msg.id}
                className={`bg-white p-5 rounded-2xl border flex flex-col md:flex-row justify-between gap-4 transition-all ${
                  msg.status === "new"
                    ? "border-blue-300 shadow-md shadow-blue-100 bg-blue-50/30"
                    : "border-gray-200"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-gray-900">{msg.name}</h3>
                    {msg.status === "new" && (
                      <span className="bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        NEW
                      </span>
                    )}
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={10} />{" "}
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <a
                    href={`mailto:${msg.email}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline mb-2 block"
                  >
                    {msg.email}
                  </a>
                  <p className="text-gray-700 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
                    "{msg.message}"
                  </p>
                </div>
                <div className="flex flex-col gap-2 justify-center min-w-30">
                  {msg.status === "new" ? (
                    <button
                      onClick={() => handleMessageStatus(msg.id, "read")}
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
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="bg-white hover:bg-red-50 text-red-600 border border-gray-200 hover:border-red-200 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {reviewingDesigner && (
        <ReviewModal
          designer={reviewingDesigner}
          onClose={() => setReviewingDesigner(null)}
          onApprove={handlePublishProfile}
          onReject={handleDeleteDesigner}
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