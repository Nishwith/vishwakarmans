import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Loader2,
  Phone,
  MapPin,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "Hyderabad",
    customCity: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // 1. Validation: Terms
    if (!agreed) {
      toast.error("You must agree to the Terms and Privacy Policy.");
      return;
    }

    // --- NEW: Phone Number Validation ---
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }
    // ------------------------------------

    // 2. Determine Final City Value
    let finalCity = formData.city;
    if (formData.city === "Other") {
      if (!formData.customCity.trim()) {
        toast.error("Please enter your city name.");
        return;
      }
      finalCity = formData.customCity.trim();
    }

    setLoading(true);
    try {
      // 3. Sign Up (Auth)
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            city: finalCity,
          },
        },
      });

      if (error) throw error;

      // ---------------------------------------------------------
      // 4. VIP DESIGNER ACCOUNT CLAIMING LOGIC
      // ---------------------------------------------------------
      if (data?.user) {
        // Check if an admin pre-created a designer profile for this exact email
        const { data: existingProfile } = await supabase
          .from("designers")
          .select("id")
          .eq("email", formData.email)
          .maybeSingle(); // maybeSingle safely returns null if it doesn't exist

        if (existingProfile) {
          // It exists! Link the newly created auth user ID to the admin-created profile
          await supabase
            .from("designers")
            .update({ user_id: data.user.id })
            .eq("id", existingProfile.id);

          console.log("VIP Profile Claimed successfully!");
        }
      }
      // ---------------------------------------------------------

      // 5. Handle Success Message based on Confirmation setting
      if (data?.user && !data?.session) {
        // Case: Email Confirmation is ON (No session created yet)
        toast.success(
          "Registration successful! Please check your email to confirm your account.",
          { duration: 6000 },
        );
        navigate("/login");
      } else {
        // Case: Email Confirmation is OFF (Session created immediately)
        toast.success("Account created! You are now logged in.");
        navigate("/");
      }
    } catch (error) {
      toast.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-accent/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-white border border-gray-200 p-8 rounded-2xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Create Account
          </h2>
          <p className="text-gray-500">Join thousands of homeowners</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-500" size={18} />
              <input
                type="text"
                name="fullName"
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 focus:border-brand-accent focus:outline-none transition-colors"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-500" size={18} />
              <input
                type="email"
                name="email"
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 focus:border-brand-accent focus:outline-none transition-colors"
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          {/* Phone & City Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                Phone
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-3 text-gray-500"
                  size={18}
                />
                <input
                  type="tel"
                  name="phone"
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 focus:border-brand-accent focus:outline-none transition-colors"
                  placeholder="9876543210"
                  required
                />
              </div>
            </div>

            {/* City Dropdown */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                City
              </label>
              <div className="relative">
                <MapPin
                  className="absolute left-3 top-3 text-gray-500"
                  size={18}
                />
                <select
                  name="city"
                  onChange={handleChange}
                  value={formData.city}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 focus:border-brand-accent focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Conditional Input for "Other" City */}
          {formData.city === "Other" && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                Enter City Name
              </label>
              <div className="relative">
                <MapPin
                  className="absolute left-3 top-3 text-brand-accent"
                  size={18}
                />
                <input
                  type="text"
                  name="customCity"
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-brand-accent rounded-xl py-3 pl-10 pr-4 text-gray-900 focus:border-brand-accent focus:outline-none transition-colors"
                  placeholder="Type your city..."
                  required
                />
              </div>
            </div>
          )}

          {/* Password - WITH TOGGLE */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-12 text-gray-900 focus:border-brand-accent focus:outline-none transition-colors"
                placeholder="••••••••"
                required
              />
              <button
                type="button" // Prevents form submission
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-900 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Checkbox */}
          <div className="flex items-start gap-3 mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 rounded cursor-pointer accent-brand-accent"
            />
            <label
              htmlFor="terms"
              className="text-sm text-gray-600 select-none cursor-pointer leading-tight"
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
            disabled={loading || !agreed}
            className={`w-full font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4 
            ${
              !agreed || loading
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-brand-accent text-white hover:bg-orange-600 active:scale-95"
            }`}
          >
            {loading ? <Loader2 className="animate-spin" /> : "Sign Up"}
          </button>

          <div className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-gray-900 hover:text-brand-accent font-bold transition-colors"
            >
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
