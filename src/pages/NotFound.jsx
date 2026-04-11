import React from "react";
import { Link } from "react-router-dom";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-accent/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="text-center relative z-10 max-w-lg">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/50 border border-gray-100 mb-8 shadow-2xl animate-bounce-slow">
          <AlertTriangle className="text-brand-accent" size={48} />
        </div>

        {/* Text */}
        <h1 className="text-8xl font-black text-gray-900 mb-4 tracking-tighter">
          4<span className="text-brand-accent">0</span>4
        </h1>
        <h2 className="text-2xl font-bold text-gray-600 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>

        {/* Action Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-brand-accent hover:bg-orange-600 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-orange-900/20 transition-all active:scale-95"
        >
          <Home size={20} /> Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
