import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Download,
  Share2,
  ExternalLink,
  Copy,
  Check,
  Building2,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Loader2,
  AlertCircle,
  Mail,
  QrCode,
} from 'lucide-react';
import { api } from '../../services/api';
import { Certificate } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';

export const StudentCertificatePage: React.FC = () => {
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getStudentCertificate()
      .then((res: Certificate) => setCert(res))
      .catch((err) => setError(err.message || 'Certificate record not found'))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async () => {
    if (!cert || cert.status !== 'issued') return;
    setDownloading(true);
    try {
      const blob = await api.downloadStudentCertificate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PSM_Certificate_${cert.certificate_id}.pdf`;
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

  const handleCopy = () => {
    if (cert?.verification_url) {
      navigator.clipboard.writeText(cert.verification_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700">
        <p className="font-semibold">{error || 'Certificate not available.'}</p>
      </div>
    );
  }

  const isIssued = cert.status === 'issued';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Internship Certificate</h1>
          <p className="text-sm text-slate-500 mt-1">
            Official cryptographic credential issued by company administration.
          </p>
        </div>
        <StatusBadge status={cert.status} size="lg" />
      </div>

      {/* Main Certificate Card with Lavender / Purple Highlights */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-purple-200 shadow-xl shadow-purple-500/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100/50 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <span className="text-xs font-bold text-purple-700 uppercase tracking-widest block">
                Certificate of Completion
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {cert.intern_name}
              </h2>
              <span className="text-xs text-slate-500 font-medium">Intern ID: {cert.intern_id}</span>
            </div>

            <div className="text-left sm:text-right bg-purple-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Certificate ID
              </span>
              <span className="font-mono text-sm sm:text-base font-bold text-purple-900">
                {cert.certificate_id}
              </span>
            </div>
          </div>

          {/* Details & QR Code Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center py-2 border-b border-slate-100">
            <div className="md:col-span-2 space-y-4 text-sm">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Internship Domain
                </span>
                <span className="font-bold text-slate-800 text-base">{cert.internship_domain}</span>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Issuing Organization
                </span>
                <span className="font-bold text-purple-900 text-base flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  {cert.company_name}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Program Duration
                  </span>
                  <span className="font-semibold text-slate-700">{cert.duration_weeks} Weeks</span>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Official Issue Date
                  </span>
                  <span className="font-semibold text-slate-700">
                    {cert.issue_date
                      ? new Date(cert.issue_date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Pending Approval'}
                  </span>
                </div>
              </div>
            </div>

            {/* QR Code Preview Box */}
            <div className="flex flex-col items-center justify-center p-6 bg-purple-50/60 rounded-2xl border border-purple-100 text-center">
              {isIssued || cert.status === 'revoked' ? (
                <>
                  <div className="w-36 h-36 bg-white p-2.5 rounded-2xl border-2 border-purple-200 shadow-md mb-3 flex items-center justify-center">
                    <img
                      src={`/api/v1/public/certificates/${cert.verification_token}/qr`}
                      alt={`Certificate verification QR code for ${cert.certificate_id}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-xs font-bold text-purple-900 flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5 text-purple-600" />
                    Official Verification QR
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Scan with any phone camera to verify authenticity
                  </p>
                </>
              ) : (
                <div className="py-8 text-slate-400 text-xs">
                  <Clock className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <span>QR will activate upon issuance</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {isIssued ? (
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-md shadow-purple-600/20 flex items-center gap-2 disabled:opacity-60"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloading ? 'Generating PDF...' : 'Download Official PDF Certificate'}</span>
                </button>
              ) : (
                <span className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 font-medium">
                  Certificate download disabled until administrator issues official credential.
                </span>
              )}

              <Link
                to={`/verify/${cert.verification_token}`}
                target="_blank"
                className="px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
              >
                <span>View Public Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Link Copied!' : 'Copy Verification URL'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
