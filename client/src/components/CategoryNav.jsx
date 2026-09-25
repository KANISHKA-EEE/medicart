import React from 'react';
import { 
  Pill, 
  Sparkles, 
  Zap, 
  Thermometer, 
  Activity, 
  Heart, 
  Cross, 
  Baby, 
  Smile,
  ChevronRight
} from 'lucide-react';
import { navCategories } from '../data/products';

const iconMap = {
  Pill: Pill,
  Sparkles: Sparkles,
  Zap: Zap,
  Thermometer: Thermometer,
  Activity: Activity,
  Heart: Heart,
  Cross: Cross,
  Baby: Baby,
  Smile: Smile
};

export default function CategoryNav({ activeCategory, setActiveCategory, onShowToast }) {
  const handleCategoryClick = (categoryName) => {
    if (activeCategory === categoryName) {
      setActiveCategory('All');
      onShowToast(`Showing all products`);
    } else {
      setActiveCategory(categoryName);
      onShowToast(`Filtered by ${categoryName}`);
    }
  };

  return (
    <div className="subnav-bar">
      <div className="subnav-container">
        <div className="category-scroll-list">
          <button 
            className={`subnav-item ${activeCategory === 'All' ? 'active' : ''}`}
            onClick={() => handleCategoryClick('All')}
          >
            <span>All Categories</span>
          </button>
          
          {navCategories.map((cat, idx) => {
            const IconComponent = iconMap[cat.icon] || Pill;
            const isActive = activeCategory === cat.name;
            return (
              <button
                key={idx}
                className={`subnav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleCategoryClick(cat.name)}
              >
                <IconComponent size={15} className="subnav-icon" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
