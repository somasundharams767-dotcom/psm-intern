import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await api.adminLogin({ email, password });
      if (data.role !== 'admin') {
        setError('Access denied: account does not have administrative privileges.');
        setLoading(false);
        return;
      }
      login(data.access_token, {
        id: data.user_id,
        email: data.email,
        full_name: data.full_name,
        role: data.role,
        is_active: true,
        created_at: new Date().toISOString(),
      });
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Administrator authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoAdmin = () => {
    setEmail('admin@psmintern.com');
    setPassword('AdminPSM@2026!');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/80 p-8 text-white">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-400 mx-auto mb-4">
              <Shield className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Administrator Console
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
              Authorized personnel only. Protected administrative environment.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="admin@psmintern.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 text-white placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 text-white placeholder:text-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-md shadow-purple-600/30 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Administrator</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credential Button */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <button
              type="button"
              onClick={handleFillDemoAdmin}
              className="w-full py-2 px-3 text-xs font-medium text-purple-300 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800 rounded-lg transition-colors text-center"
            >
              Use Initial Admin (admin@psmintern.com)
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Are you a student intern?{' '}
            <Link to="/login" className="font-semibold text-purple-400 hover:text-purple-300">
              Switch to Student Portal
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};
