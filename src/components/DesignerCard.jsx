import React from 'react';
import { Star, ShieldCheck, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const DesignerCard = ({ designer, activeCategory }) => {
  const displayImage = designer.portfolio[activeCategory] || designer.portfolio.cover;

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-brand-accent transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10 flex flex-col h-full">
      
      {/* 1. Image Area */}
      <div className="relative h-64 overflow-hidden bg-gray-50">
        <img 
          src={displayImage} 
          alt={designer.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Stronger Gradient for Visibility on Light Images */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90"></div>

        {/* Improved Verified Badge */}
        <div className="absolute top-4 left-4 flex gap-2">
          {designer.isVerified && (
            <div className="bg-blue-500 text-gray-900 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
              <ShieldCheck size={12} className="fill-white text-blue-500" /> VERIFIED
            </div>
          )}
        </div>

        {/* Rating moved to image overlay for cleaner look */}
        <div className="absolute bottom-4 left-4 flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-accent transition-colors drop-shadow-md">
              {designer.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
               <span className="bg-white/20 backdrop-blur-md text-gray-900 text-xs px-2 py-0.5 rounded flex items-center gap-1">
                 <Star size={10} className="text-yellow-400 fill-yellow-400" /> {designer.rating}
               </span>
               <span className="text-gray-600 text-xs flex items-center drop-shadow-md">
                 <MapPin size={12} className="mr-1" /> {designer.city}
               </span>
            </div>
        </div>
      </div>

      {/* 2. Info Content */}
      <div className="p-5 flex flex-col flex-grow">
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {designer.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="text-[10px] uppercase font-bold tracking-wider text-brand-muted bg-white/5 px-2 py-1 rounded border border-gray-100">
              {tag}
            </span>
          ))}
        </div>

        <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-grow">
          {designer.about}
        </p>

        {/* CTA Button */}
        <Link 
          to={`/designers/${designer.id}`} 
          className="w-full inline-flex items-center justify-center px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-white font-bold hover:bg-brand-accent hover:border-brand-accent transition-all group/btn"
        >
          View Profile <ArrowRight size={16} className="ml-2 transition-transform group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

export default DesignerCard;