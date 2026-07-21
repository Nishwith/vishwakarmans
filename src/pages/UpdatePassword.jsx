import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { signOut } from "../services/authService";

const UpdatePassword = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    // Check if we have a session (user clicked email link)
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Invalid or expired reset link.");
        navigate("/login");
      }
    };
    checkSession();
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: password });
      if (error) throw error;

      toast.success("Password updated successfully! Please login.");
      await signOut();
      queryClient.clear();
      navigate("/login");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 p-8 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Set New Password
        </h2>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-900 focus:border-brand-accent focus:outline-none transition-colors"
                placeholder="Enter new password"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-brand-accent hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;
