import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Cart = () => {
  const { cart, loading, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const handleQtyChange = async (productId, quantity, stock, productName) => {
    if (quantity <= 0) {
      // Remove if quantity becomes zero
      await removeFromCart(productId);
      return;
    }
    if (quantity > stock) {
      alert(`Sorry! Only ${stock} units are in stock for ${productName}.`);
      return;
    }
    await updateQuantity(productId, quantity);
  };

  const handleRemove = async (productId) => {
    if (confirm('Are you sure you want to remove this product from your cart?')) {
      await removeFromCart(productId);
    }
  };

  const handleClear = async () => {
    if (confirm('Are you sure you want to clear your entire cart?')) {
      await clearCart();
    }
  };

  // Calculations
  const shippingFee = cartTotal > 150 || cartTotal === 0 ? 0.00 : 15.00;
  const taxFee = cartTotal * 0.08; // 8% sales tax estimate
  const finalTotal = cartTotal + shippingFee + taxFee;

  if (loading && cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 relative text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-8">
          Shopping Cart
        </h1>

        {cart.length === 0 ? (
          /* EMPTY CART VIEW */
          <div className="glass-panel border border-white/5 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-6">
            <div className="p-4 bg-primary-950/20 text-primary-400 rounded-full inline-block">
              <ShoppingBag className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Your Cart is Empty</h2>
              <p className="text-sm text-dark-300">
                You haven't added any products to your active session yet. Browse our smart gear to start shopping!
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow transition"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* ACTIVE CART Split layout */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column: Cart items table */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Cart List */}
              <div className="glass-panel border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                {cart.map((item) => (
                  <div key={item.product_id} className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    
                    {/* Left: Product Image & Details */}
                    <div className="flex items-center space-x-4 flex-1 self-start sm:self-center">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-dark-950 border border-white/5">
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-0.5">
                        <Link to={`/products/${item.product_id}`} className="font-bold text-sm text-white hover:text-primary-400 transition">
                          {item.name}
                        </Link>
                        <div className="text-xs text-dark-300">
                          Unit Price: ₹{parseFloat(item.price).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Quantity selectors */}
                    <div className="flex items-center space-x-3 bg-dark-800/80 border border-white/10 rounded-lg overflow-hidden py-1 px-1.5 self-end sm:self-center">
                      <button
                        onClick={() => handleQtyChange(item.product_id, item.quantity - 1, item.stock, item.name)}
                        className="px-2.5 hover:bg-white/5 font-bold text-dark-200 hover:text-white rounded"
                      >
                        -
                      </button>
                      <span className="px-3 text-xs font-bold text-white select-none">{item.quantity}</span>
                      <button
                        onClick={() => handleQtyChange(item.product_id, item.quantity + 1, item.stock, item.name)}
                        className="px-2.5 hover:bg-white/5 font-bold text-dark-200 hover:text-white rounded"
                      >
                        +
                      </button>
                    </div>

                    {/* Right: Subtotal and delete */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      <div className="text-right">
                        <div className="text-xs text-dark-400 uppercase tracking-widest">Subtotal</div>
                        <div className="font-bold text-sm text-white mt-0.5">
                          ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemove(item.product_id)}
                        className="p-2 text-dark-300 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between">
                <Link
                  to="/products"
                  className="inline-flex items-center space-x-2 text-xs font-semibold text-dark-300 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Continue Shopping</span>
                </Link>

                <button
                  onClick={handleClear}
                  className="px-4 py-2 border border-red-950 hover:bg-red-950/20 text-red-400 rounded-xl text-xs font-bold transition-all"
                >
                  Clear Cart
                </button>
              </div>

            </div>

            {/* Right Column: Order Pricing Summary card */}
            <div className="glass-panel border border-white/5 rounded-2xl p-6 space-y-6">
              <h3 className="font-extrabold text-base text-white border-b border-white/5 pb-3">
                Order Summary
              </h3>

              {/* Table breakdown */}
              <div className="space-y-3.5 text-sm border-b border-white/5 pb-4">
                <div className="flex justify-between text-dark-200">
                  <span>Cart Subtotal</span>
                  <span className="font-semibold text-white">₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-dark-200">
                  <span>Shipping Fee</span>
                  <span className="font-semibold text-white">
                    {shippingFee === 0 ? 'FREE' : `₹${shippingFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-dark-200">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-semibold text-white">₹{taxFee.toFixed(2)}</span>
                </div>
              </div>

              {/* Final Totals */}
              <div className="flex justify-between items-baseline">
                <span className="text-base font-bold text-white">Final Total</span>
                <span className="text-2xl font-black bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                  ₹{finalTotal.toFixed(2)}
                </span>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full flex items-center justify-center space-x-2 py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/10 hover:shadow-primary-500/30 transition-all active:scale-95"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4.5 h-4.5 animate-pulse" />
              </button>

              {/* Guarantee */}
              <div className="text-[10px] text-dark-300 text-center leading-normal">
                By proceeding, you authorize safe processing of your inventory allocations. Full transaction guarantees protect your session data.
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Cart;
