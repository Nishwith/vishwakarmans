import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster } from "react-hot-toast";

import React, { Suspense, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Home from "./pages/Home";
import Designers from "./pages/Designers";
import DesignerProfile from "./pages/DesignerProfile";
import CompareDesigners from "./pages/CompareDesigners";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Connect from "./pages/Connect";
import UserProfile from "./pages/UserProfile";
import AboutContact from "./pages/AboutContact";
import TermsOfServices from "./pages/TermsOfServices";
import Privacy from "./pages/Privacy";
import UpdatePassword from "./pages/UpdatePassword";
import NotFound from "./pages/NotFound";
import { supabase } from "./supabaseClient";

import {
  RequireAuth,
  RequireGuest,
  RequireAdmin,
  OnboardingGuard,
} from "./components/AuthRoutes";

import CompleteProfile from "./pages/CompleteProfile";

const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const DesignerDashboard = React.lazy(() => import("./pages/DesignerDashboard"));

const PageLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-accent"></div>
  </div>
);

function App() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof window !== "undefined" && typeof supabase?.auth?.onAuthStateChange === "function") {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        const isExpired = session?.expires_at ? session.expires_at < Date.now() / 1000 : false;
        const isInvalid = !session || isExpired;

        if (
          event === "SIGNED_OUT" ||
          (event === "TOKEN_REFRESHED" && isInvalid) ||
          (event === "USER_UPDATED" && isInvalid)
        ) {
          queryClient.setQueryData(['auth', 'user'], null);
          queryClient.setQueryData(['auth', 'session'], null);
          queryClient.removeQueries({ queryKey: ['auth'] });
          queryClient.removeQueries({ queryKey: ['users'] });
          queryClient.clear();
          try {
            if (event !== "SIGNED_OUT") {
              await supabase.auth.signOut();
            }
          } catch {
            // ignore
          }
          localStorage.clear();
          sessionStorage.clear();
        } else if (event === "SIGNED_IN" && session?.user) {
          queryClient.setQueryData(['auth', 'session'], session);
          queryClient.setQueryData(['auth', 'user'], session.user);
        }
      });

      return () => {
        subscription?.unsubscribe?.();
      };
    }
  }, [queryClient]);

  return (
    <Router>
      <ScrollToTop />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#0f172a",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
          },
          success: { iconTheme: { primary: "#ff7f00", secondary: "#fff" } },
        }}
      />
      <Navbar />
      <div className="overflow-x-hidden min-h-screen">
        <OnboardingGuard>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/designers" element={<Designers />} />
            <Route path="/designers/:id" element={<DesignerProfile />} />
            <Route path="/compare" element={<CompareDesigners />} />
            <Route path="/aboutcontact" element={<AboutContact />} />
            <Route path="/terms" element={<TermsOfServices />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="*" element={<NotFound />} />
            <Route element={<RequireGuest />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/signup" element={<Navigate to="/register" replace />} />
            </Route>

            {/* Logged In Users */}
            <Route element={<RequireAuth />}>
              <Route path="/connect" element={<Connect />} />
              <Route path="/dashboard" element={<Connect />} />
              <Route path="/profile" element={<UserProfile />} />
            </Route>

            {/* === ADMIN ONLY === */}
            <Route element={<RequireAdmin />}>
              <Route 
                path="/admin" 
                element={
                  <Suspense fallback={<PageLoader />}>
                    <AdminDashboard />
                  </Suspense>
                } 
              />
              <Route 
                path="/admin/manage-designer/:id" 
                element={
                  <Suspense fallback={<PageLoader />}>
                    <DesignerDashboard />
                  </Suspense>
                } 
              />
            </Route>
          </Routes>
        </OnboardingGuard>
      </div>
      <Footer />
    </Router>
  );
}

export default App;

