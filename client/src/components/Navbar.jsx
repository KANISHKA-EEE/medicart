import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Pill, Search, User, Package, ShoppingCart, Activity, Menu, X, LogOut, ShieldCheck } from 'lucide-react';

export default function Navbar({ 
  searchQuery, 
  setSearchQuery, 
  apiStatus,
  onOpenCart,
  onShowToast
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleNavClick = (featureName) => {
    onShowToast(`${featureName} feature clicked (Demo Mode)`);
  };

  const handleLogout = () => {
    logout();
    if (onShowToast) {
      onShowToast('Logged out successfully');
    }
    navigate('/');
  };

  return (
    <header className="navbar-header">
      {/* Top Utility Bar */}
      <div className="top-bar">
        <div className="top-bar-container">
          <div className="top-bar-left">
            <span>⚡ Express 2-Hour Delivery Available in Selected Cities</span>
            <span className="dot">•</span>
            <span>🔒 100% Genuine Medicines</span>
          </div>
          <div className="top-bar-right">
            <span className="api-badge" title="Backend Server Status">
              <span className={`status-dot ${apiStatus.includes('working') ? 'online' : 'connecting'}`}></span>
              Backend: {apiStatus.includes('working') ? 'Connected' : 'Checking...'}
            </span>
            <button onClick={() => handleNavClick('Need Help?')} className="top-link">Need Help?</button>
            <button onClick={() => handleNavClick('Track Order')} className="top-link">Track Order</button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="main-nav">
        <div className="nav-container">
          {/* Brand Logo */}
          <Link to="/" className="nav-logo">
            <div className="logo-icon-box">
              <Pill className="logo-icon" size={26} />
            </div>
            <div className="logo-text-box">
              <span className="logo-title">Medi<span className="accent">Cart</span></span>
              <span className="logo-tagline">Your Health, Delivered</span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="nav-search-container">
            <div className="search-wrapper">
              <select className="search-category-select" defaultValue="All">
                <option value="All">All Categories</option>
                <option value="Medicines">Medicines</option>
                <option value="Vitamins">Vitamins</option>
                <option value="Pain Relief">Pain Relief</option>
                <option value="Personal Care">Personal Care</option>
              </select>
              <input
                type="text"
                className="search-input"
                placeholder="Search medicines, health products, vitamins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="search-btn" title="Search">
                <Search size={18} />
              </button>
            </div>
          </div>

          {/* Desktop Right Actions */}
          <div className="nav-actions">
            {isAuthenticated ? (
              <div className="user-profile-btn">
                <User size={20} />
                <div className="action-text">
                  <span className="sub-text">Hello,</span>
                  <span className="main-text">{user?.name || 'User'}</span>
                </div>

                {user?.role === 'admin' && (
                  <Link to="/admin" className="admin-nav-btn" title="Admin Dashboard">
                    <ShieldCheck size={16} />
                    <span>Admin</span>
                  </Link>
                )}

                <button 
                  className="btn-logout" 
                  onClick={handleLogout}
                  title="Sign Out"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button className="nav-action-btn" onClick={() => navigate('/login')}>
                <User size={20} />
                <div className="action-text">
                  <span className="sub-text">Hello, Sign In</span>
                  <span className="main-text">Account</span>
                </div>
              </button>
            )}

            <button className="nav-action-btn" onClick={() => navigate('/orders')}>
              <Package size={20} />
              <div className="action-text">
                <span className="sub-text">Returns &</span>
                <span className="main-text">Orders</span>
              </div>
            </button>

            <button className="cart-btn" onClick={onOpenCart}>
              <div className="cart-icon-box">
                <ShoppingCart size={22} />
                <span className="cart-badge">{cartCount}</span>
              </div>
              <div className="action-text">
                <span className="sub-text">My</span>
                <span className="main-text">Cart</span>
              </div>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Search Bar */}
        <div className="mobile-search-bar">
          <div className="search-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Search medicines, health products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-btn">
              <Search size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            {isAuthenticated ? (
              <>
                <div className="mobile-menu-item" style={{ fontWeight: 'bold' }}>
                  <User size={18} /> Signed in as {user?.name}
                </div>
                {user?.role === 'admin' && (
                  <button className="mobile-menu-item" onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }}>
                    <ShieldCheck size={18} /> Admin Dashboard
                  </button>
                )}
                <button className="mobile-menu-item" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <button className="mobile-menu-item" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>
                <User size={18} /> Sign In / Register
              </button>
            )}
            <button className="mobile-menu-item" onClick={() => { navigate('/orders'); setMobileMenuOpen(false); }}>
              <Package size={18} /> My Orders
            </button>
            <button className="mobile-menu-item" onClick={() => { onOpenCart(); setMobileMenuOpen(false); }}>
              <ShoppingCart size={18} /> Cart ({cartCount})
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
