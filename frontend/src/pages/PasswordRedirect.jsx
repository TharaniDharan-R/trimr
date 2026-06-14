import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Lock, AlertCircle, ArrowRight, Link2 } from 'lucide-react';
import { motion } from 'framer-motion';

const PasswordRedirect = () => {
  const { shortCode } = useParams();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError('Please enter the access password');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/urls/verify-password', {
        shortCode,
        password,
      });

      // Verification successful, redirect visitor to target long URL
      window.location.href = res.data.originalUrl;
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Password may be incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-left select-none font-sans">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        class="w-full max-w-md bg-white border border-borderMain rounded-3xl shadow-xl p-8"
      >
        <div class="text-center space-y-4">
          
          {/* Lock Icon */}
          <div class="bg-purple-50 text-purple-600 border border-purple-100 p-4 rounded-full w-fit mx-auto shadow-sm">
            <Lock class="h-6 w-6" />
          </div>

          <div class="space-y-1">
            <h2 class="text-xl font-extrabold text-slate-800">Link Password Required</h2>
            <p class="text-xs text-textSub">This link has been password protected by the owner. Enter the correct password to continue.</p>
          </div>

          {/* Short link spec */}
          <div class="py-2.5 px-4 bg-slate-50 border border-borderMain/50 rounded-xl text-xs font-bold text-slate-600 w-fit mx-auto">
            trimr.co/{shortCode}
          </div>

          {error && (
            <div class="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start space-x-2 text-rose-800 text-xs text-left">
              <AlertCircle class="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} class="space-y-4 text-left pt-2">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-textMain">Access Password</label>
              <input
                type="password"
                placeholder="Enter link password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                class="block w-full border border-borderMain rounded-xl px-4 py-3 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              class="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center space-x-2 text-sm"
            >
              {loading ? (
                <>
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Decrypt & Continue</span>
                  <ArrowRight class="h-4 w-4" />
                </>
              )}
            </button>
          </form>

        </div>
      </motion.div>

      <div class="mt-8 flex items-center space-x-2 text-xs text-slate-400 select-none">
        <Link2 class="h-4 w-4 text-slate-300" />
        <span>Powered by <Link to="/" class="font-bold hover:text-slate-600 hover:underline">Trimr</Link></span>
      </div>
    </div>
  );
};

export default PasswordRedirect;
