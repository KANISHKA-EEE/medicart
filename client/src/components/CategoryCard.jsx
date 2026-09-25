import React from 'react';
import { 
  Stethoscope, 
  Sparkles, 
  Zap, 
  Thermometer, 
  Activity, 
  Heart,
  ArrowRight
} from 'lucide-react';

const iconMap = {
  Stethoscope: Stethoscope,
  Sparkles: Sparkles,
  Zap: Zap,
  Thermometer: Thermometer,
  Activity: Activity,
  Heart: Heart
};

export default function CategoryCard({ category, onSelectCategory }) {
  const IconComponent = iconMap[category.icon] || Stethoscope;

  return (
    <div 
      className="category-card" 
      onClick={() => onSelectCategory(category.name)}
      style={{ '--cat-accent': category.color }}
    >
      <div className="cat-card-header">
        <div className="cat-icon-wrapper" style={{ backgroundColor: `${category.color}15`, color: category.color }}>
          <IconComponent size={28} />
        </div>
        <span className="cat-badge">{category.badge}</span>
      </div>

      <h3 className="cat-title">{category.name}</h3>
      <p className="cat-desc">{category.description}</p>

      <div className="cat-footer">
        <span className="cat-action">Browse Products</span>
        <ArrowRight size={16} className="cat-arrow" />
      </div>
    </div>
  );
}
