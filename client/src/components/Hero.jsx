import React from 'react';
import { ShieldCheck, Truck, Clock, Award, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Hero({ onShopClick, onWellnessClick }) {
  return (
    <section className="hero-section">
      <div className="hero-container">
        {/* Left Hero Content */}
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>Trusted Pharmacy Partner</span>
          </div>

          <h1 className="hero-title">
            Your Health, <br />
            <span className="hero-title-highlight">Our Priority</span>
          </h1>

          <p className="hero-subheading">
            Quality medicines and healthcare products delivered straight to your doorstep with guaranteed safety & speed.
          </p>

          <div className="hero-actions">
            <button className="btn-primary" onClick={onShopClick}>
              <span>Shop Medicines</span>
              <ArrowRight size={18} />
            </button>
            <button className="btn-secondary" onClick={onWellnessClick}>
              <span>Explore Wellness</span>
            </button>
          </div>

          {/* Quick Perks / Trust Indicators */}
          <div className="hero-perks">
            <div className="perk-item">
              <CheckCircle2 size={16} className="perk-icon" />
              <span>100% Genuine Products</span>
            </div>
            <div className="perk-item">
              <CheckCircle2 size={16} className="perk-icon" />
              <span>Licensed Pharmacists</span>
            </div>
            <div className="perk-item">
              <CheckCircle2 size={16} className="perk-icon" />
              <span>Superfast Delivery</span>
            </div>
          </div>
        </div>

        {/* Right Hero Graphic Card */}
        <div className="hero-graphic">
          <div className="hero-card-glow"></div>
          <div className="hero-card-main">
            <div className="hero-card-header">
              <div className="rx-badge">Rx Verified</div>
              <span className="live-pulse"></span>
            </div>
            <div className="hero-card-body">
              <div className="medicine-preview-icon">💊</div>
              <h3>Express Health Delivery</h3>
              <p>Over 50,000+ satisfied patients trust Kanishka Pharmacy for monthly medicine supply.</p>
            </div>
            <div className="hero-card-features">
              <div className="feature-pill">
                <Truck size={14} /> 2-Hour Express
              </div>
              <div className="feature-pill">
                <ShieldCheck size={14} /> Certified Quality
              </div>
              <div className="feature-pill">
                <Clock size={14} /> 24/7 Support
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
