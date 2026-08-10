import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, ShieldAlert, Loader2 } from "lucide-react";
import { useCurrentUser, useUserProfile } from "../hooks/useAuth";
import { signOut } from "../services/authService";
import { useQueryClient } from "@tanstack/react-query";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Consume decoupled global query state
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: profile, isLoading: profileLoading } = useUserProfile(user?.id);

  const handleLogout = async () => {
    try {
      await signOut();
      queryClient.clear();
      setIsOpen(false);
      navigate("/login");
    } catch {
      // Fail silently or toast error
    }
  };

  const role = profile?.role || "client";
  const loading = userLoading || (user && profileLoading);



  return (
    <nav className="bg-white/95 backdrop-blur-lg border-b border-gray-200 fixed w-full z-[100] top-0 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all group-hover:-translate-y-0.5">
              <span className="text-white font-black text-xl">V</span>
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-brand-accent transition-colors">
              Vishwakarmans
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
             <a
              href="https://desginers.netlify.app"
              className="bg-orange-50 text-brand-accent px-4 py-1.5 rounded-full font-bold text-sm border border-orange-200 hover:bg-orange-100 transition-colors shadow-sm whitespace-nowrap"
            >
              Are you a designer? Join
            </a>
            <Link
              to="/"
              className="text-gray-600 hover:text-brand-accent font-semibold transition-colors"
            >
              Home
            </Link>
            <Link
              to="/designers"
              className="text-gray-600 hover:text-brand-accent font-semibold transition-colors"
            >
              Find Designers
            </Link>
            <Link
              to="/connect"
              className="text-gray-600 hover:text-brand-accent font-semibold transition-colors"
            >
              Connections
            </Link>
           
            {role === "admin" && (
              <Link
                to="/admin"
                className="flex items-center gap-2 font-semibold text-brand-accent transition-colors"
              >
                <ShieldAlert size={18} /> Admin Panel
              </Link>
            )}
            
            {loading ? (
              <div className="flex items-center justify-center pl-6 border-l border-gray-200">
                <Loader2 className="animate-spin text-gray-300 w-5 h-5" />
              </div>
            ) : user ? (
              <div className="flex items-center gap-4 pl-6 border-l border-gray-200">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-gray-700 hover:text-brand-accent transition-all font-semibold"
                >
                  <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                    <User size={18} className="text-gray-600" />
                  </div>
                  <span>
                    {user.user_metadata?.full_name?.split(" ")[0] || "Profile"}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors p-2"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4 pl-6 border-l border-gray-200">
                <Link
                  to="/login"
                  className="text-gray-700 font-bold hover:text-brand-accent transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-brand-accent text-white px-5 py-2.5 rounded-xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-all active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-900 p-2 focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 p-4 space-y-4 animate-fade-in shadow-xl">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-3 text-gray-900 font-semibold hover:bg-gray-50 hover:text-brand-accent rounded-xl"
          >
            Home
          </Link>
          <Link
            to="/designers"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-3 text-gray-900 font-semibold hover:bg-gray-50 hover:text-brand-accent rounded-xl"
          >
            Find Designers
          </Link>
          <Link
            to="/connect"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-3 text-gray-900 font-semibold hover:bg-gray-50 hover:text-brand-accent rounded-xl"
          >
            Connections
          </Link>
          <a
            href="https://desginers.netlify.app"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-3 bg-orange-50 text-brand-accent font-bold rounded-xl border border-orange-200 text-center text-sm"
          >
            Are you a designer? Join
          </a>
          {role === "admin" && (
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 text-brand-accent font-bold hover:bg-gray-50 rounded-xl"
            >
              Admin Panel
            </Link>
          )}
          <div className="border-t border-gray-200 pt-4 mt-2">
            {loading ? (
              <div className="flex justify-center py-2">
                <Loader2 className="animate-spin text-gray-300 w-5 h-5" />
              </div>
            ) : user ? (
              <div className="space-y-2">
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-gray-900 font-semibold hover:bg-gray-50 hover:text-brand-accent rounded-xl"
                >
                  User Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-red-500 w-full text-left font-bold px-4 py-3 flex items-center gap-3 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 px-4 py-3">
                <Link onClick={() => setIsOpen(false)} to="/login" className="w-full text-center text-gray-900 font-bold border border-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  Login
                </Link>
                <Link onClick={() => setIsOpen(false)} to="/register" className="w-full text-center bg-brand-accent text-white px-4 py-2.5 rounded-xl font-bold hover:bg-orange-600 shadow-md transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
