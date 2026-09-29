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
  Save,
  FileText,
  FileCheck,
  Eye,
  Check,
  X,
  XCircle,
  MessageSquare
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

  // Prescription Review State
  const [isReviewingRx, setIsReviewingRx] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Prescription File View Modal State
  const [previewModalFile, setPreviewModalFile] = useState(null);
  const [rerunningOcr, setRerunningOcr] = useState(false);
  const [inlineRxFile, setInlineRxFile] = useState(null);
  const [loadingInlineRx, setLoadingInlineRx] = useState(false);

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

      // Auto-load inline prescription document for side-by-side review
      if (data.data.prescriptionFile?.filename && token) {
        loadInlinePrescription(data.data.prescriptionFile.filename);
      }
    } catch (err) {
      console.error('Fetch Admin Order Details Error:', err);
      setError(err.message || 'Network error fetching order details');
    } finally {
      setLoading(false);
    }
  };

  const loadInlinePrescription = async (filename) => {
    if (!filename || !token) return;
    setLoadingInlineRx(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/prescription-file/${filename}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const fileUrl = URL.createObjectURL(blob);
        const isPdf = filename.toLowerCase().endsWith('.pdf') || blob.type === 'application/pdf';
        setInlineRxFile({ url: fileUrl, filename, isPdf });
      }
    } catch (err) {
      console.error('Inline RX loading error:', err);
    } finally {
      setLoadingInlineRx(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const handleRerunOcr = async () => {
    if (!id || !token) return;
    setRerunningOcr(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/orders/${id}/re-run-ocr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to re-run OCR');
      }

      setOrder(data.data);
      showToast('OCR re-run successfully completed!');
    } catch (err) {
      console.error('Re-run OCR Error:', err);
      showToast(`Error: ${err.message}`);
    } finally {
      setRerunningOcr(false);
    }
  };

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

  const handlePrescriptionReview = async (action, reason = '') => {
    setIsReviewingRx(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/orders/${id}/prescription-review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action, reason })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to process prescription review');
      }

      setOrder(data.data);
      setShowRejectModal(false);
      setRejectionReasonInput('');
      showToast(`Prescription status updated to '${action === 'approve' ? 'Approved' : 'Rejected'}'!`);
    } catch (err) {
      console.error('Prescription Review Error:', err);
      showToast(`Error: ${err.message}`);
    } finally {
      setIsReviewingRx(false);
    }
  };

  const handleViewPrescription = async (filename) => {
    if (!filename || !token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/prescription-file/${filename}`, {
        headers: {
          Authorization: `Bearer ${token}`
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
              <h1>Order #{id ? id.substring(id.length - 8) : ''} Review</h1>
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
              
              {/* Left Column: Prescription Review, Order Status Controls & Purchased Items */}
              <div className="details-left-col">
                
                {/* Admin Prescription Verification & Review Card (Side-by-Side View) */}
                {order.prescriptionRequired && (
                  <div className="admin-card prescription-review-card">
                    <div className="card-title-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileCheck size={20} color="#087ea4" />
                        <h3>Prescription Verification & Authorized Review</h3>
                      </div>
                      <span className={`status-pill rx-pill-${(order.prescriptionStatus || 'Pending Review').toLowerCase().replace(/\s+/g, '-')}`}>
                        {order.prescriptionStatus === 'Pending Review' ? 'Pending Review' : order.prescriptionStatus}
                      </span>
                    </div>

                    <div className="prescription-review-body">
                      {/* Safety Disclaimer Banner */}
                      <div className="ocr-safety-banner">
                        <ShieldCheck size={18} color="#0284c7" style={{ flexShrink: 0 }} />
                        <span>OCR is for information extraction only. Final prescription verification requires authorized review.</span>
                      </div>

                      {/* Side-by-Side Review Section */}
                      <div className="ocr-side-by-side-container">
                        {/* LEFT SIDE: Original Uploaded Prescription */}
                        <div className="ocr-side-panel ocr-left-panel">
                          <div className="panel-header">
                            <FileText size={16} color="#087ea4" />
                            <h4>Original Uploaded Prescription</h4>
                          </div>

                          <div className="panel-content rx-preview-box">
                            {loadingInlineRx ? (
                              <div className="rx-loading-inline">
                                <RefreshCw size={24} className="spin" color="#087ea4" />
                                <span>Loading prescription document...</span>
                              </div>
                            ) : inlineRxFile ? (
                              inlineRxFile.isPdf ? (
                                <iframe src={inlineRxFile.url} title="Original Prescription PDF" className="rx-inline-iframe" />
                              ) : (
                                <img src={inlineRxFile.url} alt="Original Prescription" className="rx-inline-img" />
                              )
                            ) : order.prescriptionFile?.filename ? (
                              <div className="rx-placeholder-box">
                                <FileText size={36} color="#087ea4" />
                                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.5rem 0' }}>
                                  {order.prescriptionFile.originalName || order.prescriptionFile.filename}
                                </p>
                                <button
                                  className="btn-secondary"
                                  onClick={() => handleViewPrescription(order.prescriptionFile.filename)}
                                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                                >
                                  <Eye size={14} /> View Document
                                </button>
                              </div>
                            ) : (
                              <div className="rx-placeholder-box">
                                <AlertCircle size={32} color="#94a3b8" />
                                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No prescription file attached</p>
                              </div>
                            )}

                            {order.prescriptionFile?.filename && (
                              <div className="rx-file-meta-bar">
                                <span>Filename: {order.prescriptionFile.originalName || order.prescriptionFile.filename}</span>
                                <button
                                  className="btn-link-action"
                                  onClick={() => handleViewPrescription(order.prescriptionFile.filename)}
                                >
                                  <Eye size={14} /> Full Screen
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* RIGHT SIDE: OCR Extracted Information */}
                        <div className="ocr-side-panel ocr-right-panel">
                          <div className="panel-header" style={{ justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <CheckCircle2 size={16} color="#14b8a6" />
                              <h4>Prescription Information Extracted</h4>
                            </div>

                            <button
                              className="btn-rerun-ocr"
                              onClick={handleRerunOcr}
                              disabled={rerunningOcr}
                              title="Re-run OCR text extraction on uploaded file"
                            >
                              <RefreshCw size={13} className={rerunningOcr ? 'spin' : ''} />
                              <span>{rerunningOcr ? 'Extracting...' : 'Re-run OCR'}</span>
                            </button>
                          </div>

                          <div className="panel-content ocr-fields-box">
                            {/* Confidence Level */}
                            <div className="ocr-confidence-row">
                              <span className="confidence-label">OCR Confidence:</span>
                              <span className={`confidence-val ${order.prescriptionOcr?.confidence ? 'conf-has-val' : 'conf-none'}`}>
                                {order.prescriptionOcr?.confidence !== undefined && order.prescriptionOcr?.confidence !== null
                                  ? `${order.prescriptionOcr.confidence}%`
                                  : 'Not available'}
                              </span>
                            </div>

                            {/* Extracted Header Metadata Fields */}
                            <div className="ocr-meta-grid">
                              <div className="ocr-field-item">
                                <span className="field-lbl">Hospital / Clinic</span>
                                <span className={`field-val ${order.prescriptionOcr?.hospitalName && order.prescriptionOcr?.hospitalName !== 'Not detected' ? 'val-detected' : 'val-empty'}`}>
                                  {order.prescriptionOcr?.hospitalName || 'Not detected'}
                                </span>
                              </div>

                              <div className="ocr-field-item">
                                <span className="field-lbl">Doctor</span>
                                <span className={`field-val ${order.prescriptionOcr?.doctorName && order.prescriptionOcr?.doctorName !== 'Not detected' ? 'val-detected' : 'val-empty'}`}>
                                  {order.prescriptionOcr?.doctorName || 'Not detected'}
                                </span>
                              </div>

                              <div className="ocr-field-item">
                                <span className="field-lbl">Doctor Registration Number</span>
                                <span className={`field-val ${order.prescriptionOcr?.doctorRegistrationNumber && order.prescriptionOcr?.doctorRegistrationNumber !== 'Not detected' ? 'val-detected' : 'val-empty'}`}>
                                  {order.prescriptionOcr?.doctorRegistrationNumber || 'Not detected'}
                                </span>
                              </div>

                              <div className="ocr-field-item">
                                <span className="field-lbl">Patient</span>
                                <span className={`field-val ${order.prescriptionOcr?.patientName && order.prescriptionOcr?.patientName !== 'Not detected' ? 'val-detected' : 'val-empty'}`}>
                                  {order.prescriptionOcr?.patientName || 'Not detected'}
                                </span>
                              </div>

                              <div className="ocr-field-item">
                                <span className="field-lbl">Prescription Date</span>
                                <span className={`field-val ${order.prescriptionOcr?.prescriptionDate && order.prescriptionOcr?.prescriptionDate !== 'Not detected' ? 'val-detected' : 'val-empty'}`}>
                                  {order.prescriptionOcr?.prescriptionDate || 'Not detected'}
                                </span>
                              </div>
                            </div>

                            {/* Extracted Medicines Table */}
                            <div className="ocr-medicines-section">
                              <h5 className="ocr-subtitle">Medicines</h5>
                              <table className="ocr-medicines-table">
                                <thead>
                                  <tr>
                                    <th>Medicine</th>
                                    <th>Strength</th>
                                    <th>Dosage</th>
                                    <th>Quantity</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {order.prescriptionOcr?.medicines && order.prescriptionOcr.medicines.length > 0 ? (
                                    order.prescriptionOcr.medicines.map((med, idx) => (
                                      <tr key={idx}>
                                        <td><strong>{med.name || 'Not detected'}</strong></td>
                                        <td>{med.strength || 'Not detected'}</td>
                                        <td>{med.dosage || 'Not detected'}</td>
                                        <td>{med.quantity || 'Not detected'}</td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td>Not detected</td>
                                      <td>Not detected</td>
                                      <td>Not detected</td>
                                      <td>Not detected</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>

                            {/* Raw OCR Text View (Expandable/Scrollable) */}
                            {order.prescriptionOcr?.rawText && (
                              <details className="ocr-raw-details">
                                <summary>View Readable Text</summary>
                                <pre className="ocr-raw-text">{order.prescriptionOcr.rawText}</pre>
                              </details>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Mandatory Safety & Verification Disclaimer Alert */}
                      <div className="demo-disclaimer-box" style={{ marginTop: '1.25rem', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '0.85rem 1rem', borderRadius: '8px', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                        <ShieldCheck size={18} color="#087ea4" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ fontSize: '0.82rem', color: '#0369a1', lineHeight: '1.5' }}>
                          <strong>Automated Technical Verification Notice:</strong> Automated checks only assess whether the uploaded document appears to be a prescription. They do not establish authenticity or medical/legal validity. Final approval requires authorized human review.
                        </span>
                      </div>

                      {/* Admin Decision Action Buttons */}
                      <div className="rx-admin-actions-bar" style={{ marginTop: '1.25rem' }}>
                        <button
                          className="btn-approve-rx"
                          onClick={() => handlePrescriptionReview('approve')}
                          disabled={isReviewingRx || order.prescriptionStatus === 'Approved'}
                        >
                          <Check size={18} />
                          <span>Approve Prescription</span>
                        </button>

                        <button
                          className="btn-reject-rx"
                          onClick={() => {
                            setRejectionReasonInput('Prescription is unclear. Please upload a clearer copy.');
                            setShowRejectModal(true);
                          }}
                          disabled={isReviewingRx || order.prescriptionStatus === 'Rejected'}
                        >
                          <X size={18} />
                          <span>Reject Prescription</span>
                        </button>
                      </div>

                      {/* Rejection Reason Display if Rejected */}
                      {order.prescriptionStatus === 'Rejected' && order.prescriptionRejectionReason && (
                        <div className="rx-rejection-reason-alert">
                          <XCircle size={18} color="#b91c1c" style={{ flexShrink: 0 }} />
                          <div>
                            <strong>Current Rejection Reason:</strong> {order.prescriptionRejectionReason}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

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
                                  <span className="table-med-name">
                                    {item.name}
                                    {item.prescriptionRequired && (
                                      <span className="rx-item-tag" style={{ marginLeft: '0.4rem' }}>
                                        Rx Required
                                      </span>
                                    )}
                                  </span>
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

      {/* Admin Rejection Reason Modal */}
      {showRejectModal && (
        <div className="admin-modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="admin-modal-container delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ background: '#b91c1c' }}>
              <div className="modal-title-box">
                <MessageSquare size={20} />
                <h2>Reject Prescription</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setShowRejectModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>
                Please specify the reason for rejecting this prescription. The reason will be displayed to the customer.
              </p>

              <div className="form-group">
                <label htmlFor="rejectionReason">Rejection Reason *</label>
                <textarea
                  id="rejectionReason"
                  rows={3}
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="e.g. Prescription is unclear. Please upload a clearer copy."
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div className="delete-modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowRejectModal(false)}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn-delete-confirm" 
                  onClick={() => handlePrescriptionReview('reject', rejectionReasonInput)}
                  disabled={isReviewingRx || !rejectionReasonInput.trim()}
                >
                  {isReviewingRx ? 'Rejecting...' : 'Reject Prescription'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Secure Prescription Document File Modal */}
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
