import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  User,
  Building2,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  ExternalLink,
  QrCode,
  Download,
  Copy,
  Check,
  XCircle,
  Loader2,
  Share2,
  Globe,
  FileBadge,
} from 'lucide-react';
import { GithubIcon } from '../components/GithubIcon';
import { api, getMediaUrl } from '../services/api';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

interface PublicProfileData {
  full_name: string;
  intern_id: string;
  internship_domain: string;
  company_name: string;
  duration_weeks: number;
  start_date?: string;
  end_date?: string;
  profile_photo_url?: string;
  college?: string;
  bio?: string;
  student_github_url?: string;
  is_active: boolean;
  project_title?: string;
  project_description?: string;
  project_technologies?: string;
  project_status?: string;
  github_url?: string;
  live_demo_url?: string;
  documentation_url?: string;
  certificate_status?: string;
  certificate_id?: string;
  certificate_verification_url?: string;
  profile_verification_url: string;
  profile_qr_url: string;
  company_contact_email: string;
  company_website: string;
}

export const PublicProfilePage: React.FC = () => {
  const { internId } = useParams<{ internId: string }>();
  const [data, setData] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloadingQr, setDownloadingQr] = useState(false);

  useEffect(() => {
    if (!internId) return;
    setLoading(true);
    setError(null);

    api
      .getPublicProfile(internId)
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        setError(err.message || 'Student profile not found or inactive in the registry.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [internId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = async () => {
    if (!internId) return;
    try {
      setDownloadingQr(true);
      const blob = await api.downloadPublicProfileQr(internId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PSM_Profile_QR_${internId}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Failed to download QR code: ' + (err.message || 'Unknown error'));
    } finally {
      setDownloadingQr(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-purple-100 shadow-xl shadow-purple-500/5">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800">Verifying Student Profile Record...</h2>
            <p className="text-slate-500 text-sm mt-1">Fetching authorized public credentials from registry</p>
          </div>
        ) : error || !data ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-rose-200 shadow-xl shadow-rose-500/5 text-center">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Profile Not Found</h2>
            <p className="mt-2 text-slate-600 text-sm max-w-md mx-auto">
              {error || 'No active student profile matches this intern ID.'}
            </p>
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Return to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Verification Banner */}
            <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-600/15 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider mb-1">
                    Verified Public Profile
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {data.full_name}
                  </h1>
                  <p className="text-purple-100 text-sm mt-0.5">
                    Official Internship Record · Intern ID: <span className="font-mono font-semibold">{data.intern_id}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-colors border border-white/20"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied Link' : 'Copy Profile Link'}
                </button>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left / Center 2 Cols: Details & Projects */}
              <div className="lg:col-span-2 space-y-6">
                {/* Profile Header Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div className="relative shrink-0">
                      {data.profile_photo_url ? (
                        <img
                          src={getMediaUrl(data.profile_photo_url)}
                          alt={data.full_name}
                          className="w-28 h-28 rounded-full object-cover border-4 border-purple-100 shadow-md"
                        />
                      ) : (
                        <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-3xl flex items-center justify-center shadow-md border-4 border-purple-100">
                          {data.full_name.charAt(0)}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white shadow">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-2">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">{data.full_name}</h2>
                        <p className="text-purple-600 font-semibold">{data.internship_domain}</p>
                      </div>

                      {data.bio && (
                        <p className="text-slate-600 text-sm leading-relaxed">{data.bio}</p>
                      )}

                      <div className="flex flex-wrap gap-2 pt-2 justify-center sm:justify-start">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                          <Building2 className="w-3.5 h-3.5" />
                          {data.company_name}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          <Calendar className="w-3.5 h-3.5" />
                          {data.duration_weeks} Weeks Program
                        </span>
                        {data.college && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            <GraduationCap className="w-3.5 h-3.5" />
                            {data.college}
                          </span>
                        )}
                        {(data.student_github_url || data.github_url) && (
                          <a
                            href={data.student_github_url || data.github_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors"
                          >
                            <GithubIcon className="w-3.5 h-3.5" />
                            <span>GitHub Profile</span>
                            <ExternalLink className="w-3 h-3 text-purple-400" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Summary Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Intern ID</div>
                      <div className="text-base font-bold text-slate-800 font-mono mt-1">{data.intern_id}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Domain Specialization</div>
                      <div className="text-base font-bold text-slate-800 mt-1">{data.internship_domain}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Start Date</div>
                      <div className="text-sm font-semibold text-slate-800 mt-1">{data.start_date || 'N/A'}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Completion Date</div>
                      <div className="text-sm font-semibold text-slate-800 mt-1">{data.end_date || 'N/A'}</div>
                    </div>
                    {(data.student_github_url || data.github_url) && (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 sm:col-span-2">
                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">GitHub Profile</div>
                        <a
                          href={data.student_github_url || data.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-semibold text-purple-700 hover:text-purple-800 hover:underline mt-1 inline-flex items-center gap-1.5 break-all"
                        >
                          <GithubIcon className="w-4 h-4 text-slate-700 shrink-0" />
                          <span>{data.student_github_url || data.github_url}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Project Summary Card */}
                {data.project_title ? (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-bold text-slate-900">Internship Project</h3>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {data.project_status?.toUpperCase() || 'COMPLETED'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xl font-bold text-slate-800">{data.project_title}</h4>
                      {data.project_description && (
                        <p className="text-slate-600 text-sm mt-2 leading-relaxed whitespace-pre-line">
                          {data.project_description}
                        </p>
                      )}
                    </div>

                    {data.project_technologies && (
                      <div>
                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Technologies Used</div>
                        <div className="flex flex-wrap gap-2">
                          {data.project_technologies.split(',').map((tech, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100"
                            >
                              {tech.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-100">
                      {data.github_url && (
                        <a
                          href={data.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                          <GithubIcon className="w-4 h-4" />
                          View Repository
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        </a>
                      )}
                      {data.live_demo_url && (
                        <a
                          href={data.live_demo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
                        >
                          <Globe className="w-4 h-4" />
                          Live Demo
                          <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                        </a>
                      )}
                    </div>
                  </div>
                ) : null}

                {/* Certificate Status Section */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-bold text-slate-900">Certificate Status</h3>
                  </div>

                  {data.certificate_status === 'issued' ? (
                    <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-1 text-emerald-800 font-bold text-sm">
                          <Check className="w-4 h-4" />
                          Official Verified Certificate Issued
                        </div>
                        <p className="text-xs text-emerald-700 mt-1">
                          Certificate ID: <span className="font-mono font-bold">{data.certificate_id}</span>
                        </p>
                      </div>
                      {data.certificate_verification_url && (
                        <a
                          href={data.certificate_verification_url}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shrink-0 shadow-sm"
                        >
                          <FileBadge className="w-4 h-4" />
                          View Certificate
                        </a>
                      )}
                    </div>
                  ) : data.certificate_status === 'revoked' ? (
                    <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200">
                      <div className="inline-flex items-center gap-1 text-rose-800 font-bold text-sm">
                        <XCircle className="w-4 h-4" />
                        Certificate Revoked
                      </div>
                      <p className="text-xs text-rose-700 mt-1">
                        The internship certificate associated with this profile is no longer active.
                      </p>
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-sm">
                      Certificate generation in progress or pending final evaluation.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Col: Dedicated Profile QR Code Card */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-xl shadow-purple-500/5 text-center space-y-5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold uppercase tracking-wider">
                    <QrCode className="w-3.5 h-3.5" />
                    Public Verification QR
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">Student Profile QR</h3>
                  <p className="text-xs text-slate-500">
                    Scan with any mobile device to directly access and verify this student's official public profile.
                  </p>

                  <div className="flex justify-center p-4 bg-purple-50/60 rounded-2xl border border-purple-100">
                    <img
                      src={`/api/v1/public/profile/${data.intern_id}/qr`}
                      alt={`Verification QR code for ${data.full_name}`}
                      className="w-44 h-44 object-contain rounded-xl bg-white p-2 shadow-sm"
                    />
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <button
                      onClick={handleDownloadQr}
                      disabled={downloadingQr}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm transition-all shadow-md shadow-purple-600/20 disabled:opacity-50"
                    >
                      {downloadingQr ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      Download QR Code
                    </button>

                    <button
                      onClick={handleCopyLink}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-all"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Link Copied' : 'Copy Profile Link'}
                    </button>
                  </div>
                </div>

                {/* Privacy & Trust Guarantee */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    Privacy & Authenticity Assured
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    This public verification page reveals only authorized public credentials approved by PSM.Intern.
                    Personal contact information, passwords, and private identifiers remain strictly confidential.
                  </p>
                  <div className="pt-2 text-xs text-slate-400 border-t border-slate-100">
                    Issuer: {data.company_name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
