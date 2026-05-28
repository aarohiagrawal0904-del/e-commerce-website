import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ArrowRight, Cpu, Eye, ShoppingCart, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/api/products');
        if (res.data.success) {
          // slice first 3 items as featured
          setFeaturedProducts(res.data.products.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load featured products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleQuickAdd = async (productId) => {
    const res = await addToCart(productId, 1);
    if (res.success) {
      alert('Success! Added to cart.'); // fallback simple notifications if needed, we'll implement clean toasts or UI changes
    } else {
      alert(res.error);
    }
  };

  const categories = [
    { name: 'Electronics', desc: 'Premium mechanical keys, headsets, and watches', link: '/products?category=Electronics', icon: Cpu },
    { name: 'Fashion', desc: 'Distressed leather coats, custom active running shoes', link: '/products?category=Fashion', icon: Sparkles }
  ];

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Background Orbs */}
      <div className="glow-orb glow-blue top-[10%] left-[5%]" />
      <div className="glow-orb glow-purple bottom-[20%] right-[10%]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        {/* HERO HEADER SECTION */}
        <div className="glass-panel rounded-3xl p-8 sm:p-16 mb-16 border border-white/5 relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
          <div className="max-w-2xl text-left space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary-500/10 border border-primary-500/30 text-primary-400 rounded-full text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart E-Commerce Portal v1.0</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
              Elevate Your <br />
              <span className="bg-gradient-to-r from-primary-400 via-primary-500 to-purple-400 bg-clip-text text-transparent">
                Digital Lifestyle
              </span>
            </h1>
            <p className="text-dark-200 text-base sm:text-lg leading-relaxed max-w-lg">
              Explore Aura's handpicked collection of state-of-the-art developer peripherals, custom tailoring apparel, and intelligent deliveries. Powered by Gemini AI tracking.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                to="/products"
                className="flex items-center justify-center space-x-2 px-8 py-3.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/35 transition-all transform hover:-translate-y-0.5"
              >
                <span>Shop the Catalog</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/products"
                className="flex items-center justify-center px-8 py-3.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>

          <div className="relative mt-12 md:mt-0 max-w-md w-full aspect-video rounded-2xl overflow-hidden glass-panel border border-white/10 shadow-2xl flex items-center justify-center bg-dark-950/40">
            <img
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1000"
              alt="Premium Gadget Preview"
              className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>

        {/* CORE PLATFORM FEATURES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-start space-x-4">
            <div className="p-3 bg-primary-500/10 text-primary-400 rounded-xl">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Curated Collections</h4>
              <p className="text-sm text-dark-300 mt-1">Directly sourced premium peripherals and apparel selected by experts.</p>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-start space-x-4">
            <div className="p-3 bg-green-500/10 text-green-400 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Secure Encrypted Orders</h4>
              <p className="text-sm text-dark-300 mt-1">Full transaction rollbacks and secure JWT authentication protocols.</p>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-start space-x-4">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Live Tracking Timeline</h4>
              <p className="text-sm text-dark-300 mt-1">Direct sync with FedEx tracking links and automated status maps.</p>
            </div>
          </div>
        </div>

        {/* BROWSE CATEGORIES */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Explore Categories</h2>
            <Link to="/products" className="text-primary-400 hover:text-primary-300 text-sm font-semibold flex items-center space-x-1">
              <span>View all</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {categories.map((c) => {
              const Icon = c.icon;
              return (
                <Link
                  key={c.name}
                  to={c.link}
                  className="glass-panel p-8 rounded-2xl border border-white/5 glass-panel-hover flex items-center justify-between text-left group"
                >
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors">{c.name}</h3>
                    <p className="text-sm text-dark-300 max-w-sm">{c.desc}</p>
                  </div>
                  <div className="p-4 bg-primary-950/20 group-hover:bg-primary-500 group-hover:text-white rounded-xl text-primary-400 transition-all duration-300">
                    <Icon className="w-8 h-8" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* TRENDING PRODUCTS GRID */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Trending Gear</h2>
            <Link to="/products" className="text-primary-400 hover:text-primary-300 text-sm font-semibold flex items-center space-x-1">
              <span>See full catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-t-primary-500 border-r-transparent border-b-primary-200 border-l-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((p) => (
                <div
                  key={p.id}
                  className="glass-panel rounded-2xl overflow-hidden border border-white/5 flex flex-col justify-between group hover:border-primary-500/25 transition-all duration-300"
                >
                  {/* Photo area */}
                  <div className="relative aspect-square overflow-hidden bg-dark-950/40">
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-dark-900/80 backdrop-blur border border-white/10 px-2.5 py-1 rounded-md text-[10px] font-bold text-primary-400 uppercase tracking-widest">
                      {p.category_name}
                    </div>
                  </div>

                  {/* Body details */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1 text-left">
                      <h3 className="font-extrabold text-lg text-white group-hover:text-primary-400 transition-colors line-clamp-1">
                        {p.name}
                      </h3>
                      <p className="text-xs text-dark-300 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xl font-bold text-white">
                        ₹{parseFloat(p.price).toFixed(2)}
                      </span>
                      
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/products/${p.id}`}
                          className="p-2.5 bg-white/5 hover:bg-white/10 text-dark-200 hover:text-white rounded-xl border border-white/10 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </Link>
                        <button
                          onClick={() => handleQuickAdd(p.id)}
                          className="flex items-center space-x-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow shadow-primary-500/10"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>Add to Cart</span>
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
    </div>
  );
};

export default Home;
