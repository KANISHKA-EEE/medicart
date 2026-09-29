import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Pill, Search, User, Package, ShoppingCart, Info, Home, LogOut, ShieldCheck, Menu, X } from 'lucide-react';

export default function Navbar({ 
  searchQuery, 
  setSearchQuery, 
  apiStatus,
  onOpenCart,
  onOpenAbout,
  onShowToast
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleNavClick = (featureName) => {
    if (onShowToast) onShowToast(`${featureName} feature clicked (Demo Mode)`);
  };

  const handleLogout = () => {
    logout();
    if (onShowToast) {
      onShowToast('Logged out successfully');
    }
    navigate('/');
  };

  const scrollToMedicines = () => {
    navigate('/');
    setTimeout(() => {
      const el = document.getElementById('available-medicines') || document.getElementById('popular-medicines');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const scrollToHome = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="navbar-header">
      {/* Top Utility Bar */}
      <div className="top-bar">
        <div className="top-bar-container">
          <div className="top-bar-left">
            <span>🏥 <strong>Kanishka Pharmacy</strong> — Express 2-Hour Delivery Available</span>
            <span className="dot">•</span>
            <span>🔒 100% Genuine Medicines</span>
          </div>
          <div className="top-bar-right">
            <span className="api-badge" title="Backend Server Status">
              <span className={`status-dot ${apiStatus && apiStatus.includes('working') ? 'online' : 'connecting'}`}></span>
              Backend: {apiStatus && apiStatus.includes('working') ? 'Connected' : 'Checking...'}
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
              <span className="logo-title">Kanishka <span className="accent">Pharmacy</span></span>
              <span className="logo-tagline">Your Health, Delivered</span>
            </div>
          </Link>

          {/* Direct Nav Menu (Home | Medicines | About) */}
          <div className="primary-nav-links">
            <button className="nav-menu-link" onClick={scrollToHome}>
              <Home size={16} /> Home
            </button>
            <button className="nav-menu-link" onClick={scrollToMedicines}>
              <Pill size={16} /> Medicines
            </button>
            <button className="nav-menu-link" onClick={onOpenAbout}>
              <Info size={16} /> About
            </button>
          </div>

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

          {/* Desktop Right Actions: Hi, KANISHKA S → Cart → Logout */}
          <div className="nav-right-actions">
            {isAuthenticated ? (
              <div className="user-greeting-pill">
                <User size={16} className="user-icon" />
                <span className="user-greeting-text">Hi, {user?.name || 'User'}</span>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="admin-nav-btn" title="Admin Dashboard">
                    <ShieldCheck size={14} />
                    <span>Admin</span>
                  </Link>
                )}
              </div>
            ) : (
              <button className="nav-menu-link" onClick={() => navigate('/login')}>
                <User size={16} /> Login
              </button>
            )}

            <button className="nav-menu-link cart-menu-highlight" onClick={onOpenCart}>
              <ShoppingCart size={16} /> Cart ({cartCount})
            </button>

            {isAuthenticated && (
              <button 
                className="btn-logout" 
                onClick={handleLogout}
                title="Sign Out"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            )}
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
            <button className="mobile-menu-item" onClick={() => { scrollToHome(); setMobileMenuOpen(false); }}>
              <Home size={18} /> Home
            </button>
            <button className="mobile-menu-item" onClick={() => { scrollToMedicines(); setMobileMenuOpen(false); }}>
              <Pill size={18} /> Available Medicines
            </button>
            <button className="mobile-menu-item" onClick={() => { onOpenAbout(); setMobileMenuOpen(false); }}>
              <Info size={18} /> About Kanishka Pharmacy
            </button>
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
                <User size={18} /> Login / Register
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

