import React from 'react';
import { ShieldCheck, Lock, ClipboardCheck, Truck } from 'lucide-react';

export default function TrustSection() {
  const trustItems = [
    {
      icon: ShieldCheck,
      title: "100% Genuine Products",
      desc: "Directly sourced from licensed manufacturers & certified distributors."
    },
    {
      icon: Lock,
      title: "Secure Shopping",
      desc: "100% safe & encrypted payments with PCI-DSS compliance."
    },
    {
      icon: ClipboardCheck,
      title: "Easy Ordering",
      desc: "Fast medicine discovery, search & licensed pharmacist support."
    },
    {
      icon: Truck,
      title: "Fast Doorstep Delivery",
      desc: "Express 2-hour delivery available with live order tracking."
    }
  ];

  return (
    <section className="trust-section">
      <div className="section-container">
        <div className="trust-grid">
          {trustItems.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div key={idx} className="trust-card">
                <div className="trust-icon-box">
                  <IconComp size={22} />
                </div>
                <div className="trust-content">
                  <h4 className="trust-title">{item.title}</h4>
                  <p className="trust-desc">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
