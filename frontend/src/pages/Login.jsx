import React, { useState, useEffect } from 'react';
import { Rocket, Mail, Lock, User as UserIcon, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';

export default function Login({ onLogin, onGuestLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: ''
  });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || '/api';
        const res = await fetch(`${API_URL}/health`);
        const data = await res.json();
        setServerStatus(data);
      } catch (err) {
        setServerStatus({ status: 'error', database: 'unknown' });
      }
    };
    checkHealth();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (serverStatus?.database !== 'connected') {
      setError('Cannot register: Database is not connected. Please check your MONGODB_URI.');
      setLoading(false);
      return;
    }

    try {
      if (isRegister) {
        const res = await api.auth.register(formData);
        onLogin(res.token, res.user);
      } else {
        const res = await api.auth.login({
          email: formData.email,
          password: formData.password
        });
        onLogin(res.token, res.user);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden px-4">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/50">
            <Rocket className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">ProPath</h1>
          <p className="text-slate-400 text-sm">
            {isRegister ? 'Create your professional account' : 'Welcome back to your career suite'}
          </p>

          {/* Server Status Badge */}
          <div className="mt-4 flex justify-center">
            {serverStatus ? (
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                serverStatus.database === 'connected' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {serverStatus.database === 'connected' ? (
                  <><CheckCircle2 size={12} /> Database Connected</>
                ) : (
                  <><AlertCircle size={12} /> Database Disconnected</>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-slate-500 border border-white/10">
                <Loader2 size={12} className="animate-spin" /> Checking Server...
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {isRegister && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1"
              >
                <label className="text-xs font-bold text-slate-400 uppercase">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    required
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                required
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            type="submit"
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-900/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isRegister ? 'Create Account' : 'Sign In')}
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900/50 px-2 text-slate-500 backdrop-blur-sm">Or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onGuestLogin}
            className="w-full py-4 bg-white/5 text-white font-bold rounded-xl border border-white/10 hover:bg-white/10 transition-all active:scale-95"
          >
            Continue as Guest
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
          </button>
        </div>

        <p className="mt-8 text-[10px] text-slate-600 text-center uppercase tracking-widest">
          ProPath Suite • MongoDB Edition
        </p>
      </motion.div>
    </div>
  );
}
