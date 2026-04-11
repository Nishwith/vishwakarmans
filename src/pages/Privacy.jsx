import React, { useEffect } from "react";
import { Shield, Lock, Share2, Server, Eye, Cookie } from "lucide-react";

const Privacy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-600 pt-4
     pb-20 px-4">
      <div className="max-w-4xl mx-auto bg-white/50 border border-gray-100 rounded-2xl p-8 md:p-12 shadow-2xl">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Privacy Policy
        </h1>
        <p className="text-gray-500 mb-8">Last Updated: December 29, 2025</p>

        <div className="space-y-8 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Shield className="text-brand-accent" size={20} /> 1. Introduction
            </h2>
            <p>
              Welcome to Vishwakarmans. This policy explains how we collect and
              protect your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Server className="text-brand-accent" size={20} /> 2. Data
              Collection
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>
                <strong>Clients:</strong> Name, Email, Phone, City.
              </li>
              <li>
                <strong>Designers:</strong> Business Name, Portfolio, Bio,
                Contact Info.
              </li>
              <li>
                <strong>Technical:</strong> Device information for security.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Share2 className="text-brand-accent" size={20} /> 3. Sharing with
              Third Parties
            </h2>
            <p className="mb-2">
              We do not sell your personal data. We share data only with:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>
                <strong>Analytics:</strong> Google Analytics (to improve site
                performance).
              </li>
              <li>
                <strong>Payments:</strong> Payment Gateways (for secure
                subscription processing).
              </li>
              <li>
                <strong>Legal:</strong> If required by law enforcement.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="text-brand-accent" size={20} /> 4. Data Visibility
            </h2>
            <p className="text-sm">
              <strong>Designers:</strong> Your business profile is Public. Your
              direct contact info is protected behind a contact form.
              <br />
              <strong>Clients:</strong> Your data remains Private.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Lock className="text-brand-accent" size={20} /> 5. Security
            </h2>
            <p>
              We use industry-standard encryption and Supabase Row Level
              Security (RLS) to ensure only authorized users access your data.
            </p>
          </section>

          {/* COOKIE POLICY SECTION (ADDED) */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Cookie className="text-brand-accent" size={20} /> 6. Cookie
              Policy
            </h2>
            <p className="mb-2">
              We use cookies and similar tracking technologies to track the
              activity on our Service and hold certain information.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>
                <strong>Essential Cookies:</strong> These are required for the
                website to function (e.g., keeping you logged in securely via
                Supabase).
              </li>
              <li>
                <strong>Analytics Cookies:</strong> These help us understand how
                you use our site (e.g., Google Analytics). You can opt-out of
                these via your browser settings.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
