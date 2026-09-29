import React from 'react';
import { ShieldCheck, ArrowRight, CheckCircle2, Truck, Award, Clock } from 'lucide-react';

export default function Hero({ onShopClick, onWellnessClick }) {
  return (
    <section className="hero-section">
      <div className="hero-container">
        {/* Left Hero Content */}
        <div className="hero-content">
          <div className="hero-badge">
            <ShieldCheck size={16} />
            <span>Licensed & Verified Online Pharmacy</span>
          </div>

          <h1 className="hero-title">
            Your Trusted <br />
            <span className="hero-title-highlight">Online Pharmacy</span>
          </h1>

          <p className="hero-subheading">
            Order 100% genuine prescription medicines, health products, and wellness essentials delivered safely and quickly to your doorstep.
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
              <span>100% Genuine Medicines</span>
            </div>
            <div className="perk-item">
              <CheckCircle2 size={16} className="perk-icon" />
              <span>Certified Pharmacists</span>
            </div>
            <div className="perk-item">
              <CheckCircle2 size={16} className="perk-icon" />
              <span>Fast Doorstep Delivery</span>
            </div>
          </div>
        </div>

        {/* Right Hero Graphic Card */}
        <div className="hero-graphic">
          <div className="hero-card-main">
            <div className="hero-card-header">
              <div className="pharmacy-tag">
                <ShieldCheck size={18} />
                <span>Kanishka Pharmacy Express</span>
              </div>
            </div>
            
            <div className="hero-card-body">
              <div className="hero-stat-box">
                <span className="stat-number">50,000+</span>
                <span className="stat-label">Patients Served Daily</span>
              </div>
              <p className="hero-card-desc">
                Your trusted source for authentic medicines, health supplements, and healthcare supplies.
              </p>
            </div>

            <div className="hero-card-features">
              <div className="feature-pill">
                <Truck size={15} /> Express Delivery
              </div>
              <div className="feature-pill">
                <Award size={15} /> Verified Quality
              </div>
              <div className="feature-pill">
                <Clock size={15} /> 24/7 Support
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
