import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { User, Mail, Calendar, ShieldAlert, LogOut, Package, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({ orderCount: 0, spending: 0.00 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;
      
      try {
        const res = await api.get('/api/orders');
        if (res.data.success) {
          const activeOrders = res.data.orders.filter(o => o.status !== 'cancelled');
          const spending = activeOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
          setStats({
            orderCount: res.data.orders.length,
            spending
          });
        }
      } catch (err) {
        console.error('Failed to resolve profile stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserStats();
  }, [user]);

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-panel rounded-2xl p-8 text-center text-dark-300">
          User is currently unauthenticated. Please sign in!
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 relative text-left">
      <div className="glow-orb glow-purple top-1/4 left-1/3" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title */}
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-8">
          My Profile
        </h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="md" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            
            {/* Left: General Info Card */}
            <div className="md:col-span-2 glass-panel border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center space-x-4 border-b border-white/5 pb-4">
                <div className="p-4 bg-primary-500/10 text-primary-400 rounded-2xl">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{user.name}</h2>
                  <span className={`inline-block px-2.5 py-0.5 mt-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    user.role === 'admin'
                      ? 'bg-purple-950/40 border border-purple-800/30 text-purple-300'
                      : 'bg-primary-950/40 border border-primary-800/30 text-primary-300'
                  }`}>
                    {user.role} Privilege
                  </span>
                </div>
              </div>

              {/* Data fields */}
              <div className="space-y-4 text-sm">
                
                <div className="flex items-center space-x-3 text-dark-100">
                  <Mail className="w-5 h-5 text-dark-300 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] text-dark-400 font-semibold uppercase tracking-wider">Email Address</div>
                    <div className="font-medium mt-0.5">{user.email}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-dark-100">
                  <Calendar className="w-5 h-5 text-dark-300 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] text-dark-400 font-semibold uppercase tracking-wider">Joined Date</div>
                    <div className="font-medium mt-0.5">{new Date(user.created_at).toLocaleDateString()}</div>
                  </div>
                </div>

                {user.role === 'admin' && (
                  <div className="flex items-start space-x-3 text-purple-400 p-3 bg-purple-950/20 border border-purple-800/20 rounded-xl">
                    <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="text-xs leading-normal">
                      <h4 className="font-bold">Administrative Mode Active</h4>
                      <p className="mt-0.5 font-light">You hold administrative permissions to adjust stock metrics, modify product listings, and synchronize deliveries.</p>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Right: Quick stats & Action */}
            <div className="space-y-6">
              
              {/* Stats card */}
              <div className="glass-panel border border-white/5 rounded-3xl p-6 space-y-4">
                <h3 className="font-bold text-sm text-white uppercase tracking-wider border-b border-white/5 pb-2">
                  Shopping Overview
                </h3>

                <div className="space-y-3.5">
                  <div className="flex items-center space-x-3 text-xs">
                    <div className="p-2 bg-primary-500/10 text-primary-400 rounded-lg">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] text-dark-400 uppercase tracking-widest">Total Orders</div>
                      <div className="font-bold text-sm text-white mt-0.5">{stats.orderCount} order(s)</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <div className="p-2 bg-green-500/10 text-green-400 rounded-lg">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] text-dark-400 uppercase tracking-widest">Net Spending</div>
                      <div className="font-bold text-sm text-white mt-0.5">₹{stats.spending.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center justify-center space-x-2 py-3.5 border border-red-950 hover:bg-red-950/20 text-red-400 font-bold rounded-2xl transition active:scale-95 text-sm"
              >
                <LogOut className="w-4.5 h-4.5" />
                <span>Disconnect Session</span>
              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;
