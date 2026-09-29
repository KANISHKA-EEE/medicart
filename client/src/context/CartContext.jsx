import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('medicart_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (err) {
      console.error('Failed to load cart from localStorage:', err);
      return [];
    }
  });

  const [prescriptionFile, setPrescriptionFileState] = useState(() => {
    try {
      const savedPrescription = localStorage.getItem('medicart_prescription');
      return savedPrescription ? JSON.parse(savedPrescription) : null;
    } catch (err) {
      console.error('Failed to load prescription from localStorage:', err);
      return null;
    }
  });

  // Save cart to localStorage whenever cartItems changes
  useEffect(() => {
    try {
      localStorage.setItem('medicart_cart', JSON.stringify(cartItems));
    } catch (err) {
      console.error('Failed to save cart to localStorage:', err);
    }
  }, [cartItems]);

  // Save prescription file to localStorage
  useEffect(() => {
    try {
      if (prescriptionFile) {
        localStorage.setItem('medicart_prescription', JSON.stringify(prescriptionFile));
      } else {
        localStorage.removeItem('medicart_prescription');
      }
    } catch (err) {
      console.error('Failed to save prescription file to localStorage:', err);
    }
  }, [prescriptionFile]);

  const setPrescriptionFile = (fileData) => {
    setPrescriptionFileState(fileData);
  };

  const clearPrescriptionFile = () => {
    setPrescriptionFileState(null);
  };

  // Helper to normalize ID
  const getItemId = (item) => item._id || item.id;

  // Add medicine to cart
  const addToCart = (product) => {
    const prodId = getItemId(product);

    // Check if out of stock
    const isOutOfStock = typeof product.stock === 'number' && product.stock <= 0;
    if (isOutOfStock || product.stock === 'Out of Stock') {
      return { success: false, message: `${product.name} is currently out of stock.` };
    }

    let resultMsg = `${product.name} added to cart!`;

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => getItemId(item) === prodId);

      if (existingItem) {
        // Stock cap check if stock is numeric
        if (typeof product.stock === 'number' && existingItem.quantity >= product.stock) {
          resultMsg = `Maximum available stock (${product.stock}) reached for ${product.name}.`;
          return prevItems;
        }

        return prevItems.map((item) =>
          getItemId(item) === prodId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // Add new product
      return [
        ...prevItems,
        {
          _id: product._id,
          id: prodId,
          name: product.name,
          category: product.category || 'General',
          price: product.price,
          mrp: product.mrp || product.price,
          discount: product.discount || 0,
          dosageForm: product.dosageForm || product.packSize || 'Medicine',
          packSize: product.packSize || product.dosageForm || '',
          imageBg: product.imageBg || '#e0f2fe',
          iconName: product.iconName || 'Pill',
          stock: product.stock,
          prescriptionRequired: !!product.prescriptionRequired,
          quantity: 1
        }
      ];
    });

    return { success: true, message: resultMsg, prescriptionRequired: !!product.prescriptionRequired };
  };

  // Remove single item
  const removeFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => getItemId(item) !== id));
  };

  // Increase quantity by 1
  const increaseQuantity = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (getItemId(item) === id) {
          if (typeof item.stock === 'number' && item.quantity >= item.stock) {
            return item; // Cap at max stock
          }
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      })
    );
  };

  // Decrease quantity by 1 (minimum 1)
  const decreaseQuantity = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (getItemId(item) === id) {
          return { ...item, quantity: Math.max(1, item.quantity - 1) };
        }
        return item;
      })
    );
  };

  // Clear entire cart
  const clearCart = () => {
    setCartItems([]);
    setPrescriptionFileState(null);
  };

  // Calculate total number of items
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Check if any cart item requires a prescription
  const hasPrescriptionItem = cartItems.some((item) => !!item.prescriptionRequired);

  // Calculate cart subtotal
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Calculate total savings
  const totalSavings = cartItems.reduce(
    (acc, item) => acc + Math.max(0, (item.mrp || item.price) - item.price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        totalSavings,
        hasPrescriptionItem,
        prescriptionFile,
        setPrescriptionFile,
        clearPrescriptionFile
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
