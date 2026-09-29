import React, { useState, useEffect } from 'react';
import { Pill, Sparkles } from 'lucide-react';

export default function WelcomeAnimation() {
  const [visible, setVisible] = useState(() => {
    // Check if welcome animation was already shown in the current session
    return !sessionStorage.getItem('kanishka_welcome_shown');
  });
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (!visible) return;

    // Start fade out after 2.2s
    const timer1 = setTimeout(() => {
      setFadingOut(true);
    }, 2200);

    // Completely unmount after 2.8s
    const timer2 = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('kanishka_welcome_shown', 'true');
    }, 2800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className={`welcome-animation-overlay ${fadingOut ? 'fade-out' : ''}`}>
      <div className="welcome-animation-card">
        <div className="welcome-icon-box">
          <Pill size={36} className="welcome-pill-icon" />
        </div>
        <div className="welcome-sparkle-tag">
          <Sparkles size={16} />
          <span>Licensed & Verified Pharmacy</span>
          <Sparkles size={16} />
        </div>
        <h2 className="welcome-title">✨ Welcome to Kanishka Pharmacy ✨</h2>
        <p className="welcome-subtitle">Your Health & Wellbeing Is Our Highest Priority</p>
      </div>
    </div>
  );
}
