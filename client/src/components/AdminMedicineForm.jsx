import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Pill } from 'lucide-react';

export default function AdminMedicineForm({ initialData, onSubmit, onCancel, isSubmitting, serverError }) {
  const isEdit = !!initialData && !!initialData._id;

  const [formData, setFormData] = useState({
    name: '',
    category: 'Pain Relief',
    description: '',
    price: '',
    mrp: '',
    discount: 0,
    stock: 0,
    rating: 4.5,
    image: '',
    manufacturer: '',
    dosageForm: 'Tablet',
    packSize: '10 Tablets',
    prescriptionRequired: false
  });

  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        category: initialData.category || 'Pain Relief',
        description: initialData.description || '',
        price: initialData.price !== undefined ? initialData.price : '',
        mrp: initialData.mrp !== undefined ? initialData.mrp : '',
        discount: initialData.discount !== undefined ? initialData.discount : 0,
        stock: initialData.stock !== undefined ? initialData.stock : 0,
        rating: initialData.rating !== undefined ? initialData.rating : 4.5,
        image: initialData.image || '',
        manufacturer: initialData.manufacturer || '',
        dosageForm: initialData.dosageForm || '',
        packSize: initialData.packSize || '',
        prescriptionRequired: !!initialData.prescriptionRequired
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError(null);

    // Validation
    const nameTrimmed = formData.name.trim();
    if (!nameTrimmed) {
      setValidationError('Medicine Name is required.');
      return;
    }

    const categoryTrimmed = formData.category.trim();
    if (!categoryTrimmed) {
      setValidationError('Category is required.');
      return;
    }

    const numPrice = Number(formData.price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setValidationError('Price must be a number greater than 0.');
      return;
    }

    const numMrp = Number(formData.mrp);
    if (isNaN(numMrp) || numMrp <= 0) {
      setValidationError('MRP must be a number greater than 0.');
      return;
    }

    if (numMrp < numPrice) {
      setValidationError('MRP should be greater than or equal to Price.');
      return;
    }

    const numStock = Number(formData.stock);
    if (isNaN(numStock) || numStock < 0) {
      setValidationError('Stock must be 0 or greater.');
      return;
    }

    const numRating = Number(formData.rating);
    if (isNaN(numRating) || numRating < 0 || numRating > 5) {
      setValidationError('Rating must be between 0 and 5.');
      return;
    }

    const numDiscount = Number(formData.discount);
    if (isNaN(numDiscount) || numDiscount < 0 || numDiscount > 100) {
      setValidationError('Discount must be between 0% and 100%.');
      return;
    }

    // Pass parsed numbers back
    onSubmit({
      ...formData,
      name: nameTrimmed,
      category: categoryTrimmed,
      description: formData.description.trim(),
      price: numPrice,
      mrp: numMrp,
      discount: numDiscount,
      stock: numStock,
      rating: numRating,
      image: formData.image.trim(),
      manufacturer: formData.manufacturer.trim(),
      dosageForm: formData.dosageForm.trim(),
      packSize: formData.packSize.trim(),
      prescriptionRequired: formData.prescriptionRequired
    });
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-container medicine-form-modal">
        <div className="admin-modal-header">
          <div className="modal-title-box">
            <Pill size={22} className="modal-icon" />
            <h2>{isEdit ? 'Edit Medicine' : 'Add New Medicine'}</h2>
          </div>
          <button className="modal-close-btn" onClick={onCancel} title="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-medicine-form">
          {(validationError || serverError) && (
            <div className="form-error-banner">
              <AlertCircle size={18} />
              <span>{validationError || serverError}</span>
            </div>
          )}

          <div className="form-grid">
            {/* Medicine Name */}
            <div className="form-group full-width">
              <label htmlFor="name">Medicine Name <span className="required">*</span></label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="e.g. Paracetamol 500mg Extra"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label htmlFor="category">Category <span className="required">*</span></label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
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

            {/* Manufacturer */}
            <div className="form-group">
              <label htmlFor="manufacturer">Manufacturer / Brand</label>
              <input
                type="text"
                id="manufacturer"
                name="manufacturer"
                placeholder="e.g. Sun Pharma / Cipla"
                value={formData.manufacturer}
                onChange={handleChange}
              />
            </div>

            {/* Price */}
            <div className="form-group">
              <label htmlFor="price">Selling Price (₹) <span className="required">*</span></label>
              <input
                type="number"
                id="price"
                name="price"
                placeholder="e.g. 45"
                min="1"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            {/* MRP */}
            <div className="form-group">
              <label htmlFor="mrp">MRP (₹) <span className="required">*</span></label>
              <input
                type="number"
                id="mrp"
                name="mrp"
                placeholder="e.g. 60"
                min="1"
                step="0.01"
                value={formData.mrp}
                onChange={handleChange}
                required
              />
            </div>

            {/* Discount (%) */}
            <div className="form-group">
              <label htmlFor="discount">Discount (%)</label>
              <input
                type="number"
                id="discount"
                name="discount"
                placeholder="e.g. 15"
                min="0"
                max="100"
                value={formData.discount}
                onChange={handleChange}
              />
            </div>

            {/* Stock Quantity */}
            <div className="form-group">
              <label htmlFor="stock">Available Stock Quantity <span className="required">*</span></label>
              <input
                type="number"
                id="stock"
                name="stock"
                placeholder="e.g. 100"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                required
              />
            </div>

            {/* Dosage Form */}
            <div className="form-group">
              <label htmlFor="dosageForm">Dosage Form</label>
              <input
                type="text"
                id="dosageForm"
                name="dosageForm"
                placeholder="e.g. Tablet, Syrup, Injection"
                value={formData.dosageForm}
                onChange={handleChange}
              />
            </div>

            {/* Pack Size */}
            <div className="form-group">
              <label htmlFor="packSize">Pack Size</label>
              <input
                type="text"
                id="packSize"
                name="packSize"
                placeholder="e.g. Strip of 10 Tablets, 100ml Bottle"
                value={formData.packSize}
                onChange={handleChange}
              />
            </div>

            {/* Rating */}
            <div className="form-group">
              <label htmlFor="rating">Rating (0 - 5)</label>
              <input
                type="number"
                id="rating"
                name="rating"
                placeholder="4.5"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={handleChange}
              />
            </div>

            {/* Image URL */}
            <div className="form-group full-width">
              <label htmlFor="image">Image URL</label>
              <input
                type="text"
                id="image"
                name="image"
                placeholder="https://images.unsplash.com/..."
                value={formData.image}
                onChange={handleChange}
              />
            </div>

            {/* Description */}
            <div className="form-group full-width">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows="3"
                placeholder="Enter medicine composition, uses, and instructions..."
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* Prescription Required Checkbox */}
            <div className="form-group full-width checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="prescriptionRequired"
                  checked={formData.prescriptionRequired}
                  onChange={handleChange}
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-text">
                  <strong>Prescription Required (Rx)</strong>
                  <small>Check if doctor's prescription is mandated for purchasing this medicine</small>
                </span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={isSubmitting}>
              {isSubmitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Check size={18} />
                  <span>{isEdit ? 'Update Medicine' : 'Add Medicine'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
