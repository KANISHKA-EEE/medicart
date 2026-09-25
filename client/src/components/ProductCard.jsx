import React from 'react';
import { Star, ShoppingCart, Zap, CheckCircle2, Pill, Sun, ShieldAlert, Activity, Thermometer, Sparkles, Cross } from 'lucide-react';

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

export default function ProductCard({ product, onAddToCart, onBuyNow }) {
  const iconName = product.iconName || 'Pill';
  const IconComp = iconMap[iconName] || Pill;

  const imageBg = product.imageBg || '#e0f2fe';
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

  return (
    <div className={`product-card ${isOutOfStock ? 'out-of-stock-card' : ''}`}>
      {/* Discount Badge */}
      {discountVal > 0 && !isOutOfStock && (
        <span className="product-discount-badge">{discountVal}% OFF</span>
      )}

      {/* Image Placeholder Box */}
      <div className="product-img-box" style={{ backgroundColor: imageBg }}>
        <IconComp size={48} className="product-icon-visual" />
        <span className="dosage-pill">{dosageForm}</span>
      </div>

      {/* Product Details */}
      <div className="product-info">
        <span className="product-cat-tag">{product.category}</span>
        
        <h3 className="product-name" title={product.name}>
          {product.name}
        </h3>

        {/* Rating & Stock */}
        <div className="product-meta">
          <div className="product-rating">
            <Star size={14} className="star-icon" />
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
            className="btn-add-cart" 
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
            title={isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          >
            <ShoppingCart size={16} />
            <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>
          
          <button 
            className="btn-buy-now" 
            onClick={() => onBuyNow(product)}
            disabled={isOutOfStock}
            title={isOutOfStock ? 'Out of Stock' : 'Buy Now'}
          >
            <Zap size={16} />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
