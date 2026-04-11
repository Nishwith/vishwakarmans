import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Loader2,
  Target,
  ShieldCheck,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

const AboutContact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const location = useLocation();

  // 1. Scroll Handling
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);

  // 2. Auto-Fill User Data if Logged In
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setFormData((prev) => ({
          ...prev,
          name:
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            "",
          email: session.user.email || "",
        }));
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all fields.");
      return;
    }

    setSending(true);

    try {
      const { error } = await supabase.from("contact_messages").insert([
        {
          name: formData.name,
          email: formData.email,
          message: formData.message,
        },
      ]);

      if (error) throw error;

      toast.success("Message sent successfully!");
      // Only clear message if user is logged in, otherwise clear all
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setFormData((prev) => ({ ...prev, message: "" }));
      } else {
        setFormData({ name: "", email: "", message: "" });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* ==================== ABOUT SECTION ==================== */}
      <section id="about" className="py-20 px-4 border-b border-gray-100">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About <span className="text-brand-accent">Vishwakarmans</span>
            </h1>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">
              We are India's premier platform connecting discerning homeowners
              with elite interior and commercial designers. Our mission is to
              bridge the gap between vision and reality.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {[
              {
                icon: Target,
                title: "Our Mission",
                desc: "To democratize access to high-quality design by creating a transparent, trusted ecosystem for professionals and clients.",
              },
              {
                icon: ShieldCheck,
                title: "Our Promise",
                desc: "Every designer on our platform is vetted for quality, experience, and reliability. We ensure your project is in safe hands.",
              },
              {
                icon: Users,
                title: "Community",
                desc: "We are building a thriving community of creative minds and homeowners, fostering collaboration and innovation.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white/50 p-8 rounded-2xl border border-gray-100 hover:border-brand-accent/30 transition-all hover:-translate-y-1 shadow-lg"
              >
                <div className="w-14 h-14 bg-brand-accent/10 rounded-xl flex items-center justify-center text-brand-accent mb-6">
                  <item.icon size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CONTACT SECTION ==================== */}
      <section id="contact" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get in Touch
            </h2>
            <p className="text-gray-500">
              Have questions? We'd love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 bg-white/30 border border-gray-100 rounded-3xl p-6 md:p-12 shadow-2xl">
            {/* Contact Info */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Contact Information
              </h3>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand-accent shrink-0 border border-gray-200">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Our Head Office</h4>
                  <p className="text-gray-500">
                    Miyapur, Hyderabad,
                    <br />
                    Telangana, India - 500049
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand-accent shrink-0 border border-gray-200">
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Phone</h4>
                  <p className="text-gray-500">+91 9014350017</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Mon-Fri, 9am - 6pm IST
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand-accent shrink-0 border border-gray-200">
                  <Mail size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Email</h4>
                  <p className="text-gray-500">vishwakarmans55@gmail.com</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-brand-accent focus:outline-none transition-colors"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-brand-accent focus:outline-none transition-colors"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Message
                  </label>
                  <textarea
                    rows="4"
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-brand-accent focus:outline-none transition-colors resize-none"
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-brand-accent hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutContact;
