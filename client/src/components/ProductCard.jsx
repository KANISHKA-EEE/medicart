import React from 'react';
import { Star, ShoppingCart, CheckCircle2, Pill, Sun, ShieldAlert, Activity, Thermometer, Sparkles, Cross, Zap, FileText } from 'lucide-react';

const iconMap = {
  Pill: Pill,
  Sun: Sun,
  ShieldAlert: ShieldAlert,
  Zap: Zap,
  Activity: Activity,
  Cross: Cross,
  Thermometer: Thermometer,
  Sparkles: Sparkles
};

export default function ProductCard({ product, onAddToCart, onBuyNow, onOpenPrescriptionModal }) {
  const iconName = product.iconName || 'Pill';
  const IconComp = iconMap[iconName] || Pill;

  const dosageForm = product.dosageForm || product.packSize || 'Medicine';
  const rating = product.rating !== undefined && product.rating !== null ? product.rating : 4.5;
  const reviewsCount = product.reviewsCount !== undefined && product.reviewsCount !== null ? product.reviewsCount : 120;
  
  const isOutOfStock = typeof product.stock === 'number' 
    ? product.stock <= 0 
    : product.stock === 'Out of Stock';

  const stockText = isOutOfStock 
    ? 'Out of Stock' 
    : (typeof product.stock === 'number' ? 'In Stock' : (product.stock || 'In Stock'));

  const discountVal = product.discount !== undefined && product.discount !== null
    ? product.discount
    : (product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0);

  const saveAmount = product.mrp > product.price ? product.mrp - product.price : 0;

  const isRxRequired = !!product.prescriptionRequired;

  const shortDesc = product.description 
    ? (product.description.length > 60 ? product.description.substring(0, 57) + '...' : product.description)
    : (product.shortDescription || `${dosageForm} • Genuine Quality`);

  return (
    <div className={`product-card ${isOutOfStock ? 'out-of-stock-card' : ''}`}>
      {/* Medicine Image Container */}
      <div className="product-img-box">
        {discountVal > 0 && !isOutOfStock && (
          <span className="product-discount-badge">{discountVal}% OFF</span>
        )}

        <img 
          src={product.image || '/images/fallback_medicine.svg'} 
          alt={product.name} 
          className="product-real-img"
          style={{ objectFit: 'contain' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/fallback_medicine.svg';
          }}
        />
        <span className="dosage-pill">{dosageForm}</span>
      </div>

      {/* Prescription Required Badge Row (Cleanly separated below image area) */}
      {isRxRequired && (
        <div className="product-rx-badge-row">
          <span className="rx-required-tag" title="Prescription required from a licensed doctor">
            <FileText size={11} /> Prescription Required
          </span>
        </div>
      )}

      {/* Product Details */}
      <div className="product-info">
        <span className="product-cat-tag">{product.category}</span>
        
        <h3 className="product-name" title={product.name}>
          {product.name}
        </h3>

        {/* Short Description */}
        <p className="product-short-desc">
          {shortDesc}
        </p>

        {/* Rating & Stock */}
        <div className="product-meta">
          <div className="product-rating">
            <Star size={13} className="star-icon" />
            <span className="rating-score">{rating}</span>
            <span className="reviews-count">({reviewsCount})</span>
          </div>

          <span className={`stock-status ${isOutOfStock ? 'out-of-stock-label' : ''}`}>
            <CheckCircle2 size={12} /> {stockText}
          </span>
        </div>

        {/* Price Row */}
        <div className="product-price-row">
          <div className="price-box">
            <span className="current-price">₹{product.price}</span>
            {product.mrp > product.price && (
              <span className="mrp-price">₹{product.mrp}</span>
            )}
          </div>
          {saveAmount > 0 && (
            <span className="save-tag">Save ₹{saveAmount}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="product-actions">
          <button 
            className={`btn-add-cart ${isRxRequired ? 'btn-rx-add' : ''}`}
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
            title={isOutOfStock ? 'Out of Stock' : (isRxRequired ? 'Upload Prescription & Add to Cart' : 'Add to Cart')}
          >
            {isRxRequired ? <FileText size={14} /> : <ShoppingCart size={15} />}
            <span>
              {isOutOfStock 
                ? 'Out of Stock' 
                : (isRxRequired ? 'Upload Rx & Add' : 'Add to Cart')}
            </span>
          </button>
          
          <button 
            className="btn-buy-now" 
            onClick={() => onBuyNow(product)}
            disabled={isOutOfStock}
            title={isOutOfStock ? 'Out of Stock' : 'Buy Now'}
          >
            <Zap size={15} />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
