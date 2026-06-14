import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Link2, 
  MousePointerClick, 
  CheckCircle2, 
  QrCode, 
  TrendingUp, 
  ArrowUpRight,
  RefreshCw,
  Compass,
  Monitor,
  Plus
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { motion } from 'framer-motion';

const DashboardOverview = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOverview = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) setRefreshing(true);
      else setLoading(true);

      const res = await api.get('/api/urls/overview/analytics');
      setData(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard overview:', err);
      setError('Failed to load dashboard overview data. Please seed the database or create links.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div class="space-y-8 animate-pulse text-left">
        {/* Header Skeleton */}
        <div class="flex justify-between items-center">
          <div class="space-y-2">
            <div class="h-8 w-48 bg-slate-200 rounded-xl"></div>
            <div class="h-4 w-72 bg-slate-100 rounded-lg"></div>
          </div>
          <div class="h-10 w-24 bg-slate-200 rounded-xl"></div>
        </div>

        {/* Stats Grid Skeleton */}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} class="h-28 bg-white border border-borderMain rounded-3xl p-6 space-y-3">
              <div class="flex justify-between">
                <div class="h-4 w-20 bg-slate-100 rounded"></div>
                <div class="h-6 w-6 bg-slate-200 rounded-lg"></div>
              </div>
              <div class="h-8 w-24 bg-slate-200 rounded-xl"></div>
            </div>
          ))}
        </div>

        {/* Charts Grid Skeleton */}
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 h-96 bg-white border border-borderMain rounded-3xl p-6">
            <div class="h-6 w-36 bg-slate-100 rounded mb-6"></div>
            <div class="h-64 bg-slate-50 rounded-2xl"></div>
          </div>
          <div class="h-96 bg-white border border-borderMain rounded-3xl p-6">
            <div class="h-6 w-36 bg-slate-100 rounded mb-6"></div>
            <div class="h-64 bg-slate-50 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div class="text-center py-16 space-y-4 max-w-md mx-auto">
        <div class="bg-rose-50 border border-rose-100 text-rose-800 p-6 rounded-3xl space-y-2">
          <h3 class="text-lg font-bold">Failed to Load Dashboard</h3>
          <p class="text-xs leading-relaxed">{error}</p>
        </div>
        <div class="flex items-center justify-center space-x-3">
          <button 
            onClick={() => fetchOverview()} 
            class="flex items-center space-x-2 bg-primary text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md hover:bg-primary/95 transition-all"
          >
            <RefreshCw class="h-3.5 w-3.5" />
            <span>Try Again</span>
          </button>
          <button
            onClick={() => navigate('/dashboard/links')}
            class="bg-slate-100 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl border border-borderMain hover:bg-slate-200 transition-all"
          >
            Create Your First Link
          </button>
        </div>
      </div>
    );
  }

  const { summary, clickTrends, browserBreakdown, deviceBreakdown, recentActivity } = data;

  const cards = [
    {
      title: 'Total Links',
      value: summary.totalLinks,
      icon: Link2,
      color: 'text-blue-500 bg-blue-50 border-blue-100/30',
      desc: 'Short codes registered',
    },
    {
      title: 'Total Clicks',
      value: summary.totalClicks,
      icon: MousePointerClick,
      color: 'text-indigo-500 bg-indigo-50 border-indigo-100/30',
      desc: 'Server-side redirects',
    },
    {
      title: 'Active Links',
      value: summary.activeLinks,
      icon: CheckCircle2,
      color: 'text-emerald-500 bg-emerald-50 border-emerald-100/30',
      desc: 'Available destinations',
    },
    {
      title: 'QR Code Scans',
      value: summary.qrScans,
      icon: QrCode,
      color: 'text-amber-500 bg-amber-50 border-amber-100/30',
      desc: 'Simulated QR requests',
    },
  ];

  // Pie colors matching theme
  const PIE_COLORS = ['#3B82F6', '#6366F1', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

  return (
    <div class="space-y-8 text-left">
      
      {/* Header */}
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 class="text-3xl font-extrabold text-textMain tracking-tight">Dashboard Overview</h2>
          <p class="text-textSub text-sm mt-1">Shorten, track and monitor your link analytics in real-time.</p>
        </div>
        
        <div class="flex items-center space-x-3">
          <button
            onClick={() => fetchOverview(true)}
            disabled={refreshing}
            class="p-2.5 border border-borderMain bg-white text-slate-600 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center"
            title="Refresh details"
          >
            <RefreshCw class={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/dashboard/links')}
            class="flex items-center space-x-2 bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all"
          >
            <Plus class="h-4 w-4" />
            <span>Create Link</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              class="bg-white border border-borderMain rounded-3xl p-6 shadow-premium hover:shadow-premiumHover transition-all flex flex-col justify-between group"
            >
              <div class="flex justify-between items-start">
                <span class="text-xs font-semibold text-textSub uppercase tracking-wider">{card.title}</span>
                <div class={`p-2.5 rounded-xl border ${card.color} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon class="h-4 w-4" />
                </div>
              </div>
              <div class="mt-4">
                <p class="text-3xl font-bold text-textMain">{card.value.toLocaleString()}</p>
                <p class="text-[11px] text-textSub mt-1">{card.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Click Trend Area Chart */}
        <div class="lg:col-span-2 bg-white border border-borderMain rounded-3xl p-6 shadow-premium">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-base font-bold text-textMain">Clicks Over Time</h3>
              <p class="text-xs text-textSub">Visitor click frequencies for the last 7 days</p>
            </div>
            <div class="flex items-center space-x-1 text-xs text-emerald-500 font-bold bg-emerald-50 px-2.5 py-1 rounded-xl">
              <TrendingUp class="h-3.5 w-3.5" />
              <span>Real-Time</span>
            </div>
          </div>

          <div class="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={clickTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 10, fill: '#6B7280' }} 
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 10, fill: '#6B7280' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    background: '#FFFFFF', 
                    border: '1px solid #E5E7EB', 
                    borderRadius: '16px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                    fontSize: '12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="clicks" 
                  stroke="#3B82F6" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorClicks)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Browser breakdown donut */}
        <div class="bg-white border border-borderMain rounded-3xl p-6 shadow-premium flex flex-col justify-between">
          <div>
            <h3 class="text-base font-bold text-textMain">Browser Breakdown</h3>
            <p class="text-xs text-textSub">Audience browser footprint distributions</p>
          </div>

          <div class="h-56 w-full relative flex items-center justify-center my-4">
            {browserBreakdown.length === 0 ? (
              <div class="text-slate-400 text-xs text-center flex flex-col items-center">
                <Compass class="h-8 w-8 text-slate-300 mb-2" />
                <span>No browser details logged yet</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={browserBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {browserBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ 
                      background: '#FFFFFF', 
                      border: '1px solid #E5E7EB', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                      fontSize: '11px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Browser list legend */}
          <div class="grid grid-cols-2 gap-2 text-xs">
            {browserBreakdown.slice(0, 4).map((entry, idx) => (
              <div key={idx} class="flex items-center space-x-2">
                <span 
                  class="w-2.5 h-2.5 rounded-full shrink-0" 
                  style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                ></span>
                <span class="truncate text-slate-700 font-medium">{entry.name}</span>
                <span class="text-slate-400">({entry.value})</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Activity Table */}
      <div class="bg-white border border-borderMain rounded-3xl p-6 shadow-premium overflow-hidden">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-base font-bold text-textMain">Recent Activity</h3>
            <p class="text-xs text-textSub">Recent shortened link visits recorded on the server</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard/links')}
            class="text-xs font-semibold text-primary hover:underline flex items-center space-x-1"
          >
            <span>Manage All Links</span>
            <ArrowUpRight class="h-3.5 w-3.5" />
          </button>
        </div>

        {recentActivity.length === 0 ? (
          <div class="text-center py-12 text-slate-400 text-sm">
            <Monitor class="h-8 w-8 mx-auto text-slate-300 mb-2" />
            <p>No activity recorded yet. Visited shortened URLs will appear here.</p>
          </div>
        ) : (
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="border-b border-borderMain pb-2 text-slate-400 font-semibold uppercase tracking-wider">
                  <th class="py-3 pr-4">Timestamp</th>
                  <th class="py-3 px-4">Visitor IP</th>
                  <th class="py-3 px-4">Device</th>
                  <th class="py-3 px-4">Browser</th>
                  <th class="py-3 px-4">OS</th>
                  <th class="py-3 pl-4">Referrer</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
                {recentActivity.map((log, idx) => (
                  <tr key={idx} class="hover:bg-slate-50/50 transition-colors">
                    <td class="py-3.5 pr-4 text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td class="py-3.5 px-4 font-mono font-semibold text-slate-800">{log.ip}</td>
                    <td class="py-3.5 px-4">{log.device}</td>
                    <td class="py-3.5 px-4">{log.browser}</td>
                    <td class="py-3.5 px-4">{log.os}</td>
                    <td class="py-3.5 pl-4 text-slate-500 truncate max-w-[120px]">{log.referer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default DashboardOverview;
