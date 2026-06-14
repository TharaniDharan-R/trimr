import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Link2, 
  ArrowRight, 
  BarChart3, 
  QrCode, 
  Calendar, 
  Globe, 
  ShieldAlert, 
  MousePointerClick,
  Sparkles,
  Layers,
  TrendingUp,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip as ChartTooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

// Custom lightweight counter animator for dashboard stats
const AnimatedCounter = ({ value, duration = 1.5 }) => {
  const [count, setCount] = useState('0');

  useEffect(() => {
    let start = 0;
    // Extract numbers and decimal points
    const numericStr = value.replace(/[^0-9.]/g, '');
    const target = parseFloat(numericStr);
    const isK = value.includes('K');
    const suffix = isK ? 'K' : '';

    if (isNaN(target)) {
      setCount(value);
      return;
    }

    const end = target;
    const totalMilliseconds = duration * 1000;
    const incrementTime = 30;
    const totalSteps = totalMilliseconds / incrementTime;
    const increment = (end - start) / totalSteps;

    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        clearInterval(timer);
        setCount(value);
      } else {
        setCount(isK 
          ? current.toFixed(1) + suffix 
          : Math.floor(current).toLocaleString()
        );
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count}</span>;
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleDemoMode = async () => {
    try {
      const res = await login('demo@trimr.com', 'password123');
      if (res.success) {
        navigate('/dashboard');
      } else {
        navigate('/auth');
      }
    } catch (err) {
      navigate('/auth');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const features = [
    {
      title: 'Smart URL Shortening',
      description: 'Generate instantly recognizable short links with full protocol validation and instant metadata caching.',
      icon: Link2,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Real-Time Analytics',
      description: 'Track click counts, visit details, and aggregate historical logs on a sleek timeline chart.',
      icon: BarChart3,
      color: 'from-indigo-500 to-purple-500',
    },
    {
      title: 'QR Code Generation',
      description: 'Automatically create high-fidelity downloadable vector QR codes for every shortened link.',
      icon: QrCode,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'Link Expiry Management',
      description: 'Configure specific dates and times to automatically deactivate links when they expire.',
      icon: Calendar,
      color: 'from-amber-500 to-orange-500',
    },
    {
      title: 'Visitor Browser Breakdown',
      description: 'Understand your audience with deep-dive breakdowns of browsers, operating systems, and referrers.',
      icon: Globe,
      color: 'from-pink-500 to-rose-500',
    },
    {
      title: 'Custom Aliases',
      description: 'Replace random string codes with custom branded phrases to boost click-through rates.',
      icon: Layers,
      color: 'from-violet-500 to-purple-500',
    },
  ];

  return (
    <div class="min-h-screen bg-[#F8FAFC] flex flex-col font-sans overflow-x-hidden selection:bg-primary/20 relative">
      
      {/* Background Dot Grid */}
      <div class="absolute inset-0 z-0 bg-[radial-gradient(#CBD5E1_1.5px,transparent_1.5px)] [background-size:28px_28px] opacity-[0.3] pointer-events-none"></div>
      
      {/* Soft Radial Glows */}
      <div class="absolute top-0 left-0 right-0 h-[850px] bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.06),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.06),transparent_40%)] pointer-events-none z-0"></div>

      {/* Large Blurred Depth Blobs */}
      <div class="absolute top-32 left-[10%] w-[380px] h-[380px] rounded-full bg-primary/5 blur-[100px] pointer-events-none z-0"></div>
      <div class="absolute top-80 right-[8%] w-[420px] h-[420px] rounded-full bg-secondary/5 blur-[120px] pointer-events-none z-0"></div>

      {/* Floating Glassmorphic Shapes */}
      {/* Top Left Cube-Like Shape */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotate: [0, 8, 0]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        class="absolute top-36 left-[6%] w-16 h-16 border border-white/50 bg-white/10 backdrop-blur-[2px] rounded-2xl shadow-premium pointer-events-none z-0 hidden lg:block"
      ></motion.div>

      {/* Top Right Sphere */}
      <motion.div
        animate={{
          y: [0, 12, 0],
          rotate: [0, -6, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        class="absolute top-44 right-[12%] w-24 h-24 border border-white/40 bg-white/5 backdrop-blur-[3px] rounded-full shadow-premium pointer-events-none z-0 hidden lg:block"
      ></motion.div>

      {/* Middle Left Hexagon-Like Shape */}
      <motion.div
        animate={{
          y: [0, -15, 0],
          x: [0, 6, 0]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        class="absolute bottom-[30%] left-[8%] w-20 h-20 border border-white/30 bg-white/5 backdrop-blur-[2px] rounded-[24px] shadow-premium pointer-events-none z-0 hidden lg:block"
      ></motion.div>

      {/* Header */}
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-20 flex items-center justify-between z-10 relative">
        <div class="flex items-center space-x-2">
          <div class="bg-gradient-to-tr from-primary to-secondary p-2 rounded-xl text-white shadow-md">
            <Link2 class="h-6 w-6" />
          </div>
          <span class="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Trimr
          </span>
        </div>

        <div class="flex items-center space-x-4">
          <Link to="/auth" class="text-sm font-semibold text-textSub hover:text-textMain transition-colors">
            Sign In
          </Link>
          <Link 
            to="/auth" 
            class="bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* Left Copy */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          class="lg:col-span-5 space-y-6 text-left"
        >
          <div class="inline-flex items-center space-x-2 bg-primary/10 text-primary font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider">
            <Sparkles class="h-3.5 w-3.5" />
            <span>Shorten, Track & Share Links Smarter</span>
          </div>

          <h1 class="text-5xl sm:text-6xl font-extrabold text-textMain tracking-tight leading-[1.1]">
            Shorten, Track & Manage Links{' '}
            <span class="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Effortlessly
            </span>
          </h1>

          <p class="text-lg text-textSub leading-relaxed font-normal">
            Trimr helps teams, creators and professionals create smart short links, monitor click performance, generate QR codes and gain valuable audience insights through powerful analytics.
          </p>

          <div class="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
            <Link 
              to="/auth" 
              class="flex items-center justify-center space-x-2 bg-gradient-to-r from-primary to-secondary text-white font-semibold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
            >
              <span>Get Started Free</span>
              <ArrowRight class="h-4 w-4" />
            </Link>
            <button
              onClick={handleDemoMode}
              class="flex items-center justify-center space-x-2 bg-white text-slate-700 font-semibold px-8 py-4 rounded-2xl border border-borderMain hover:bg-slate-50 transition-all active:scale-[0.98]"
            >
              <span>View Interactive Demo</span>
            </button>
          </div>

        </motion.div>

        {/* Right Dashboard Mockup (Redesigned Live Dashboard Preview) */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          class="lg:col-span-7 flex justify-center w-full"
        >
          <div class="relative w-full max-w-[660px] bg-white border border-slate-200/80 rounded-3xl shadow-2xl p-5 md:p-6 overflow-hidden select-none">
            
            {/* Window Header */}
            <div class="flex items-center justify-between pb-4 border-b border-slate-100">
              <div class="flex items-center space-x-1.5">
                <span class="w-3 h-3 rounded-full bg-rose-400"></span>
                <span class="w-3 h-3 rounded-full bg-amber-400"></span>
                <span class="w-3 h-3 rounded-full bg-emerald-400"></span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span class="text-xs font-semibold text-slate-500 tracking-wider">Live Dashboard Preview</span>
              </div>
              <div class="flex items-center space-x-1 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1">
                <span class="text-[10px] font-bold text-slate-500">Last 7 Days</span>
              </div>
            </div>

            {/* Premium Analytics Cards */}
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              
              {/* Active Links */}
              <div class="p-3 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col justify-between hover:bg-slate-50 hover:shadow-sm transition-all duration-200">
                <div class="flex justify-between items-start">
                  <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Active Links</span>
                  <span class="text-[9px] text-emerald-500 font-bold bg-emerald-50 px-1 rounded">+18%</span>
                </div>
                <div class="mt-2 flex items-baseline justify-between">
                  <span class="text-lg font-bold text-slate-800 tracking-tight">
                    <AnimatedCounter value="124" />
                  </span>
                  <svg class="w-8 h-4 text-emerald-500" viewBox="0 0 30 10" fill="none">
                    <path d="M0 8 C5 6, 10 9, 15 4 S25 2, 30 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </div>
              </div>

              {/* Clicks Today */}
              <div class="p-3 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col justify-between hover:bg-slate-50 hover:shadow-sm transition-all duration-200">
                <div class="flex justify-between items-start">
                  <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Clicks Today</span>
                  <span class="text-[9px] text-emerald-500 font-bold bg-emerald-50 px-1 rounded">+24%</span>
                </div>
                <div class="mt-2 flex items-baseline justify-between">
                  <span class="text-lg font-bold text-slate-800 tracking-tight">
                    <AnimatedCounter value="1,842" />
                  </span>
                  <svg class="w-8 h-4 text-emerald-500" viewBox="0 0 30 10" fill="none">
                    <path d="M0 9 C5 8, 10 3, 15 5 S25 1, 30 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </div>
              </div>

              {/* Total Clicks */}
              <div class="p-3 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col justify-between hover:bg-slate-50 hover:shadow-sm transition-all duration-200">
                <div class="flex justify-between items-start">
                  <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Clicks</span>
                  <span class="text-[9px] text-emerald-500 font-bold bg-emerald-50 px-1 rounded">+21%</span>
                </div>
                <div class="mt-2 flex items-baseline justify-between">
                  <span class="text-lg font-bold text-slate-800 tracking-tight">
                    <AnimatedCounter value="32.7K" />
                  </span>
                  <svg class="w-8 h-4 text-emerald-500" viewBox="0 0 30 10" fill="none">
                    <path d="M0 8 C5 9, 10 7, 15 4 S25 3, 30 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </div>
              </div>

              {/* QR Scans */}
              <div class="p-3 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col justify-between hover:bg-slate-50 hover:shadow-sm transition-all duration-200">
                <div class="flex justify-between items-start">
                  <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">QR Scans</span>
                  <span class="text-[9px] text-emerald-500 font-bold bg-emerald-50 px-1 rounded">+16%</span>
                </div>
                <div class="mt-2 flex items-baseline justify-between">
                  <span class="text-lg font-bold text-slate-800 tracking-tight">
                    <AnimatedCounter value="486" />
                  </span>
                  <svg class="w-8 h-4 text-emerald-500" viewBox="0 0 30 10" fill="none">
                    <path d="M0 9 C5 7, 10 8, 15 6 S25 2, 30 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </div>
              </div>

            </div>

            {/* Click Over Time Recharts AreaChart */}
            <div class="mt-4 p-4 border border-slate-100 rounded-2xl bg-white shadow-sm">
              <div class="flex justify-between items-center mb-3">
                <span class="text-xs font-bold text-slate-700">Clicks Over Time</span>
                <span class="text-[9px] font-semibold text-slate-400 flex items-center space-x-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
                  <span>Clicks</span>
                </span>
              </div>
              <div class="h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { day: 'Mon', clicks: 1200 },
                      { day: 'Tue', clicks: 1842 },
                      { day: 'Wed', clicks: 1450 },
                      { day: 'Thu', clicks: 2200 },
                      { day: 'Fri', clicks: 1900 },
                      { day: 'Sat', clicks: 2800 },
                      { day: 'Sun', clicks: 3100 },
                    ]}
                    margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fill: '#94A3B8' }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fill: '#94A3B8' }}
                    />
                    <ChartTooltip 
                      contentStyle={{ 
                        fontSize: '10px', 
                        borderRadius: '8px', 
                        borderColor: '#E2E8F0',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)' 
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="clicks" 
                      stroke="#3B82F6" 
                      strokeWidth={2} 
                      fillOpacity={1} 
                      fill="url(#colorClicks)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Split row: Browser Breakdown & QR Code Panel */}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              
              {/* Browser Breakdown Donut Chart */}
              <div class="p-4 border border-slate-100 rounded-2xl bg-white shadow-sm flex flex-col justify-between">
                <span class="text-xs font-bold text-slate-700 block mb-2 text-left">Browser Breakdown</span>
                <div class="flex items-center justify-between h-20">
                  <div class="w-16 h-16">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Chrome', value: 64 },
                            { name: 'Safari', value: 18 },
                            { name: 'Edge', value: 9 },
                            { name: 'Firefox', value: 6 },
                            { name: 'Others', value: 3 },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={18}
                          outerRadius={28}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {[
                            { name: 'Chrome', color: '#3B82F6' },
                            { name: 'Safari', color: '#10B981' },
                            { name: 'Edge', color: '#6366F1' },
                            { name: 'Firefox', color: '#F59E0B' },
                            { name: 'Others', color: '#EC4899' },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div class="flex flex-col space-y-0.5 text-left">
                    <div class="flex items-center space-x-1 text-[9px] font-semibold text-slate-500">
                      <span class="w-1.5 h-1.5 rounded-full bg-[#3B82F6]"></span>
                      <span>Chrome: 64%</span>
                    </div>
                    <div class="flex items-center space-x-1 text-[9px] font-semibold text-slate-500">
                      <span class="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                      <span>Safari: 18%</span>
                    </div>
                    <div class="flex items-center space-x-1 text-[9px] font-semibold text-slate-500">
                      <span class="w-1.5 h-1.5 rounded-full bg-[#6366F1]"></span>
                      <span>Edge: 9%</span>
                    </div>
                    <div class="flex items-center space-x-1 text-[9px] font-semibold text-slate-500">
                      <span class="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>
                      <span>Firefox: 6%</span>
                    </div>
                    <div class="flex items-center space-x-1 text-[9px] font-semibold text-slate-500">
                      <span class="w-1.5 h-1.5 rounded-full bg-[#EC4899]"></span>
                      <span>Others: 3%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code Preview Panel */}
              <div class="p-4 border border-slate-100 rounded-2xl bg-white shadow-sm flex items-center justify-between">
                <div class="space-y-1 text-left max-w-[130px]">
                  <span class="text-[9px] uppercase font-bold text-primary tracking-wider">Short URL Created</span>
                  <p class="text-xs font-bold text-slate-800 truncate">trimr.co/react-docs</p>
                  <p class="text-[9px] text-slate-400 truncate">Target: react.dev/reference</p>
                  <button class="mt-2 flex items-center space-x-1 bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-[9px] font-bold transition-all duration-200">
                    <Download class="h-3 w-3" />
                    <span>Download QR</span>
                  </button>
                </div>
                <div class="p-1.5 bg-white border border-slate-100 rounded-xl shadow-sm hover:scale-[1.05] transition-transform duration-200">
                  <svg class="h-12 w-12 text-slate-800" viewBox="0 0 29 29" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M1 1h7v7H1zm1 1v5h5V2zm1 1h3v3H3zm0 8h2v2H3zm5 0h2v2H8zm3 0h2v2h-2z" fill="currentColor"/>
                    <path d="M1 1h7v7H1z M1 21h7v7H1z M21 1h7v7h-7z" stroke="currentColor" stroke-width="2"/>
                    <path d="M4 4h1v1H4z M4 24h1v1H4z M24 4h1v1h-1z" fill="currentColor"/>
                    <path d="M11 2h2v2h-2zm4 0h2v2h-2zm6 11h2v2h-2zm-3 3h2v2h-2zm3 3h2v2h-2z" fill="currentColor"/>
                    <path d="M11 6h2v4h-2zm4 4h4v2h-4zm0 6h2v4h-2zm6-2h2v2h-2zm-6 4h4v2h-4z" fill="currentColor"/>
                    <path d="M11 15h4v2h-4zm6-3h2v2h-2z" fill="currentColor"/>
                    <path d="M11 21h4v2h-4zm8 4h2v2h-2z" fill="currentColor"/>
                  </svg>
                </div>
              </div>

            </div>

            {/* Recent Links Table */}
            <div class="mt-4 border border-slate-100 rounded-2xl bg-white shadow-sm overflow-hidden">
              <div class="p-3 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <span class="text-xs font-bold text-slate-700">Recent Links</span>
                <span class="text-[9px] font-semibold text-slate-400">Updated just now</span>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="border-b border-slate-50 text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/20">
                      <th class="p-2.5 pl-4">Link Name</th>
                      <th class="p-2.5">Clicks</th>
                      <th class="p-2.5">Last Activity</th>
                      <th class="p-2.5 pr-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-50">
                    <tr class="hover:bg-slate-50/40 transition-colors group">
                      <td class="p-2.5 pl-4 text-xs font-bold text-slate-700 group-hover:text-primary transition-colors">react-docs</td>
                      <td class="p-2.5 text-xs text-slate-500 font-semibold">1,243 clicks</td>
                      <td class="p-2.5 text-xs text-slate-400">Today</td>
                      <td class="p-2.5 pr-4 text-right">
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                          Active
                        </span>
                      </td>
                    </tr>
                    <tr class="hover:bg-slate-50/40 transition-colors group">
                      <td class="p-2.5 pl-4 text-xs font-bold text-slate-700 group-hover:text-primary transition-colors">portfolio-site</td>
                      <td class="p-2.5 text-xs text-slate-500 font-semibold">842 clicks</td>
                      <td class="p-2.5 text-xs text-slate-400">Today</td>
                      <td class="p-2.5 pr-4 text-right">
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                          Active
                        </span>
                      </td>
                    </tr>
                    <tr class="hover:bg-slate-50/40 transition-colors group">
                      <td class="p-2.5 pl-4 text-xs font-bold text-slate-700 group-hover:text-primary transition-colors">design-assets</td>
                      <td class="p-2.5 text-xs text-slate-500 font-semibold">256 clicks</td>
                      <td class="p-2.5 text-xs text-slate-400">Yesterday</td>
                      <td class="p-2.5 pr-4 text-right">
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                          Active
                        </span>
                      </td>
                    </tr>
                    <tr class="hover:bg-slate-50/40 transition-colors group">
                      <td class="p-2.5 pl-4 text-xs font-bold text-slate-700 group-hover:text-primary transition-colors">promo-ended</td>
                      <td class="p-2.5 text-xs text-slate-500 font-semibold">95 clicks</td>
                      <td class="p-2.5 text-xs text-slate-400">2 days ago</td>
                      <td class="p-2.5 pr-4 text-right">
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                          Expired
                        </span>
                      </td>
                    </tr>
                    <tr class="hover:bg-slate-50/40 transition-colors group">
                      <td class="p-2.5 pl-4 text-xs font-bold text-slate-700 group-hover:text-primary transition-colors">client-portal</td>
                      <td class="p-2.5 text-xs text-slate-500 font-semibold">14 clicks</td>
                      <td class="p-2.5 text-xs text-slate-400">3 days ago</td>
                      <td class="p-2.5 pr-4 text-right">
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-50 text-purple-600 border border-purple-100">
                          Protected
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section class="bg-white py-24 border-y border-borderMain/60 w-full">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
          <div class="max-w-3xl mx-auto space-y-4">
            <h2 class="text-sm uppercase tracking-widest font-extrabold text-primary">Everything you need</h2>
            <p class="text-4xl font-extrabold text-textMain tracking-tight">
              Enterprise link tools at your fingertips
            </p>
            <p class="text-lg text-textSub max-w-2xl mx-auto">
              Trimr is built with startup standards to provide granular insights and security controls.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16 text-left"
          >
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  class="p-8 border border-borderMain rounded-3xl hover:border-primary/30 hover:shadow-premium transition-all duration-300 group bg-slate-50/20"
                >
                  <div class={`bg-gradient-to-tr ${feature.color} text-white p-3 rounded-2xl w-fit shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <Icon class="h-6 w-6" />
                  </div>
                  <h3 class="text-xl font-bold text-textMain mt-6">{feature.title}</h3>
                  <p class="text-textSub text-sm mt-3 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer class="mt-auto py-12 border-t border-borderMain/60 bg-[#F8FAFC] w-full">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-slate-500 text-sm">
          <div class="flex items-center space-x-2 select-none">
            <Link2 class="h-5 w-5 text-primary" />
            <span class="font-extrabold text-textMain">Trimr</span>
          </div>
          <div class="flex space-x-6">
            <a href="#" class="hover:text-textMain transition-colors">Privacy Policy</a>
            <a href="#" class="hover:text-textMain transition-colors">Terms of Service</a>
            <a href="https://katomaran.com" class="hover:text-textMain transition-colors" target="_blank" rel="noreferrer">Katomaran</a>
          </div>
          <div>
            <p>This project is a part of a hackathon run by <a href="https://katomaran.com" class="font-semibold text-primary hover:underline" target="_blank" rel="noreferrer">https://katomaran.com</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
