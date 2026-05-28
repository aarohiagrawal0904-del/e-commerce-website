import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../utils/api';
import { Calendar, User, DollarSign, RefreshCw, Truck, CheckSquare, Search } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/orders');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/api/admin/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        alert(res.data.message);
        fetchAllOrders(); // reload
      }
    } catch (err) {
      console.error('Failed to change order status:', err);
      alert('Could not update order status. Check logs.');
    }
  };

  // Badges color mapping
  const statusBadges = {
    pending: 'bg-yellow-950/40 text-yellow-400 border border-yellow-900/30',
    processing: 'bg-blue-950/40 text-blue-400 border border-blue-900/30',
    shipped: 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/30',
    delivered: 'bg-green-950/40 text-green-400 border border-green-900/30',
    cancelled: 'bg-red-950/40 text-red-400 border border-red-900/30'
  };

  const deliveryBadges = {
    pending: 'text-yellow-400',
    in_transit: 'text-indigo-400',
    out_for_delivery: 'text-purple-400',
    delivered: 'text-green-400',
    failed: 'text-red-400'
  };

  // Filter logic
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.user_name.toLowerCase().includes(search.toLowerCase()) ||
      o.user_email.toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search) ||
      (o.tracking_number && o.tracking_number.toLowerCase().includes(search.toLowerCase()));
      
    const matchesStatus = filterStatus === '' ? true : o.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen flex text-left">
      <Sidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-8 overflow-y-auto">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Manage Orders</h1>
            <p className="text-xs text-dark-300 mt-1">Review user purchases, allocate carrier trackings, update statuses, and trigger cancellations.</p>
          </div>
          
          <button
            onClick={fetchAllOrders}
            className="flex items-center space-x-1 px-4 py-2 border border-white/5 bg-dark-800 hover:bg-white/5 text-dark-200 hover:text-white rounded-xl text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload database</span>
          </button>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="glass-panel border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Search bar */}
          <div className="relative flex-1 max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark-300">
              <Search className="w-4.5 h-4.5" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-xs"
              placeholder="Search by ID, customer name, email, or tracking number..."
            />
          </div>

          {/* Quick status dropdown */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3.5 py-2.5 bg-dark-800 border border-white/5 text-dark-100 rounded-xl text-xs w-full sm:w-auto"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

        </div>

        {/* ORDERS TABLE */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="glass-panel border border-white/5 rounded-2xl p-12 text-center text-dark-300">
            No orders found matching your search parameters. Expand your search query!
          </div>
        ) : (
          <div className="glass-panel border border-white/5 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-dark-300 uppercase tracking-wider font-bold">
                    <th className="py-3.5 px-4 pl-5">Order ID</th>
                    <th className="py-3.5 px-4">Consumer Details</th>
                    <th className="py-3.5 px-4">Total Amount</th>
                    <th className="py-3.5 px-4">Shipment Details</th>
                    <th className="py-3.5 px-4">Timeline Status</th>
                    <th className="py-3.5 px-4 text-right pr-5">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-dark-100">
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-white/[0.01] transition-colors">
                      
                      {/* ID */}
                      <td className="py-4 px-4 pl-5 font-extrabold text-white">#{o.id}</td>
                      
                      {/* Consumer */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1.5">
                          <User className="w-3.5 h-3.5 text-primary-400" />
                          <span className="font-bold text-white">{o.user_name}</span>
                        </div>
                        <div className="text-[10px] text-dark-300 mt-0.5">{o.user_email}</div>
                      </td>

                      {/* Total */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-3.5 h-3.5 text-green-400" />
                          <span className="font-extrabold text-white">₹{parseFloat(o.total_amount).toFixed(2)}</span>
                        </div>
                        <div className="text-[9px] text-green-400 mt-0.5 uppercase font-medium">{o.payment_status}</div>
                      </td>

                      {/* Shipment */}
                      <td className="py-4 px-4">
                        {o.tracking_number ? (
                          <>
                            <div className="font-mono text-[10px] uppercase text-white font-bold">{o.tracking_number}</div>
                            <div className="text-[10px] text-dark-300 mt-0.5 flex items-center space-x-1">
                              <Truck className="w-3 h-3 text-indigo-400" />
                              <span>{o.carrier} ({o.delivery_status})</span>
                            </div>
                          </>
                        ) : (
                          <span className="text-dark-300 italic">No shipment logged</span>
                        )}
                      </td>

                      {/* Badges */}
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase ${statusBadges[o.status]}`}>
                          {o.status}
                        </span>
                      </td>

                      {/* Status Dropdowns */}
                      <td className="py-4 px-4 text-right pr-5">
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          className="px-2 py-1.5 bg-dark-800 border border-white/5 hover:border-purple-500/35 text-dark-100 rounded-lg text-xs cursor-pointer focus:outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminOrders;
