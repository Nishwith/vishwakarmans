import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster } from "react-hot-toast";

import React, { Suspense } from "react";
import Home from "./pages/Home";
import Designers from "./pages/Designers";
import DesignerProfile from "./pages/DesignerProfile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Connect from "./pages/Connect";
import UserProfile from "./pages/UserProfile";
import AboutContact from "./pages/AboutContact";
import TermsOfServices from "./pages/TermsOfServices";
import Privacy from "./pages/Privacy";
import UpdatePassword from "./pages/UpdatePassword";
import NotFound from "./pages/NotFound";

import {
  RequireAuth,
  RequireGuest,
  RequireAdmin,
  OnboardingGuard,
} from "./components/AuthRoutes";

const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));

const PageLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-accent"></div>
  </div>
);

function App() {
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
      <div className="pt-16 md:pt-20">
        <OnboardingGuard>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/designers" element={<Designers />} />
            <Route path="/designers/:id" element={<DesignerProfile />} />
            <Route path="/aboutcontact" element={<AboutContact />} />
            <Route path="/terms" element={<TermsOfServices />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="*" element={<NotFound />} />
            <Route element={<RequireGuest />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Logged In Users */}
            <Route element={<RequireAuth />}>
              <Route path="/connect" element={<Connect />} />
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
            </Route>
          </Routes>
        </OnboardingGuard>
      </div>
      <Footer />
    </Router>
  );
}

export default App;

