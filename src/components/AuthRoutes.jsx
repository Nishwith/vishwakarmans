import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Loader2 } from "lucide-react";

// 1. REQUIRE AUTH (Any logged in user)
export const RequireAuth = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
  }, []);

  if (loading)
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-accent" />
      </div>
    );
  return session ? <Outlet /> : <Navigate to="/login" replace />;
};

// 2. REQUIRE GUEST (Not logged in)
export const RequireGuest = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
  }, []);

  if (loading) return null;
  return !session ? <Outlet /> : <Navigate to="/" replace />;
};

// 3. REQUIRE DESIGNER (Checks Database Role)
export const RequireDesigner = () => {
  const [isDesigner, setIsDesigner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setIsDesigner(false);
        setLoading(false);
        return;
      }

      // Check the public 'users' table
      const { data } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      setIsDesigner(data?.role === "designer");
      setLoading(false);
    };
    checkRole();
  }, []);

  if (loading)
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-accent" />
      </div>
    );
  return isDesigner ? <Outlet /> : <Navigate to="/" replace />;
};

// 4. REQUIRE ADMIN (Checks Database Role)
export const RequireAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Check the public 'users' table
      const { data } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      setIsAdmin(data?.role === "admin");
      setLoading(false);
    };
    checkRole();
  }, []);

  if (loading)
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-accent" />
      </div>
    );
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};
