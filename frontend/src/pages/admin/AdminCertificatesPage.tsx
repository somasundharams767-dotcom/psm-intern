import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Download,
  ExternalLink,
  QrCode,
  RotateCcw,
  Loader2,
  AlertTriangle,
  History,
} from 'lucide-react';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';

export const AdminCertificatesPage: React.FC = () => {
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [selectedCert, setSelectedCert] = useState<any | null>(null);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const fetchCertificates = () => {
    setLoading(true);
    api
      .listCertificates(statusFilter || undefined)
      .then((res) => setCerts(res || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCertificates();
  }, [statusFilter]);

  const handleApprove = async (id: number) => {
    setActionLoading(true);
    try {
      await api.approveCertificate(id);
      fetchCertificates();
    } catch (err: any) {
      alert(err.message || 'Failed to approve certificate');
    } finally {
      setActionLoading(false);
    }
  };

  const handleIssue = async (id: number) => {
    setActionLoading(true);
    try {
      await api.issueCertificate(id);
      fetchCertificates();
    } catch (err: any) {
      alert(err.message || 'Failed to issue certificate');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenRevoke = (cert: any) => {
    setSelectedCert(cert);
    setRevokeReason('');
    setRevokeModalOpen(true);
  };

  const handleConfirmRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCert || !revokeReason.trim()) return;
    setActionLoading(true);
    try {
      await api.revokeCertificate(selectedCert.id, revokeReason.trim());
      setRevokeModalOpen(false);
      fetchCertificates();
    } catch (err: any) {
      alert(err.message || 'Failed to revoke certificate');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenReject = (cert: any) => {
    setSelectedCert(cert);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCert || !rejectReason.trim()) return;
    setActionLoading(true);
    try {
      await api.rejectCertificate(selectedCert.id, rejectReason.trim());
      setRejectModalOpen(false);
      fetchCertificates();
    } catch (err: any) {
      alert(err.message || 'Failed to reject certificate');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReissue = async (id: number) => {
    if (!window.confirm('Are you sure you want to re-issue this certificate?')) return;
    setActionLoading(true);
    try {
      await api.reissueCertificate(id);
      fetchCertificates();
    } catch (err: any) {
      alert(err.message || 'Failed to reissue certificate');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadPdf = async (cert: any) => {
    try {
      const blob = await api.adminDownloadCertificate(cert.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate_${cert.certificate_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || 'Failed to download certificate PDF');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Certificate Operations Hub</h1>
          <p className="text-sm text-slate-500 mt-1">
            Approve, generate, issue, and manage tamper-proof internship certificates and QR anchors.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-700 shadow-xs"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="issued">Issued</option>
          <option value="revoked">Revoked</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Certificates Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Certificate & Intern</th>
                <th className="py-3.5 px-4">Domain & Duration</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Issue Date</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Certificate Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
                    <span>Loading certificate records...</span>
                  </td>
                </tr>
              ) : certs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No certificates found matching this filter.
                  </td>
                </tr>
              ) : (
                certs.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-mono text-xs font-bold text-purple-900">{c.certificate_id}</div>
                      <div className="font-bold text-slate-800 text-sm mt-0.5">{c.intern_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">Intern ID: {c.intern_id}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="font-medium">{c.internship_domain}</div>
                      <div className="text-[11px] text-slate-400">{c.duration_weeks} Weeks &bull; {c.company_name}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={c.status} size="sm" />
                      {c.status === 'revoked' && c.revocation_reason && (
                        <div className="text-[10px] text-rose-700 font-medium truncate max-w-[180px] mt-1" title={c.revocation_reason}>
                          Reason: {c.revocation_reason}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      {c.issue_date ? new Date(c.issue_date).toLocaleDateString() : '--'}
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-right space-x-1.5 whitespace-nowrap">
                      {/* PENDING -> Approve or Reject */}
                      {c.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(c.id)}
                            disabled={actionLoading}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleOpenReject(c)}
                            disabled={actionLoading}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {/* APPROVED -> Issue Certificate */}
                      {c.status === 'approved' && (
                        <button
                          onClick={() => handleIssue(c.id)}
                          disabled={actionLoading}
                          className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors"
                        >
                          Generate & Issue
                        </button>
                      )}

                      {/* ISSUED -> Download PDF, Revoke, Public Link */}
                      {c.status === 'issued' && (
                        <>
                          <button
                            onClick={() => handleDownloadPdf(c)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 inline-flex items-center gap-1"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>

                          <Link
                            to={`/verify/${c.verification_token}`}
                            target="_blank"
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 inline-flex items-center gap-1"
                            title="Open verification page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Verify</span>
                          </Link>

                          <button
                            onClick={() => handleOpenRevoke(c)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                          >
                            Revoke
                          </button>
                        </>
                      )}

                      {/* REVOKED -> Re-issue or View public page */}
                      {c.status === 'revoked' && (
                        <>
                          <Link
                            to={`/verify/${c.verification_token}`}
                            target="_blank"
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-100 text-rose-800 inline-flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Check Status</span>
                          </Link>

                          <button
                            onClick={() => handleReissue(c.id)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 inline-flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Re-Issue</span>
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mandatory Revocation Reason Modal */}
      <Modal isOpen={revokeModalOpen} onClose={() => setRevokeModalOpen(false)} title="Revoke Certificate">
        {selectedCert && (
          <form onSubmit={handleConfirmRevoke} className="space-y-4 text-xs sm:text-sm">
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <span className="font-bold block mb-1">Warning: Irreversible Public Revocation</span>
              Revoking certificate <span className="font-mono font-bold">{selectedCert.certificate_id}</span> will immediately render all public verification lookups and QR scans INVALID.
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Mandatory Revocation Reason <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="State the official reason for revoking this certificate (e.g. academic integrity violation, falsified milestone data, administrative withdrawal)..."
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRevokeModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading || !revokeReason.trim()}
                className="px-5 py-2 rounded-xl text-white bg-rose-700 hover:bg-rose-800 font-semibold shadow-md shadow-rose-700/20 disabled:opacity-50"
              >
                {actionLoading ? 'Revoking...' : 'Confirm Revocation'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Rejection Modal */}
      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Reject Certificate Request">
        {selectedCert && (
          <form onSubmit={handleConfirmReject} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Rejection Reason
              </label>
              <textarea
                rows={3}
                required
                placeholder="Explain why the certificate request is denied..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading || !rejectReason.trim()}
                className="px-5 py-2 rounded-xl text-white bg-slate-800 hover:bg-slate-900 font-semibold"
              >
                {actionLoading ? 'Rejecting...' : 'Reject Certificate'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
