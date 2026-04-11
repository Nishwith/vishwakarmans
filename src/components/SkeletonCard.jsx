import React from "react";

const SkeletonCard = () => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 h-full flex flex-col animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 bg-white/5 rounded-xl"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/5 rounded w-3/4"></div>
          <div className="h-3 bg-white/5 rounded w-1/2"></div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="h-12 bg-white/5 rounded-xl"></div>
        <div className="h-12 bg-white/5 rounded-xl"></div>
      </div>

      {/* Tags Skeleton */}
      <div className="flex-1 space-y-2 mb-6">
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-white/5 rounded-full"></div>
          <div className="h-6 w-16 bg-white/5 rounded-full"></div>
        </div>
        <div className="h-3 bg-white/5 rounded w-full mt-2"></div>
        <div className="h-3 bg-white/5 rounded w-5/6"></div>
      </div>

      {/* Button Skeleton */}
      <div className="h-12 bg-white/5 rounded-xl w-full"></div>
    </div>
  );
};

export default SkeletonCard;
