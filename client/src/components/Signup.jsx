import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Pill, User, Mail, Lock, UserPlus, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function Signup({ onShowToast }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password.trim()
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Signup failed. Please try again.');
      }

      setSuccessMsg('Account created successfully! Redirecting to sign in...');
      if (onShowToast) {
        onShowToast('Account registered successfully! Please sign in.');
      }

      setTimeout(() => {
        navigate('/login');
      }, 1800);

    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Unable to connect to server. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        {/* Top Back Link */}
        <Link to="/" className="auth-back-link">
          <ArrowLeft size={16} /> Back to MediCart
        </Link>

        {/* Brand Header */}
        <div className="auth-brand-header">
          <div className="auth-logo-box">
            <Pill size={32} className="auth-logo-icon" />
          </div>
          <h2>Join MediCart</h2>
          <p>Create your account for fast medicine delivery & care</p>
        </div>

        {/* Success Alert Box */}
        {successMsg && (
          <div className="auth-success-alert">
            <CheckCircle2 size={18} className="auth-success-icon" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert Box */}
        {error && (
          <div className="auth-error-alert">
            <AlertCircle size={18} className="auth-error-icon" />
            <span>{error}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="signup-name">Full Name</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                id="signup-name"
                type="text"
                placeholder="e.g. Kanishka Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="signup-email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="signup-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="signup-password">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="signup-password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="signup-confirm-password">Confirm Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="signup-confirm-password"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Switcher */}
        <div className="auth-footer-switch">
          <span>Already have a MediCart account?</span>
          <Link to="/login" className="auth-switch-link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
