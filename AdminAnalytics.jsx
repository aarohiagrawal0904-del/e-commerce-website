import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../utils/api';
import { BarChart3, LineChart as LucideLine, Sparkles, TrendingUp, RefreshCw, Layers, Award } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // AI Brief states
  const [aiInsights, setAiInsights] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/analytics');
      if (res.data.success) {
        setData(res.data.analytics);
      }
    } catch (err) {
      console.error('Failed to load sales analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleFetchAiInsights = async () => {
    setAiLoading(true);
    setAiInsights('');
    try {
      const res = await api.post('/api/ai/sales-insights');
      if (res.data.success) {
        setAiInsights(res.data.insights);
      }
    } catch (err) {
      console.error('Failed to generate AI insights:', err);
      alert('Could not resolve business brief. Verify GEMINI_API_KEY.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-left">
      <Sidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-8 overflow-y-auto">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Sales Analytics</h1>
            <p className="text-xs text-dark-300 mt-1">Review revenue curves, best sellers, and consult the Gemini Sales Advisor for marketing feedback.</p>
          </div>

          <button
            onClick={fetchAnalytics}
            className="flex items-center space-x-1.5 px-4 py-2 border border-white/5 bg-dark-800 hover:bg-white/5 text-dark-200 hover:text-white rounded-xl text-xs font-semibold transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh logs</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* 1. CHART CONTAINER AREA */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Monthly Revenues graph (recharts) */}
              <div className="lg:col-span-2 glass-panel border border-white/5 rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-2 text-purple-400 pl-1">
                  <TrendingUp className="w-5 h-5 animate-pulse" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Revenue Curve (YTD)</h3>
                </div>

                <div className="w-full h-[280px] text-xs pt-4 font-mono select-none">
                  {data.monthlySales.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-dark-300 italic">No sales logs recorded this year</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.monthlySales}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f73ff" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#4f73ff" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" />
                        <YAxis stroke="rgba(255,255,255,0.4)" />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'rgba(20,20,30,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}
                          labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#4f73ff" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Category Contribution (recharts) */}
              <div className="glass-panel border border-white/5 rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-2 text-purple-400 pl-1">
                  <Layers className="w-5 h-5" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Category revenues</h3>
                </div>

                <div className="w-full h-[280px] text-xs pt-4 font-mono select-none">
                  {data.categoryRevenue.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-dark-300 italic">No categories logged</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.categoryRevenue}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="categoryName" stroke="rgba(255,255,255,0.4)" />
                        <YAxis stroke="rgba(255,255,255,0.4)" />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'rgba(20,20,30,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px' }}
                        />
                        <Bar dataKey="revenue" fill="#a855f7" radius={[5, 5, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

            </div>

            {/* 2. REVENUE TABLES & BEST SELLERS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Best Sellers table */}
              <div className="glass-panel border border-white/5 rounded-2xl p-6">
                <div className="flex items-center space-x-2 text-purple-400 pl-1 mb-6">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Top Selling products</h3>
                </div>

                <div className="overflow-x-auto text-xs">
                  {data.bestSellers.length === 0 ? (
                    <div className="p-8 text-center text-dark-300 italic">No products sold yet</div>
                  ) : (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/5 text-dark-300 uppercase tracking-widest font-bold">
                          <th className="py-2.5 px-3 pl-1">Product Title</th>
                          <th className="py-2.5 px-3 text-center">Units Sold</th>
                          <th className="py-2.5 px-3 text-right pr-1">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-dark-200">
                        {data.bestSellers.map((item) => (
                          <tr key={item.name} className="hover:bg-white/[0.01]">
                            <td className="py-3.5 px-3 pl-1 font-bold text-white">{item.name}</td>
                            <td className="py-3.5 px-3 text-center font-semibold text-white">{item.unitsSold} units</td>
                            <td className="py-3.5 px-3 text-right pr-1 font-bold text-white">₹{item.revenue.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* DYNAMIC GEMINI SALES ADVISOR PANEL! */}
              <div className="glass-panel border border-white/5 rounded-2xl p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4 text-left">
                  <div className="flex items-center space-x-2 text-primary-400 pl-1 border-b border-white/5 pb-3 justify-between">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Gemini Sales Advisor</h3>
                    </div>
                    
                    <span className="text-[9px] px-2 py-0.5 bg-primary-950/40 border border-primary-500/20 text-primary-300 rounded font-semibold uppercase tracking-wider">
                      Consulting Model
                    </span>
                  </div>

                  <p className="text-xs text-dark-300 leading-normal font-light">
                    Initiate our custom analytical intelligence model. Gemini will audit active orders, best sellers, and seasonal growth coefficients to output actionable operational advice.
                  </p>

                  {/* AI Response markdown viewer */}
                  {aiLoading ? (
                    <div className="py-8 flex justify-center">
                      <LoadingSpinner size="md" />
                    </div>
                  ) : aiInsights ? (
                    <div className="p-4 bg-dark-900/60 border border-white/5 rounded-xl max-h-[220px] overflow-y-auto text-xs text-dark-100 text-left leading-relaxed font-mono whitespace-pre-wrap select-text">
                      {aiInsights}
                    </div>
                  ) : (
                    <div className="p-8 border border-dashed border-white/10 rounded-xl text-center text-xs text-dark-300 italic">
                      Click the trigger below to load AI Insights Brief.
                    </div>
                  )}
                </div>

                <button
                  onClick={handleFetchAiInsights}
                  disabled={aiLoading}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white font-bold rounded-xl shadow transition duration-200 disabled:opacity-50 active:scale-95 text-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{aiLoading ? 'Auditing numbers...' : '✨ Generate AI Business Brief'}</span>
                </button>

              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
};

export default AdminAnalytics;
