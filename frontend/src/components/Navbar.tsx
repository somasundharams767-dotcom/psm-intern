import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Search, Menu, X, User, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickVerifyToken, setQuickVerifyToken] = useState('');

  const handleQuickVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickVerifyToken.trim()) {
      navigate(`/verify/${quickVerifyToken.trim()}`);
      setQuickVerifyToken('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-purple-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center">
                PSM<span className="text-purple-600">.Intern</span>
              </span>
              <span className="hidden sm:block text-[10px] font-medium text-slate-400 tracking-wider uppercase -mt-1">
                Verification Platform
              </span>
            </div>
          </Link>

          {/* Quick Verification Search */}
          <form onSubmit={handleQuickVerify} className="hidden md:flex items-center relative max-w-xs w-full mx-6">
            <input
              type="text"
              placeholder="Enter Certificate or Token ID..."
              value={quickVerifyToken}
              onChange={(e) => setQuickVerifyToken(e.target.value)}
              className="w-full pl-9 pr-16 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-1 top-1 px-2.5 py-1 text-[11px] font-medium bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Verify
            </button>
          </form>

          {/* Navigation Links & Authentication CTA */}
          <nav className="hidden lg:flex items-center gap-4">
            <Link
              to="/#features"
              className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors"
            >
              Features
            </Link>
            <Link
              to="/#how-it-works"
              className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors"
            >
              How It Works
            </Link>
            <Link
              to="/verify/psm-verify-aarav-2026-valid-token-alpha"
              className="text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors flex items-center gap-1"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Live Demo
            </Link>

            <div className="h-5 w-px bg-slate-200 mx-1" />

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{user.role === 'admin' ? 'Admin Portal' : 'My Dashboard'}</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-purple-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Student Login
                </Link>
                <Link
                  to="/admin/login"
                  className="text-sm font-medium text-purple-700 hover:text-purple-800 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium text-white px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-xs shadow-purple-500/20 transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-purple-100 bg-white px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleQuickVerify} className="relative mb-3">
            <input
              type="text"
              placeholder="Enter Certificate or Token ID..."
              value={quickVerifyToken}
              onChange={(e) => setQuickVerifyToken(e.target.value)}
              className="w-full pl-9 pr-16 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-3 py-1 text-xs font-medium bg-purple-600 text-white rounded-md"
            >
              Verify
            </button>
          </form>

          <Link
            to="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700"
          >
            Features
          </Link>
          <Link
            to="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700"
          >
            How It Works
          </Link>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated && user ? (
              <>
                <Link
                  to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 px-4 rounded-lg bg-purple-600 text-white text-sm font-medium"
                >
                  {user.role === 'admin' ? 'Admin Portal' : 'Student Dashboard'}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg text-center"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg"
                >
                  Student Login
                </Link>
                <Link
                  to="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium text-purple-700 bg-purple-50 rounded-lg"
                >
                  Admin Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium text-white bg-purple-600 rounded-lg"
                >
                  Create Student Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
