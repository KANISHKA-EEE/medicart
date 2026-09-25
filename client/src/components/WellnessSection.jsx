import React from 'react';
import { wellnessData } from '../data/products';
import { ShieldCheck, Apple, Dumbbell, Droplets, ArrowRight, HeartPulse } from 'lucide-react';

const iconMap = {
  ShieldCheck: ShieldCheck,
  Apple: Apple,
  Dumbbell: Dumbbell,
  Droplets: Droplets
};

export default function WellnessSection({ onSelectWellness }) {
  return (
    <section className="wellness-section" id="wellness">
      <div className="section-container">
        <div className="section-header-center">
          <div className="section-tag center">
            <HeartPulse size={16} />
            <span>Preventative Healthcare</span>
          </div>
          <h2 className="section-title">Take Care of Your Health</h2>
          <p className="section-subtitle">
            Explore curated wellness categories for long-term vitality, strength, and immunity.
          </p>
        </div>

        <div className="wellness-grid">
          {wellnessData.map((item) => {
            const IconComp = iconMap[item.icon] || HeartPulse;
            return (
              <div 
                key={item.id} 
                className="wellness-card"
                onClick={() => onSelectWellness(item.title)}
              >
                <div className="wellness-header" style={{ color: item.color }}>
                  <div className="wellness-icon-box" style={{ backgroundColor: `${item.color}15` }}>
                    <IconComp size={30} />
                  </div>
                </div>

                <h3 className="wellness-title">{item.title}</h3>
                <p className="wellness-tagline">{item.tagline}</p>

                <ul className="wellness-items-list">
                  {item.items.map((sub, idx) => (
                    <li key={idx}>
                      <span className="bullet-dot" style={{ backgroundColor: item.color }}></span>
                      <span>{sub}</span>
                    </li>
                  ))}
                </ul>

                <div className="wellness-card-footer">
                  <span>Explore Category</span>
                  <ArrowRight size={16} className="wellness-arrow" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
