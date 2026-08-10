import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Phone, MapPin, Loader2, Building, ShieldCheck } from "lucide-react";
import { supabase } from "../supabaseClient";
import { updateUserProfile } from "../services/authService";

const PHONE_REGEX = /^[6-9]\d{9}$/;
const CITY_OPTIONS = [
  "Hyderabad",
  "Bangalore",
  "Mumbai",
  "Delhi",
  "Kolkata",
  "Chennai",
  "Other",
];

const CompleteProfile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [customCity, setCustomCity] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!PHONE_REGEX.test(phone.trim())) {
      setError("Please enter a valid phone number.");
      return;
    }

    const finalCity = city === "Other" ? customCity.trim() : city;
    if (!finalCity || finalCity.trim() === "" || finalCity === "Select City" || finalCity === "Select a City") {
      toast.error("Please select a valid city.");
      setError("Please select a valid city.");
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("User session expired. Please log in again.");
        navigate("/login");
        return;
      }

      await updateUserProfile(user.id, {
        phone: phone.trim(),
        city: finalCity,
        profile_completed: true,
      });

      await queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Profile completed successfully!");
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-8 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-orange-500/10 text-brand-accent rounded-full flex items-center justify-center mx-auto mb-3">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            Please provide your details to connect with top designers.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                id="phone"
                name="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit phone number (e.g. 9876543210)"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-gray-900 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent outline-none transition-all placeholder-gray-400"
                required
              />
            </div>
          </div>

          {/* City Dropdown */}
          <div>
            <label htmlFor="city" className="block text-xs font-bold text-gray-500 uppercase mb-2">
              City
            </label>
            <div className="relative">
              <MapPin size={18} className="absolute left-3.5 top-3.5 text-gray-400 pointer-events-none" />
              <select
                id="city"
                name="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-gray-900 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent outline-none transition-all appearance-none cursor-pointer"
                required
              >
                <option value="">Select a City</option>
                {CITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Conditional Custom City Field */}
          {city === "Other" && (
            <div>
              <label htmlFor="custom-city" className="block text-xs font-bold text-gray-500 uppercase mb-2">
                Custom City Name
              </label>
              <div className="relative">
                <Building size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  id="custom-city"
                  name="customCity"
                  type="text"
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  placeholder="Enter your city name"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-gray-900 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent outline-none transition-all placeholder-gray-400"
                  required
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-accent hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Explore Marketplace"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
