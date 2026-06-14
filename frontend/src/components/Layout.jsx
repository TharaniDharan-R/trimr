import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Link2, 
  Search, 
  LogOut, 
  LayoutDashboard, 
  Menu, 
  X, 
  User, 
  Settings,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = ({ children, searchQuery, setSearchQuery }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const dropdownRef = useRef(null);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Links', path: '/dashboard/links', icon: Link2 },
  ];

  return (
    <div class="min-h-screen bg-bg flex flex-col font-sans">
      {/* Top Navbar */}
      <header class="sticky top-0 z-40 w-full glass shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left: Logo */}
          <div class="flex items-center space-x-8">
            <Link to="/dashboard" class="flex items-center space-x-2">
              <div class="bg-gradient-to-tr from-primary to-secondary p-2 rounded-xl text-white shadow-md">
                <Link2 class="h-5 w-5" />
              </div>
              <span class="text-xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Trimr
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav class="hidden md:flex space-x-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    class={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-textSub hover:bg-slate-100 hover:text-textMain'
                    }`}
                  >
                    <Icon class="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Middle: Search Bar (Conditional for URL Management Page) */}
          <div class="hidden sm:block flex-1 max-w-md mx-8">
            {setSearchQuery !== undefined && location.pathname === '/dashboard/links' ? (
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search class="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search short links or original URLs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  class="block w-full pl-10 pr-3 py-2 border border-borderMain rounded-xl bg-slate-50/50 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200"
                />
              </div>
            ) : null}
          </div>

          {/* Right: Avatar */}
          <div class="flex items-center space-x-4">

            {/* Profile Menu */}
            <div class="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                class="flex items-center space-x-2 focus:outline-none"
              >
                <div class="h-9 w-9 rounded-full bg-gradient-to-tr from-primary/30 to-secondary/30 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm select-none">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    class="absolute right-0 mt-2 w-56 bg-white border border-borderMain rounded-2xl shadow-xl py-2 z-50 overflow-hidden"
                  >
                    <div class="px-4 py-3 border-b border-borderMain">
                      <p class="text-sm font-semibold text-textMain truncate">{user?.name || 'Account User'}</p>
                      <p class="text-xs text-textSub truncate mt-0.5">{user?.email || 'demo@trimr.com'}</p>
                    </div>
                    
                    <div class="p-1.5 space-y-0.5">
                      <button 
                        onClick={() => { setDropdownOpen(false); navigate('/dashboard'); }}
                        class="w-full flex items-center space-x-2 px-3 py-2 text-sm text-slate-700 rounded-xl hover:bg-slate-50 hover:text-primary transition-colors text-left"
                      >
                        <LayoutDashboard class="h-4 w-4" />
                        <span>Overview</span>
                      </button>
                      <button 
                        onClick={() => { setDropdownOpen(false); navigate('/dashboard/links'); }}
                        class="w-full flex items-center space-x-2 px-3 py-2 text-sm text-slate-700 rounded-xl hover:bg-slate-50 hover:text-primary transition-colors text-left"
                      >
                        <Link2 class="h-4 w-4" />
                        <span>Manage Links</span>
                      </button>
                    </div>

                    <div class="border-t border-borderMain p-1.5">
                      <button
                        onClick={handleLogout}
                        class="w-full flex items-center space-x-2 px-3 py-2 text-sm text-rose-600 rounded-xl hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut class="h-4 w-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile menu button */}
            <div class="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {mobileMenuOpen ? <X class="h-6 w-6" /> : <Menu class="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Open Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            class="md:hidden bg-white border-b border-borderMain"
          >
            <div class="px-4 pt-2 pb-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    class={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                      isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-textSub hover:bg-slate-100 hover:text-textMain'
                    }`}
                  >
                    <Icon class="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default Layout;
