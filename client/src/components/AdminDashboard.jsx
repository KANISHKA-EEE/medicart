import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import { 
  Users, 
  Pill, 
  ShoppingBag, 
  IndianRupee, 
  ShieldCheck, 
  RefreshCw, 
  AlertCircle,
  ArrowLeft,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Package
} from 'lucide-react';

export default function AdminDashboard() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || `Failed to fetch statistics (Status: ${response.status})`);
      }

      setStats(data.data);
    } catch (err) {
      console.error('Admin Dashboard Fetch Error:', err);
      setError(err.message || 'Network error fetching dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardStats();
    }
  }, [token]);

  return (
    <div className="admin-dashboard-layout">
      {/* Top Admin Navbar / Header Bar */}
      <header className="admin-header">
        <div className="admin-header-container">
          <div className="admin-brand">
            <Link to="/" className="admin-back-btn" title="Return to Shop">
              <ArrowLeft size={18} />
              <span>Back to Store</span>
            </Link>
            <div className="admin-title-badge">
              <ShieldCheck size={22} className="admin-shield-icon" />
              <h1>MediCart Admin Dashboard</h1>
            </div>
          </div>

          <div className="admin-user-info">
            <div className="admin-user-details">
              <span className="admin-user-name">{user?.name || 'Admin'}</span>
              <span className="admin-user-role">Role: {user?.role || 'admin'}</span>
            </div>
            <Link to="/admin/medicines" className="admin-nav-btn" title="Manage Medicine Inventory">
              <Pill size={16} />
              <span>Manage Medicines</span>
            </Link>
            <Link to="/admin/orders" className="admin-nav-btn" title="Manage Customer Orders">
              <ShoppingBag size={16} />
              <span>Manage Orders</span>
            </Link>
            <button className="admin-refresh-btn" onClick={fetchDashboardStats} title="Refresh Data">
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="admin-main-content">
        <div className="admin-container">
          
          {/* Section Welcome Banner */}
          <div className="admin-welcome-card">
            <div className="welcome-flex">
              <div>
                <h2>Welcome back, {user?.name}!</h2>
                <p>System Overview & Real-Time Performance Analytics</p>
              </div>
              <div className="banner-action-buttons">
                <Link to="/admin/medicines" className="admin-manage-banner-btn">
                  <Pill size={18} />
                  <span>Manage Medicines</span>
                </Link>
                <Link to="/admin/orders" className="admin-manage-banner-btn secondary-banner-btn">
                  <ShoppingBag size={18} />
                  <span>Manage Orders</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="admin-loading-box">
              <RefreshCw size={32} className="spin" />
              <p>Fetching statistics from server...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="admin-error-box">
              <AlertCircle size={32} />
              <div>
                <h3>Failed to load dashboard data</h3>
                <p>{error}</p>
              </div>
              <button onClick={fetchDashboardStats} className="admin-retry-btn">
                Try Again
              </button>
            </div>
          )}

          {/* Data State */}
          {!loading && !error && stats && (
            <>
              {/* Primary Stat Cards Grid */}
              <div className="admin-stats-grid">
                
                {/* Total Users */}
                <div className="admin-stat-card users-card">
                  <div className="stat-icon-wrapper users">
                    <Users size={26} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Total Registered Users</span>
                    <span className="stat-value">{stats.totalUsers.toLocaleString()}</span>
                  </div>
                </div>

                {/* Total Medicines */}
                <div 
                  className="admin-stat-card medicines-card clickable-card"
                  onClick={() => navigate('/admin/medicines')}
                  title="Click to Manage Medicines"
                >
                  <div className="stat-icon-wrapper medicines">
                    <Pill size={26} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Total Medicines</span>
                    <span className="stat-value">{stats.totalMedicines.toLocaleString()}</span>
                    <span className="card-sublink">Manage Catalog →</span>
                  </div>
                </div>

                {/* Total Orders */}
                <div 
                  className="admin-stat-card orders-card clickable-card"
                  onClick={() => navigate('/admin/orders')}
                  title="Click to Manage Orders"
                >
                  <div className="stat-icon-wrapper orders">
                    <ShoppingBag size={26} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Total Orders</span>
                    <span className="stat-value">{stats.totalOrders.toLocaleString()}</span>
                    <span className="card-sublink">View Orders →</span>
                  </div>
                </div>

                {/* Total Revenue */}
                <div className="admin-stat-card revenue-card">
                  <div className="stat-icon-wrapper revenue">
                    <IndianRupee size={26} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Total Revenue</span>
                    <span className="stat-value">₹{stats.totalRevenue.toLocaleString()}</span>
                  </div>
                </div>

              </div>

              {/* Order Status Section */}
              <div className="admin-status-section">
                <div className="status-section-header">
                  <Package size={20} />
                  <h3>Order Status Breakdown</h3>
                </div>

                <div className="status-cards-grid">
                  
                  {/* Placed */}
                  <div className="status-card placed">
                    <div className="status-card-header">
                      <Clock size={18} />
                      <span>Placed</span>
                    </div>
                    <span className="status-count">{stats.ordersByStatus?.Placed || 0}</span>
                  </div>

                  {/* Processing */}
                  <div className="status-card processing">
                    <div className="status-card-header">
                      <RefreshCw size={18} />
                      <span>Processing</span>
                    </div>
                    <span className="status-count">{stats.ordersByStatus?.Processing || 0}</span>
                  </div>

                  {/* Shipped */}
                  <div className="status-card shipped">
                    <div className="status-card-header">
                      <Truck size={18} />
                      <span>Shipped</span>
                    </div>
                    <span className="status-count">{stats.ordersByStatus?.Shipped || 0}</span>
                  </div>

                  {/* Delivered */}
                  <div className="status-card delivered">
                    <div className="status-card-header">
                      <CheckCircle2 size={18} />
                      <span>Delivered</span>
                    </div>
                    <span className="status-count">{stats.ordersByStatus?.Delivered || 0}</span>
                  </div>

                  {/* Cancelled */}
                  <div className="status-card cancelled">
                    <div className="status-card-header">
                      <XCircle size={18} />
                      <span>Cancelled</span>
                    </div>
                    <span className="status-count">{stats.ordersByStatus?.Cancelled || 0}</span>
                  </div>

                </div>
              </div>

              {/* Recent Orders Overview */}
              {stats.recentOrders && stats.recentOrders.length > 0 && (
                <div className="admin-recent-orders-section" style={{ marginTop: '2rem' }}>
                  <div className="status-section-header" style={{ justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <ShoppingBag size={20} />
                      <h3>Recent Customer Orders</h3>
                    </div>
                    <Link to="/admin/orders" className="view-all-link">
                      View All Orders ({stats.totalOrders}) →
                    </Link>
                  </div>

                  <div className="table-responsive-container">
                    <table className="admin-medicines-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Total Amount</th>
                          <th>Status</th>
                          <th className="text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentOrders.map((ord) => (
                          <tr key={ord._id}>
                            <td>
                              <span className="order-id-code">
                                #{ord._id.substring(ord._id.length - 8)}
                              </span>
                            </td>
                            <td>
                              <span className="table-med-name">
                                {ord.user?.name || ord.shippingAddress?.fullName || 'Customer'}
                              </span>
                            </td>
                            <td>
                              <span className="table-price">₹{ord.pricing?.total || 0}</span>
                            </td>
                            <td>
                              <span className={`status-pill ${ord.status?.toLowerCase() || 'placed'}`}>
                                {ord.status || 'Placed'}
                              </span>
                            </td>
                            <td className="text-right">
                              <button
                                className="action-btn view-btn"
                                onClick={() => navigate(`/admin/orders/${ord._id}`)}
                              >
                                View Order
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </main>
    </div>
  );
}
