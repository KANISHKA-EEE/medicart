import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminMedicineForm from './AdminMedicineForm';
import { API_BASE_URL } from '../config/api';
import { 
  Pill, 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowLeft, 
  RefreshCw, 
  AlertCircle, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  FileText,
  Package,
  IndianRupee,
  AlertTriangle,
  X
} from 'lucide-react';

export default function AdminMedicines() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  // Data states
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Form Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Delete Modal state
  const [deletingMedicine, setDeletingMedicine] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Notification Toast state
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  // Fetch medicines list from backend REST API
  const fetchMedicines = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/medicines`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load medicines list');
      }

      setMedicines(data.data || []);
    } catch (err) {
      console.error('Fetch Medicines Error:', err);
      setError(err.message || 'Network error fetching medicines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // Handle Add Medicine submit
  const handleCreateMedicine = async (formData) => {
    setFormSubmitting(true);
    setFormError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/medicines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create medicine');
      }

      showToast(`Medicine "${data.data.name}" added successfully!`);
      setIsFormOpen(false);
      setEditingMedicine(null);
      fetchMedicines();
    } catch (err) {
      console.error('Create Medicine Error:', err);
      setFormError(err.message || 'Failed to create medicine');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Edit Medicine submit
  const handleUpdateMedicine = async (formData) => {
    if (!editingMedicine || !editingMedicine._id) return;
    setFormSubmitting(true);
    setFormError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/medicines/${editingMedicine._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update medicine');
      }

      showToast(`Medicine "${data.data.name}" updated successfully!`);
      setIsFormOpen(false);
      setEditingMedicine(null);
      fetchMedicines();
    } catch (err) {
      console.error('Update Medicine Error:', err);
      setFormError(err.message || 'Failed to update medicine');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Delete Medicine confirm
  const handleConfirmDelete = async () => {
    if (!deletingMedicine || !deletingMedicine._id) return;
    setDeleteSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/medicines/${deletingMedicine._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete medicine');
      }

      showToast(`Medicine "${deletingMedicine.name}" deleted successfully!`);
      setDeletingMedicine(null);
      fetchMedicines();
    } catch (err) {
      console.error('Delete Medicine Error:', err);
      showToast(`Error: ${err.message}`);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Filtered medicines
  const filteredMedicines = medicines.filter((med) => {
    const matchesSearch =
      (med.name && med.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (med.category && med.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (med.manufacturer && med.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = filterCategory === 'All' || med.category === filterCategory;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="admin-dashboard-layout">
      {/* Toast Notification */}
      {toast && (
        <div className="toast-notification">
          <CheckCircle2 size={18} className="toast-icon" />
          <span>{toast}</span>
        </div>
      )}

      {/* Admin Navbar */}
      <header className="admin-header">
        <div className="admin-header-container">
          <div className="admin-brand">
            <Link to="/admin" className="admin-back-btn" title="Back to Dashboard">
              <ArrowLeft size={18} />
              <span>Admin Dashboard</span>
            </Link>
            <div className="admin-title-badge">
              <Pill size={22} className="admin-shield-icon" />
              <h1>Medicine Management</h1>
            </div>
          </div>

          <div className="admin-user-info">
            <button
              className="admin-refresh-btn"
              onClick={() => {
                setIsFormOpen(true);
                setEditingMedicine(null);
                setFormError(null);
              }}
            >
              <Plus size={18} />
              <span>Add New Medicine</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-main-content">
        <div className="admin-container">
          
          {/* Header Controls Bar */}
          <div className="admin-controls-card">
            <div className="search-filter-box">
              <div className="admin-search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search medicines by name, category, manufacturer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="filter-select-wrapper">
                <label htmlFor="filterCategory">Category:</label>
                <select
                  id="filterCategory"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  <option value="Pain Relief">Pain Relief</option>
                  <option value="Cold & Flu">Cold & Flu</option>
                  <option value="Vitamins">Vitamins</option>
                  <option value="Diabetes">Diabetes</option>
                  <option value="Heart Care">Heart Care</option>
                  <option value="First Aid">First Aid</option>
                  <option value="Personal Care">Personal Care</option>
                  <option value="Skin Care">Skin Care</option>
                  <option value="General Health">General Health</option>
                </select>
              </div>
            </div>

            <div className="stats-summary-pills">
              <span className="summary-pill">
                Total: <strong>{medicines.length}</strong> medicines
              </span>
              <span className="summary-pill">
                Showing: <strong>{filteredMedicines.length}</strong>
              </span>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="admin-loading-box">
              <RefreshCw size={32} className="spin" />
              <p>Loading medicine catalog from database...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="admin-error-box">
              <AlertCircle size={32} />
              <div>
                <h3>Error Loading Catalog</h3>
                <p>{error}</p>
              </div>
              <button onClick={fetchMedicines} className="admin-retry-btn">
                Retry
              </button>
            </div>
          )}

          {/* Medicines Table */}
          {!loading && !error && (
            <div className="table-responsive-container">
              {filteredMedicines.length === 0 ? (
                <div className="admin-empty-table">
                  <Package size={42} />
                  <h3>No Medicines Found</h3>
                  <p>
                    {searchQuery || filterCategory !== 'All'
                      ? 'No medicines match your search criteria.'
                      : 'Your inventory is empty. Click "+ Add New Medicine" to create one.'}
                  </p>
                </div>
              ) : (
                <table className="admin-medicines-table">
                  <thead>
                    <tr>
                      <th>Medicine Info</th>
                      <th>Category</th>
                      <th>Price & MRP</th>
                      <th>Stock</th>
                      <th>Rx Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMedicines.map((med) => (
                      <tr key={med._id}>
                        <td>
                          <div className="medicine-table-item">
                            <img
                              src={
                                med.image ||
                                'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80'
                              }
                              alt={med.name}
                              className="table-med-thumb"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80';
                              }}
                            />
                            <div className="table-med-details">
                              <span className="table-med-name">{med.name}</span>
                              <span className="table-med-meta">
                                {med.dosageForm && `${med.dosageForm} • `}
                                {med.packSize || 'Standard Pack'}
                                {med.manufacturer && ` • By ${med.manufacturer}`}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="category-badge">{med.category}</span>
                        </td>
                        <td>
                          <div className="table-price-box">
                            <span className="table-price">₹{med.price}</span>
                            {med.mrp > med.price && (
                              <span className="table-mrp">₹{med.mrp}</span>
                            )}
                            {med.discount > 0 && (
                              <span className="table-discount-badge">{med.discount}% OFF</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`stock-badge ${
                              med.stock > 10
                                ? 'in-stock'
                                : med.stock > 0
                                ? 'low-stock'
                                : 'out-of-stock'
                            }`}
                          >
                            {med.stock > 0 ? `${med.stock} in stock` : 'Out of Stock'}
                          </span>
                        </td>
                        <td>
                          {med.prescriptionRequired ? (
                            <span className="rx-badge rx-required" title="Prescription Required">
                              Rx Required
                            </span>
                          ) : (
                            <span className="rx-badge rx-optional" title="OTC Medicine">
                              OTC
                            </span>
                          )}
                        </td>
                        <td className="text-right">
                          <div className="table-actions">
                            <button
                              className="action-btn edit-btn"
                              title="Edit Medicine"
                              onClick={() => {
                                setEditingMedicine(med);
                                setFormError(null);
                                setIsFormOpen(true);
                              }}
                            >
                              <Edit3 size={16} />
                              <span>Edit</span>
                            </button>
                            <button
                              className="action-btn delete-btn"
                              title="Delete Medicine"
                              onClick={() => setDeletingMedicine(med)}
                            >
                              <Trash2 size={16} />
                              <span>Delete</span>
                            </button>
                          </div>
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

      {/* Form Modal (Add / Edit) */}
      {isFormOpen && (
        <AdminMedicineForm
          initialData={editingMedicine}
          onSubmit={editingMedicine ? handleUpdateMedicine : handleCreateMedicine}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingMedicine(null);
            setFormError(null);
          }}
          isSubmitting={formSubmitting}
          serverError={formError}
        />
      )}

      {/* Delete Confirmation Dialog Modal */}
      {deletingMedicine && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container delete-confirm-modal">
            <div className="delete-modal-content">
              <div className="delete-warning-icon">
                <AlertTriangle size={32} />
              </div>
              <h3>Delete Medicine?</h3>
              <p>
                Are you sure you want to delete <strong>"{deletingMedicine.name}"</strong>?
                This action cannot be undone.
              </p>

              <div className="delete-modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setDeletingMedicine(null)}
                  disabled={deleteSubmitting}
                >
                  Cancel
                </button>
                <button
                  className="btn-delete-confirm"
                  onClick={handleConfirmDelete}
                  disabled={deleteSubmitting}
                >
                  {deleteSubmitting ? 'Deleting...' : 'Yes, Delete Medicine'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
