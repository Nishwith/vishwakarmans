import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useCurrentUser, useUserProfile } from "../hooks/useAuth";
import { Loader2 } from "lucide-react";

// Full-screen branded loading spinner to prevent session flicker (FOUC)
const LoadingScreen = () => (
  <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
    <div className="relative flex flex-col items-center space-y-4">
      <Loader2 className="animate-spin text-brand-accent w-12 h-12 stroke-[2.5]" />
      <span className="text-sm font-semibold text-gray-500 tracking-wider font-heading uppercase animate-pulse">
        Securing Session...
      </span>
    </div>
  </div>
);

// Helper function to check if a route is whitelisted
const isWhitelisted = (pathname) => {
  const whitelist = ["/login", "/register", "/update-password"];
  return whitelist.includes(pathname);
};

// 1. REQUIRE AUTH (Any logged in user)
export const RequireAuth = () => {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const location = useLocation();

  if (userLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

// 2. REQUIRE GUEST (Not logged in)
export const RequireGuest = () => {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) return <LoadingScreen />;
  return !user ? <Outlet /> : <Navigate to="/" replace />;
};

// 3. REQUIRE DESIGNER (Checks Database Role)
export const RequireDesigner = () => {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: profile, isLoading: profileLoading } = useUserProfile(user?.id);
  const location = useLocation();

  if (userLoading || profileLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return profile?.role === "designer" ? <Outlet /> : <Navigate to="/" replace />;
};

// 4. REQUIRE ADMIN (Checks Database Role)
export const RequireAdmin = () => {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: profile, isLoading: profileLoading } = useUserProfile(user?.id);
  const location = useLocation();

  if (userLoading || profileLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return profile?.role === "admin" ? <Outlet /> : <Navigate to="/" replace />;
};

// 5. GLOBAL PROFILE COMPLETION GUARD
export const OnboardingGuard = ({ children }) => {
  return children;
};
