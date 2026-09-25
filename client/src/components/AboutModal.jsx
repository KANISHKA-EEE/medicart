import React from 'react';
import { Pill, ShieldCheck, Truck, Clock, Award, X, CheckCircle } from 'lucide-react';

export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="cart-modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="cart-modal-drawer" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '540px', height: 'auto', maxHeight: '90vh', borderRadius: '16px', overflowY: 'auto', margin: 'auto' }}
      >
        {/* Modal Header */}
        <div className="cart-drawer-header" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="cart-drawer-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="logo-icon-box" style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #0284c7, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Pill size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--color-slate-800)' }}>About Kanishka Pharmacy</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)' }}>Your Trusted Healthcare Partner</span>
            </div>
          </div>
          <button className="cart-close-btn" onClick={onClose} aria-label="Close about modal">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', color: 'var(--color-slate-700)', lineHeight: '1.6' }}>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            Welcome to <strong>Kanishka Pharmacy</strong> (powered by MediCart). We are dedicated to delivering genuine prescription medicines, OTC products, and wellness essentials right to your doorstep with maximum safety and speed.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
            <div style={{ padding: '1rem', borderRadius: '10px', background: '#f0f9ff', border: '1px solid #bae6fd' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0369a1', fontWeight: 600, marginBottom: '0.3rem' }}>
                <ShieldCheck size={18} />
                <span>100% Genuine</span>
              </div>
              <span style={{ fontSize: '0.85rem', color: '#0369a1' }}>Direct from licensed manufacturers & distributors.</span>
            </div>

            <div style={{ padding: '1rem', borderRadius: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#15803d', fontWeight: 600, marginBottom: '0.3rem' }}>
                <Truck size={18} />
                <span>Express Delivery</span>
              </div>
              <span style={{ fontSize: '0.85rem', color: '#15803d' }}>Fast doorstep delivery in selected cities.</span>
            </div>

            <div style={{ padding: '1rem', borderRadius: '10px', background: '#faf5ff', border: '1px solid #e9d5ff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b21a8', fontWeight: 600, marginBottom: '0.3rem' }}>
                <Clock size={18} />
                <span>24/7 Availability</span>
              </div>
              <span style={{ fontSize: '0.85rem', color: '#6b21a8' }}>Order medicine online anytime, anywhere.</span>
            </div>

            <div style={{ padding: '1rem', borderRadius: '10px', background: '#fff7ed', border: '1px solid #fed7aa' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c2410c', fontWeight: 600, marginBottom: '0.3rem' }}>
                <Award size={18} />
                <span>Verified Pharmacists</span>
              </div>
              <span style={{ fontSize: '0.85rem', color: '#c2410c' }}>Expert review on prescription medicines.</span>
            </div>
          </div>

          <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-slate-800)', fontSize: '1rem' }}>Shopping Flow</h4>
            <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <li><strong>Home / Navigation:</strong> Browse categories & search medicines.</li>
              <li><strong>Available Medicines:</strong> View verified stock & prices.</li>
              <li><strong>Add to Cart:</strong> Select quantities & update cart.</li>
              <li><strong>Cart:</strong> Review items & view discount savings.</li>
              <li><strong>Checkout:</strong> Fast & secure order placement.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="cart-drawer-footer" style={{ borderTop: '1px solid var(--color-border)', padding: '1rem 1.5rem' }}>
          <button className="btn-primary" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>
            <CheckCircle size={18} /> Got It, Start Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
