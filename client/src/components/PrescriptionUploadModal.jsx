import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Eye, Trash2, FileCheck, ShieldAlert, Lock } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function PrescriptionUploadModal({ isOpen, onClose, targetMedicine, onUploadSuccess, onShowToast }) {
  const { token } = useAuth();
  const { setPrescriptionFile } = useCart();

  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const validateAndSetFile = (file) => {
    setErrorMsg('');
    if (!file) return;

    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();

    // File Format Check
    if (!allowedMimeTypes.includes(file.type) && !allowedExtensions.includes(ext)) {
      setErrorMsg('Invalid file format. Please upload a JPG, JPEG, PNG, or PDF file.');
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }

    // File Size Check (5 MB = 5 * 1024 * 1024 bytes)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMsg('File size exceeds the 5 MB limit. Please upload a smaller file.');
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }

    setSelectedFile(file);

    // Generate Preview if Image
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setErrorMsg('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setErrorMsg('Please select a prescription file to upload.');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('prescription', selectedFile);

      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/orders/upload-prescription`, {
        method: 'POST',
        headers,
        body: formData
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // REJECTED FILE BY SERVER VALIDATOR
        const errorText = data.message || '❌ This file does not appear to be a medical prescription. Please upload a valid prescription issued by a qualified doctor.';
        setErrorMsg(errorText);
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      // PASSED TECHNICAL VALIDATION -> Status: Pending Review
      const uploadedData = {
        originalName: data.data.originalName || selectedFile.name,
        filename: data.data.filename,
        mimetype: data.data.mimetype || selectedFile.type,
        size: data.data.size || selectedFile.size,
        uploadedAt: data.data.uploadedAt || new Date().toISOString(),
        previewUrl: filePreview,
        ocr: data.data.ocr,
        validation: data.data.validation,
        prescriptionStatus: 'Pending Review'
      };

      setPrescriptionFile(uploadedData);

      if (onShowToast) {
        onShowToast('✓ Prescription document detected. Status: Pending Review');
      }

      if (onUploadSuccess) {
        onUploadSuccess(uploadedData);
      }

      onClose();

    } catch (err) {
      console.error('Prescription Upload Error:', err);
      setErrorMsg('❌ Failed to upload prescription. Please ensure the backend server is online and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="cart-modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="cart-modal-drawer prescription-upload-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '560px', height: 'auto', maxHeight: '92vh', borderRadius: '16px', overflowY: 'auto', margin: 'auto' }}
      >
        {/* Header */}
        <div className="cart-drawer-header" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <div className="cart-drawer-title" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="logo-icon-box" style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#087ea4', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileCheck size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#1f2937' }}>Upload Prescription</h2>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Hospital & Verified Doctor Prescription</span>
            </div>
          </div>
          <button className="cart-close-btn" onClick={onClose} aria-label="Close upload modal">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Target Medicine Alert */}
          {targetMedicine && (
            <div className="rx-target-medicine-banner">
              <ShieldAlert size={18} className="rx-alert-icon" />
              <div>
                <strong>Prescription Required for:</strong>
                <span className="rx-medicine-name"> {targetMedicine.name}</span>
              </div>
            </div>
          )}

          {/* Description */}
          <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155', lineHeight: '1.55' }}>
              Please upload a clear image or PDF of your prescription. Our authorized pharmacy team will review it before dispensing prescription medicines.
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="auth-error-alert" style={{ margin: 0 }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Upload Drop Zone */}
          {!selectedFile ? (
            <div 
              className={`prescription-dropzone ${isDragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".jpg,.jpeg,.png,.pdf" 
                style={{ display: 'none' }}
              />
              <div className="dropzone-icon-box">
                <UploadCloud size={36} color="#087ea4" />
              </div>
              <h4 style={{ margin: '0.5rem 0 0.25rem', fontSize: '1.05rem', fontWeight: 700, color: '#1f2937' }}>
                Drag and drop prescription file here
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1rem' }}>
                Supports JPG, JPEG, PNG, or PDF (Max file size: 5 MB)
              </p>
              <button type="button" className="btn-secondary" style={{ pointerEvents: 'none', padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>
                Choose File
              </button>
            </div>
          ) : (
            /* Uploaded Preview Card */
            <div className="prescription-preview-card">
              <div className="preview-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <FileText size={20} color="#087ea4" />
                  <div>
                    <h5 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#1f2937' }}>
                      {selectedFile.name}
                    </h5>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'Document'}
                    </span>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={handleRemoveFile} 
                  className="btn-remove-file"
                  title="Remove file"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Image Preview */}
              {filePreview ? (
                <div className="image-preview-container">
                  <img src={filePreview} alt="Prescription preview" className="prescription-image-thumbnail" />
                </div>
              ) : (
                <div className="pdf-preview-box">
                  <FileText size={32} color="#087ea4" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginTop: '0.4rem' }}>
                    PDF Prescription Document
                  </span>
                </div>
              )}

              {/* Technical Verification Pill */}
              <div className="verification-status-banner">
                <CheckCircle2 size={16} color="#16a34a" />
                <div>
                  <strong>Technical Validation:</strong> Prescription document detected.
                  <span className="pending-verification-tag"> Status: Pending Review</span>
                </div>
              </div>
            </div>
          )}

          {/* Pharmacist Review Notice */}
          <div className="demo-disclaimer-box">
            <Lock size={14} style={{ color: '#0369a1', flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '0.78rem', color: '#0369a1', lineHeight: '1.4' }}>
              <strong>Pharmacist Review Notice:</strong> Automated checks only assess whether the uploaded document appears to be a prescription. Final approval requires authorized human review by the pharmacist/admin.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="modal-actions-row">
            <button type="button" className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </button>

            <button 
              type="button" 
              className="btn-primary" 
              onClick={handleUploadSubmit} 
              disabled={!selectedFile || isUploading}
              style={{ flex: 1.5, justifyContent: 'center' }}
            >
              {isUploading ? (
                <span>Uploading...</span>
              ) : (
                <>
                  <UploadCloud size={16} />
                  <span>Upload Prescription</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
