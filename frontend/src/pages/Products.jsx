import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import ProductCard from '../components/ProductCard.jsx';
import api from '../services/api.js';

const categories = ['All Categories', 'Electronics', 'Fashion', 'Books', 'Home'];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (category !== 'All Categories') params.category = category;
        if (sort === 'price_asc' || sort === 'price_desc') params.sort = sort;

        const response = await api.get('/products', { params });
        setProducts(response.data.products || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Something went wrong while loading products.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, category, sort]);

  return (
    <>
      <Navbar />
      <main className="products-page">
        <div className="products-header">
          <div>
            <p className="tag">SHOPKART CATALOG</p>
            <h1>Discover Products</h1>
            <p>Browse our curated selection of quality items.</p>
          </div>
        </div>

        <section className="filters-bar">
          <label className="search-box">
            <span>Search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name..."
            />
          </label>

          <label className="filter-select-box">
            <span>Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-select-box">
            <span>Sort By</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </label>
        </section>

        {loading && (
          <div className="state-card">
            <div className="spinner"></div>
            <p>Loading products...</p>
          </div>
        )}

        {!loading && error && (
          <div className="state-card error">
            <p>{error}</p>
            <button className="primary" onClick={() => setCategory('All Categories')}>
              Reset Filters
            </button>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="state-card empty">
            <div className="empty-icon">🔍</div>
            <h3>No products found</h3>
            <p>Try refining your search term or select another category.</p>
            <button
              className="primary"
              onClick={() => {
                setSearch('');
                setCategory('All Categories');
                setSort('newest');
              }}
            >
              Clear All Filters
            </button>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <section className="product-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </section>
        )}
      </main>
    </>
  );
}
