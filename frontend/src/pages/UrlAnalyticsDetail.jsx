import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { 
  ArrowLeft, 
  MousePointerClick, 
  Calendar, 
  ExternalLink,
  Copy,
  Check,
  QrCode,
  Compass,
  Monitor,
  Activity,
  Network,
  Share2,
  Lock,
  Globe
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
  BarChart,
  Bar,
  CartesianGrid
} from 'recharts';
import { motion } from 'framer-motion';

const UrlAnalyticsDetail = () => {
  const { id, shortCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isPublic = location.pathname.startsWith('/stats/');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      let res;
      if (isPublic) {
        // Find URL document by short code first to get its MongoDB ID
        // Wait! Our backend route is GET /api/urls/:id/analytics. If we have the shortCode, we can create a public endpoint or query by shortcode.
        // Let's check how the backend route is structured:
        // router.get('/:id/analytics', getUrlAnalytics) -> this uses req.params.id (which can be the MongoDB ID)
        // Wait, if we are on a public stats page, we only have 'shortCode'.
        // So we can let the backend support getting analytics by EITHER mongo _id or shortCode!
        // Let's verify our backend controller 'getUrlAnalytics':
        // const url = await Url.findById(req.params.id);
        // Oh! If the parameter is a shortCode (like 'hn'), Url.findById will fail because 'hn' is not a valid ObjectId!
        // To handle both seamlessly in the backend, we can write a quick fallback in 'getUrlAnalytics':
        // If mongoose.Types.ObjectId.isValid(req.params.id) -> findById, else findOne({ shortCode: req.params.id }).
        // Let's modify the controller to support this fallback. It will make the public stats route bulletproof!
        // But first let's see how the API call is constructed in this frontend page.
        // We'll call: `/api/urls/${id || shortCode}/analytics`.
        res = await api.get(`/api/urls/${id || shortCode}/analytics`);
      } else {
        res = await api.get(`/api/urls/${id}/analytics`);
      }
      setData(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load link analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [id, shortCode]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div class="space-y-8 animate-pulse text-left">
        <div class="h-10 w-24 bg-slate-200 rounded-xl"></div>
        <div class="h-32 bg-white border border-borderMain rounded-3xl p-6"></div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="h-80 bg-white border border-borderMain rounded-3xl"></div>
          <div class="h-80 bg-white border border-borderMain rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div class="max-w-md mx-auto text-center py-16 space-y-4">
        <div class="bg-rose-50 border border-rose-100 text-rose-800 p-6 rounded-3xl space-y-2">
          <Lock class="h-8 w-8 text-rose-500 mx-auto mb-2" />
          <h3 class="text-base font-bold">Analytics Access Restricted</h3>
          <p class="text-xs leading-relaxed">{error}</p>
        </div>
        {!isPublic && (
          <button 
            onClick={() => navigate('/dashboard/links')} 
            class="bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-900 transition-all"
          >
            Go Back
          </button>
        )}
      </div>
    );
  }

  const { urlDetails, summary, clickTrends, browserBreakdown, deviceBreakdown, osBreakdown, refererBreakdown, recentActivity } = data;
  const shortBase = `${window.location.protocol}//${window.location.host === 'localhost:5173' ? 'localhost:5000' : window.location.host}`;
  const shortUrl = `${shortBase}/${urlDetails.shortCode}`;

  const PIE_COLORS = ['#3B82F6', '#6366F1', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

  return (
    <div class="space-y-8 text-left max-w-6xl mx-auto">
      
      {/* Back to dashboard button (only in admin mode) */}
      {!isPublic && (
        <button
          onClick={() => navigate('/dashboard/links')}
          class="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft class="h-4 w-4" />
          <span>Back to links</span>
        </button>
      )}

      {/* Link Header details card */}
      <div class="bg-white border border-borderMain rounded-3xl p-6 shadow-premium relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        
        <div class="space-y-2 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="text-xl sm:text-2xl font-black text-slate-800 tracking-tight leading-tight">
              {urlDetails.title || 'Shortened URL Statistics'}
            </h2>
            <span class={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
              urlDetails.status === 'Active' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                : urlDetails.status === 'Broken'
                ? 'bg-rose-50 text-rose-700 border-rose-100'
                : urlDetails.status === 'Password Protected'
                ? 'bg-purple-50 text-purple-700 border-purple-100'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {urlDetails.status}
            </span>
          </div>

          {urlDetails.description && (
            <p class="text-xs text-textSub leading-relaxed max-w-2xl">{urlDetails.description}</p>
          )}

          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2 text-xs font-semibold">
            {/* Shortened URL */}
            <div class="flex items-center space-x-1">
              <span class="text-primary font-bold">{shortUrl}</span>
              <a href={shortUrl} target="_blank" rel="noreferrer" class="text-slate-400 hover:text-primary transition-colors">
                <ExternalLink class="h-3.5 w-3.5" />
              </a>
            </div>
            
            <span class="hidden sm:inline text-slate-300">|</span>
            
            {/* Original URL */}
            <a 
              href={urlDetails.originalUrl} 
              target="_blank" 
              rel="noreferrer" 
              class="text-slate-500 hover:text-primary transition-colors truncate max-w-[280px]"
            >
              Target: {urlDetails.originalUrl}
            </a>
          </div>
        </div>

        {/* Counters & Copy options */}
        <div class="flex items-center gap-4 shrink-0 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
          
          {/* Clicks */}
          <div class="text-left md:text-right">
            <span class="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Total Visits</span>
            <span class="text-3xl font-black text-slate-800 leading-tight">
              {summary.totalClicks.toLocaleString()}
            </span>
          </div>

          <div class="flex items-center space-x-1.5">
            <button
              onClick={() => handleCopy(shortUrl)}
              class={`p-2.5 rounded-xl border transition-all ${
                copied
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  : 'bg-slate-50 border-borderMain text-slate-500 hover:bg-slate-100'
              }`}
            >
              {copied ? <Check class="h-4 w-4" /> : <Copy class="h-4 w-4" />}
            </button>
            
            {/* Download QR button directly */}
            <a
              href={urlDetails.qrCode}
              download={`trimr_qr_${urlDetails.shortCode}.png`}
              class="p-2.5 bg-slate-50 border border-borderMain text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
              title="Download QR Code"
            >
              <QrCode class="h-4 w-4" />
            </a>
          </div>

        </div>

      </div>

      {/* Grid: Charts */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Click trends */}
        <div class="lg:col-span-2 bg-white border border-borderMain rounded-3xl p-6 shadow-premium">
          <div class="mb-4">
            <h3 class="text-base font-bold text-textMain">Clicks Timeline</h3>
            <p class="text-xs text-textSub">Clicks aggregated for the last 7 days</p>
          </div>
          
          <div class="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={clickTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTrendClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#FFFFFF', 
                    border: '1px solid #E5E7EB', 
                    borderRadius: '16px',
                    fontSize: '12px'
                  }} 
                />
                <Area type="monotone" dataKey="clicks" stroke="#6366F1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTrendClicks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Referrers */}
        <div class="bg-white border border-borderMain rounded-3xl p-6 shadow-premium flex flex-col justify-between">
          <div>
            <h3 class="text-base font-bold text-textMain">Referrer Channels</h3>
            <p class="text-xs text-textSub">Sources where clicks originated</p>
          </div>

          <div class="h-52 w-full flex items-center justify-center my-4">
            {refererBreakdown.length === 0 ? (
              <div class="text-xs text-slate-400">No referer data recorded</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={refererBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {refererBreakdown.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div class="grid grid-cols-2 gap-2 text-xs">
            {refererBreakdown.slice(0, 4).map((entry, idx) => (
              <div key={idx} class="flex items-center space-x-2">
                <span class="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></span>
                <span class="truncate text-slate-700 font-semibold">{entry.name}</span>
                <span class="text-slate-400">({entry.value})</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Systems specs row (Browser, OS, Device) */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Browsers */}
        <div class="bg-white border border-borderMain rounded-3xl p-6 shadow-premium">
          <h4 class="text-sm font-bold text-slate-800 mb-4 flex items-center space-x-2">
            <Compass class="h-4.5 w-4.5 text-blue-500" />
            <span>Browsers</span>
          </h4>
          <div class="space-y-3">
            {browserBreakdown.length === 0 ? (
              <p class="text-xs text-slate-400">No browser data</p>
            ) : (
              browserBreakdown.map((item, idx) => (
                <div key={idx} class="space-y-1 text-xs font-semibold text-slate-700">
                  <div class="flex justify-between">
                    <span>{item.name}</span>
                    <span>{item.value}</span>
                  </div>
                  <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${(item.value / summary.totalClicks) * 100}%` }}
                      class="bg-blue-500 h-full rounded-full"
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Operating Systems */}
        <div class="bg-white border border-borderMain rounded-3xl p-6 shadow-premium">
          <h4 class="text-sm font-bold text-slate-800 mb-4 flex items-center space-x-2">
            <Activity class="h-4.5 w-4.5 text-indigo-500" />
            <span>Operating Systems</span>
          </h4>
          <div class="space-y-3">
            {osBreakdown.length === 0 ? (
              <p class="text-xs text-slate-400">No OS data</p>
            ) : (
              osBreakdown.map((item, idx) => (
                <div key={idx} class="space-y-1 text-xs font-semibold text-slate-700">
                  <div class="flex justify-between">
                    <span>{item.name}</span>
                    <span>{item.value}</span>
                  </div>
                  <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${(item.value / summary.totalClicks) * 100}%` }}
                      class="bg-indigo-500 h-full rounded-full"
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Devices */}
        <div class="bg-white border border-borderMain rounded-3xl p-6 shadow-premium">
          <h4 class="text-sm font-bold text-slate-800 mb-4 flex items-center space-x-2">
            <Monitor class="h-4.5 w-4.5 text-emerald-500" />
            <span>Devices</span>
          </h4>
          <div class="space-y-3">
            {deviceBreakdown.length === 0 ? (
              <p class="text-xs text-slate-400">No device data</p>
            ) : (
              deviceBreakdown.map((item, idx) => (
                <div key={idx} class="space-y-1 text-xs font-semibold text-slate-700">
                  <div class="flex justify-between">
                    <span>{item.name}</span>
                    <span>{item.value}</span>
                  </div>
                  <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${(item.value / summary.totalClicks) * 100}%` }}
                      class="bg-emerald-500 h-full rounded-full"
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Raw click log history list */}
      <div class="bg-white border border-borderMain rounded-3xl p-6 shadow-premium overflow-hidden">
        <h3 class="text-base font-bold text-textMain mb-6">Recent Visits Log</h3>
        
        {recentActivity.length === 0 ? (
          <div class="text-center py-10 text-slate-400 text-sm">
            No visitor clicks logged yet for this short link.
          </div>
        ) : (
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="border-b border-borderMain pb-2 text-slate-400 font-semibold uppercase tracking-wider">
                  <th class="py-3 pr-4">Timestamp</th>
                  <th class="py-3 px-4">Visitor IP</th>
                  <th class="py-3 px-4">Browser</th>
                  <th class="py-3 px-4">Device</th>
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
                    <td class="py-3.5 px-4">{log.browser}</td>
                    <td class="py-3.5 px-4">{log.device}</td>
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

export default UrlAnalyticsDetail;
