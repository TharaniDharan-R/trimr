import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link2, Eye, EyeOff, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuthPage = () => {
  const { login, signup, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Local Form Validations & Errors
  const [formErrors, setFormErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If logged in, send to dashboard directly
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validate = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!isLogin && !name.trim()) {
      errors.name = 'Full name is required';
    }

    if (!email) {
      errors.email = 'Email address is required';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Please fill a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!validate()) return;

    setLoading(true);
    let response;

    if (isLogin) {
      response = await login(email, password);
    } else {
      response = await signup(name, email, password);
    }

    setLoading(false);

    if (response && response.success) {
      navigate('/dashboard');
    } else if (response && response.error) {
      setErrorMsg(response.error);
    }
  };

  return (
    <div class="min-h-screen bg-bg flex flex-col lg:flex-row font-sans selection:bg-primary/20">
      
      {/* Left Pane - Abstract illustration */}
      <div class="lg:w-1/2 bg-slate-900 text-white p-12 flex flex-col justify-between relative overflow-hidden">
        {/* Glow Effects */}
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>

        {/* Logo */}
        <Link to="/" class="flex items-center space-x-2.5 z-10 relative">
          <div class="bg-gradient-to-tr from-primary to-secondary p-2 rounded-xl text-white shadow-md">
            <Link2 class="h-6 w-6" />
          </div>
          <span class="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Trimr
          </span>
        </Link>

        {/* Dynamic Graphic and Headline */}
        <div class="my-auto py-12 z-10 relative space-y-8 max-w-md">
          <div class="space-y-4">
            <div class="bg-primary/10 border border-primary/20 rounded-xl px-3 py-1 text-primary text-xs font-semibold w-fit flex items-center space-x-1">
              <Sparkles class="h-3 w-3" />
              <span>Link Shortener & Intelligent Analytics</span>
            </div>
            <h2 class="text-4xl font-extrabold tracking-tight leading-tight">
              Welcome to Trimr
            </h2>
            <p class="text-slate-400 text-sm leading-relaxed">
              Create short links, track real-time audience engagement, analyze traffic origins, and manage your URLs from one powerful dashboard.
            </p>
          </div>

          {/* Abstract CSS Connection Graph */}
          <div class="p-6 border border-slate-800 rounded-3xl bg-slate-950/40 backdrop-blur-xl relative">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                  A
                </div>
                <div class="space-y-0.5">
                  <p class="text-[10px] uppercase font-bold text-slate-500">Short Link</p>
                  <p class="text-xs font-bold">trimr.co/dashboard</p>
                </div>
              </div>

              {/* Connecting line */}
              <div class="flex-1 mx-4 h-0.5 border-t border-dashed border-slate-700 relative">
                <div class="absolute -top-1 left-1/2 w-2 h-2 rounded-full bg-primary animate-ping"></div>
              </div>

              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary font-bold text-xs">
                  B
                </div>
                <div class="space-y-0.5">
                  <p class="text-[10px] uppercase font-bold text-slate-500">Target URL</p>
                  <p class="text-xs font-bold truncate max-w-[80px]">original-site.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Credit */}
        <div class="z-10 relative text-xs text-slate-500">
          <p>© 2026 Trimr URL management. Built for modern startup teams.</p>
        </div>
      </div>

      {/* Right Pane - Form Card */}
      <div class="lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16 bg-[#F8FAFC]">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          class="w-full max-w-md bg-white border border-borderMain rounded-3xl shadow-premium p-8 sm:p-10"
        >
          {/* Form Header */}
          <div class="text-center space-y-2 mb-8">
            <h3 class="text-2xl font-extrabold text-textMain">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </h3>
            <p class="text-sm text-textSub">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormErrors({});
                  setErrorMsg('');
                  setName('');
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                }}
                class="font-semibold text-primary hover:underline"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Server/Context Error */}
          {errorMsg && (
            <div class="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start space-x-3 text-rose-800 text-xs">
              <AlertCircle class="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Auth form */}
          <form onSubmit={handleSubmit} class="space-y-5">
            {/* Full Name (Signup Only) */}
            {!isLogin && (
              <div class="space-y-1.5 text-left">
                <label class="text-xs font-semibold text-textMain">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  class={`block w-full border rounded-xl px-4 py-3 placeholder-slate-400 text-sm focus:outline-none transition-all duration-200 ${
                    formErrors.name 
                      ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500 bg-rose-50/20' 
                      : 'border-borderMain focus:ring-2 focus:ring-primary/20 focus:border-primary'
                  }`}
                />
                {formErrors.name && (
                  <p class="text-rose-500 text-[11px] font-medium flex items-center space-x-1 mt-1">
                    <span>{formErrors.name}</span>
                  </p>
                )}
              </div>
            )}

            {/* Email Address */}
            <div class="space-y-1.5 text-left">
              <label class="text-xs font-semibold text-textMain">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                class={`block w-full border rounded-xl px-4 py-3 placeholder-slate-400 text-sm focus:outline-none transition-all duration-200 ${
                  formErrors.email 
                    ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500 bg-rose-50/20' 
                    : 'border-borderMain focus:ring-2 focus:ring-primary/20 focus:border-primary'
                }`}
              />
              {formErrors.email && (
                <p class="text-rose-500 text-[11px] font-medium flex items-center mt-1">
                  <span>{formErrors.email}</span>
                </p>
              )}
            </div>

            {/* Password */}
            <div class="space-y-1.5 text-left">
              <div class="flex justify-between items-center">
                <label class="text-xs font-semibold text-textMain">Password</label>
                {isLogin && (
                  <a href="#" class="text-[11px] font-semibold text-primary hover:underline">Forgot password?</a>
                )}
              </div>
              <div class="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  class={`block w-full border rounded-xl pl-4 pr-10 py-3 placeholder-slate-400 text-sm focus:outline-none transition-all duration-200 ${
                    formErrors.password 
                      ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500 bg-rose-50/20' 
                      : 'border-borderMain focus:ring-2 focus:ring-primary/20 focus:border-primary'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff class="h-4 w-4" /> : <Eye class="h-4 w-4" />}
                </button>
              </div>
              {formErrors.password && (
                <p class="text-rose-500 text-[11px] font-medium flex items-center mt-1">
                  <span>{formErrors.password}</span>
                </p>
              )}
            </div>

            {/* Confirm Password (Signup Only) */}
            {!isLogin && (
              <div class="space-y-1.5 text-left">
                <label class="text-xs font-semibold text-textMain">Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  class={`block w-full border rounded-xl px-4 py-3 placeholder-slate-400 text-sm focus:outline-none transition-all duration-200 ${
                    formErrors.confirmPassword 
                      ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500 bg-rose-50/20' 
                      : 'border-borderMain focus:ring-2 focus:ring-primary/20 focus:border-primary'
                  }`}
                />
                {formErrors.confirmPassword && (
                  <p class="text-rose-500 text-[11px] font-medium flex items-center mt-1">
                    <span>{formErrors.confirmPassword}</span>
                  </p>
                )}
              </div>
            )}

            {/* Remember Me (Login Only) */}
            {isLogin && (
              <div class="flex items-center justify-between text-xs text-textSub">
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    class="h-4 w-4 text-primary focus:ring-primary/20 border-borderMain rounded-lg cursor-pointer"
                  />
                  <span class="font-medium">Remember me</span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || authLoading}
              class="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
            >
              {loading ? (
                <div class="flex items-center justify-center space-x-2">
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Please wait...</span>
                </div>
              ) : (
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>
        </motion.div>
      </div>

    </div>
  );
};

export default AuthPage;
