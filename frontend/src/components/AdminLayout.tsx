import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Star,
  Award,
  QrCode,
  History,
  Settings,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Manage Interns', to: '/admin/interns', icon: Users },
    { label: 'Manage Projects', to: '/admin/projects', icon: FolderKanban },
    { label: 'Mentor Evaluations', to: '/admin/evaluations', icon: Star },
    { label: 'Certificates', to: '/admin/certificates', icon: Award },
    { label: 'QR Code Management', to: '/admin/qr-codes', icon: QrCode },
    { label: 'Audit Logs', to: '/admin/audit-logs', icon: History },
    { label: 'Company Settings', to: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Lavender Sidebar (Prominently styled with lavender background and deep purple accents) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-purple-100/90 via-purple-50 to-indigo-50/70 border-r border-purple-200/80 p-5 flex flex-col transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between pb-6 border-b border-purple-200/70">
          <Link to="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-700 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight text-base">
                PSM<span className="text-purple-700">.Intern</span>
              </span>
              <span className="block text-[10px] font-semibold text-purple-700 uppercase tracking-wider">
                Admin Console
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-purple-700 text-white shadow-sm shadow-purple-700/20 font-semibold'
                      : 'text-slate-700 hover:bg-purple-200/50 hover:text-purple-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className="pt-4 border-t border-purple-200/70 space-y-3">
          <Link
            to="/verify/psm-verify-aarav-2026-valid-token-alpha"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-purple-800 bg-purple-200/40 hover:bg-purple-200/70 rounded-lg transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              Public Verification
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center justify-between px-2 pt-2">
            <div className="truncate mr-2">
              <p className="text-xs font-semibold text-slate-800 truncate">{user?.full_name}</p>
              <p className="text-[10px] text-purple-700 font-medium">Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Navbar for Mobile/Tablet */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-purple-100 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-sm font-semibold text-slate-700 hidden sm:inline-block">
              Internship Verification Management System
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              System Online
            </span>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
