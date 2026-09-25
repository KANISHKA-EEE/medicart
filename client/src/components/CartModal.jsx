import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { X, ShoppingBag, Trash2, ArrowRight, ShieldCheck, Plus, Minus, RotateCcw } from 'lucide-react';

export default function CartModal({ isOpen, onClose, onShowToast }) {
  const {
    cartItems,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    cartCount,
    cartSubtotal,
    totalSavings
  } = useCart();

  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckoutClick = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="cart-modal-overlay" onClick={onClose}>
      <div className="cart-modal-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-drawer-header">
          <div className="cart-drawer-title">
            <ShoppingBag size={22} />
            <h2>Your Shopping Cart ({cartCount})</h2>
          </div>
          <div className="cart-header-actions">
            {cartItems.length > 0 && (
              <button 
                className="btn-clear-cart" 
                onClick={clearCart}
                title="Clear all items"
              >
                <Trash2 size={14} /> Clear Cart
              </button>
            )}
            <button className="cart-close-btn" onClick={onClose} aria-label="Close cart">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div className="empty-cart-view">
              <ShoppingBag size={64} className="empty-cart-icon" />
              <h3>Your cart is empty</h3>
              <p>Looks like you haven't added any medicines or health products yet.</p>
              <button className="btn-primary" onClick={onClose}>
                Browse Medicines
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map((item) => {
                const itemId = item._id || item.id;
                const itemTotal = item.price * item.quantity;
                const itemSavings = (item.mrp > item.price) ? (item.mrp - item.price) * item.quantity : 0;

                return (
                  <div key={itemId} className="cart-item-card">
                    <div className="cart-item-img" style={{ backgroundColor: item.imageBg || '#e0f2fe' }}>
                      💊
                    </div>

                    <div className="cart-item-details">
                      <h4>{item.name}</h4>
                      <span className="cart-item-cat">{item.dosageForm || item.category}</span>
                      
                      <div className="cart-item-price-row">
                        <div className="cart-item-prices">
                          <span className="item-price">₹{item.price}</span>
                          {item.mrp > item.price && (
                            <span className="item-mrp">₹{item.mrp}</span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="cart-qty-controls">
                          <button 
                            className="btn-qty-control"
                            onClick={() => decreaseQuantity(itemId)}
                            disabled={item.quantity <= 1}
                            title="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="qty-value">{item.quantity}</span>
                          <button 
                            className="btn-qty-control"
                            onClick={() => increaseQuantity(itemId)}
                            title="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="cart-item-row-footer">
                        <span className="item-row-total">Total: ₹{itemTotal}</span>
                        {itemSavings > 0 && (
                          <span className="item-row-savings">Save ₹{itemSavings}</span>
                        )}
                      </div>
                    </div>

                    <button 
                      className="cart-item-remove"
                      onClick={() => removeFromCart(itemId)}
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Summary */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            {totalSavings > 0 && (
              <div className="cart-savings-banner">
                <ShieldCheck size={16} />
                <span>You are saving ₹{totalSavings} on this order!</span>
              </div>
            )}

            <div className="cart-subtotal-row">
              <span>Subtotal:</span>
              <span className="subtotal-amount">₹{cartSubtotal}</span>
            </div>

            <div className="cart-drawer-buttons">
              <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>
                Continue Shopping
              </button>
              <button 
                className="btn-primary btn-checkout"
                onClick={handleCheckoutClick}
                style={{ flex: 1.5 }}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
