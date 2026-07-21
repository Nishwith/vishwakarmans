import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser, useUserProfile } from "../hooks/useAuth";
import { updateUserProfile } from "../services/authService";
import { MapPin, Phone, ArrowRight, Loader2, Compass } from "lucide-react";
import toast from "react-hot-toast";

const CompleteProfile = () => {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: profile, isLoading: profileLoading } = useUserProfile(user?.id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [phone, setPhone] = useState("");
  const [cityDropdown, setCityDropdown] = useState("Hyderabad");
  const [customCity, setCustomCity] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const phoneInputRef = useRef(null);

  const standardCities = ["Hyderabad", "Mumbai", "Bangalore", "Delhi", "Kolkata", "Chennai"];

  // Pre-fill existing data immediately on load
  useEffect(() => {
    if (profile) {
      if (profile.phone) setPhone(profile.phone);
      if (profile.city) {
        if (standardCities.includes(profile.city)) {
          setCityDropdown(profile.city);
        } else {
          setCityDropdown("Others");
          setCustomCity(profile.city);
        }
      }
    }
  }, [profile]);

  // Auto-focus the first input field on render
  useEffect(() => {
    if (!userLoading && !profileLoading && phoneInputRef.current) {
      phoneInputRef.current.focus();
    }
  }, [userLoading, profileLoading]);

  // Redirect if user has already completed profile
  useEffect(() => {
    if (profile?.profile_completed) {
      navigate("/", { replace: true });
    }
  }, [profile, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in.");
      navigate("/login");
      return;
    }

    // 1. Phone number validation (Indian 10-digit number starting with 6, 7, 8, or 9)
    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    const targetPhone = cleanPhone.startsWith('+91') 
      ? cleanPhone.slice(3) 
      : (cleanPhone.startsWith('91') && cleanPhone.length === 12) 
        ? cleanPhone.slice(2) 
        : cleanPhone;

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(targetPhone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    // 2. City selection
    let finalCity = cityDropdown;
    if (cityDropdown === "Others") {
      const trimmedCustom = customCity.trim();
      if (!trimmedCustom) {
        toast.error("Please specify your city.");
        return;
      }
      finalCity = trimmedCustom;
    }

    setSubmitting(true);
    try {
      await updateUserProfile(user.id, {
        phone: targetPhone,
        city: finalCity,
        profile_completed: true,
      });

      toast.success("Profile updated successfully!");
      
      // Invalidate the auth query cache so the routing guard sees completion status immediately
      await queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
      await queryClient.invalidateQueries({ queryKey: ["users", user.id] });

      navigate("/", { replace: true });
    } catch (error) {
      toast.error(error.message || "Failed to complete profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (userLoading || profileLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <Loader2 className="animate-spin text-brand-accent w-12 h-12 stroke-[2.5]" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex flex-col md:flex-row bg-white overflow-hidden animate-fade-in">
      {/* Left side: Premium branding context */}
      <div className="hidden md:flex md:w-1/2 bg-slate-950 relative items-center justify-center p-16">
        <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-accent/20 to-slate-950/90"></div>
        
        <div className="relative z-10 max-w-md text-white space-y-8">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md animate-float">
            <Compass className="text-brand-accent w-7 h-7" />
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold tracking-tight leading-tight font-heading">
              Personalizing your <span className="text-brand-accent">matches.</span>
            </h1>
            <p className="text-gray-400 text-lg font-sans leading-relaxed font-light">
              Connect directly with verified interior architects. Provide your details so we can match you with the best design professionals in your area.
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Borderless, spacious form layout */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-20 lg:p-28 bg-white">
        <div className="w-full max-w-lg space-y-12 animate-slide-up">
          
          {/* Welcoming Typographic Header */}
          <div className="space-y-4">
            <h2 className="text-5xl font-bold text-gray-900 tracking-tight font-heading">
              Complete your profile
            </h2>
            <p className="text-gray-500 font-sans font-light text-lg">
              We just need a few basic details to set up your personalized workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-8">
              
              {/* Minimal Phone Input Container */}
              <div className="group relative border-b border-gray-100 focus-within:border-brand-accent transition-all duration-500 py-2">
                <label htmlFor="phone" className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">
                  Phone Number
                </label>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-300 group-focus-within:text-brand-accent transition-colors duration-500 mr-3" />
                  <input
                    id="phone"
                    type="tel"
                    ref={phoneInputRef}
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full py-2 bg-transparent text-gray-900 placeholder-gray-300 text-lg font-sans font-normal border-none outline-none focus:ring-0 focus:outline-none"
                  />
                </div>
              </div>

              {/* Minimal City Dropdown Container */}
              <div className="group relative border-b border-gray-100 focus-within:border-brand-accent transition-all duration-500 py-2">
                <label htmlFor="cityDropdown" className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">
                  Current City
                </label>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-300 group-focus-within:text-brand-accent transition-colors duration-500 mr-3" />
                  <select
                    id="cityDropdown"
                    required
                    value={cityDropdown}
                    onChange={(e) => setCityDropdown(e.target.value)}
                    className="block w-full py-2 bg-transparent text-gray-900 text-lg font-sans font-normal border-none outline-none focus:ring-0 focus:outline-none cursor-pointer"
                  >
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Kolkata">Kolkata</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>

              {/* Conditional Input for Custom City */}
              {cityDropdown === "Others" && (
                <div className="group relative border-b border-brand-accent transition-all duration-500 py-2 animate-in fade-in slide-in-from-top-2">
                  <label htmlFor="customCity" className="text-xs font-bold text-brand-accent block mb-1 uppercase tracking-widest">
                    Specify City
                  </label>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-brand-accent mr-3" />
                    <input
                      id="customCity"
                      type="text"
                      required
                      placeholder="Type your city..."
                      value={customCity}
                      onChange={(e) => setCustomCity(e.target.value)}
                      className="block w-full py-2 bg-transparent text-gray-900 placeholder-gray-300 text-lg font-sans font-normal border-none outline-none focus:ring-0 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Immersive Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="group relative w-full py-5 bg-gray-900 hover:bg-brand-accent text-white font-bold rounded-2xl transition-all duration-500 ease-out flex items-center justify-center gap-3 cursor-pointer shadow-xl shadow-slate-900/5 hover:shadow-brand-accent/25 hover:-translate-y-0.5 disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <>
                    <span className="tracking-wide">Explore Marketplace</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform duration-500 ease-out" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
