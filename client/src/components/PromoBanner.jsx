import React from 'react';
import { Tag, Sparkles, Percent, ArrowRight } from 'lucide-react';

export default function PromoBanner({ onOffersClick }) {
  return (
    <section className="promo-banner-section">
      <div className="section-container">
        <div className="promo-banner-card">
          <div className="promo-content">
            <div className="promo-badge">
              <Tag size={16} />
              <span>Special Offer • Up to 25% Off</span>
            </div>
            
            <h2 className="promo-title">Save More on Your Healthcare</h2>
            <p className="promo-text">
              Get exclusive offers on selected health products, vitamins, and daily essentials delivered fast.
            </p>

            <button className="promo-btn" onClick={onOffersClick}>
              <span>View Offers</span>
              <ArrowRight size={18} />
            </button>
          </div>

          <div className="promo-visual">
            <div className="offer-circle">
              <span className="percent-text">25%</span>
              <span className="off-text">OFF</span>
            </div>
            <div className="floating-pill-tag">
              <Sparkles size={16} /> Best Prices Guaranteed
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
