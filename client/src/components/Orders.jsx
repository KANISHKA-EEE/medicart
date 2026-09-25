import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import { 
  Pill, 
  Package, 
  Calendar, 
  Clock, 
  ChevronRight, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  ShoppingBag 
} from 'lucide-react';

export default function Orders() {
  const { token, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/orders' }, replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Fetch orders from API
  useEffect(() => {
    if (!token) return;

    const fetchOrders = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_BASE_URL}/api/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to fetch order history');
        }

        setOrders(data.data || []);
      } catch (err) {
        console.error('Fetch Orders Error:', err);
        setError(err.message || 'Unable to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

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
              <span className="logo-tagline">My Orders</span>
            </div>
          </Link>

          <Link to="/" className="checkout-back-link">
            <ArrowLeft size={16} /> Back to Shop
          </Link>
        </div>
      </header>

      <main className="section-container orders-main-content">
        <div className="orders-title-row">
          <div>
            <h1>My Order History</h1>
            <p>View and track your medicine purchases</p>
          </div>
          <span className="checkout-item-badge">{orders.length} total orders</span>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="empty-checkout-box">
            <Package size={48} className="no-products-icon" style={{ opacity: 0.6 }} />
            <h3>Loading orders...</h3>
            <p>Fetching your purchase history from database.</p>
          </div>
        ) : error ? (
          <div className="auth-error-alert">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        ) : orders.length === 0 ? (
          /* Empty Orders View */
          <div className="empty-checkout-box">
            <ShoppingBag size={64} className="empty-cart-icon" />
            <h2>No orders yet</h2>
            <p>You haven't placed any medicine orders with MediCart yet.</p>
            <Link to="/" className="btn-primary">
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
          </div>
        ) : (
          /* Orders List */
          <div className="orders-list-grid">
            {orders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div key={order._id} className="order-history-card">
                  <div className="order-card-header">
                    <div className="order-meta-info">
                      <span className="order-id-tag">Order #{order._id}</span>
                      <span className="order-date-text">
                        <Calendar size={14} /> {formattedDate}
                      </span>
                    </div>
                    <div className="order-status-badges">
                      <span className={`status-pill status-${(order.status || 'Placed').toLowerCase()}`}>
                        {order.status || 'Placed'}
                      </span>
                    </div>
                  </div>

                  <div className="order-card-body">
                    <div className="order-items-preview">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="order-preview-row">
                          <span className="preview-medicine-name">{item.name}</span>
                          <span className="preview-medicine-qty">Qty: {item.quantity}</span>
                          <span className="preview-medicine-price">₹{item.itemTotal}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="order-card-footer">
                    <div className="order-total-box">
                      <span className="order-total-label">Total Amount</span>
                      <span className="order-total-price">₹{order.pricing?.total}</span>
                    </div>

                    <Link to={`/orders/${order._id}`} className="btn-secondary btn-order-details">
                      <span>View Order Details</span>
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
