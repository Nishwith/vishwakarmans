import React from 'react';
import { Sofa, Utensils, BedDouble, Briefcase, ShoppingBag } from 'lucide-react';

const categories = [
  // Interior Categories
  { id: 'living', label: 'Living', icon: Sofa, type: 'interior' },
  { id: 'kitchen', label: 'Kitchen', icon: Utensils, type: 'interior' },
  { id: 'bedroom', label: 'Bedroom', icon: BedDouble, type: 'interior' },
  // Commercial Categories
  { id: 'office', label: 'Office', icon: Briefcase, type: 'commercial' },
  { id: 'retail', label: 'Retail', icon: ShoppingBag, type: 'commercial' },
];

const CategoryTabs = ({ activeCategory, onSelect, filterType }) => {
  // Filter tabs: 
  // If filterType is 'interior', show only interior. 
  // If 'commercial', show only commercial.
  // If null/undefined, show ALL.
  const visibleCategories = categories.filter(cat => 
    !filterType || cat.type === filterType
  );

  return (
    <div className="flex overflow-x-auto gap-3 py-1 scrollbar-hide">
      {visibleCategories.map((cat) => {
        const isActive = activeCategory === cat.id;
        const Icon = cat.icon;
        
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 border
              ${isActive 
                ? 'bg-brand-accent text-gray-900 border-brand-accent shadow-md shadow-orange-500/20' 
                : 'bg-transparent text-gray-500 border-transparent hover:bg-white/5 hover:text-gray-900'
              }
            `}
          >
            <Icon size={16} />
            {cat.label}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryTabs;