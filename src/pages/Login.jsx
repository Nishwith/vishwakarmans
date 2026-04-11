import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react"; // Added Eye icons
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false); // Toggle for Forgot Password
  const [showPassword, setShowPassword] = useState(false); // Toggle for Password Visibility
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- LOGIN LOGIC ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (error) throw error;

      // Check role to redirect correctly
      const { data: userRole } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (userRole?.role === "admin") navigate("/admin");
      else if (userRole?.role === "designer") navigate("/dashboard");
      else navigate("/");

      toast.success("Welcome back!");
    } catch (error) {
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // --- FORGOT PASSWORD LOGIC ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      // Sends a reset link to the user's email
      const { error } = await supabase.auth.resetPasswordForEmail(
        formData.email,
        {
          redirectTo: `${window.location.origin}/update-password`, // You need an update-password route later
        }
      );
      if (error) throw error;
      toast.success("Password reset link sent to your email!");
      setIsResetMode(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-brand-accent/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-white border border-gray-200 p-8 rounded-2xl shadow-2xl relative z-10 backdrop-blur-xl">
        {/* HEADER */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isResetMode ? "Reset Password" : "Welcome Back"}
          </h2>
          <p className="text-gray-500">
            {isResetMode
              ? "Enter your email to receive a reset link"
              : "Sign in to access your account"}
          </p>
        </div>

        {/* --- RESET PASSWORD FORM --- */}
        {isResetMode ? (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-3 text-gray-500"
                  size={18}
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 focus:border-brand-accent focus:outline-none transition-colors"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>
            <button
              disabled={loading}
              className="w-full bg-brand-accent hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Send Reset Link"
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsResetMode(false)}
              className="w-full text-gray-500 hover:text-gray-900 text-sm flex items-center justify-center gap-2 mt-4"
            >
              <ArrowLeft size={14} /> Back to Login
            </button>
          </form>
        ) : (
          /* --- LOGIN FORM --- */
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-3 text-gray-500"
                  size={18}
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 focus:border-brand-accent focus:outline-none transition-colors"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsResetMode(true)}
                  className="text-xs text-brand-accent hover:text-orange-400 font-bold"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-3 text-gray-500"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"} // Dynamic Type
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-12 text-gray-900 focus:border-brand-accent focus:outline-none transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button" // Prevent form submission
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-brand-accent hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
            </button>

            <div className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-gray-900 hover:text-brand-accent font-bold transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
