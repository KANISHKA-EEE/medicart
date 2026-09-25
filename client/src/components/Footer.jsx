import React from 'react';
import { Pill, ShieldCheck, Phone, Mail } from 'lucide-react';

export default function Footer({ onFooterLinkClick }) {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-container">
          {/* Brand Column */}
          <div className="footer-col brand-col">
            <div className="footer-logo">
              <div className="logo-icon-box">
                <Pill className="logo-icon" size={24} />
              </div>
              <span className="logo-title">Kanishka <span className="accent">Pharmacy</span></span>
            </div>
            <p className="footer-about">
              Kanishka Pharmacy is your trusted online healthcare destination for genuine medicines, wellness supplements, and medical devices.
            </p>
            <div className="footer-contact">
              <div className="contact-item">
                <Phone size={16} /> <span>1800-123-KANISHKA</span>
              </div>
              <div className="contact-item">
                <Mail size={16} /> <span>support@kanishkapharmacy.com</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">About Us</h4>
            <ul className="footer-links">
              <li><button onClick={() => onFooterLinkClick('About Kanishka Pharmacy')}>About Kanishka Pharmacy</button></li>
              <li><button onClick={() => onFooterLinkClick('Contact Us')}>Contact Us</button></li>
              <li><button onClick={() => onFooterLinkClick('Help Center')}>Help Center</button></li>
              <li><button onClick={() => onFooterLinkClick('Privacy Policy')}>Privacy Policy</button></li>
              <li><button onClick={() => onFooterLinkClick('Terms & Conditions')}>Terms & Conditions</button></li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div className="footer-col">
            <h4 className="footer-heading">Customer Service</h4>
            <ul className="footer-links">
              <li><button onClick={() => onFooterLinkClick('FAQs')}>FAQs</button></li>
              <li><button onClick={() => onFooterLinkClick('Order Tracking')}>Order Tracking</button></li>
              <li><button onClick={() => onFooterLinkClick('Returns & Refunds')}>Returns & Refunds</button></li>
              <li><button onClick={() => onFooterLinkClick('Prescription Upload')}>Upload Prescription</button></li>
              <li><button onClick={() => onFooterLinkClick('Store Locator')}>Store Locator</button></li>
            </ul>
          </div>

          {/* Column 4: Follow Us & Security */}
          <div className="footer-col">
            <h4 className="footer-heading">Follow Us</h4>
            <div className="social-links">
              <button onClick={() => onFooterLinkClick('Instagram')} className="social-btn" title="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </button>
              <button onClick={() => onFooterLinkClick('Facebook')} className="social-btn" title="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </button>
              <button onClick={() => onFooterLinkClick('LinkedIn')} className="social-btn" title="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </button>
            </div>
            
            <div className="footer-security-badge">
              <ShieldCheck size={20} className="security-icon" />
              <div>
                <strong>PCI-DSS Compliant</strong>
                <span>100% Safe Payments</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>© 2026 Kanishka Pharmacy. All rights reserved.</p>
          <div className="footer-disclaimer">
            <span>Powered by MediCart (MERN Stack)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
