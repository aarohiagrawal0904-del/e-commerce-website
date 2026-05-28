import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import { MapPin, CreditCard, ChevronLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Protect empty checkouts
  useEffect(() => {
    if (cart.length === 0 && !submitting) {
      navigate('/cart');
    }
  }, [cart, navigate, submitting]);

  const validate = () => {
    if (!address || !city || !zip) {
      setError('Please provide complete shipping details (address, city, and zip code).');
      return false;
    }
    return true;
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setSubmitting(true);
    const completeAddress = `${address.trim()}, ${city.trim()}, Zip: ${zip.trim()}`;

    try {
      const res = await api.post('/api/orders', {
        shippingAddress: completeAddress,
        paymentMethod
      });

      if (res.data.success) {
        // Clear cart
        await clearCart();
        alert('Order successfully placed! Redirecting to tracking panel...');
        navigate('/orders');
      }
    } catch (err) {
      console.error('Order placement failed:', err);
      setError(err.customMessage || 'Failed to place order. Please review stock limits.');
    } finally {
      setSubmitting(false);
    }
  };

  const shippingFee = cartTotal > 150 ? 0.00 : 15.00;
  const taxFee = cartTotal * 0.08;
  const finalTotal = cartTotal + shippingFee + taxFee;

  if (cart.length === 0 && submitting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 relative text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link
          to="/cart"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-dark-300 hover:text-white mb-6 group transition-colors"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Cart</span>
        </Link>

        {/* Title */}
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-8">
          Checkout
        </h1>

        {error && (
          <div className="flex items-center space-x-2.5 p-4 bg-red-950/40 border border-red-800/30 text-red-400 rounded-2xl text-sm mb-6 max-w-3xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Forms */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. SHIPPING FORM */}
            <div className="glass-panel border border-white/5 rounded-2xl p-6 sm:p-8 space-y-5">
              <div className="flex items-center space-x-2 text-primary-400 border-b border-white/5 pb-3">
                <MapPin className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Shipping Address</h3>
              </div>

              <div className="space-y-4">
                
                {/* Street Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-dark-200 uppercase tracking-widest pl-0.5">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="block w-full px-4 py-3 glass-input rounded-xl text-sm"
                    placeholder="123 Developer Lane"
                    disabled={submitting}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* City */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-dark-200 uppercase tracking-widest pl-0.5">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="block w-full px-4 py-3 glass-input rounded-xl text-sm"
                      placeholder="Silicon Valley"
                      disabled={submitting}
                    />
                  </div>

                  {/* Zip */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-dark-200 uppercase tracking-widest pl-0.5">
                      Postal / ZIP Code
                    </label>
                    <input
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="block w-full px-4 py-3 glass-input rounded-xl text-sm"
                      placeholder="94025"
                      disabled={submitting}
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* 2. PAYMENT METHODS */}
            <div className="glass-panel border border-white/5 rounded-2xl p-6 sm:p-8 space-y-5">
              <div className="flex items-center space-x-2 text-primary-400 border-b border-white/5 pb-3">
                <CreditCard className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Payment Method</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['Credit Card', 'PayPal', 'Cash on Delivery'].map((method) => (
                  <label
                    key={method}
                    className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer select-none transition ${
                      paymentMethod === method
                        ? 'border-primary-500 bg-primary-950/20 text-white'
                        : 'border-white/5 bg-dark-800/40 hover:bg-white/5 text-dark-200 hover:text-white'
                    }`}
                  >
                    <span className="text-sm font-semibold">{method}</span>
                    <input
                      type="radio"
                      name="payment_opt"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      className="accent-primary-500 h-4 w-4"
                      disabled={submitting}
                    />
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Checkout Items Recaps */}
          <div className="glass-panel border border-white/5 rounded-2xl p-6 space-y-6">
            <h3 className="font-extrabold text-base text-white border-b border-white/5 pb-3">
              Order Breakdown
            </h3>

            {/* Small list */}
            <div className="max-h-[160px] overflow-y-auto space-y-3.5 divide-y divide-white/5 pr-1">
              {cart.map((item) => (
                <div key={item.product_id} className="flex justify-between items-center text-xs pt-3 first:pt-0">
                  <div className="max-w-[70%] text-left">
                    <div className="font-bold text-white truncate">{item.name}</div>
                    <div className="text-dark-300 mt-0.5">Qty: {item.quantity}</div>
                  </div>
                  <span className="font-semibold text-white">
                    ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing math */}
            <div className="border-t border-white/5 pt-4 space-y-2.5 text-xs text-dark-200">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (8%)</span>
                <span>₹{taxFee.toFixed(2)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-baseline border-t border-white/5 pt-4">
              <span className="text-sm font-bold text-white">Total Amount</span>
              <span className="text-xl font-extrabold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                ₹{finalTotal.toFixed(2)}
              </span>
            </div>

            {/* CTA */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center space-x-2 py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white font-bold rounded-xl shadow-lg transition disabled:opacity-50 active:scale-[0.98]"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>{submitting ? 'Placing Order...' : 'Confirm & Place Order'}</span>
            </button>

          </div>

        </form>

      </div>
    </div>
  );
};

export default Checkout;
