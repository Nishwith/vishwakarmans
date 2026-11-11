import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useCurrentUser, useUserProfile } from "../hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { resolveAdminAuthorization } from "../services/phase1aAuthorizationService";
import { supabase } from "../services/supabaseClient";

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

// Helper function to check if a route is allowed for incomplete user profiles
const isAllowedForIncomplete = (pathname) => {
  const allowed = [
    "/",
    "/designers",
    "/aboutcontact",
    "/terms",
    "/privacy",
    "/login",
    "/register",
    "/update-password",
    "/complete-profile",
  ];
  return allowed.includes(pathname);
};

// 1. REQUIRE AUTH (Any logged in user)
export const RequireAuth = () => {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const location = useLocation();

  if (!user && !userLoading) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (userLoading && user !== null) {
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

  // If user is explicitly null or empty, allow access immediately
  if (!user && !isLoading) {
    return <Outlet />;
  }

  if (isLoading && user) {
    return <LoadingScreen />;
  }

  // Only redirect away if an active user truly exists
  return user ? <Navigate to="/" replace /> : <Outlet />;
};

// 3. REQUIRE DESIGNER (Checks Database Role)
export const RequireDesigner = () => {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: profile, isLoading: profileLoading } = useUserProfile(user?.id);
  const location = useLocation();

  if (!user && !userLoading) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if ((userLoading || profileLoading) && user !== null) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return profile?.role === "designer" ? <Outlet /> : <Navigate to="/" replace />;
};

// 4. REQUIRE ADMIN (Checks Server Session and Admin Role)
export const RequireAdmin = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const [authStatus, setAuthStatus] = useState({
    checking: true,
    authorized: false,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const verifyAdminSession = async () => {
      try {
        // 1. Explicitly await getSession() on mount to verify session exists
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          throw new Error("No active session found.");
        }

        // 2. Validate token actually with server via getUser()
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error("Session rejected by auth server.");
        }

        // 3. Resolve Admin Authorization (allowlist RPC or database role)
        let isAuthorized = false;
        if (import.meta.env.VITE_PHASE1A_ADMIN_AUTH_RPC_ENABLED === "true") {
          const authResult = await resolveAdminAuthorization(supabase, null);
          isAuthorized = Boolean(authResult?.authorized);
        } else {
          const { data: roleRow, error: roleError } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();

          if (!roleError && roleRow?.role === "admin") {
            isAuthorized = true;
          } else {
            // Also attempt is_admin RPC fallback
            try {
              const { data: rpcAdmin } = await supabase.rpc("is_admin");
              if (rpcAdmin === true) isAuthorized = true;
            } catch {
              // ignore
            }
          }
        }

        if (!isAuthorized) {
          throw new Error("Unauthorized: Account does not have admin privileges.");
        }

        if (mounted) {
          setAuthStatus({ checking: false, authorized: true, error: null });
        }
      } catch (err) {
        console.error("RequireAdmin verification failed:", err?.message || err);
        // Clean state
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.warn("Server signout failed, forcing local cleanup", signOutError);
        } finally {
          localStorage.clear();
          sessionStorage.clear();
          queryClient.clear();
        }

        if (mounted) {
          setAuthStatus({ checking: false, authorized: false, error: err?.message });
        }
      }
    };

    verifyAdminSession();

    return () => {
      mounted = false;
    };
  }, [queryClient]);

  // If user is explicitly null or absent when not loading, redirect immediately
  if ((user === null || (!user && !userLoading)) && authStatus.checking) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (authStatus.checking && user !== null) {
    return <LoadingScreen />;
  }

  if (!authStatus.authorized) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

// 5. GLOBAL PROFILE COMPLETION GUARD
export const OnboardingGuard = ({ children }) => {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: profile, isLoading: profileLoading } = useUserProfile(user?.id);
  const location = useLocation();

  if (!user && !userLoading) {
    if (location.pathname === "/complete-profile") {
      return <Navigate to="/login" replace />;
    }
    return children ? children : <Outlet />;
  }

  // If the user is an admin or a designer, bypass the homeowner onboarding flow instantly
  const role = profile?.role || user?.role || user?.user_metadata?.role;
  if (role === "designer" || role === "admin" || user?.role === "designer" || user?.role === "admin") {
    return children ? children : <Outlet />;
  }

  if (location.pathname.startsWith("/admin")) {
    return children ? children : <Outlet />;
  }

  if ((userLoading || (user && profileLoading)) && user !== null) {
    return <LoadingScreen />;
  }

  if (user) {
    // Only force the /complete-profile redirect if the role is homeowner (or client default)
    const isHomeowner = role === "homeowner" || role === "client" || !role;
    if (isHomeowner) {
      const isComplete = Boolean(profile?.profile_completed && profile?.phone);
      if (!isComplete && !isAllowedForIncomplete(location.pathname)) {
        return <Navigate to="/complete-profile" replace />;
      }
      if (isComplete && location.pathname === "/complete-profile") {
        return <Navigate to="/" replace />;
      }
    }
  } else if (location.pathname === "/complete-profile") {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};
