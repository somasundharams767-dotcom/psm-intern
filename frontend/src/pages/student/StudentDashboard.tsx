import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  FolderKanban,
  Star,
  Award,
  Download,
  ExternalLink,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Calendar,
  Building2,
  User,
} from 'lucide-react';
import { api } from '../../services/api';
import { StudentDashboardData } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';

export const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getStudentDashboard()
      .then((res) => setData(res))
      .catch((err) => setError(err.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async () => {
    if (!data?.can_download_certificate) return;
    setDownloading(true);
    try {
      const blob = await api.downloadStudentCertificate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PSM_Certificate_${data.certificate_id || 'Official'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || 'Error downloading certificate');
    } finally {
      setDownloading(false);
    }
  };

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
        <p className="font-semibold">{error || 'Could not load student information.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-900/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white/30 shadow-md bg-white/20 shrink-0 flex items-center justify-center">
            {data.profile_photo_url ? (
              <img
                src={data.profile_photo_url}
                alt={data.intern_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-white font-extrabold text-2xl sm:text-3xl">
                {data.intern_name.charAt(0)}
              </div>
            )}
          </div>
          <div className="text-center sm:text-left">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-purple-100 mb-2">
              Intern Profile Active &bull; {data.intern_id}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {data.intern_name}!
            </h1>
            <p className="text-purple-100 text-xs sm:text-sm mt-1 max-w-xl">
              Internship Domain: <span className="font-semibold text-white">{data.internship_domain}</span> ({data.duration_weeks} Weeks)
            </p>
          </div>
        </div>

        {/* Profile Completion Indicator */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[200px]">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span>Profile Completion</span>
            <span className="font-bold text-purple-200">{data.profile_completion}%</span>
          </div>
          <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500"
              style={{ width: `${data.profile_completion}%` }}
            />
          </div>
          <Link
            to="/student/profile"
            className="text-[11px] text-purple-200 hover:text-white mt-2 block text-right font-medium"
          >
            Update Profile &rarr;
          </Link>
        </div>
      </div>

      {/* 4 Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Internship Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase">Internship</span>
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-base font-bold text-slate-900 truncate">{data.internship_domain}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-slate-500">{data.duration_weeks} Weeks Cohort</span>
            <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              Active
            </span>
          </div>
        </div>

        {/* Card 2: Project Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase">Capstone Project</span>
            <FolderKanban className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mb-2">
            <StatusBadge status={data.project_status} />
          </div>
          <Link to="/student/project" className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
            <span>View Submissions</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 3: Evaluation Summary */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase">Mentor Rating</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-2xl font-extrabold text-slate-900">
              {data.overall_rating ? data.overall_rating.toFixed(1) : '--'}
            </span>
            <span className="text-xs text-slate-400">/ 5.0</span>
          </div>
          <Link to="/student/evaluation" className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
            <span>View Criteria Breakdown</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 4: Certificate Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase">Certificate</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mb-2">
            <StatusBadge status={data.certificate_status} />
          </div>
          {data.can_download_certificate ? (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'Downloading...' : 'Download PDF'}</span>
            </button>
          ) : (
            <span className="text-[11px] text-slate-400">Issuance pending approval</span>
          )}
        </div>
      </div>

      {/* Quick Actions & Certificate Callout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Certificate Action Box */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Official Certificate Status</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Cryptographically signed credential with canonical public QR code.
              </p>
            </div>
            <StatusBadge status={data.certificate_status} size="lg" />
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-purple-700 font-semibold block">Certificate ID</span>
              <span className="font-mono text-sm font-bold text-slate-800">
                {data.certificate_id || 'Not Yet Assigned'}
              </span>
            </div>

            {data.verification_token && (
              <Link
                to={`/verify/${data.verification_token}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-purple-800 text-xs font-semibold rounded-xl border border-purple-200 shadow-xs hover:bg-purple-50 transition-colors"
              >
                <span>Preview Public Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {data.can_download_certificate ? (
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-md shadow-purple-600/20 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{downloading ? 'Preparing PDF...' : 'Download Official Certificate PDF'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200">
                <Clock className="w-4 h-4 shrink-0" />
                <span>Certificate will become available for download once approved and issued by the administrator.</span>
              </div>
            )}
            <Link
              to="/student/certificates"
              className="px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              Certificate Hub
            </Link>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-2.5">
              <Link
                to="/student/project"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-purple-50 hover:text-purple-700 transition-colors text-xs font-semibold text-slate-700 border border-slate-100"
              >
                <span className="flex items-center gap-2.5">
                  <FolderKanban className="w-4 h-4 text-purple-600" />
                  Submit / Update Project
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                to="/student/profile"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-purple-50 hover:text-purple-700 transition-colors text-xs font-semibold text-slate-700 border border-slate-100"
              >
                <span className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-purple-600" />
                  Edit Profile Details
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                to="/student/evaluation"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-purple-50 hover:text-purple-700 transition-colors text-xs font-semibold text-slate-700 border border-slate-100"
              >
                <span className="flex items-center gap-2.5">
                  <Star className="w-4 h-4 text-purple-600" />
                  View Mentor Feedback
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            For internship domain or date modifications, please contact company administration.
          </div>
        </div>
      </div>
    </div>
  );
};
