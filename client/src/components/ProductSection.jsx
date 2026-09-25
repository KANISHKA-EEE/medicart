import React from 'react';
import ProductCard from './ProductCard';
import { Pill, Filter, RotateCcw } from 'lucide-react';

export default function ProductSection({ 
  products, 
  totalMedicinesCount = 0,
  isLoading = false,
  isError = false,
  onRetry,
  activeCategory, 
  setActiveCategory,
  searchQuery, 
  setSearchQuery,
  onAddToCart, 
  onBuyNow 
}) {
  return (
    <section className="product-section" id="available-medicines">
      <div className="section-container" id="popular-medicines">
        {/* Section Header */}
        <div className="section-header-flex">
          <div>
            <div className="section-tag">
              <Pill size={16} />
              <span>Verified Kanishka Pharmacy Stock</span>
            </div>
            <h2 className="section-title">Available Medicines & Health Essentials</h2>
          </div>

          {/* Quick Filter Badges */}
          <div className="filter-pills-row">
            <button 
              className={`filter-pill ${activeCategory === 'All' ? 'active' : ''}`}
              onClick={() => setActiveCategory('All')}
            >
              All
            </button>
            <button 
              className={`filter-pill ${activeCategory === 'Pain Relief' ? 'active' : ''}`}
              onClick={() => setActiveCategory('Pain Relief')}
            >
              Pain Relief
            </button>
            <button 
              className={`filter-pill ${activeCategory === 'Vitamins' ? 'active' : ''}`}
              onClick={() => setActiveCategory('Vitamins')}
            >
              Vitamins
            </button>
            <button 
              className={`filter-pill ${activeCategory === 'Personal Care' ? 'active' : ''}`}
              onClick={() => setActiveCategory('Personal Care')}
            >
              Personal Care
            </button>
          </div>
        </div>

        {/* Active Filter Bar Info */}
        {(activeCategory !== 'All' || searchQuery) && (
          <div className="active-filter-banner">
            <span>
              Showing results for 
              {activeCategory !== 'All' && <strong> Category: "{activeCategory}"</strong>}
              {searchQuery && <strong> Search: "{searchQuery}"</strong>}
            </span>
            <button 
              className="reset-filter-btn"
              onClick={() => {
                setActiveCategory('All');
                setSearchQuery('');
              }}
            >
              <RotateCcw size={14} /> Reset Filters
            </button>
          </div>
        )}

        {/* Content Section based on status */}
        {isLoading ? (
          <div className="no-products-box">
            <Pill size={48} className="no-products-icon" style={{ opacity: 0.6 }} />
            <h3>Loading medicines...</h3>
            <p>Fetching latest pharmacy inventory from database.</p>
          </div>
        ) : isError ? (
          <div className="no-products-box">
            <Pill size={48} className="no-products-icon" style={{ color: 'var(--color-danger)' }} />
            <h3>Unable to load medicines. Please try again.</h3>
            <p>Please check your backend connection or database status.</p>
            {onRetry && (
              <button className="btn-primary" onClick={onRetry} style={{ marginTop: '1rem' }}>
                Retry Loading
              </button>
            )}
          </div>
        ) : products.length > 0 ? (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                onAddToCart={onAddToCart}
                onBuyNow={onBuyNow}
              />
            ))}
          </div>
        ) : totalMedicinesCount === 0 ? (
          <div className="no-products-box">
            <Pill size={48} className="no-products-icon" />
            <h3>No medicines available right now.</h3>
            <p>No medicine records were found in the database. Add medicines via POST /api/medicines.</p>
          </div>
        ) : (
          <div className="no-products-box">
            <Pill size={48} className="no-products-icon" />
            <h3>No medicines match your search</h3>
            <p>Try searching for "Paracetamol", "Vitamin C", or clear your filter.</p>
            <button 
              className="btn-primary"
              onClick={() => {
                setActiveCategory('All');
                setSearchQuery('');
              }}
            >
              View All Medicines
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
