import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { signInWithPassword, sendPasswordResetEmail } from "../services/authService";
import GoogleSignInButton from "../components/GoogleSignInButton";

const Login = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false); 
  const [showPassword, setShowPassword] = useState(false); 
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- LOGIN LOGIC ---
  // ponytail: navigate("/") and let OnboardingGuard handle role redirect — kills the FOUC race
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithPassword(formData.email, formData.password);
      await queryClient.invalidateQueries({ queryKey: ['auth'] });
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success("Welcome back!");
      navigate("/");
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
      await sendPasswordResetEmail(formData.email);
      toast.success("Password reset link sent to your email!");
      setIsResetMode(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex flex-col md:flex-row bg-white overflow-hidden animate-fade-in">
      {/* Left side: Premium branding */}
      <div className="hidden md:flex md:w-1/2 bg-slate-950 relative items-center justify-center p-16">
        <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-accent/20 to-slate-950/90"></div>
        <div className="relative z-10 max-w-md text-white space-y-8">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
            <Lock className="text-brand-accent w-7 h-7" />
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold tracking-tight leading-tight font-heading">
              {isResetMode ? "Reset your " : "Welcome "}
              <span className="text-brand-accent">{isResetMode ? "password." : "back."}</span>
            </h1>
            <p className="text-gray-400 text-lg font-sans leading-relaxed font-light">
              {isResetMode
                ? "Enter your email and we'll send you a secure link to reset your password."
                : "Sign in to browse verified designers, manage your connections, and transform your space."}
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Borderless form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-20 lg:p-28 bg-white">
        <div className="w-full max-w-lg space-y-12 animate-slide-up">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold text-gray-900 tracking-tight font-heading">
              {isResetMode ? "Reset Password" : "Sign In"}
            </h2>
            <p className="text-gray-500 font-sans font-light text-lg">
              {isResetMode ? "Enter your email to receive a reset link" : "Access your personalized workspace"}
            </p>
          </div>

          {/* Google Sign In */}
          {!isResetMode && (
            <div className="space-y-6">
              <GoogleSignInButton label="Sign in with Google" />
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-100"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-xs font-bold uppercase tracking-wider">or continue with email</span>
                <div className="flex-grow border-t border-gray-100"></div>
              </div>
            </div>
          )}

          {isResetMode ? (
            <form onSubmit={handleResetPassword} className="space-y-10">
              <div className="group relative border-b border-gray-100 focus-within:border-brand-accent transition-all duration-500 py-2">
                <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">Email Address</label>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-300 group-focus-within:text-brand-accent transition-colors duration-500 mr-3" />
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    className="block w-full py-2 bg-transparent text-gray-900 placeholder-gray-300 text-lg font-sans border-none outline-none focus:ring-0"
                    placeholder="name@example.com" required />
                </div>
              </div>
              <div className="pt-4">
                <button disabled={loading}
                  className="group relative w-full py-5 bg-gray-900 hover:bg-brand-accent text-white font-bold rounded-2xl transition-all duration-500 flex items-center justify-center gap-3 cursor-pointer shadow-xl shadow-slate-900/5 hover:shadow-brand-accent/25 hover:-translate-y-0.5 disabled:opacity-75">
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Send Reset Link"}
                </button>
              </div>
              <button type="button" onClick={() => setIsResetMode(false)}
                className="w-full text-gray-500 hover:text-gray-900 text-sm flex items-center justify-center gap-2">
                <ArrowLeft size={14} /> Back to Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-10">
              <div className="space-y-8">
                {/* Email */}
                <div className="group relative border-b border-gray-100 focus-within:border-brand-accent transition-all duration-500 py-2">
                  <label className="text-xs font-bold text-gray-400 tracking-widest uppercase block mb-1">Email Address</label>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-300 group-focus-within:text-brand-accent transition-colors duration-500 mr-3" />
                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                      className="block w-full py-2 bg-transparent text-gray-900 placeholder-gray-300 text-lg font-sans border-none outline-none focus:ring-0"
                      placeholder="name@example.com" required />
                  </div>
                </div>

                {/* Password */}
                <div className="group relative border-b border-gray-100 focus-within:border-brand-accent transition-all duration-500 py-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-gray-400 tracking-widest uppercase">Password</label>
                    <button type="button" onClick={() => setIsResetMode(true)}
                      className="text-xs text-brand-accent hover:text-orange-400 font-bold">Forgot Password?</button>
                  </div>
                  <div className="flex items-center">
                    <Lock className="h-5 w-5 text-gray-300 group-focus-within:text-brand-accent transition-colors duration-500 mr-3" />
                    <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange}
                      className="block w-full py-2 bg-transparent text-gray-900 placeholder-gray-300 text-lg font-sans border-none outline-none focus:ring-0"
                      placeholder="••••••••" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-900 transition-colors ml-2">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button disabled={loading}
                  className="group relative w-full py-5 bg-gray-900 hover:bg-brand-accent text-white font-bold rounded-2xl transition-all duration-500 flex items-center justify-center gap-3 cursor-pointer shadow-xl shadow-slate-900/5 hover:shadow-brand-accent/25 hover:-translate-y-0.5 disabled:opacity-75">
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Sign In"}
                </button>
              </div>

              <div className="text-center text-sm text-gray-500">
                Don't have an account?{" "}
                <Link to="/register" className="text-gray-900 hover:text-brand-accent font-bold transition-colors">Sign Up</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;

