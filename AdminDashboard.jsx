import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../utils/api';
import { Users, ShoppingCart, DollarSign, ArrowRight, Eye, Calendar, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/admin/stats');
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statusBadges = {
    pending: 'bg-yellow-950/40 text-yellow-400 border border-yellow-900/30',
    processing: 'bg-blue-950/40 text-blue-400 border border-blue-900/30',
    shipped: 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/30',
    delivered: 'bg-green-950/40 text-green-400 border border-green-900/30',
    cancelled: 'bg-red-950/40 text-red-400 border border-red-900/30'
  };

  return (
    <div className="min-h-screen flex text-left">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main content body */}
      <main className="flex-1 p-6 sm:p-8 space-y-8 overflow-y-auto">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Overview</h1>
            <p className="text-xs text-dark-300 mt-1">Real-time indicators of e-commerce databases and server logs.</p>
          </div>
          
          <div className="text-xs font-semibold text-primary-400 bg-primary-950/20 px-3 py-1.5 border border-primary-500/20 rounded-lg flex items-center space-x-1.5 self-start">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>Live Server Link Verified</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              {/* Card 1: Users */}
              <div className="glass-panel border border-white/5 rounded-2xl p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-dark-300 uppercase tracking-widest">Total Consumers</span>
                  <div className="text-2xl font-black text-white mt-1">{stats.totalUsers}</div>
                </div>
                <div className="p-3 bg-primary-500/10 text-primary-400 rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              {/* Card 2: Orders */}
              <div className="glass-panel border border-white/5 rounded-2xl p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-dark-300 uppercase tracking-widest">Transactions Logged</span>
                  <div className="text-2xl font-black text-white mt-1">{stats.totalOrders}</div>
                </div>
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                  <ShoppingCart className="w-6 h-6" />
                </div>
              </div>

              {/* Card 3: Revenue */}
              <div className="glass-panel border border-white/5 rounded-2xl p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-dark-300 uppercase tracking-widest">Accumulated Revenue</span>
                  <div className="text-2xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mt-1">
                    ₹{stats.totalRevenue.toFixed(2)}
                  </div>
                </div>
                <div className="p-3 bg-green-500/10 text-green-400 rounded-xl">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

            </div>

            {/* RECENT ORDERS TABLE */}
            <div className="glass-panel border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-white uppercase tracking-wider pl-1 flex items-center space-x-1.5">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  <span>Recent Purchases</span>
                </h3>
                <Link
                  to="/admin/orders"
                  className="text-xs font-bold text-purple-300 hover:text-white flex items-center space-x-1 group"
                >
                  <span>Moderate all</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-dark-300 uppercase tracking-wider font-bold">
                      <th className="py-3 px-4 pl-1">Order ID</th>
                      <th className="py-3 px-4">Consumer</th>
                      <th className="py-3 px-4">Total Bill</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right pr-1">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {stats.recentOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="py-4 px-4 pl-1 font-bold text-white">#{o.id}</td>
                        <td className="py-4 px-4 flex items-center space-x-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-primary-400" />
                          <span className="font-medium">{o.user_name}</span>
                        </td>
                        <td className="py-4 px-4 font-bold text-white">₹{parseFloat(o.total_amount).toFixed(2)}</td>
                        <td className="py-4 px-4 text-dark-200">{new Date(o.created_at).toLocaleDateString()}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${statusBadges[o.status]}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right pr-1">
                          <Link
                            to="/admin/orders"
                            className="p-1.5 bg-dark-800 border border-white/5 text-dark-200 hover:text-white rounded-lg inline-flex items-center"
                            title="Inspect Order"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;
