import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";
import { signUp } from "../services/authService";
import { supabase } from "../services/supabaseClient";
import GoogleSignInButton from "../components/GoogleSignInButton";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!agreed) {
      toast.error("You must agree to the Terms and Privacy Policy.");
      return;
    }

    setLoading(true);
    try {
      // Sign Up (Auth) using decoupled authService
      // Since phone/city are collected on onboarding, they start null here, with profile_completed: false
      const data = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        profile_completed: false,
      });

      // VIP DESIGNER ACCOUNT CLAIMING LOGIC
      if (data?.user) {
        // Check if an admin pre-created a designer profile for this exact email
        const { data: existingProfile } = await supabase
          .from("designers")
          .select("id")
          .eq("email", formData.email)
          .maybeSingle();

        if (existingProfile) {
          // Link the newly created auth user ID to the admin-created profile
          await supabase
            .from("designers")
            .update({ user_id: data.user.id })
            .eq("id", existingProfile.id);
        }
      }

      // Handle Success Message based on Confirmation setting
      if (data?.user && !data?.session) {
        toast.success(
          "Registration successful! Please check your email to confirm your account.",
          { duration: 6000 }
        );
        navigate("/login");
      } else {
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
    <div className="min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] w-full flex flex-col md:flex-row bg-white animate-fade-in">
      {/* Left side: Form container */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-2 md:px-12 xl:px-20 bg-white order-1">
        <div className="m-auto w-full max-w-md space-y-6 animate-slide-up">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight font-heading">Create Account</h2>
            <p className="text-gray-500 font-sans font-light text-base">Set up your profile in seconds</p>
          </div>

          {/* Google Sign In */}
          <div className="space-y-4">
            <GoogleSignInButton label="Sign up with Google" />
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-xs font-bold uppercase tracking-wider">or continue with email</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-4">
              {/* Full Name */}
              <div className="group relative border-b border-gray-100 focus-within:border-brand-accent transition-all duration-500 py-1.5">
                <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">Full Name</label>
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-300 group-focus-within:text-brand-accent transition-colors duration-500 mr-3" />
                  <input type="text" name="fullName" onChange={handleChange}
                    className="block w-full py-1.5 bg-transparent text-gray-900 placeholder-gray-300 text-base font-sans border-none outline-none focus:ring-0"
                    placeholder="John Doe" required />
                </div>
              </div>

              {/* Email */}
              <div className="group relative border-b border-gray-100 focus-within:border-brand-accent transition-all duration-500 py-1.5">
                <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">Email Address</label>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-300 group-focus-within:text-brand-accent transition-colors duration-500 mr-3" />
                  <input type="email" name="email" onChange={handleChange}
                    className="block w-full py-1.5 bg-transparent text-gray-900 placeholder-gray-300 text-base font-sans border-none outline-none focus:ring-0"
                    placeholder="john@example.com" required />
                </div>
              </div>

              {/* Password */}
              <div className="group relative border-b border-gray-100 focus-within:border-brand-accent transition-all duration-500 py-1.5">
                <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">Password</label>
                <div className="flex items-center">
                  <Lock className="h-5 w-5 text-gray-300 group-focus-within:text-brand-accent transition-colors duration-500 mr-3" />
                  <input type={showPassword ? "text" : "password"} name="password" onChange={handleChange}
                    className="block w-full py-1.5 bg-transparent text-gray-900 placeholder-gray-300 text-base font-sans border-none outline-none focus:ring-0"
                    placeholder="••••••••" required minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-900 transition-colors ml-2">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3">
              <input type="checkbox" id="terms" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded cursor-pointer accent-brand-accent" />
              <label htmlFor="terms" className="text-sm text-gray-500 select-none cursor-pointer leading-tight">
                I agree to the{" "}
                <Link to="/terms" className="text-brand-accent hover:underline font-bold">Terms of Service</Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-brand-accent hover:underline font-bold">Privacy Policy</Link>.
              </label>
            </div>

            <div className="pt-2">
              <button disabled={loading || !agreed}
                className={`group relative w-full py-4 font-bold rounded-2xl transition-all duration-500 flex items-center justify-center gap-3 cursor-pointer shadow-xl hover:-translate-y-0.5 ${
                  !agreed || loading
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                    : "bg-gray-900 hover:bg-brand-accent text-white shadow-slate-900/5 hover:shadow-brand-accent/25"
                }`}>
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Sign Up"}
              </button>
            </div>

            <div className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="text-gray-900 hover:text-brand-accent font-bold transition-colors">Sign In</Link>
            </div>
          </form>
        </div>
      </div>

      {/* Right side: Dedicated Designer CTA */}
      <div className="w-full md:w-1/2 relative flex flex-col items-center justify-center p-12 text-center overflow-hidden order-2 bg-slate-950 min-h-[400px]">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-accent to-orange-700 z-0"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=1200&q=80')] opacity-20 mix-blend-overlay object-cover z-0"></div>
        <div className="relative z-10 max-w-md text-white space-y-6">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight font-heading leading-tight">
            Are you a Designer?
          </h2>
          <p className="text-lg text-white/90 font-medium leading-relaxed">
            Want to showcase your portfolio, connect with homeowners, and grow your firm? Join our exclusive network of professionals.
          </p>
          <div className="pt-4">
            <a href="https://designers-v.netlify.app" className="inline-block px-8 py-4 bg-white text-brand-accent font-bold rounded-xl shadow-2xl hover:shadow-orange-900/20 hover:-translate-y-1 transition-all active:scale-95">
              Sign up in Designers Portal
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

