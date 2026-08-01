import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Palette,
  MessageSquare,
  ArrowRight,
  Star,
  ShieldCheck,
  Users,
  MapPin,
  Briefcase,
  Home as HomeIcon,
  Zap,
  Compass,
  PenTool,
  Ruler,
  Lightbulb,
  Layout,
  Sparkles
} from "lucide-react";
import { supabase } from "../supabaseClient";
import { useCurrentUser, useUserProfile } from "../hooks/useAuth";

// --- HELPER COMPONENT FOR SCROLL ANIMATIONS ---
const RevealOnScroll = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const Home = () => {
  // ponytail: use shared TanStack hooks instead of local auth listeners (BUG-005)
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: profile, isLoading: profileLoading } = useUserProfile(user?.id);
  const role = profile?.role || "client";
  const loadingRole = userLoading || (user && profileLoading);

  const [featuredDesigners, setFeaturedDesigners] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchFeatured = async () => {
      try {
        const { data, error } = await supabase
          .from("designers")
          .select("id, name, city, designer_type, rating_avg, logo_url")
          .eq("featured_status", "featured")
          .eq("is_verified", true)
          .order("priority_score", { ascending: false })
          .limit(3);

        if (error) throw error;
        if (mounted) setFeaturedDesigners(data || []);
      } catch (err) {
        console.error("Error fetching featured:", err);
      } finally {
        if (mounted) setLoadingFeatured(false);
      }
    };

    fetchFeatured();
    return () => { mounted = false; };
  }, []);

  const getDesignerBtnProps = () => {
    if (loadingRole && user) return { link: "#", text: "Loading..." };
    if (role === "admin") return { link: "/admin", text: "Go to Admin Panel" };
    if (role === "designer")
      return { link: "/dashboard", text: "Go to Dashboard" };
    return { link: "/collab", text: "Join as Designer" };
  };

  const designerBtn = getDesignerBtnProps();

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <div className="relative min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center text-center px-4 overflow-hidden border-b border-gray-200">
        <div className="absolute inset-0 z-0 bg-white">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-accent/10 rounded-full blur-[120px] mix-blend-multiply"></div>
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-brand-accent/10 rounded-full blur-[120px] mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto space-y-10">
          <div className="flex justify-center mb-[-1rem] animate-fade-in pb-5 pt-5">
            <span className="px-4 py-1.5 rounded-full border border-gray-200 bg-white/60 backdrop-blur-md text-xs font-bold text-gray-500 tracking-[0.2em] uppercase shadow-sm">
              Welcome to Vishwakarmans
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tighter font-sans animate-fade-in leading-[1.1] drop-shadow-sm">
            Dream. <br className="md:hidden" />
            <span className="text-brand-accent relative inline-block">
              Discover.
              <div className="absolute -bottom-3 left-0 w-full h-4 bg-brand-accent/20 -z-10 -rotate-2 skew-x-12"></div>
            </span>{" "}
            Design.
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 font-medium max-w-2xl mx-auto animate-fade-in delay-200 leading-relaxed">
            Connect with talented Interior and Commercial designers.
            Browse stunning portfolios, compare unique styles, and transform your vision into reality.
          </p>
          
          <div className="pt-6 flex flex-col sm:flex-row gap-5 justify-center animate-fade-in delay-300">
            <Link
              to="/designers"
              className="inline-flex items-center justify-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-brand-accent hover:text-white transition-all shadow-xl hover:shadow-orange-500/20 active:scale-95"
            >
              Start Exploring <ArrowRight size={20} />
            </Link>
            {role !== "client" && (
              <Link
                to={designerBtn.link}
                className={`inline-flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-900 px-8 py-4 rounded-xl text-lg font-bold hover:border-brand-accent hover:text-brand-accent transition-all shadow-md hover:shadow-xl active:scale-95 ${
                  loadingRole && user ? "opacity-50 cursor-wait" : ""
                }`}
              >
                <Briefcase size={20} />
                {designerBtn.text}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. HOW IT WORKS (Redesigned with Image) */}
      <section className="py-24 bg-gray-50 border-y border-gray-200">
        <div className="container mx-auto px-4 max-w-7xl">
          <RevealOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900">How it works</h2>
              <p className="mt-4 text-gray-600 text-lg">Three simple steps to transform your space</p>
            </div>
          </RevealOnScroll>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              {[
                { icon: Search, title: "1. Browse", desc: "Search by location, style, and budget. View verified portfolios and past projects." },
                { icon: Palette, title: "2. Review", desc: "Compare designers side-by-side. Read genuine reviews from verified clients." },
                { icon: MessageSquare, title: "3. Connect", desc: "Send a direct inquiry to your favorite designers to discuss your vision and get quotes." }
              ].map((step, idx) => (
                <RevealOnScroll key={idx} delay={idx * 150}>
                  <div className="flex items-start gap-6 p-6 rounded-3xl bg-white border border-gray-100 hover:border-brand-accent/30 hover:shadow-xl transition-all duration-300">
                    <div className="w-14 h-14 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0">
                      <step.icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600 leading-relaxed text-lg">{step.desc}</p>
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>

            <RevealOnScroll delay={300}>
              <div className="relative h-[600px] rounded-[2.5rem] overflow-hidden shadow-2xl group">
                <img 
                  loading="lazy"
                  src="https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=1200&q=80" 
                  alt="Designer at work" 
                  className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* 3. SELECT YOUR CATEGORY SECTION */}
      <div className="max-w-7xl mx-auto py-32 px-4">
        <RevealOnScroll>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">
              Start Exploring
            </h2>
            <p className="mt-4 text-gray-600 text-lg">Choose an expertise below to find your perfect designer</p>
          </div>
        </RevealOnScroll>
        <div className="grid md:grid-cols-2 gap-10">
          <RevealOnScroll delay={100}>
            <Link
              to="/designers?category=interior"
              className="group relative w-full aspect-[16/9] md:aspect-[16/9] lg:h-[24rem] rounded-3xl overflow-hidden border border-gray-200 hover:border-brand-accent/30 transition-all cursor-pointer shadow-xl block"
            >
              <img
                loading="lazy"
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"
                alt="Interior"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent flex flex-col justify-end p-12">
                <h3 className="text-4xl font-bold text-white mb-3 group-hover:text-brand-accent transition-colors">
                  Interior Designer
                </h3>
                <p className="text-gray-200 text-lg transform translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  Home interior, renovations, bedrooms, and living spaces.
                </p>
              </div>
            </Link>
          </RevealOnScroll>
          <RevealOnScroll delay={200}>
            <Link
              to="/designers?category=commercial"
              className="group relative w-full aspect-[16/9] md:aspect-[16/9] lg:h-[24rem] rounded-3xl overflow-hidden border border-gray-200 hover:border-brand-accent/30 transition-all cursor-pointer shadow-xl block"
            >
              <img
                loading="lazy"
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
                alt="Commercial"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent flex flex-col justify-end p-12">
                <h3 className="text-4xl font-bold text-white mb-3 group-hover:text-brand-accent transition-colors">
                  Commercial Designer
                </h3>
                <p className="text-gray-200 text-lg transform translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  Offices, retail stores, cafes, and corporate spaces.
                </p>
              </div>
            </Link>
          </RevealOnScroll>
        </div>
      </div>

      {/* 4. FEATURED PROFESSIONALS SECTION */}
      <section className="py-24 bg-gray-50 border-y border-gray-200 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 max-w-7xl">
          <RevealOnScroll>
            <div className="flex justify-between items-end mb-16">
              <div>
                <span className="text-brand-accent font-bold tracking-wider uppercase text-sm flex items-center gap-2">
                  <Zap size={16} className="fill-brand-accent" /> Top Rated
                </span>
                <h2 className="text-4xl font-bold text-gray-900 mt-2">
                  Featured Professionals
                </h2>
              </div>
              <Link
                to="/designers"
                className="hidden md:flex items-center gap-2 text-gray-600 hover:text-brand-accent transition-colors font-bold"
              >
                View all <ArrowRight size={16} />
              </Link>
            </div>
          </RevealOnScroll>

          {loadingFeatured ? (
            <div className="grid md:grid-cols-3 gap-10">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : featuredDesigners.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-10">
              {featuredDesigners.map((designer, idx) => (
                <RevealOnScroll key={designer.id} delay={idx * 150}>
                  <div className="group relative bg-white border border-gray-200 rounded-3xl p-10 hover:border-brand-accent/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full flex flex-col items-center text-center">
                    <div className="absolute top-6 right-6 bg-white border border-gray-200 px-3 py-1.5 rounded-full text-xs font-bold text-gray-900 flex items-center gap-1 shadow-sm">
                      <Star size={12} className="text-yellow-500" fill="currentColor" />{" "}
                      {designer.rating_avg > 0 ? designer.rating_avg.toFixed(1) : "New"}
                    </div>

                    <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-brand-accent to-yellow-500 mb-8 group-hover:scale-105 transition-transform duration-500 shadow-lg">
                      <div className="w-full h-full rounded-full bg-white border-4 border-white overflow-hidden flex items-center justify-center relative">
                        {designer.logo_url ? (
                          <img loading="lazy" src={designer.logo_url} alt={designer.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-5xl font-bold text-gray-300">{designer.name[0]}</span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{designer.name}</h3>

                    <div className="flex flex-wrap justify-center gap-2 mb-10 w-full">
                      <span className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-bold border border-gray-200">
                        <MapPin size={12} /> {designer.city}
                      </span>
                      <span className="flex items-center gap-1.5 bg-brand-accent/5 text-brand-accent px-3 py-1 rounded-lg text-xs font-bold border border-brand-accent/10">
                        {designer.designer_type === "commercial" ? <Briefcase size={12} /> : <HomeIcon size={12} />}
                        <span className="capitalize">{designer.designer_type}</span>
                      </span>
                    </div>

                    <Link
                      to={`/designers/${designer.id}`}
                      className="mt-auto w-full py-4 rounded-xl border-2 border-brand-accent text-brand-accent font-bold hover:bg-brand-accent hover:text-white transition-all transform active:scale-95 flex items-center justify-center gap-2"
                    >
                      View Profile <ArrowRight size={18} />
                    </Link>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 shadow-sm">
              <p className="text-gray-500 text-lg">No featured designers found yet.</p>
              <Link to="/designers" className="text-brand-accent mt-3 inline-block font-bold hover:underline">
                Browse all designers
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 5. NEW SECTION: THE ELEMENTS OF CRAFT (With Image) */}
      <section className="py-24 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <RevealOnScroll>
            <div className="text-center mb-16">
              <span className="text-brand-accent font-bold tracking-wider uppercase text-sm mb-4 block">The Craftsmanship</span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">The Anatomy of Great Design</h2>
              <p className="mt-4 text-gray-600 text-lg max-w-2xl mx-auto">
                Discover what professional designers actually do behind the scenes to elevate your space.
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <RevealOnScroll delay={100}>
              <div className="relative h-[600px] rounded-[2.5rem] overflow-hidden shadow-xl group">
                <img 
                  loading="lazy"
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80" 
                  alt="Anatomy of Design" 
                  className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                />
              </div>
            </RevealOnScroll>

            <div className="space-y-8">
              {[
                { icon: Layout, title: "Space Planning", desc: "Designers don't just decorate; they optimize. Through ergonomic layouts, they ensure optimal traffic flow and maximize square footage." },
                { icon: Palette, title: "Material Curation", desc: "Navigating thousands of fabric swatches and stone slabs is overwhelming. Professionals curate harmonious palettes that balance durability and visual texture." },
                { icon: Lightbulb, title: "Lighting Architecture", desc: "Experts layer ambient, task, and accent lighting to influence mood, highlight architectural features, and transform the atmosphere." }
              ].map((item, idx) => (
                <RevealOnScroll key={idx} delay={idx * 150}>
                  <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                        <item.icon size={24} />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">{item.title}</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed text-lg">{item.desc}</p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. NEW SECTION: THE DESIGN JOURNEY (With Image) */}
      <section className="py-24 bg-gray-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
           <img loading="lazy" src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80" className="w-full h-full object-cover" alt="Background" />
           <div className="absolute inset-0 bg-gradient-to-l from-transparent to-gray-900"></div>
        </div>

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5">
              <RevealOnScroll>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">The Professional Process</h2>
                <p className="text-gray-400 text-lg leading-relaxed mb-10">
                  How an independent designer takes your project from a raw concept to a finished masterpiece, ensuring transparency at every step.
                </p>
                <div className="relative h-80 rounded-3xl overflow-hidden shadow-2xl">
                   <img loading="lazy" src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80" alt="Blueprint" className="w-full h-full object-cover opacity-80" />
                </div>
              </RevealOnScroll>
            </div>

            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
              {[
                { num: "01", title: "Discovery & Brief", icon: Compass, desc: "Deep dive into your lifestyle, aesthetic preferences, and budget." },
                { num: "02", title: "Conceptualization", icon: PenTool, desc: "Development of mood boards, color palettes, and layout sketches." },
                { num: "03", title: "3D Visualization", icon: Layout, desc: "Creation of photorealistic 3D renders so you can see your exact space." },
                { num: "04", title: "Execution & Styling", icon: Ruler, desc: "Sourcing materials, managing contractors, and final interior styling." }
              ].map((step, idx) => (
                <RevealOnScroll key={idx} delay={idx * 150}>
                  <div className="relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors h-full">
                    <div className="text-brand-accent/20 font-black text-6xl absolute top-6 right-6">{step.num}</div>
                    <step.icon className="w-8 h-8 text-brand-accent mb-6 relative z-10" />
                    <h3 className="text-xl font-bold mb-3 relative z-10">{step.title}</h3>
                    <p className="text-gray-400 leading-relaxed relative z-10">{step.desc}</p>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. TRANSFORMING SPACES */}
      <section className="py-24 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <RevealOnScroll>
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl relative h-[600px] group">
                <img loading="lazy" src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80" alt="Transformed Space" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="bg-white/90 backdrop-blur p-6 rounded-2xl shadow-lg border border-white/20">
                    <p className="text-brand-accent font-bold text-sm uppercase tracking-wider mb-1">Project Impact</p>
                    <p className="text-gray-900 font-bold text-xl">"A complete reimagining of flow and natural light."</p>
                  </div>
                </div>
              </div>
            </RevealOnScroll>

            <div className="space-y-8">
              <RevealOnScroll delay={100}>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                  It's not just about furniture. <br />
                  <span className="text-brand-accent">It's about transformation.</span>
                </h2>
              </RevealOnScroll>
              <RevealOnScroll delay={200}>
                <p className="text-xl text-gray-600 leading-relaxed">
                  A common misconception is that designers simply pick out expensive couches. In reality, working with a professional is a deeply structural and psychological process.
                </p>
              </RevealOnScroll>
              <RevealOnScroll delay={300}>
                <p className="text-gray-600 leading-relaxed text-lg">
                  They open up choked floor plans, solve complex storage issues, and introduce sustainable materials that breathe life into dead zones. By managing proportions and scale, a designer can make a small room feel grand, and a cavernous space feel deeply intimate.
                </p>
              </RevealOnScroll>
              <RevealOnScroll delay={400}>
                <div className="flex gap-4 pt-4">
                  <Link to="/designers" className="px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-brand-accent transition-colors shadow-lg flex items-center gap-2">
                    Browse Portfolios <ArrowRight size={18} />
                  </Link>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* 8. NEW SECTION: BEYOND AESTHETICS (With Image) */}
      <section className="py-24 bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <RevealOnScroll>
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Beyond Aesthetics</h2>
              <p className="text-xl text-gray-600">
                The tangible, long-term benefits of investing in professional interior and commercial design.
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5 space-y-8">
              <RevealOnScroll delay={100}>
                <div className="bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="bg-green-50 w-14 h-14 rounded-2xl text-green-600 flex items-center justify-center mb-6">
                    <Sparkles size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Property Value Addition</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Thoughtful design is an investment, not an expense. Optimized layouts and high-quality finishes significantly increase the resale value of properties.
                  </p>
                </div>
              </RevealOnScroll>
              <RevealOnScroll delay={200}>
                <div className="bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="bg-blue-50 w-14 h-14 rounded-2xl text-blue-600 flex items-center justify-center mb-6">
                    <Users size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Wellbeing & Productivity</h3>
                  <p className="text-gray-600 leading-relaxed">
                    In homes, proper design reduces visual clutter. In commercial spaces, ergonomic workstations directly correlate to a happier, more productive workforce.
                  </p>
                </div>
              </RevealOnScroll>
            </div>

            <div className="lg:col-span-7">
              <RevealOnScroll delay={300}>
                <div className="relative h-[600px] rounded-[2.5rem] overflow-hidden shadow-2xl group">
                  <img 
                    loading="lazy"
                    src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80" 
                    alt="Beyond Aesthetics" 
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" 
                  />
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* 9. NEW SECTION: THE BOUTIQUE EXPERIENCE */}
      <section className="py-24 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
             <RevealOnScroll delay={100}>
                <div className="relative h-[500px] rounded-[2.5rem] overflow-hidden shadow-xl group border border-gray-100">
                  <img loading="lazy" src="/assets/boutique_studio_materials.png" alt="Curated Travertine and Linen samples" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" />
                </div>
             </RevealOnScroll>
             
             <div className="space-y-6">
               <RevealOnScroll delay={200}>
                 <ShieldCheck className="w-16 h-16 text-brand-accent mb-6" />
                 <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                   The Boutique Experience
                 </h2>
                 <p className="text-xl text-gray-600 leading-relaxed mb-10">
                   True luxury lies in undivided attention. We connect you directly with elite, independent design studios to ensure a deeply personal collaboration. You aren't just hiring a firm—you are forming a partnership with a visionary dedicated to the singular art of your space.
                 </p>
                 <Link to="/designers" className="inline-flex items-center gap-2 text-brand-accent font-bold text-lg hover:underline">
                   Connect with visionaries <ArrowRight size={20} />
                 </Link>
               </RevealOnScroll>
             </div>
          </div>
        </div>
      </section>

      {/* 10. WHY CHOOSE US */}
      <section className="py-32 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <RevealOnScroll>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                  Why thousands trust <br />{" "}
                  <span className="text-brand-accent">Vishwakarmans</span>
                </h2>
              </RevealOnScroll>
              <div className="space-y-8">
                {[
                  {
                    icon: ShieldCheck,
                    title: "100% Verified",
                    desc: "Every designer undergoes a strict background check and portfolio review.",
                  },
                  {
                    icon: Star,
                    title: "Transparent Reviews",
                    desc: "Genuine feedback from real clients, strictly moderated to ensure quality.",
                  },
                  {
                    icon: Users,
                    title: "Direct Connection",
                    desc: "No middlemen. Discuss your vision and get quotes directly from the experts.",
                  },
                ].map((item, idx) => (
                  <RevealOnScroll key={idx} delay={idx * 100}>
                    <div className="flex gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0">
                        <item.icon size={26} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </RevealOnScroll>
                ))}
              </div>
            </div>
            <RevealOnScroll delay={300}>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-accent/20 to-transparent rounded-3xl blur-3xl"></div>
                <div className="relative rounded-[2.5rem] border border-gray-200 shadow-2xl z-10 w-full h-[36rem] overflow-hidden">
                  <img
                    loading="lazy"
                    src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
                    alt="Why Choose Us"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute -bottom-8 -left-8 z-20 bg-white border border-gray-100 p-8 rounded-3xl shadow-2xl max-w-xs animate-fade-in">
                  <p className="text-5xl font-bold text-brand-accent mb-2">
                    500+
                  </p>
                  <p className="text-gray-900 font-bold text-lg">Successful Projects</p>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                    Connecting homes with heart across India with top-tier design professionals.
                  </p>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* 11. CTA */}
      <section className="py-24 relative overflow-hidden bg-brand-accent">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618221381711-42cb25ac9e0f?auto=format&fit=crop&w=1920&q=80')] opacity-10 mix-blend-overlay object-cover"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <RevealOnScroll>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to transform your space?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10">
              Join India's fastest-growing community of homeowners and design
              professionals today.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/designers"
                className="px-10 py-5 bg-gray-900 text-white font-bold text-lg rounded-xl shadow-xl hover:bg-black transition-all hover:-translate-y-1 w-full sm:w-auto"
              >
                Find a Designer
              </Link>
              {role !== "client" && (
                <Link
                  to={designerBtn.link}
                  className={`px-10 py-5 bg-white text-brand-accent font-bold text-lg rounded-xl shadow-xl hover:bg-gray-50 transition-all hover:-translate-y-1 w-full sm:w-auto ${
                    loadingRole && user ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  {designerBtn.text}
                </Link>
              )}
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </div>
  );
};

export default Home;  