import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import { 
  ArrowLeft, 
  Package, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  IndianRupee,
  ShieldCheck,
  Save
} from 'lucide-react';

export default function AdminOrderDetails() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status update state
  const [selectedStatus, setSelectedStatus] = useState('Placed');
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch order details');
      }

      setOrder(data.data);
      setSelectedStatus(data.data.status || 'Placed');
    } catch (err) {
      console.error('Fetch Admin Order Details Error:', err);
      setError(err.message || 'Network error fetching order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!selectedStatus) return;
    setUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: selectedStatus })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update order status');
      }

      setOrder(data.data);
      showToast(`Order status updated to '${selectedStatus}' successfully!`);
    } catch (err) {
      console.error('Update Order Status Error:', err);
      showToast(`Error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Placed': return 'placed';
      case 'Processing': return 'processing';
      case 'Shipped': return 'shipped';
      case 'Delivered': return 'delivered';
      case 'Cancelled': return 'cancelled';
      default: return 'placed';
    }
  };

  return (
    <div className="admin-dashboard-layout">
      {/* Toast Notification */}
      {toast && (
        <div className="toast-notification">
          <CheckCircle2 size={18} className="toast-icon" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="admin-header">
        <div className="admin-header-container">
          <div className="admin-brand">
            <Link to="/admin/orders" className="admin-back-btn" title="Back to All Orders">
              <ArrowLeft size={18} />
              <span>Back to Orders List</span>
            </Link>
            <div className="admin-title-badge">
              <Package size={22} className="admin-shield-icon" />
              <h1>Order #{id ? id.substring(id.length - 8) : ''} Details</h1>
            </div>
          </div>

          <div className="admin-user-info">
            <button className="admin-refresh-btn" onClick={fetchOrderDetails} title="Refresh Order">
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-main-content">
        <div className="admin-container">
          
          {/* Loading State */}
          {loading && (
            <div className="admin-loading-box">
              <RefreshCw size={32} className="spin" />
              <p>Loading order details...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="admin-error-box">
              <AlertCircle size={32} />
              <div>
                <h3>Failed to load order</h3>
                <p>{error}</p>
              </div>
              <button onClick={fetchOrderDetails} className="admin-retry-btn">
                Retry
              </button>
            </div>
          )}

          {/* Order Details Content */}
          {!loading && !error && order && (
            <div className="admin-order-details-grid">
              
              {/* Left Column: Order Status Controls & Purchased Items */}
              <div className="details-left-col">
                
                {/* Status Control Card */}
                <div className="admin-card status-control-card">
                  <div className="card-title-header">
                    <Clock size={20} />
                    <h3>Order Status & Progress Control</h3>
                  </div>

                  <div className="status-control-body">
                    <div className="current-status-row">
                      <span className="label">Current Status:</span>
                      <span className={`status-pill ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="status-update-form">
                      <label htmlFor="updateStatusSelect">Change Order Status:</label>
                      <div className="select-action-flex">
                        <select
                          id="updateStatusSelect"
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                          <option value="Placed">Placed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        
                        <button
                          className="btn-update-status"
                          onClick={handleUpdateStatus}
                          disabled={updating || selectedStatus === order.status}
                        >
                          <Save size={16} />
                          <span>{updating ? 'Updating...' : 'Update Status'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Purchased Items List */}
                <div className="admin-card">
                  <div className="card-title-header">
                    <Package size={20} />
                    <h3>Purchased Items ({order.items?.length || 0})</h3>
                  </div>

                  <div className="items-table-wrapper">
                    <table className="admin-medicines-table">
                      <thead>
                        <tr>
                          <th>Medicine</th>
                          <th>Price</th>
                          <th>Qty</th>
                          <th className="text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items?.map((item, idx) => (
                          <tr key={idx}>
                            <td>
                              <div className="medicine-table-item">
                                <img
                                  src={
                                    item.image ||
                                    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80'
                                  }
                                  alt={item.name}
                                  className="table-med-thumb"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80';
                                  }}
                                />
                                <div className="table-med-details">
                                  <span className="table-med-name">{item.name}</span>
                                  {item.dosageForm && (
                                    <span className="table-med-meta">{item.dosageForm}</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>₹{item.price}</td>
                            <td>{item.quantity}</td>
                            <td className="text-right">
                              <strong>₹{item.itemTotal || item.price * item.quantity}</strong>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Right Column: Customer Info, Shipping Address, Pricing Breakdown */}
              <div className="details-right-col">
                
                {/* Customer Information */}
                <div className="admin-card">
                  <div className="card-title-header">
                    <User size={20} />
                    <h3>Customer Information</h3>
                  </div>
                  <div className="info-list">
                    <div className="info-row">
                      <span className="info-label">Name:</span>
                      <span className="info-val">{order.user?.name || order.shippingAddress?.fullName}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Email:</span>
                      <span className="info-val">{order.user?.email || order.shippingAddress?.email}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Order Placed:</span>
                      <span className="info-val">
                        {new Date(order.createdAt).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="admin-card">
                  <div className="card-title-header">
                    <MapPin size={20} />
                    <h3>Shipping Address</h3>
                  </div>
                  <div className="address-box">
                    <p className="add-name">{order.shippingAddress?.fullName}</p>
                    <p>{order.shippingAddress?.addressLine1}</p>
                    {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress?.addressLine2}</p>}
                    <p>
                      {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                    </p>
                    <div className="add-contacts">
                      <span><Phone size={14} /> {order.shippingAddress?.phone}</span>
                      <span><Mail size={14} /> {order.shippingAddress?.email}</span>
                    </div>
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="admin-card pricing-summary-card">
                  <div className="card-title-header">
                    <IndianRupee size={20} />
                    <h3>Payment Summary</h3>
                  </div>
                  <div className="summary-list">
                    <div className="summary-row">
                      <span>Subtotal</span>
                      <span>₹{order.pricing?.subtotal || 0}</span>
                    </div>
                    <div className="summary-row">
                      <span>Delivery Charge</span>
                      <span className="free-delivery">FREE</span>
                    </div>
                    <div className="summary-row total-row">
                      <span>Grand Total</span>
                      <span>₹{order.pricing?.total || 0}</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
