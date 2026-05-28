import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { Search, Eye, ShoppingCart, SlidersHorizontal } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Products = () => {
  const { search: searchParam } = useLocation();
  const { addToCart } = useCart();
  const navigate = useNavigateHelper(); // custom fallback/hook or simple parsing

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sort, setSort] = useState('newest');

  // Read query params from URL on load
  useEffect(() => {
    const params = new URLSearchParams(searchParam);
    const cat = params.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParam]);

  // Fetch data from API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Build query string
      let url = '/api/products';
      const params = [];
      if (selectedCategory) params.push(`category=${encodeURIComponent(selectedCategory)}`);
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (sort) params.push(`sort=${encodeURIComponent(sort)}`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const res = await api.get(url);
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce/Fetch product catalog when filters adjust
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 150);

    return () => clearTimeout(delayDebounceFn);
  }, [selectedCategory, search, sort]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/api/products/categories/all');
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  const handleAddToCartClick = async (productId) => {
    const result = await addToCart(productId, 1);
    if (result.success) {
      alert('Product added to cart!');
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER SECTION */}
        <div className="text-left space-y-4 mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Our Catalog
          </h1>
          <p className="text-dark-200 text-sm max-w-xl">
            Browse our handpicked inventory of high-end accessories and tech apparel. Filters update in real-time.
          </p>
        </div>

        {/* SEARCH, SORT, FILTER CONTROLS BAR */}
        <div className="glass-panel border border-white/5 rounded-2xl p-4 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Live Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-300">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm"
              placeholder="Search products..."
            />
          </div>

          {/* Sort & Settings */}
          <div className="flex items-center space-x-3">
            <SlidersHorizontal className="w-5 h-5 text-dark-300 hidden sm:block" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3.5 py-2.5 bg-dark-800 border border-white/5 text-dark-100 rounded-xl text-sm focus:outline-none focus:border-primary-500 transition-colors"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

        </div>

        {/* CATEGORY FILTER TAB BARS */}
        <div className="flex overflow-x-auto pb-4 mb-8 space-x-2.5 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
              selectedCategory === ''
                ? 'bg-primary-600 border border-primary-500 text-white'
                : 'bg-dark-800/80 border border-white/5 text-dark-200 hover:text-white hover:bg-dark-700'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all uppercase tracking-wider ${
                selectedCategory === cat.name
                  ? 'bg-primary-600 border border-primary-500 text-white'
                  : 'bg-dark-800/80 border border-white/5 text-dark-200 hover:text-white hover:bg-dark-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* PRODUCTS LISTING GRID */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : products.length === 0 ? (
          <div className="glass-panel border border-white/5 rounded-2xl p-12 text-center text-dark-300">
            No products found matching your active filter criteria. Try expanding your search queries!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <div
                key={p.id}
                className="glass-panel rounded-2xl overflow-hidden border border-white/5 flex flex-col justify-between group hover:border-primary-500/25 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-dark-950/40">
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-dark-900/80 backdrop-blur border border-white/10 px-2.5 py-1 rounded-md text-[9px] font-bold text-primary-400 uppercase tracking-widest">
                    {p.category_name}
                  </div>
                  {p.stock === 0 && (
                    <div className="absolute inset-0 bg-dark-900/75 flex items-center justify-center text-sm font-bold text-red-400">
                      Out of Stock
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1 text-left">
                    <h3 className="font-bold text-base text-white group-hover:text-primary-400 transition-colors line-clamp-1">
                      {p.name}
                    </h3>
                    <p className="text-xs text-dark-300 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-extrabold text-white">
                      ₹{parseFloat(p.price).toFixed(2)}
                    </span>

                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/products/${p.id}`}
                        className="p-2 bg-white/5 hover:bg-white/10 text-dark-200 hover:text-white rounded-xl border border-white/10 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleAddToCartClick(p.id)}
                        disabled={p.stock === 0}
                        className="flex items-center space-x-1.5 px-3 py-2 bg-primary-600 hover:bg-primary-500 active:scale-95 disabled:opacity-50 disabled:active:scale-100 text-white text-xs font-bold rounded-xl transition-all shadow"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

// Quick custom location/navigation helper
const useNavigateHelper = () => {
  // simple routing triggers
};

export default Products;
