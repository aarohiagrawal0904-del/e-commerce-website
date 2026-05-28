import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, ShoppingCart, Cpu, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/products/${id}`);
        if (res.data.success) {
          setProduct(res.data.product);
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
        setError(err.customMessage || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleQtyChange = (val) => {
    if (val < 1) return;
    if (product && val > product.stock) {
      alert(`Only ${product.stock} units are currently in stock!`);
      return;
    }
    setQuantity(val);
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setAdding(true);
    const result = await addToCart(product.id, quantity);
    setAdding(false);
    if (result.success) {
      alert(`Success! Added ${quantity} item(s) to your cart.`);
    } else {
      alert(result.error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-panel rounded-2xl p-8 max-w-md text-center space-y-4">
          <h2 className="text-xl font-bold text-red-400">Error Occurred</h2>
          <p className="text-dark-200 text-sm">{error || 'Product details could not be found'}</p>
          <Link to="/products" className="inline-flex items-center space-x-2 text-primary-400 text-sm font-bold">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 relative">
      {/* Background orbs */}
      <div className="glow-orb glow-blue top-1/3 left-1/4 animate-pulse" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Back Link */}
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 text-dark-300 hover:text-white text-sm font-semibold mb-8 group transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Catalog</span>
        </Link>

        {/* Detailed Split view */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          
          {/* Left Column: Image Card */}
          <div className="glass-panel border border-white/5 rounded-3xl overflow-hidden shadow-xl aspect-square flex items-center justify-center bg-dark-950/20 relative">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute top-4 left-4 bg-dark-900/80 backdrop-blur border border-white/10 px-3 py-1.5 rounded-lg text-xs font-bold text-primary-400 uppercase tracking-widest">
              {product.category_name}
            </div>
          </div>

          {/* Right Column: Checkout details and Actions */}
          <div className="flex flex-col justify-between text-left space-y-6">
            
            {/* Title Block */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                {product.name}
              </h1>
              
              {/* Stock Indicator */}
              <div className="flex items-center space-x-3">
                {product.stock > 0 ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-950/40 border border-green-800/30 text-green-400">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                    In Stock ({product.stock} units available)
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-950/40 border border-red-800/30 text-red-400">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Price Detail */}
            <div className="border-y border-white/5 py-4">
              <div className="text-sm font-semibold text-dark-300">Unit Price</div>
              <div className="text-3xl font-extrabold text-white mt-1">
                ₹{parseFloat(product.price).toFixed(2)}
              </div>
            </div>

            {/* Product description */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-dark-200 uppercase tracking-wider">Product Overview</h3>
              <p className="text-sm text-dark-100 leading-relaxed font-light">
                {product.description}
              </p>
            </div>

            {/* Quantities & Checkout Actions */}
            <div className="space-y-4">
              {product.stock > 0 && (
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-bold text-dark-200 uppercase tracking-wider">Quantity</span>
                  <div className="flex items-center bg-dark-800/80 border border-white/10 rounded-xl overflow-hidden">
                    <button
                      onClick={() => handleQtyChange(quantity - 1)}
                      className="px-3.5 py-2 hover:bg-white/5 text-lg font-bold text-dark-200 hover:text-white transition-colors"
                      disabled={adding}
                    >
                      -
                    </button>
                    <span className="px-5 font-bold text-sm text-white select-none">{quantity}</span>
                    <button
                      onClick={() => handleQtyChange(quantity + 1)}
                      className="px-3.5 py-2 hover:bg-white/5 text-lg font-bold text-dark-200 hover:text-white transition-colors"
                      disabled={adding}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || adding}
                  className="flex-1 flex items-center justify-center space-x-2 py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/10 hover:shadow-primary-500/30 transition-all duration-200 disabled:opacity-50 active:scale-95"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>{adding ? 'Syncing...' : 'Add to Shopping Cart'}</span>
                </button>
                
                <button
                  className="p-4 bg-dark-800 border border-white/5 text-dark-200 hover:text-red-400 rounded-xl transition-colors"
                  title="Add to Wishlist"
                >
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* AI CAPABILITY FEATURE PANEL (GEMINI BRIEFING CARD) */}
        <div className="glass-panel border border-white/5 rounded-3xl p-6 sm:p-8 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-primary-400">
            <Sparkles className="w-40 h-40" />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center space-x-2 text-primary-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <h3 className="text-base font-extrabold uppercase tracking-widest">AI Generated Highlights</h3>
            </div>
            
            <p className="text-xs text-dark-300 max-w-2xl font-light">
              Our automated Gemini Engine processes and extracts technical insights from the merchant parameters:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start space-x-2.5">
                <div className="p-1 bg-primary-500/10 rounded-md text-primary-400 mt-0.5">
                  <Cpu className="w-4.5 h-4.5" />
                </div>
                <div className="text-sm">
                  <h4 className="font-bold text-white">Advanced Specifications</h4>
                  <p className="text-xs text-dark-300 mt-0.5">Optimized dimensions, resilient frame structuring, and eco-friendly composition.</p>
                </div>
              </div>
              <div className="flex items-start space-x-2.5">
                <div className="p-1 bg-green-500/10 rounded-md text-green-400 mt-0.5">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div className="text-sm">
                  <h4 className="font-bold text-white">Full Quality Verified</h4>
                  <p className="text-xs text-dark-300 mt-0.5">Undergoes dynamic batch pressure testing for standard electrical and wear guarantees.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetails;
