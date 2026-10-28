import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FolderKanban,
  Star,
  Award,
  ShieldAlert,
  Clock,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../services/api';
import { AdminDashboardData } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getAdminDashboard()
      .then((res: AdminDashboardData) => setData(res))
      .catch((err) => setError(err.message || 'Failed to load administrator dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700">
        <p className="font-semibold">{error || 'Could not load admin stats.'}</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Interns',
      value: data.total_interns,
      icon: Users,
      color: 'text-purple-700',
      bg: 'bg-purple-100/70',
      border: 'border-purple-200/80',
      link: '/admin/interns',
    },
    {
      title: 'Active Internships',
      value: data.active_internships,
      icon: Activity,
      color: 'text-indigo-700',
      bg: 'bg-indigo-100/70',
      border: 'border-indigo-200/80',
      link: '/admin/interns',
    },
    {
      title: 'Pending Project Reviews',
      value: data.pending_project_reviews,
      icon: FolderKanban,
      color: 'text-amber-700',
      bg: 'bg-amber-100/70',
      border: 'border-amber-200/80',
      link: '/admin/projects',
    },
    {
      title: 'Pending Evaluations',
      value: data.pending_evaluations,
      icon: Star,
      color: 'text-sky-700',
      bg: 'bg-sky-100/70',
      border: 'border-sky-200/80',
      link: '/admin/evaluations',
    },
    {
      title: 'Certificates Issued',
      value: data.certificates_issued,
      icon: Award,
      color: 'text-emerald-700',
      bg: 'bg-emerald-100/70',
      border: 'border-emerald-200/80',
      link: '/admin/certificates',
    },
    {
      title: 'Certificates Revoked',
      value: data.certificates_revoked,
      icon: ShieldAlert,
      color: 'text-rose-700',
      bg: 'bg-rose-100/70',
      border: 'border-rose-200/80',
      link: '/admin/certificates',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time verification telemetry, intern cohort metrics, and certification operations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/interns"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-purple-700 text-white hover:bg-purple-800 transition-colors shadow-sm shadow-purple-700/20"
          >
            Manage Interns
          </Link>
        </div>
      </div>

      {/* 6 Dashboard Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.title}
              to={c.link}
              className={`p-6 rounded-3xl bg-white border ${c.border} shadow-xs hover:shadow-md transition-all group`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {c.title}
                </span>
                <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                  {c.value}
                </span>
                <span className="text-xs text-purple-700 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Manage &rarr;
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Charts & Domain Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Domain Distribution */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 sm:p-7 border border-purple-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-base font-bold text-slate-900">Internship Domains</h3>
              <Building2 className="w-4 h-4 text-purple-600" />
            </div>

            <div className="space-y-4">
              {Object.entries(data.domain_breakdown).length === 0 ? (
                <p className="text-xs text-slate-400">No domain records found.</p>
              ) : (
                Object.entries(data.domain_breakdown).map(([domain, count]) => {
                  const percentage = Math.round((count / (data.total_interns || 1)) * 100);
                  return (
                    <div key={domain} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-700 truncate max-w-[180px]">{domain}</span>
                        <span className="text-purple-700 font-bold">{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6 text-xs text-slate-400">
            Total cohorts active across all verified disciplines.
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h3 className="text-base font-bold text-slate-900">Recent Audit & Verification Activities</h3>
            <Link
              to="/admin/audit-logs"
              className="text-xs font-semibold text-purple-700 hover:text-purple-800 flex items-center gap-1"
            >
              <span>Full Audit Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {data.recent_activities.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">No recent activity logged.</p>
            ) : (
              data.recent_activities.map((act) => (
                <div key={act.id} className="py-3.5 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-800 capitalize">
                      {act.action.replace(/_/g, ' ')}
                    </span>
                    <p className="text-slate-500 text-[11px] leading-relaxed">{act.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
