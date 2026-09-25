import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import { 
  Package, 
  Search, 
  ArrowLeft, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Eye,
  User,
  IndianRupee,
  Filter
} from 'lucide-react';

export default function AdminOrders() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch customer orders');
      }

      setOrders(data.data || []);
    } catch (err) {
      console.error('Fetch Admin Orders Error:', err);
      setError(err.message || 'Network error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders by search & status
  const filteredOrders = orders.filter((order) => {
    const customerName = order.user?.name || order.shippingAddress?.fullName || '';
    const customerEmail = order.user?.email || order.shippingAddress?.email || '';
    const orderIdStr = order._id || '';

    const matchesSearch =
      orderIdStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
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
      {/* Header Bar */}
      <header className="admin-header">
        <div className="admin-header-container">
          <div className="admin-brand">
            <Link to="/admin" className="admin-back-btn" title="Back to Admin Dashboard">
              <ArrowLeft size={18} />
              <span>Admin Dashboard</span>
            </Link>
            <div className="admin-title-badge">
              <Package size={22} className="admin-shield-icon" />
              <h1>Order Management</h1>
            </div>
          </div>

          <div className="admin-user-info">
            <button className="admin-refresh-btn" onClick={fetchOrders} title="Refresh Orders List">
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-main-content">
        <div className="admin-container">
          
          {/* Controls Bar */}
          <div className="admin-controls-card">
            <div className="search-filter-box">
              <div className="admin-search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search orders by Order ID, Customer name, or Email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="filter-select-wrapper">
                <Filter size={16} />
                <label htmlFor="statusFilter">Status:</label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Placed">Placed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="stats-summary-pills">
              <span className="summary-pill">
                Total Orders: <strong>{orders.length}</strong>
              </span>
              <span className="summary-pill">
                Showing: <strong>{filteredOrders.length}</strong>
              </span>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="admin-loading-box">
              <RefreshCw size={32} className="spin" />
              <p>Fetching orders from MongoDB...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="admin-error-box">
              <AlertCircle size={32} />
              <div>
                <h3>Failed to load orders</h3>
                <p>{error}</p>
              </div>
              <button onClick={fetchOrders} className="admin-retry-btn">
                Retry
              </button>
            </div>
          )}

          {/* Orders Table */}
          {!loading && !error && (
            <div className="table-responsive-container">
              {filteredOrders.length === 0 ? (
                <div className="admin-empty-table">
                  <Package size={42} />
                  <h3>No Orders Found</h3>
                  <p>
                    {searchQuery || statusFilter !== 'All'
                      ? 'No orders match your filter criteria.'
                      : 'No customer orders have been placed yet.'}
                  </p>
                </div>
              ) : (
                <table className="admin-medicines-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer Details</th>
                      <th>Date & Time</th>
                      <th>Items</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order._id}>
                        <td>
                          <span className="order-id-code" title={order._id}>
                            #{order._id.substring(order._id.length - 8)}
                          </span>
                        </td>
                        <td>
                          <div className="table-med-details">
                            <span className="table-med-name">
                              {order.user?.name || order.shippingAddress?.fullName || 'Customer'}
                            </span>
                            <span className="table-med-meta">
                              {order.user?.email || order.shippingAddress?.email || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="order-date-text">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </td>
                        <td>
                          <span className="items-summary-badge">
                            {order.items?.length || 0} {order.items?.length === 1 ? 'Item' : 'Items'}
                          </span>
                        </td>
                        <td>
                          <span className="table-price">₹{order.pricing?.total || 0}</span>
                        </td>
                        <td>
                          <span className={`status-pill ${getStatusBadgeClass(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <span className="payment-badge-pending">
                            {order.paymentStatus || 'Pending'}
                          </span>
                        </td>
                        <td className="text-right">
                          <button
                            className="action-btn view-btn"
                            onClick={() => navigate(`/admin/orders/${order._id}`)}
                            title="View Full Order Details"
                          >
                            <Eye size={16} />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
