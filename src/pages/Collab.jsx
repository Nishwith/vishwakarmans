import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import {
  Loader2,
  Building2,
  MapPin,
  Globe,
  Phone,
  Briefcase,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";

const Collab = () => {
  const navigate = useNavigate();
  const isMounted = useRef(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [agreed, setAgreed] = useState(false);

  // CHANGED: portfolioLink -> websiteUrl
  const [formData, setFormData] = useState({
    orgName: "",
    city: "Hyderabad",
    phone: "", 
    websiteUrl: "", 
    designerType: "interior",
  });
  const [customCity, setCustomCity] = useState("");

  useEffect(() => {
    isMounted.current = true;
    const checkEligibility = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          if (isMounted.current) navigate("/login");
          return;
        }
        if (isMounted.current) {
          setUser(user);
        }

        const { data: userRole } = await supabase
          .from("users")
          .select("role, phone")
          .eq("id", user.id)
          .maybeSingle();

        if (isMounted.current) {
          setFormData((prev) => ({
            ...prev,
            phone: userRole?.phone || user.user_metadata?.phone || user.phone || "",
          }));
        }

        if (userRole?.role === "admin" || userRole?.role === "designer") {
          toast.error("You are already a registered partner.");
          if (isMounted.current) navigate("/");
          return;
        }

        const { data: existingApp } = await supabase
          .from("designer_applications")
          .select("status")
          .eq("user_id", user.id)
          .maybeSingle();

        if (existingApp) {
          toast.error(`You have already submitted an application.`);
          setTimeout(() => {
            if (isMounted.current) navigate("/");
          }, 1500);
          return;
        }
      } catch (error) {
        console.error("Check failed:", error);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };
    checkEligibility();
    return () => {
      isMounted.current = false;
    };
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreed) {
      toast.error("You must agree to the Terms and Privacy Policy.");
      return;
    }

    // ponytail: same Indian phone regex as complete-profile (BUG-007)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Please enter a valid 10-digit Indian phone number starting with 6-9.");
      return;
    }

    // ponytail: same city selection logic as complete-profile (BUG-013)
    let finalCity = formData.city;
    if (formData.city === "Others") {
      const trimmedCustom = customCity.trim();
      if (!trimmedCustom) {
        toast.error("Please specify your city.");
        return;
      }
      finalCity = trimmedCustom;
    }

    setSubmitting(true);
    try {
      if (!formData.orgName)
        throw new Error("Please fill in the Organization Name.");

      const { error } = await supabase.from("designer_applications").insert({
        user_id: user.id,
        org_name: formData.orgName,
        city: finalCity,
        phone: formData.phone,
        email: user.email,
        // CHANGED: sending to website_url in DB
        website_url: formData.websiteUrl || null, 
        designer_type: formData.designerType,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Application Submitted! We will contact you soon.");
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    } finally {
      if (isMounted.current) setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-accent" size={48} />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pt-4 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter font-sans leading-[1.1]">
            COLLAB. <br className="md:hidden" />
            <span className="text-brand-accent relative inline-block">
              EXPAND.
              <div className="absolute -bottom-3 left-0 w-full h-4 bg-brand-accent/20 -z-10 -rotate-2 skew-x-12"></div>
            </span>{" "}
            GROW.
          </h1>
          <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto">
            Showcase your work to thousands of homeowners. Apply today to join India's fastest growing community of design professionals.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-2xl animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Firm / Designer Name
              </label>
              <div className="relative">
                <Building2
                  className="absolute left-3 top-4 text-gray-500"
                  size={18}
                />
                <input
                  type="text"
                  name="orgName"
                  value={formData.orgName}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Studio Zen"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 focus:border-brand-accent focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  City
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-4 text-gray-500"
                    size={18}
                  />
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 focus:border-brand-accent focus:outline-none appearance-none cursor-pointer"
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

              {formData.city === "Others" && (
                <div className="md:col-span-2 animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Specify City
                  </label>
                  <div className="relative">
                    <MapPin
                      className="absolute left-3 top-4 text-brand-accent"
                      size={18}
                    />
                    <input
                      type="text"
                      required
                      placeholder="Type your city..."
                      value={customCity}
                      onChange={(e) => setCustomCity(e.target.value)}
                      className="w-full bg-gray-50 border border-brand-accent rounded-xl py-3 pl-10 pr-4 text-gray-900 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Business Phone
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-4 text-gray-500"
                    size={18}
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    readOnly
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-3 pl-10 pr-10 text-gray-500 cursor-not-allowed focus:outline-none"
                  />
                  <Lock
                    className="absolute right-3 top-3 text-gray-600"
                    size={16}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Phone linked to your account.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Specialization
              </label>
              <div className="relative">
                <Briefcase
                  className="absolute left-3 top-4 text-gray-500"
                  size={18}
                />
                <select
                  name="designerType"
                  value={formData.designerType}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 focus:border-brand-accent focus:outline-none appearance-none"
                >
                  <option value="interior">Interior Designer</option>
                  <option value="commercial">Commercial / Architect</option>
                  <option value="both">Both (Interior & Commercial)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Website Link{" "}
                <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <Globe
                  className="absolute left-3 top-4 text-gray-500"
                  size={18}
                />
                <input
                  type="url"
                  name="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={handleChange}
                  placeholder="https://www.studiozen.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 focus:border-brand-accent focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex items-start gap-3 mt-4 p-3 bg-white/5 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
              <input
                type="checkbox"
                id="terms"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded cursor-pointer accent-brand-accent"
              />
              <label
                htmlFor="terms"
                className="text-sm text-gray-500 select-none cursor-pointer leading-tight"
              >
                I agree to the{" "}
                <Link
                  to="/terms"
                  className="text-brand-accent hover:underline font-bold"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="text-brand-accent hover:underline font-bold"
                >
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full text-gray-900 font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4 
              ${
                !agreed
                  ? "bg-gray-600 opacity-50 cursor-not-allowed"
                  : "bg-brand-accent hover:bg-orange-600 active:scale-95"
              }`}
            >
              {submitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Submit Application"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Collab;