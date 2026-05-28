import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Calendar, Package, Eye, Truck, CheckCircle2, ChevronRight, AlertTriangle, ShieldCheck } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/orders');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleViewDetails = async (orderId) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/api/orders/${orderId}`);
      if (res.data.success) {
        setSelectedOrder(res.data.order);
      }
    } catch (err) {
      console.error('Failed to load order details:', err);
      alert('Could not fetch detailed order timelines.');
    } finally {
      setDetailLoading(false);
    }
  };

  // Helper mapping to color status badges
  const statusBadges = {
    pending: 'bg-yellow-950/40 border border-yellow-800/30 text-yellow-400',
    processing: 'bg-blue-950/40 border border-blue-800/30 text-blue-400',
    shipped: 'bg-indigo-950/40 border border-indigo-800/30 text-indigo-400',
    delivered: 'bg-green-950/40 border border-green-800/30 text-green-400',
    cancelled: 'bg-red-950/40 border border-red-800/30 text-red-400'
  };

  return (
    <div className="min-h-screen py-12 relative text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-8">
          Order History & Tracking
        </h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : orders.length === 0 ? (
          <div className="glass-panel border border-white/5 rounded-2xl p-12 text-center text-dark-300">
            You haven't placed any orders on your account yet. Fill your cart to start shopping!
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column: Orders list */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-lg font-bold text-white mb-2 pl-1">My Orders</h2>
              
              <div className="space-y-3">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    onClick={() => handleViewDetails(o.id)}
                    className={`glass-panel border rounded-2xl p-4 cursor-pointer text-left transition duration-200 ${
                      selectedOrder && selectedOrder.id === o.id
                        ? 'border-primary-500 bg-primary-950/20'
                        : 'border-white/5 bg-dark-800/40 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-sm text-white">Order #{o.id}</span>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${statusBadges[o.status] || ''}`}>
                        {o.status}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 mt-3 text-xs text-dark-200">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(o.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Package className="w-3.5 h-3.5" />
                        <span>{o.total_items} item(s)</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-baseline mt-4 border-t border-white/5 pt-3">
                      <span className="text-[10px] text-dark-400 uppercase tracking-widest">Total Bill</span>
                      <span className="font-bold text-sm text-white">₹{parseFloat(o.total_amount).toFixed(2)}</span>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Tracking Timeline and Details */}
            <div className="lg:col-span-2 space-y-6">
              
              {detailLoading ? (
                <div className="glass-panel border border-white/5 rounded-2xl p-16 flex items-center justify-center">
                  <LoadingSpinner size="md" />
                </div>
              ) : selectedOrder ? (
                /* ORDER DETAIL SHIELD */
                <div className="glass-panel border border-white/5 rounded-2xl p-6 sm:p-8 space-y-8 animate-slide-up">
                  
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-2">
                    <div>
                      <h2 className="text-lg font-black text-white">Order Details - #{selectedOrder.id}</h2>
                      <p className="text-xs text-dark-300 mt-1">Placed on {new Date(selectedOrder.created_at).toLocaleString()}</p>
                    </div>

                    <div className="flex items-center space-x-2 text-xs">
                      <span className="font-bold text-dark-300">Payment:</span>
                      <span className="px-2 py-0.5 bg-green-950/40 border border-green-800/30 text-green-400 rounded-md font-semibold">
                        {selectedOrder.payment_status}
                      </span>
                    </div>
                  </div>

                  {/* 1. DYNAMIC TRACKING TIMELINE */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider pl-1 flex items-center space-x-1.5">
                      <Truck className="w-4 h-4 text-primary-400" />
                      <span>Live Delivery Timeline</span>
                    </h3>

                    {selectedOrder.status === 'cancelled' ? (
                      /* Cancelled Alert */
                      <div className="flex items-start space-x-3 p-4 bg-red-950/30 border border-red-800/30 text-red-400 rounded-xl">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-left leading-normal">
                          <h4 className="font-bold">Transaction Refunded</h4>
                          <p className="mt-0.5">This transaction has been successfully rolled back. Cancelled orders are returned to warehouse inventory pools.</p>
                        </div>
                      </div>
                    ) : (
                      /* Active Steps */
                      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/5">
                        
                        {/* Step 1: Pending */}
                        <div className="relative flex items-start space-x-3 text-xs">
                          <CheckCircle2 className="w-4.5 h-4.5 text-green-500 absolute -left-[23px] bg-dark-900 rounded-full" />
                          <div className="text-left">
                            <h4 className="font-bold text-white">Order Received & Approved</h4>
                            <p className="text-dark-300 mt-0.5">Transaction logged, items allocated in database.</p>
                          </div>
                        </div>

                        {/* Step 2: Processing */}
                        <div className="relative flex items-start space-x-3 text-xs">
                          <CheckCircle2 className={`w-4.5 h-4.5 absolute -left-[23px] bg-dark-900 rounded-full ${
                            ['processing', 'shipped', 'delivered'].includes(selectedOrder.status)
                              ? 'text-green-500'
                              : 'text-dark-400 border border-white/10'
                          }`} />
                          <div className="text-left">
                            <h4 className={`font-bold ${['processing', 'shipped', 'delivered'].includes(selectedOrder.status) ? 'text-white' : 'text-dark-300'}`}>
                              In Packaging Pipeline
                            </h4>
                            <p className="text-dark-300 mt-0.5">Products are packed, carrier tracking slips printed.</p>
                          </div>
                        </div>

                        {/* Step 3: Shipped */}
                        <div className="relative flex items-start space-x-3 text-xs">
                          <CheckCircle2 className={`w-4.5 h-4.5 absolute -left-[23px] bg-dark-900 rounded-full ${
                            ['shipped', 'delivered'].includes(selectedOrder.status)
                              ? 'text-green-500'
                              : 'text-dark-400 border border-white/10'
                          }`} />
                          <div className="text-left">
                            <h4 className={`font-bold ${['shipped', 'delivered'].includes(selectedOrder.status) ? 'text-white' : 'text-dark-300'}`}>
                              Dispatched from Hub
                            </h4>
                            <p className="text-dark-300 mt-0.5">
                              Shipment assigned to {selectedOrder.delivery?.carrier || 'FedEx'}.
                            </p>
                            {selectedOrder.delivery?.tracking_number && (
                              <div className="mt-1.5 px-3 py-1 bg-white/5 border border-white/5 text-dark-200 rounded font-mono text-[10px] inline-block uppercase">
                                Tracking: {selectedOrder.delivery.tracking_number}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Step 4: Delivered */}
                        <div className="relative flex items-start space-x-3 text-xs">
                          <CheckCircle2 className={`w-4.5 h-4.5 absolute -left-[23px] bg-dark-900 rounded-full ${
                            selectedOrder.status === 'delivered'
                              ? 'text-green-500'
                              : 'text-dark-400 border border-white/10'
                          }`} />
                          <div className="text-left">
                            <h4 className={`font-bold ${selectedOrder.status === 'delivered' ? 'text-white' : 'text-dark-300'}`}>
                              Delivered
                            </h4>
                            {selectedOrder.status === 'delivered' ? (
                              <p className="text-green-400 mt-0.5 font-medium">
                                Package signed. Actual delivery: {new Date(selectedOrder.delivery.actual_delivery).toLocaleDateString()}
                              </p>
                            ) : (
                              <p className="text-dark-300 mt-0.5">
                                Estimated arrival: {new Date(selectedOrder.delivery?.estimated_delivery).toLocaleDateString() || 'N/A'}
                              </p>
                            )}
                          </div>
                        </div>

                      </div>
                    )}

                  </div>

                  {/* 2. ORDERED ITEMS TABLE */}
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider pl-1 flex items-center space-x-1.5">
                      <Package className="w-4 h-4 text-primary-400" />
                      <span>Items Breakdown</span>
                    </h3>

                    <div className="glass-panel border border-white/5 rounded-xl divide-y divide-white/5">
                      {selectedOrder.items?.map((item) => (
                        <div key={item.id} className="p-4 flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-3 flex-1 max-w-[70%]">
                            <img src={item.image_url} alt={item.name} className="w-10 h-10 object-cover rounded bg-dark-950 border border-white/5" />
                            <div className="truncate text-left">
                              <div className="font-bold text-white truncate">{item.name}</div>
                              <div className="text-dark-300 mt-0.5">Qty: {item.quantity} x ₹{parseFloat(item.price).toFixed(2)}</div>
                            </div>
                          </div>
                          
                          <span className="font-bold text-white">
                            ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. SHIPPING BRIEF */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/5 text-xs text-left">
                    <div className="space-y-2">
                      <h4 className="font-bold text-dark-300 uppercase tracking-widest">Delivery Address</h4>
                      <p className="text-dark-100 font-light leading-normal">{selectedOrder.shipping_address}</p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-dark-300 uppercase tracking-widest">Billing Method</h4>
                      <p className="text-dark-100 font-light leading-normal flex items-center space-x-1.5">
                        <ShieldCheck className="w-4 h-4 text-green-400" />
                        <span>{selectedOrder.payment?.payment_method || 'Credit Card'}</span>
                      </p>
                    </div>
                  </div>

                </div>
              ) : (
                /* Select Order Placeholder */
                <div className="glass-panel border border-white/5 rounded-2xl p-16 text-center text-dark-300 flex flex-col items-center justify-center space-y-4">
                  <Eye className="w-12 h-12 text-dark-400" />
                  <p className="text-sm max-w-sm">Select an active order from the left panel to inspect detailed shipping timelines and tracking details.</p>
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Orders;
