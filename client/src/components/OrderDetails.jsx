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
  Clock,
  FileText,
  FileCheck,
  Eye,
  XCircle,
  X
} from 'lucide-react';

export default function OrderDetails() {
  const { id } = useParams();
  const { token, isAuthenticated } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewModalFile, setPreviewModalFile] = useState(null);

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

  const handleViewPrescription = async (filename) => {
    if (!filename || !token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/prescription-file/${filename}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to retrieve prescription file');
      }

      const blob = await res.blob();
      const fileUrl = URL.createObjectURL(blob);
      const isPdf = filename.toLowerCase().endsWith('.pdf') || blob.type === 'application/pdf';

      setPreviewModalFile({
        url: fileUrl,
        filename: filename,
        isPdf
      });

    } catch (err) {
      console.error('View Prescription Error:', err);
      alert('Unable to load prescription file. ' + err.message);
    }
  };

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
                  Order Status: {order.status || 'Placed'}
                </span>
                <span className="payment-status-pill">
                  Payment: {order.paymentStatus || 'Pending'}
                </span>
              </div>
            </div>

            <div className="checkout-grid" style={{ marginTop: '2rem' }}>
              {/* Left Column: Items, Prescription & Delivery Address */}
              <div className="details-left-column">
                
                {/* Prescription Status Section */}
                {order.prescriptionRequired && (
                  <section className="checkout-form-card" style={{ marginBottom: '2rem' }}>
                    <div className="card-section-title">
                      <FileText size={20} className="section-title-icon" />
                      <h3>Prescription Verification</h3>
                    </div>

                    <div className={`customer-rx-status-box rx-box-${(order.prescriptionStatus || 'Pending Review').toLowerCase().replace(/\s+/g, '-')}`}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          {order.prescriptionStatus === 'Approved' ? (
                            <CheckCircle2 size={26} color="#16a34a" />
                          ) : order.prescriptionStatus === 'Rejected' ? (
                            <XCircle size={26} color="#dc2626" />
                          ) : (
                            <Clock size={26} color="#087ea4" />
                          )}

                          <div>
                            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1f2937' }}>
                              Prescription Document: {order.prescriptionFile?.originalName || order.prescriptionFile?.filename || 'Uploaded Prescription'}
                            </h4>
                            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                              Prescription Status: {' '}
                              <span className={`status-pill rx-pill-${(order.prescriptionStatus || 'Pending Review').toLowerCase().replace(/\s+/g, '-')}`}>
                                {order.prescriptionStatus === 'Pending Review' ? 'Pending Verification' : order.prescriptionStatus}
                              </span>
                            </div>
                          </div>
                        </div>

                        {order.prescriptionFile?.filename && (
                          <button 
                            className="btn-secondary" 
                            onClick={() => handleViewPrescription(order.prescriptionFile.filename)}
                            style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
                          >
                            <Eye size={14} /> View Prescription
                          </button>
                        )}
                      </div>

                      {order.prescriptionStatus === 'Rejected' && order.prescriptionRejectionReason && (
                        <div className="rx-rejection-reason-alert">
                          <XCircle size={18} color="#b91c1c" style={{ flexShrink: 0 }} />
                          <div>
                            <strong>Rejection Reason from Pharmacy Admin:</strong>
                            <p style={{ margin: '0.2rem 0 0', fontSize: '0.88rem' }}>{order.prescriptionRejectionReason}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}

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
                          <h4>
                            {item.name}
                            {item.prescriptionRequired && (
                              <span className="rx-item-tag">Prescription Required</span>
                            )}
                          </h4>
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

      {/* Prescription Document Modal Preview */}
      {previewModalFile && (
        <div className="cart-modal-overlay" onClick={() => setPreviewModalFile(null)} style={{ zIndex: 1200 }}>
          <div className="cart-modal-drawer" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px', height: 'auto', maxHeight: '90vh', borderRadius: '16px', margin: 'auto', overflow: 'hidden' }}>
            <div className="cart-drawer-header">
              <div className="cart-drawer-title">
                <FileText size={20} />
                <h3>Prescription File: {previewModalFile.filename}</h3>
              </div>
              <button className="cart-close-btn" onClick={() => setPreviewModalFile(null)}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '1.5rem', textAlign: 'center', overflowY: 'auto', maxHeight: '75vh' }}>
              {previewModalFile.isPdf ? (
                <iframe src={previewModalFile.url} title="Prescription PDF" style={{ width: '100%', height: '500px', border: 'none', borderRadius: '8px' }} />
              ) : (
                <img src={previewModalFile.url} alt="Uploaded Prescription" style={{ maxWidth: '100%', maxHeight: '500px', borderRadius: '8px', objectFit: 'contain' }} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
