import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  XCircle,
  Building2,
  Calendar,
  Award,
  User,
  Mail,
  Globe,
  Share2,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Loader2,
  FileBadge,
} from 'lucide-react';
import { api } from '../services/api';
import { PublicVerification } from '../types';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const PublicVerifyPage: React.FC = () => {
  const { verificationId } = useParams<{ verificationId: string }>();
  const [data, setData] = useState<PublicVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!verificationId) return;
    setLoading(true);
    setError(null);

    api
      .verifyCertificatePublic(verificationId)
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        setError(err.message || 'Verification record not found in the official registry.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [verificationId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-purple-100 shadow-xl shadow-purple-500/5">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800">Verifying Certificate Authenticity...</h2>
            <p className="text-slate-500 text-sm mt-1">Querying tamper-resistant registry records</p>
          </div>
        ) : error || !data ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-rose-200 shadow-xl shadow-rose-500/5 text-center">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Verification Failed</h2>
            <p className="mt-2 text-slate-600 text-sm max-w-md mx-auto">
              {error || 'No certificate record exists matching this verification token.'}
            </p>
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Return to Search
              </Link>
              <Link
                to="/verify/psm-verify-aarav-2026-valid-token-alpha"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700"
              >
                View Sample Valid Certificate
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Banner */}
            {data.status === 'issued' ? (
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-600/15 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                    <ShieldCheck className="w-10 h-10" />
                  </div>
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 text-emerald-50 mb-1">
                      Official Verification Status
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      Valid & Verified Certificate
                    </h2>
                    <p className="text-emerald-100 text-xs sm:text-sm mt-1">
                      This credential has been officially issued by {data.company_name} and is authentic.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-800 text-xs sm:text-sm font-bold shadow-md hover:bg-emerald-50 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                    <span>{copied ? 'Link Copied!' : 'Share Proof'}</span>
                  </button>
                </div>
              </div>
            ) : data.status === 'revoked' ? (
              <div className="bg-gradient-to-r from-rose-700 to-red-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-rose-900/20">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                    <ShieldAlert className="w-10 h-10" />
                  </div>
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 text-rose-100 mb-1">
                      Official Verification Status
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      Certificate Has Been Revoked
                    </h2>
                    <p className="text-rose-100 text-xs sm:text-sm mt-1">
                      This certificate was previously generated but has been officially annulled and is NO LONGER VALID.
                    </p>

                    {data.revocation_reason && (
                      <div className="mt-4 p-4 rounded-2xl bg-black/30 border border-white/20 text-xs sm:text-sm leading-relaxed">
                        <span className="font-bold text-rose-200 block mb-1">Official Revocation Reason:</span>
                        <p className="text-white">{data.revocation_reason}</p>
                        {data.revoked_at && (
                          <span className="block mt-2 text-[11px] text-rose-300">
                            Revocation executed on: {new Date(data.revoked_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-amber-600 to-yellow-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-amber-600/15 flex items-center gap-4">
                <Clock className="w-12 h-12 text-white shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Status: {data.status.toUpperCase()}</h2>
                  <p className="text-amber-100 text-xs sm:text-sm mt-1">
                    This certificate request is pending final issuance by the company administration.
                  </p>
                </div>
              </div>
            )}

            {/* Certificate Details Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-purple-100 shadow-xl shadow-purple-500/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div>
                  <span className="text-xs font-bold text-purple-700 uppercase tracking-widest">
                    Internship Credential
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                    {data.intern_name}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium">Intern ID: {data.intern_id}</p>
                </div>

                <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Certificate Number
                  </span>
                  <span className="font-mono text-sm sm:text-base font-bold text-purple-900">
                    {data.certificate_id}
                  </span>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-slate-100 text-sm">
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Internship Domain
                    </span>
                    <span className="font-bold text-slate-800 text-base">{data.internship_domain}</span>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Host Organization
                    </span>
                    <span className="font-bold text-purple-800 text-base flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-purple-600" />
                      {data.company_name}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Program Duration
                    </span>
                    <span className="font-semibold text-slate-700">
                      {data.duration_weeks} Weeks
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Issue Date
                    </span>
                    <span className="font-semibold text-slate-800">
                      {data.issue_date
                        ? new Date(data.issue_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                        : 'Pending Issuance'}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Authorized Signatory
                    </span>
                    <span className="font-bold text-slate-800 block">{data.authorized_signatory_name}</span>
                    <span className="text-xs text-slate-500">{data.authorized_signatory_title}</span>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Official Contact
                    </span>
                    <a
                      href={`mailto:${data.company_contact_email}`}
                      className="text-purple-600 hover:text-purple-700 text-xs font-medium flex items-center gap-1"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {data.company_contact_email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified by PSM.Intern Cryptographic Registry</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied' : 'Copy Verification URL'}</span>
                  </button>

                  <a
                    href={`mailto:${data.company_contact_email}?subject=Verification%20Inquiry:%20${data.certificate_id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Contact Company</span>
                  </a>
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
