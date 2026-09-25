import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import { 
  Pill, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  Phone, 
  Mail, 
  ShoppingBag,
  Clock
} from 'lucide-react';

export default function OrderDetails() {
  const { id } = useParams();
  const { token, isAuthenticated } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/orders/${id}` }, replace: true });
    }
  }, [isAuthenticated, id, navigate]);

  // Fetch order details by ID
  useEffect(() => {
    if (!token || !id) return;

    const fetchOrderDetails = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to fetch order details');
        }

        setOrder(data.data);
      } catch (err) {
        console.error('Fetch Order Details Error:', err);
        setError(err.message || 'Unable to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [token, id]);

  if (!isAuthenticated) return null;

  return (
    <div className="orders-page-layout">
      {/* Header */}
      <header className="checkout-header">
        <div className="section-container checkout-header-container">
          <Link to="/" className="nav-logo">
            <div className="logo-icon-box">
              <Pill className="logo-icon" size={24} />
            </div>
            <div className="logo-text-box">
              <span className="logo-title">Medi<span className="accent">Cart</span></span>
              <span className="logo-tagline">Order Details</span>
            </div>
          </Link>

          <Link to="/orders" className="checkout-back-link">
            <ArrowLeft size={16} /> Back to My Orders
          </Link>
        </div>
      </header>

      <main className="section-container orders-main-content">
        {loading ? (
          <div className="empty-checkout-box">
            <ShoppingBag size={48} className="no-products-icon" style={{ opacity: 0.6 }} />
            <h3>Loading order details...</h3>
            <p>Fetching purchase details from database.</p>
          </div>
        ) : error ? (
          <div className="auth-error-alert" style={{ marginTop: '2rem' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        ) : !order ? (
          <div className="empty-checkout-box">
            <AlertCircle size={48} className="no-products-icon" style={{ color: 'var(--color-danger)' }} />
            <h2>Order Not Found</h2>
            <p>The requested order details could not be found.</p>
            <Link to="/orders" className="btn-primary">
              <ArrowLeft size={16} /> View My Orders
            </Link>
          </div>
        ) : (
          <div className="order-details-container">
            {/* Header Status Row */}
            <div className="details-header-card">
              <div className="details-title-box">
                <h2>Order #{order._id}</h2>
                <span className="details-date">
                  <Calendar size={14} /> Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="details-badges-row">
                <span className={`status-pill status-${(order.status || 'Placed').toLowerCase()}`}>
                  Status: {order.status || 'Placed'}
                </span>
                <span className="payment-status-pill">
                  Payment: {order.paymentStatus || 'Pending'}
                </span>
              </div>
            </div>

            <div className="checkout-grid" style={{ marginTop: '2rem' }}>
              {/* Left Column: Items & Delivery Address */}
              <div className="details-left-column">
                {/* Purchased Items List */}
                <section className="checkout-form-card" style={{ marginBottom: '2rem' }}>
                  <div className="card-section-title">
                    <ShoppingBag size={20} className="section-title-icon" />
                    <h3>Purchased Items ({order.items?.length})</h3>
                  </div>

                  <div className="details-items-list">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="details-item-card">
                        <div className="details-item-icon">
                          💊
                        </div>
                        <div className="details-item-info">
                          <h4>{item.name}</h4>
                          <span className="details-item-dosage">{item.dosageForm || 'Medicine'}</span>
                          <div className="details-item-pricing-line">
                            <span>₹{item.price} × {item.quantity}</span>
                            <span className="details-item-subtotal">₹{item.itemTotal}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Delivery Address Card */}
                <section className="checkout-form-card">
                  <div className="card-section-title">
                    <MapPin size={20} className="section-title-icon" />
                    <h3>Delivery Address</h3>
                  </div>

                  <div className="address-details-box">
                    <p className="address-name"><User size={16} /> <strong>{order.shippingAddress?.fullName}</strong></p>
                    <p className="address-line"><MapPin size={16} /> {order.shippingAddress?.addressLine1}</p>
                    {order.shippingAddress?.addressLine2 && (
                      <p className="address-line-2">{order.shippingAddress?.addressLine2}</p>
                    )}
                    <p className="address-city">{order.shippingAddress?.city}, {order.shippingAddress?.state} - <strong>{order.shippingAddress?.pincode}</strong></p>
                    <div className="address-contacts">
                      <span><Phone size={14} /> {order.shippingAddress?.phone}</span>
                      <span><Mail size={14} /> {order.shippingAddress?.email}</span>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: Pricing Summary */}
              <aside className="checkout-summary-card">
                <div className="card-section-title">
                  <ShieldCheck size={20} className="section-title-icon" />
                  <h3>Payment Breakdown</h3>
                </div>

                <div className="summary-totals-box">
                  <div className="totals-row">
                    <span>Items Subtotal</span>
                    <span>₹{order.pricing?.subtotal}</span>
                  </div>

                  <div className="totals-row">
                    <span>Delivery Charge</span>
                    <span className="free-delivery-tag">FREE Delivery</span>
                  </div>

                  <div className="totals-divider"></div>

                  <div className="totals-row grand-total-row">
                    <span>Grand Total</span>
                    <span className="grand-total-amount">₹{order.pricing?.total}</span>
                  </div>
                </div>

                <div className="summary-security-footer">
                  <ShieldCheck size={18} />
                  <span>Verified Purchase • Original MediCart Order</span>
                </div>
              </aside>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
