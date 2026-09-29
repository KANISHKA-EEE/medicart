import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import Navbar from './components/Navbar';
import WelcomeAnimation from './components/WelcomeAnimation';
import Hero from './components/Hero';
import TrustSection from './components/TrustSection';
import CategoryCard from './components/CategoryCard';
import ProductSection from './components/ProductSection';
import WellnessSection from './components/WellnessSection';
import PromoBanner from './components/PromoBanner';
import Footer from './components/Footer';
import CartModal from './components/CartModal';
import PrescriptionUploadModal from './components/PrescriptionUploadModal';
import Login from './components/Login';
import Signup from './components/Signup';
import Checkout from './components/Checkout';
import Orders from './components/Orders';
import OrderDetails from './components/OrderDetails';
import AdminDashboard from './components/AdminDashboard';
import AdminMedicines from './components/AdminMedicines';
import AdminOrders from './components/AdminOrders';
import AdminOrderDetails from './components/AdminOrderDetails';
import AdminRoute from './components/AdminRoute';
import { API_BASE_URL } from './config/api';

import { categoriesData } from './data/products';
import { Grid, CheckCircle } from 'lucide-react';
import './App.css';

import AboutModal from './components/AboutModal';

function MainShopView({ showToast, toast }) {
  // Backend API Status State
  const [apiStatus, setApiStatus] = useState('Connecting...');

  // Medicines API State
  const [medicines, setMedicines] = useState([]);
  const [isLoadingMedicines, setIsLoadingMedicines] = useState(true);
  const [medicinesError, setMedicinesError] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Modal Visibility
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Prescription Upload Modal State
  const [isRxModalOpen, setIsRxModalOpen] = useState(false);
  const [rxTargetMedicine, setRxTargetMedicine] = useState(null);

  // Consume CartContext
  const { addToCart, prescriptionFile } = useCart();

  // Fetch backend /api/test on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/test`)
      .then((res) => res.json())
      .then((data) => setApiStatus(data.message))
      .catch(() => setApiStatus('Backend connection offline'));
  }, []);

  // Fetch medicines from MongoDB REST API (/api/medicines)
  const fetchMedicines = () => {
    setIsLoadingMedicines(true);
    setMedicinesError(false);
    fetch(`${API_BASE_URL}/api/medicines`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.success && Array.isArray(data.data)) {
          const formatted = data.data.map((item) => ({
            ...item,
            id: item._id || item.id
          }));
          setMedicines(formatted);
        } else {
          setMedicines([]);
        }
        setIsLoadingMedicines(false);
      })
      .catch((err) => {
        console.error('Failed to fetch medicines from MongoDB API:', err);
        setMedicinesError(true);
        setIsLoadingMedicines(false);
      });
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // Add to Cart Action
  const handleAddToCart = (product) => {
    const res = addToCart(product);
    if (product.prescriptionRequired && !prescriptionFile) {
      setRxTargetMedicine(product);
      setIsRxModalOpen(true);
    }
    if (res && res.message) {
      showToast(res.message);
    }
  };

  // Buy Now Action
  const handleBuyNow = (product) => {
    const res = addToCart(product);
    if (product.prescriptionRequired && !prescriptionFile) {
      setRxTargetMedicine(product);
      setIsRxModalOpen(true);
    } else {
      setIsCartOpen(true);
    }
    if (res && res.message) {
      showToast(res.message);
    }
  };

  // Filter medicines dynamically
  const filteredProducts = medicines.filter((product) => {
    const matchesSearch =
      !searchQuery ||
      (product.name && product.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      activeCategory === 'All' ||
      (product.category && product.category.trim().toLowerCase() === activeCategory.trim().toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="app-layout">
      {/* Welcome Animation on Initial Load */}
      <WelcomeAnimation />

      {/* Toast Notification */}
      {toast && (
        <div className="toast-notification">
          <CheckCircle size={18} className="toast-icon" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        apiStatus={apiStatus}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onShowToast={showToast}
      />

      {/* Hero Section */}
      <Hero
        onShopClick={() => {
          const el = document.getElementById('available-medicines') || document.getElementById('popular-medicines');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onWellnessClick={() => {
          const el = document.getElementById('wellness');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Trust & Features Section */}
      <TrustSection />

      {/* Shop By Category Section */}
      <section className="shop-by-category-section">
        <div className="section-container">
          <div className="section-header-flex">
            <div>
              <div className="section-tag">
                <Grid size={16} />
                <span>Quick Discovery</span>
              </div>
              <h2 className="section-title">Shop by Category</h2>
            </div>
          </div>

          <div className="category-grid">
            {categoriesData.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onSelectCategory={(name) => {
                  setActiveCategory(name);
                  showToast(`Selected category: ${name}`);
                  const el = document.getElementById('available-medicines') || document.getElementById('popular-medicines');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Popular / Available Medicines Section */}
      <ProductSection
        products={filteredProducts}
        totalMedicinesCount={medicines.length}
        isLoading={isLoadingMedicines}
        isError={medicinesError}
        onRetry={fetchMedicines}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      {/* Health & Wellness Section */}
      <WellnessSection
        onSelectWellness={(title) => {
          showToast(`Exploring ${title}`);
        }}
      />

      {/* Promotional Banner */}
      <PromoBanner
        onOffersClick={() => {
          showToast('Special promotional discount code MEDICART25 applied!');
        }}
      />

      {/* Footer */}
      <Footer 
        onFooterLinkClick={(linkName) => {
          if (linkName.includes('About')) {
            setIsAboutOpen(true);
          } else {
            showToast(`${linkName} clicked`);
          }
        }} 
      />

      {/* Cart Drawer Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOpenRxModal={() => setIsRxModalOpen(true)}
        onShowToast={showToast}
      />

      {/* Prescription Upload Modal */}
      <PrescriptionUploadModal
        isOpen={isRxModalOpen}
        onClose={() => {
          setIsRxModalOpen(false);
          setRxTargetMedicine(null);
        }}
        targetMedicine={rxTargetMedicine}
        onShowToast={showToast}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
}

function App() {
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainShopView showToast={showToast} toast={toast} />} />
            <Route path="/login" element={<Login onShowToast={showToast} />} />
            <Route path="/signup" element={<Signup onShowToast={showToast} />} />
            <Route path="/checkout" element={<Checkout onShowToast={showToast} />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/medicines"
              element={
                <AdminRoute>
                  <AdminMedicines />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <AdminOrders />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders/:id"
              element={
                <AdminRoute>
                  <AdminOrderDetails />
                </AdminRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
