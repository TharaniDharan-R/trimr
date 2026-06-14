import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Link2, 
  Copy, 
  Check, 
  QrCode, 
  BarChart3, 
  Edit3, 
  Trash2, 
  Calendar, 
  Shield, 
  AlertTriangle,
  Search,
  Filter,
  Download,
  UploadCloud,
  FileSpreadsheet,
  Globe,
  ExternalLink,
  Plus,
  Info,
  Lock,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UrlManagement = ({ searchQuery = '' }) => {
  const navigate = useNavigate();
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // URL create inputs
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [isPublicStats, setIsPublicStats] = useState(true);
  
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // CSV bulk shortening states
  const [csvFile, setCsvFile] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const [bulkError, setBulkError] = useState(null);
  const [showBulkSection, setShowBulkSection] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('All');

  // Clipboard copy state tracker
  const [copiedId, setCopiedId] = useState(null);

  // Modal states
  const [activeQrUrl, setActiveQrUrl] = useState(null);
  const [editUrlItem, setEditUrlItem] = useState(null);
  const [deleteUrlItem, setDeleteUrlItem] = useState(null);

  // Edit Modal form inputs
  const [editOriginalUrl, setEditOriginalUrl] = useState('');
  const [editExpiresAt, setEditExpiresAt] = useState('');
  const [editPasswordProtected, setEditPasswordProtected] = useState(false);
  const [editPassword, setEditPassword] = useState('');
  const [editIsPublicStats, setEditIsPublicStats] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  const fetchUrls = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/urls');
      setUrls(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load shortened URLs. Please check database connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError(null);
    setSuccessMsg('');

    if (!originalUrl) {
      setCreateError('Destination URL is required');
      return;
    }

    setCreateLoading(true);
    try {
      await api.post('/api/urls', {
        originalUrl,
        customAlias: customAlias.trim() || undefined,
        expiresAt: expiresAt || undefined,
        passwordProtected,
        password: passwordProtected ? password : undefined,
        isPublicStats,
      });

      // Clear form
      setOriginalUrl('');
      setCustomAlias('');
      setExpiresAt('');
      setPasswordProtected(false);
      setPassword('');
      setIsPublicStats(true);
      
      setSuccessMsg('Short link generated successfully!');
      fetchUrls();

      // Clear success notification after 3s
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to shorten URL');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    setBulkError(null);
    setBulkResult(null);

    if (!csvFile) {
      setBulkError('Please select a CSV file first');
      return;
    }

    setBulkLoading(true);
    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const res = await api.post('/api/urls/bulk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setBulkResult(res.data);
      setCsvFile(null);
      fetchUrls();
    } catch (err) {
      setBulkError(err.response?.data?.message || 'Error processing bulk file.');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openEditModal = (url) => {
    setEditUrlItem(url);
    setEditOriginalUrl(url.originalUrl);
    setEditExpiresAt(url.expiresAt ? new Date(url.expiresAt).toISOString().slice(0, 16) : '');
    setEditPasswordProtected(url.passwordProtected);
    setEditPassword('');
    setEditIsPublicStats(url.isPublicStats);
    setEditError(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);

    try {
      await api.put(`/api/urls/${editUrlItem._id}`, {
        originalUrl: editOriginalUrl,
        expiresAt: editExpiresAt || null,
        passwordProtected: editPasswordProtected,
        password: editPasswordProtected && editPassword ? editPassword : undefined,
        isPublicStats: editIsPublicStats,
      });
      
      setEditUrlItem(null);
      fetchUrls();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update link details.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/urls/${deleteUrlItem._id}`);
      setDeleteUrlItem(null);
      fetchUrls();
    } catch (err) {
      console.error(err);
      alert('Failed to delete URL.');
    }
  };

  // Filter and Search URLs locally
  const filteredUrls = urls.filter((url) => {
    // Search filter
    const matchesSearch = 
      url.originalUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      url.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (url.title && url.title.toLowerCase().includes(searchQuery.toLowerCase()));

    // Status filter
    if (statusFilter === 'All') return matchesSearch;
    return matchesSearch && url.status === statusFilter;
  });

  return (
    <div class="space-y-8 text-left max-w-6xl mx-auto">
      
      {/* Header section */}
      <div>
        <h2 class="text-3xl font-extrabold text-textMain tracking-tight">Manage Links</h2>
        <p class="text-textSub text-sm mt-1">Shorten single URLs, import bulk sheets, and configure redirect logic.</p>
      </div>

      {/* Grid containing Create Link Form & CSV bulk uploader */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Create Single Link */}
        <div class="lg:col-span-8 bg-white border border-borderMain rounded-3xl p-6 shadow-premium">
          <h3 class="text-lg font-bold text-textMain flex items-center space-x-2 mb-6">
            <Plus class="h-5 w-5 text-primary" />
            <span>Shorten a new URL</span>
          </h3>

          {/* Form success notifications */}
          {successMsg && (
            <div class="mb-5 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-xs font-semibold">
              🎉 {successMsg}
            </div>
          )}

          {createError && (
            <div class="mb-5 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-800 text-xs flex items-center space-x-2">
              <AlertTriangle class="h-4.5 w-4.5 text-rose-500 shrink-0" />
              <span>{createError}</span>
            </div>
          )}

          <form onSubmit={handleCreate} class="space-y-5">
            {/* Long URL input */}
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-textMain">Destination URL</label>
              <input
                type="text"
                placeholder="https://example.com/very-long-original-url-path"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                class="block w-full border border-borderMain rounded-xl px-4 py-3 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              />
            </div>

            {/* Custom Alias & Expiry Grid */}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Custom Alias */}
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-textMain">Custom Alias (Optional)</label>
                <div class="flex">
                  <span class="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-borderMain bg-slate-50 text-slate-400 text-xs font-medium">
                    trimr.co/
                  </span>
                  <input
                    type="text"
                    placeholder="my-alias"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                    class="block w-full border border-borderMain rounded-r-xl px-3 py-2.5 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Expiry Date */}
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-textMain">Expiry Date (Optional)</label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  class="block w-full border border-borderMain rounded-xl px-3 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Options Toggle Bar */}
            <div class="border-t border-slate-100 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              
              {/* Left toggles */}
              <div class="flex flex-col space-y-2">
                {/* Password Protection */}
                <label class="flex items-center space-x-2 cursor-pointer text-xs text-slate-700 font-semibold select-none">
                  <input
                    type="checkbox"
                    checked={passwordProtected}
                    onChange={(e) => setPasswordProtected(e.target.checked)}
                    class="h-4 w-4 text-primary focus:ring-primary/20 border-borderMain rounded-lg cursor-pointer"
                  />
                  <Shield class="h-4 w-4 text-slate-400 shrink-0" />
                  <span>Password Protect Link</span>
                </label>

                {/* Public Stats toggle */}
                <label class="flex items-center space-x-2 cursor-pointer text-xs text-slate-700 font-semibold select-none">
                  <input
                    type="checkbox"
                    checked={isPublicStats}
                    onChange={(e) => setIsPublicStats(e.target.checked)}
                    class="h-4 w-4 text-primary focus:ring-primary/20 border-borderMain rounded-lg cursor-pointer"
                  />
                  <Info class="h-4 w-4 text-slate-400 shrink-0" />
                  <span>Allow Public Stats Access</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={createLoading}
                class="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all text-sm shrink-0 flex items-center justify-center space-x-2"
              >
                {createLoading ? (
                  <>
                    <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <span>Shorten URL</span>
                )}
              </button>

            </div>

            {/* Password input drawer */}
            <AnimatePresence>
              {passwordProtected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  class="pt-2 text-left space-y-1.5 overflow-hidden"
                >
                  <label class="text-xs font-semibold text-textMain">Link Protection Password</label>
                  <input
                    type="password"
                    placeholder="Enter custom access password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    class="block w-full border border-borderMain rounded-xl px-4 py-2.5 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </motion.div>
              )}
            </AnimatePresence>

          </form>
        </div>

        {/* Right Pane: CSV Bulk Uploader */}
        <div class="lg:col-span-4 space-y-4">
          <button 
            onClick={() => setShowBulkSection(!showBulkSection)}
            class="w-full flex items-center justify-between p-4 bg-white border border-borderMain rounded-2xl shadow-sm text-left hover:border-slate-300 transition-colors"
          >
            <div class="flex items-center space-x-2 text-slate-700">
              <FileSpreadsheet class="h-5 w-5 text-indigo-500" />
              <span class="text-sm font-bold">Bulk CSV Import</span>
            </div>
            <UploadCloud class="h-4 w-4 text-slate-400" />
          </button>

          {showBulkSection && (
            <div class="bg-white border border-borderMain rounded-3xl p-5 shadow-premium space-y-4">
              <div class="space-y-1">
                <h4 class="text-xs font-extrabold text-slate-400 uppercase tracking-wider">CSV Upload</h4>
                <p class="text-[11px] text-textSub">Import multiple destinations at once. Must contain header keys: `originalUrl` (required), `alias`, `expiry`.</p>
              </div>

              {bulkError && (
                <div class="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-[11px]">
                  {bulkError}
                </div>
              )}

              {bulkResult && (
                <div class="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-[11px]">
                  🎉 {bulkResult.message}
                </div>
              )}

              <form onSubmit={handleBulkUpload} class="space-y-3">
                <div class="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-primary/50 transition-colors cursor-pointer relative bg-slate-50/50">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files[0])}
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud class="h-7 w-7 text-slate-400 mx-auto mb-2" />
                  <span class="text-xs font-semibold text-slate-600 block truncate">
                    {csvFile ? csvFile.name : 'Select CSV Sheet'}
                  </span>
                </div>

                <div class="flex space-x-2">
                  <button
                    type="submit"
                    disabled={bulkLoading}
                    class="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-xs font-bold shadow-md hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center space-x-1"
                  >
                    {bulkLoading ? 'Processing...' : 'Upload & Create'}
                  </button>
                  <a
                    href="data:text/csv;charset=utf-8,originalUrl,alias,expiry%0Ahttps://google.com,google-home,2026-12-31%0Ahttps://github.com,git-hub,"
                    download="trimr_template.csv"
                    class="p-2 border border-borderMain bg-white text-slate-600 hover:bg-slate-50 rounded-xl flex items-center justify-center"
                    title="Download Template CSV"
                  >
                    <Download class="h-4 w-4" />
                  </a>
                </div>
              </form>
            </div>
          )}
        </div>

      </div>

      {/* Filter and Cards Header */}
      <div class="bg-white border border-borderMain rounded-3xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        {/* Links count info */}
        <div class="flex items-center space-x-2 text-xs font-bold text-slate-500">
          <Globe class="h-4.5 w-4.5 text-primary shrink-0" />
          <span>Showing {filteredUrls.length} of {urls.length} Links</span>
        </div>

        {/* Filter categories */}
        <div class="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-600">
          <Filter class="h-4 w-4 text-slate-400 mr-2" />
          {['All', 'Active', 'Expired', 'Password Protected', 'Broken'].map((cat) => (
            <button
              key={cat}
              onClick={() => setStatusFilter(cat)}
              class={`px-3 py-1.5 rounded-lg border transition-all ${
                statusFilter === cat 
                  ? 'bg-slate-800 text-white border-slate-800 shadow-sm' 
                  : 'bg-white border-borderMain hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* URL Cards List */}
      {loading ? (
        <div class="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} class="h-28 bg-white border border-borderMain rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredUrls.length === 0 ? (
        <div class="bg-white border border-borderMain rounded-3xl py-16 text-center text-slate-400">
          <Link2 class="h-10 w-10 mx-auto text-slate-300 mb-3" />
          <p class="text-sm font-semibold">No short links match your search parameters.</p>
          <p class="text-xs text-textSub mt-1">Shorten a URL above to populate this grid.</p>
        </div>
      ) : (
        <div class="space-y-4">
          {filteredUrls.map((url, idx) => {
            const shortBase = `${window.location.protocol}//${window.location.host === 'localhost:5173' ? 'localhost:5000' : window.location.host}`;
            const shortLink = `${shortBase}/${url.shortCode}`;
            const statsLink = `/stats/${url.shortCode}`;

            return (
              <motion.div
                key={url._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.03 }}
                class="bg-white border border-borderMain rounded-3xl p-6 shadow-premium hover:shadow-premiumHover transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              >
                {/* Details Column */}
                <div class="flex-1 space-y-2 text-left max-w-xl">
                  {/* Title and Badge */}
                  <div class="flex flex-wrap items-center gap-2.5">
                    <h4 class="text-sm font-extrabold text-slate-800 truncate max-w-[280px] sm:max-w-md">
                      {url.title || 'Untitled Link'}
                    </h4>
                    
                    {/* Status Badge */}
                    <span class={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      url.status === 'Active' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : url.status === 'Broken'
                        ? 'bg-rose-50 text-rose-700 border-rose-100'
                        : url.status === 'Password Protected'
                        ? 'bg-purple-50 text-purple-700 border-purple-100'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {url.status}
                    </span>
                  </div>

                  {/* Description */}
                  {url.description && (
                    <p class="text-xs text-textSub line-clamp-2 max-w-[500px]">
                      {url.description}
                    </p>
                  )}

                  {/* Redirection link specs */}
                  <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 pt-1 text-[11px] text-slate-400 font-medium">
                    {/* Short Link */}
                    <div class="flex items-center space-x-1">
                      <span class="text-primary font-bold">{shortLink}</span>
                      <a href={shortLink} target="_blank" rel="noreferrer" class="text-slate-400 hover:text-primary transition-colors">
                        <ExternalLink class="h-3 w-3" />
                      </a>
                    </div>
                    
                    <span class="hidden sm:inline text-slate-300">|</span>

                    {/* Original Long link */}
                    <div class="flex items-center space-x-1 max-w-[240px] truncate">
                      <span class="truncate">{url.originalUrl}</span>
                    </div>
                  </div>

                  {/* Stats timestamps */}
                  <div class="flex items-center space-x-4 pt-1 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    <span>Created {new Date(url.createdAt).toLocaleDateString()}</span>
                    {url.lastVisited && (
                      <>
                        <span>•</span>
                        <span>Visited {new Date(url.lastVisited).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Counter & Action items */}
                <div class="flex items-center justify-between md:justify-end w-full md:w-auto shrink-0 gap-6 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                  
                  {/* Click Counter indicator */}
                  <div class="text-left md:text-right">
                    <span class="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold block">Clicks</span>
                    <span class="text-2xl font-black text-slate-800 leading-tight">
                      {(url.clickCount || 0).toLocaleString()}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div class="flex items-center space-x-1.5">
                    {/* Copy button */}
                    <button
                      onClick={() => handleCopy(url._id, shortLink)}
                      class={`p-2.5 rounded-xl border transition-all ${
                        copiedId === url._id
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                          : 'bg-white border-borderMain text-slate-500 hover:bg-slate-50'
                      }`}
                      title="Copy short link"
                    >
                      {copiedId === url._id ? <Check class="h-4 w-4" /> : <Copy class="h-4 w-4" />}
                    </button>

                    {/* QR Code trigger */}
                    <button
                      onClick={() => setActiveQrUrl(url)}
                      class="p-2.5 bg-white border border-borderMain text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
                      title="View QR Code"
                    >
                      <QrCode class="h-4 w-4" />
                    </button>

                    {/* Analytics navigation */}
                    <button
                      onClick={() => navigate(`/dashboard/analytics/${url._id}`)}
                      class="p-2.5 bg-white border border-borderMain text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
                      title="View deep analytics"
                    >
                      <BarChart3 class="h-4 w-4" />
                    </button>

                    {/* Edit trigger */}
                    <button
                      onClick={() => openEditModal(url)}
                      class="p-2.5 bg-white border border-borderMain text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
                      title="Edit URL properties"
                    >
                      <Edit3 class="h-4 w-4" />
                    </button>

                    {/* Delete trigger */}
                    <button
                      onClick={() => setDeleteUrlItem(url)}
                      class="p-2.5 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 rounded-xl transition-all"
                      title="Delete shortened link"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>

                </div>

              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modals Overlay */}
      
      {/* 1. QR Code Modal */}
      <AnimatePresence>
        {activeQrUrl && (
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              class="w-full max-w-sm bg-white border border-borderMain rounded-3xl shadow-2xl p-6 relative"
            >
              <button 
                onClick={() => setActiveQrUrl(null)}
                class="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X class="h-5 w-5" />
              </button>

              <div class="text-center space-y-4 pt-4">
                <h4 class="text-base font-extrabold text-slate-800">QR Code Scan Image</h4>
                <p class="text-xs text-textSub truncate">Scan to open trimr.co/{activeQrUrl.shortCode}</p>
                
                {/* QR Image */}
                <div class="border border-borderMain p-4 rounded-2xl w-fit mx-auto bg-slate-50">
                  <img 
                    src={activeQrUrl.qrCode} 
                    alt={`QR Code for ${activeQrUrl.shortCode}`}
                    class="h-44 w-44" 
                  />
                </div>

                <div class="pt-2">
                  <a
                    href={activeQrUrl.qrCode}
                    download={`trimr_qr_${activeQrUrl.shortCode}.png`}
                    class="flex items-center justify-center space-x-2 bg-slate-800 text-white font-semibold py-2.5 rounded-xl text-xs hover:bg-slate-900 active:scale-[0.98] transition-all w-full"
                  >
                    <Download class="h-4 w-4" />
                    <span>Download QR Code Image</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Edit Modal */}
      <AnimatePresence>
        {editUrlItem && (
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              class="w-full max-w-lg bg-white border border-borderMain rounded-3xl shadow-2xl p-6 relative"
            >
              <button 
                onClick={() => setEditUrlItem(null)}
                class="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X class="h-5 w-5" />
              </button>

              <div class="space-y-4">
                <h4 class="text-lg font-bold text-slate-800">Edit Link Properties</h4>
                
                {editError && (
                  <div class="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs">
                    {editError}
                  </div>
                )}

                <form onSubmit={handleUpdate} class="space-y-4 text-left">
                  <div class="space-y-1">
                    <label class="text-xs font-semibold text-textMain">Destination URL</label>
                    <input
                      type="text"
                      value={editOriginalUrl}
                      onChange={(e) => setEditOriginalUrl(e.target.value)}
                      class="block w-full border border-borderMain rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div class="space-y-1">
                    <label class="text-xs font-semibold text-textMain">Expiry Date</label>
                    <input
                      type="datetime-local"
                      value={editExpiresAt}
                      onChange={(e) => setEditExpiresAt(e.target.value)}
                      class="block w-full border border-borderMain rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div class="space-y-2">
                    <label class="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-textMain">
                      <input
                        type="checkbox"
                        checked={editPasswordProtected}
                        onChange={(e) => setEditPasswordProtected(e.target.checked)}
                        class="h-4 w-4 text-primary rounded border-borderMain"
                      />
                      <span>Set Password Access Protection</span>
                    </label>

                    {editPasswordProtected && (
                      <input
                        type="password"
                        placeholder="Leave blank to keep existing password, or enter new password"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        class="block w-full border border-borderMain rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    )}
                  </div>

                  <div class="space-y-2">
                    <label class="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-textMain">
                      <input
                        type="checkbox"
                        checked={editIsPublicStats}
                        onChange={(e) => setEditIsPublicStats(e.target.checked)}
                        class="h-4 w-4 text-primary rounded border-borderMain"
                      />
                      <span>Allow Public Statistics page access</span>
                    </label>
                  </div>

                  <div class="pt-4 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditUrlItem(null)}
                      class="bg-slate-100 text-slate-700 py-2.5 px-4 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editLoading}
                      class="bg-primary text-white py-2.5 px-6 rounded-xl text-xs font-semibold shadow-md hover:bg-primary/95 transition-all disabled:opacity-50"
                    >
                      {editLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteUrlItem && (
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              class="w-full max-w-sm bg-white border border-borderMain rounded-3xl shadow-2xl p-6 text-center space-y-4"
            >
              <div class="bg-rose-50 text-rose-600 p-3.5 rounded-full w-fit mx-auto border border-rose-100">
                <AlertTriangle class="h-6 w-6" />
              </div>
              
              <div class="space-y-1">
                <h4 class="text-base font-extrabold text-slate-800">Confirm Deletion</h4>
                <p class="text-xs text-textSub">Are you sure you want to delete trimr.co/{deleteUrlItem.shortCode}? This action will permanently wipe all visitor logs and click stats.</p>
              </div>

              <div class="pt-2 flex justify-center space-x-2 w-full">
                <button
                  onClick={() => setDeleteUrlItem(null)}
                  class="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  class="flex-1 bg-rose-600 text-white py-2.5 rounded-xl text-xs font-semibold shadow-md hover:bg-rose-700 transition-colors"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default UrlManagement;
