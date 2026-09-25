import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { API_BASE_URL } from '../config/api';
import { 
  Pill, 
  ShoppingBag, 
  MapPin, 
  User as UserIcon, 
  Phone, 
  Mail, 
  Home, 
  Building, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ShieldCheck, 
  Check,
  PackageCheck
} from 'lucide-react';

export default function Checkout({ onShowToast }) {
  const { user, token, isAuthenticated } = useAuth();
  const { cartItems, cartCount, cartSubtotal, totalSavings, clearCart } = useCart();

  const navigate = useNavigate();
  const location = useLocation();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const [error, setError] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Auto pre-fill user name & email when user is available
  useEffect(() => {
    if (user) {
      if (!name && user.name) setName(user.name);
      if (!email && user.email) setEmail(user.email);
    }
  }, [user]);

  // Auth Protection: Redirect to /login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' }, replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  // Empty Cart Protection
  if (cartItems.length === 0) {
    return (
      <div className="checkout-page-layout">
        <div className="section-container">
          <div className="empty-checkout-box">
            <ShoppingBag size={64} className="empty-cart-icon" />
            <h2>Your cart is empty</h2>
            <p>You need to add medicines or health products to your cart before proceeding to checkout.</p>
            <Link to="/" className="btn-primary">
              <ArrowLeft size={16} /> Browse Medicines
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Real Order Submission Handler
  const handlePlaceOrderClick = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedAddr1 = address1.trim();
    const trimmedCity = city.trim();
    const trimmedState = state.trim();
    const trimmedPincode = pincode.trim();

    // 1. Required fields check
    if (!trimmedName || !trimmedEmail || !trimmedPhone || !trimmedAddr1 || !trimmedCity || !trimmedState || !trimmedPincode) {
      setError('Please fill in all required delivery fields.');
      return;
    }

    // 2. Email format validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    // 3. Indian 10-digit mobile number validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
      return;
    }

    // 4. Indian 6-digit pincode validation
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(trimmedPincode)) {
      setError('Please enter a valid 6-digit Indian postal pincode (e.g. 110001).');
      return;
    }

    setIsPlacingOrder(true);

    try {
      // Build order items array with medicine ID and quantity (ignoring frontend prices)
      const formattedItems = cartItems.map((item) => ({
        medicine: item._id || item.id,
        quantity: item.quantity
      }));

      const orderPayload = {
        items: formattedItems,
        shippingAddress: {
          fullName: trimmedName,
          phone: trimmedPhone,
          email: trimmedEmail,
          addressLine1: trimmedAddr1,
          addressLine2: address2.trim(),
          city: trimmedCity,
          state: trimmedState,
          pincode: trimmedPincode
        }
      };

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to place order. Please try again.');
      }

      const createdOrder = data.data.order;

      // Clear cart ONLY AFTER successful order creation in backend
      clearCart();

      if (onShowToast) {
        onShowToast(`Order #${createdOrder._id} placed successfully!`);
      }

      // Navigate to order details view
      navigate(`/orders/${createdOrder._id}`);

    } catch (err) {
      console.error('Order Submission Error:', err);
      setError(err.message || 'Server connection error during checkout. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="checkout-page-layout">
      {/* Top Header Bar */}
      <header className="checkout-header">
        <div className="section-container checkout-header-container">
          <Link to="/" className="nav-logo">
            <div className="logo-icon-box">
              <Pill className="logo-icon" size={24} />
            </div>
            <div className="logo-text-box">
              <span className="logo-title">Medi<span className="accent">Cart</span></span>
              <span className="logo-tagline">Secure Checkout</span>
            </div>
          </Link>

          <Link to="/" className="checkout-back-link">
            <ArrowLeft size={16} /> Continue Shopping
          </Link>
        </div>
      </header>

      {/* Main Checkout Container */}
      <main className="section-container checkout-main-content">
        <div className="checkout-title-row">
          <h1>Delivery Information & Order Summary</h1>
          <span className="checkout-item-badge">{cartCount} items in cart</span>
        </div>

        {/* Validation Error Alert */}
        {error && (
          <div className="auth-error-alert" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={20} className="auth-error-icon" />
            <span>{error}</span>
          </div>
        )}

        <div className="checkout-grid">
          {/* Left Column: Delivery Form */}
          <section className="checkout-form-card">
            <div className="card-section-title">
              <MapPin size={20} className="section-title-icon" />
              <h2>Delivery Address</h2>
            </div>

            <form onSubmit={handlePlaceOrderClick} className="checkout-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="chk-name">Full Name *</label>
                  <div className="input-with-icon">
                    <UserIcon size={18} className="input-icon" />
                    <input
                      id="chk-name"
                      type="text"
                      placeholder="e.g. Kanishka Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="chk-phone">Mobile Phone (10 digits) *</label>
                  <div className="input-with-icon">
                    <Phone size={18} className="input-icon" />
                    <input
                      id="chk-phone"
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="chk-email">Email Address *</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="chk-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="chk-address1">Address Line 1 (House No, Building, Street) *</label>
                <div className="input-with-icon">
                  <Home size={18} className="input-icon" />
                  <input
                    id="chk-address1"
                    type="text"
                    placeholder="e.g. Flat 402, Green Valley Apartments"
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="chk-address2">Address Line 2 (Landmark, Area - Optional)</label>
                <div className="input-with-icon">
                  <Building size={18} className="input-icon" />
                  <input
                    id="chk-address2"
                    type="text"
                    placeholder="e.g. Near City Hospital"
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label htmlFor="chk-city">City *</label>
                  <input
                    id="chk-city"
                    type="text"
                    className="standard-input"
                    placeholder="e.g. New Delhi"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="chk-state">State *</label>
                  <input
                    id="chk-state"
                    type="text"
                    className="standard-input"
                    placeholder="e.g. Delhi"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="chk-pincode">Pincode (6 digits) *</label>
                  <input
                    id="chk-pincode"
                    type="text"
                    className="standard-input"
                    placeholder="e.g. 110001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary place-order-btn" disabled={isPlacingOrder}>
                {isPlacingOrder ? (
                  <span>Placing Order...</span>
                ) : (
                  <>
                    <Check size={20} />
                    <span>Place Order</span>
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Right Column: Order Summary */}
          <aside className="checkout-summary-card">
            <div className="card-section-title">
              <ShoppingBag size={20} className="section-title-icon" />
              <h2>Order Summary</h2>
            </div>

            {/* Cart Items List */}
            <div className="summary-items-list">
              {cartItems.map((item) => {
                const itemId = item._id || item.id;
                const itemTotal = item.price * item.quantity;

                return (
                  <div key={itemId} className="summary-item-row">
                    <div className="summary-item-left">
                      <span className="summary-item-name">{item.name}</span>
                      <span className="summary-item-qty">
                        ₹{item.price} × {item.quantity}
                      </span>
                    </div>
                    <span className="summary-item-total">₹{itemTotal}</span>
                  </div>
                );
              })}
            </div>

            {/* Price Calculations */}
            <div className="summary-totals-box">
              <div className="totals-row">
                <span>Subtotal</span>
                <span>₹{cartSubtotal}</span>
              </div>

              <div className="totals-row">
                <span>Delivery Charge</span>
                <span className="free-delivery-tag">FREE Delivery</span>
              </div>

              {totalSavings > 0 && (
                <div className="totals-row savings-row">
                  <span>Total Discount Savings</span>
                  <span>- ₹{totalSavings}</span>
                </div>
              )}

              <div className="totals-divider"></div>

              <div className="totals-row grand-total-row">
                <span>Total Payable</span>
                <span className="grand-total-amount">₹{cartSubtotal}</span>
              </div>
            </div>

            <div className="summary-security-footer">
              <ShieldCheck size={18} />
              <span>100% Genuine Pharmacy Products & Secure Processing</span>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
