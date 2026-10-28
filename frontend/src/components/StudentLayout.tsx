import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, FolderKanban, Award, Star, Settings, LogOut, ShieldCheck, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, getMediaUrl } from '../services/api';

export const StudentLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    api
      .getStudentProfile()
      .then((res) => {
        if (res.profile_photo_url) {
          setAvatarUrl(res.profile_photo_url);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', to: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Profile', to: '/student/profile', icon: User },
    { label: 'Internship', to: '/student/internship', icon: Briefcase },
    { label: 'Project', to: '/student/project', icon: FolderKanban },
    { label: 'Evaluation', to: '/student/evaluation', icon: Star },
    { label: 'Certificate', to: '/student/certificates', icon: Award },
    { label: 'Settings', to: '/student/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-purple-100 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-sm shadow-purple-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                  PSM<span className="text-purple-600">.Intern</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md">
                  Student Portal
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-800">{user?.full_name}</p>
                <p className="text-[11px] text-slate-500">{user?.email}</p>
              </div>
              <div className="w-9 h-9 rounded-full overflow-hidden bg-purple-100 border border-purple-200 text-purple-700 font-bold flex items-center justify-center text-sm shrink-0">
                {avatarUrl ? (
                  <img src={getMediaUrl(avatarUrl)} alt={user?.full_name} className="w-full h-full object-cover" />
                ) : (
                  user?.full_name?.charAt(0) || 'S'
                )}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto scrollbar-none py-1 border-t border-slate-100">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-purple-100/80 text-purple-900 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0 text-purple-600" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Outlet */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};
