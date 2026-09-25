import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Pill, Mail, Lock, LogIn, AlertCircle, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function Login({ onShowToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in both email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      // Save user & token to AuthContext & localStorage
      login(data.user, data.token);

      if (onShowToast) {
        onShowToast(`Welcome back, ${data.user.name}!`);
      }

      navigate(from, { replace: true });

    } catch (err) {
      console.error('Login error:', err);
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
          <h2>Welcome Back to MediCart</h2>
          <p>Sign in to manage your health essentials and orders</p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="auth-error-alert">
            <AlertCircle size={18} className="auth-error-icon" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="login-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <span>Signing in...</span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Switcher */}
        <div className="auth-footer-switch">
          <span>Don't have a MediCart account?</span>
          <Link to="/signup" className="auth-switch-link">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
