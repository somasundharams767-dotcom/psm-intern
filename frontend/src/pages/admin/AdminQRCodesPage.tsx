import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  QrCode,
  Download,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  Loader2,
  Copy,
  Check,
  Eye,
  X,
  Sparkles,
  RefreshCw,
  Building2,
  FileBadge,
  LayoutGrid,
  Table as TableIcon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';

export const AdminQRCodesPage: React.FC = () => {
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [issuingId, setIssuingId] = useState<number | null>(null);
  const [selectedQrCert, setSelectedQrCert] = useState<any | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = () => {
    setLoading(true);
    api
      .listCertificates()
      .then((res) => setCerts(res || []))
      .catch((err) => setMessage({ text: err.message || 'Failed to load certificates', type: 'error' }))
      .finally(() => setLoading(false));
  };

  const handleDownloadQr = async (c: any) => {
    try {
      const blob = await api.downloadPublicCertificateQr(c.verification_token);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PSM_Certificate_QR_${c.certificate_id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || 'Failed to download QR image');
    }
  };

  const handleCopyUrl = (c: any) => {
    navigator.clipboard.writeText(c.verification_url);
    setCopiedId(c.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateAndIssueQr = async (c: any) => {
    if (c.status !== 'approved') return;
    setIssuingId(c.id);
    setMessage(null);

    try {
      await api.issueCertificate(c.id);
      setMessage({
        text: `Certificate ${c.certificate_id} officially issued and cryptographic QR code activated!`,
        type: 'success',
      });
      loadCertificates();
    } catch (err: any) {
      setMessage({
        text: err.message || 'Failed to issue certificate and generate QR code.',
        type: 'error',
      });
    } finally {
      setIssuingId(null);
    }
  };

  const filteredCerts = certs.filter((c) => {
    const matchesStatus =
      statusFilter === 'all' ||
      c.status === statusFilter;

    if (!matchesStatus) return false;

    if (!search) return true;
    const term = search.toLowerCase();
    return (
      c.intern_name?.toLowerCase().includes(term) ||
      c.intern_id?.toLowerCase().includes(term) ||
      c.certificate_id?.toLowerCase().includes(term) ||
      c.internship_domain?.toLowerCase().includes(term)
    );
  });

  const issuedCount = certs.filter((c) => c.status === 'issued').length;
  const approvedCount = certs.filter((c) => c.status === 'approved').length;
  const revokedCount = certs.filter((c) => c.status === 'revoked').length;
  const pendingCount = certs.filter((c) => c.status === 'pending').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold uppercase tracking-wider mb-1.5">
            <QrCode className="w-3.5 h-3.5 text-purple-700" />
            Registry Verification Anchors
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">QR Code Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor, preview, and generate tamper-proof QR verification codes for intern certificates.
          </p>
        </div>

        {/* View Toggle & Refresh */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-purple-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-purple-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
          </div>

          <button
            onClick={loadCertificates}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh Registry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-sm flex items-center gap-2 border shadow-xs ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="ml-auto text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Quick Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'all'
              ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">All Records</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{certs.length}</span>
        </button>

        <button
          onClick={() => setStatusFilter('issued')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'issued'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block">Active QR (Issued)</span>
          <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">{issuedCount}</span>
        </button>

        <button
          onClick={() => setStatusFilter('approved')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'approved'
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block">Eligible (Approved)</span>
          <span className="text-2xl font-extrabold text-blue-700 mt-1 block">{approvedCount}</span>
        </button>

        <button
          onClick={() => setStatusFilter('revoked')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'revoked'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider block">Revoked Records</span>
          <span className="text-2xl font-extrabold text-rose-700 mt-1 block">{revokedCount}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by intern name, intern ID, certificate ID, domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:bg-white text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 text-slate-700 font-medium w-full sm:w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="issued">Issued (Active QR)</option>
            <option value="approved">Approved (Eligible for QR)</option>
            <option value="pending">Pending Approval</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {loading ? (
        <div className="bg-white rounded-3xl p-16 text-center text-slate-400 border border-slate-200 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-600" />
          <span className="font-medium text-slate-600">Loading certificate registry and QR anchors...</span>
        </div>
      ) : filteredCerts.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center text-slate-500 border border-slate-200 shadow-xs">
          <QrCode className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No matching certificates found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or filter options.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-4 px-4 sm:px-6">QR Preview</th>
                  <th className="py-4 px-4">Intern & Details</th>
                  <th className="py-4 px-4">Certificate ID</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCerts.map((c) => {
                  const hasActiveQr = c.status === 'issued' || c.status === 'revoked';
                  const isEligibleForQr = c.status === 'approved';

                  return (
                    <tr key={c.id} className="hover:bg-purple-50/40 transition-colors">
                      {/* QR Thumbnail */}
                      <td className="py-3 px-4 sm:px-6">
                        {hasActiveQr ? (
                          <div
                            onClick={() => setSelectedQrCert(c)}
                            className="w-14 h-14 rounded-xl border border-purple-200 bg-white p-1 cursor-pointer hover:border-purple-500 shadow-2xs transition-transform hover:scale-105 flex items-center justify-center shrink-0"
                            title="Click to view full size"
                          >
                            <img
                              src={`/api/v1/public/certificates/${c.verification_token}/qr`}
                              alt={`QR ${c.certificate_id}`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-300 shrink-0">
                            <QrCode className="w-6 h-6" />
                          </div>
                        )}
                      </td>

                      {/* Intern info */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{c.intern_name}</div>
                        <div className="text-xs text-purple-700 font-medium">{c.internship_domain}</div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">{c.intern_id}</div>
                      </td>

                      {/* Certificate ID */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-md">
                          {c.certificate_id}
                        </span>
                        {c.issue_date && (
                          <div className="text-[11px] text-slate-400 mt-1">
                            Issued: {new Date(c.issue_date).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <StatusBadge status={c.status} size="sm" />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {hasActiveQr ? (
                            <>
                              <button
                                onClick={() => setSelectedQrCert(c)}
                                className="p-2 rounded-xl text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                                title="View QR Code"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDownloadQr(c)}
                                className="p-2 rounded-xl text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                                title="Download QR PNG"
                              >
                                <Download className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleCopyUrl(c)}
                                className="p-2 rounded-xl text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                                title="Copy Verification URL"
                              >
                                {copiedId === c.id ? (
                                  <Check className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>

                              <Link
                                to={`/verify/${c.verification_token}`}
                                target="_blank"
                                className="p-2 rounded-xl text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                                title="Open Public Verification Page"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                            </>
                          ) : isEligibleForQr ? (
                            <button
                              onClick={() => handleGenerateAndIssueQr(c)}
                              disabled={issuingId === c.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors shadow-xs shadow-purple-600/20 disabled:opacity-50"
                              title="Issue certificate and activate official QR verification anchor"
                            >
                              {issuingId === c.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                              )}
                              <span>Generate & Issue QR</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              Requires evaluation approval
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid / Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCerts.map((c) => {
            const hasActiveQr = c.status === 'issued' || c.status === 'revoked';
            const isEligibleForQr = c.status === 'approved';

            return (
              <div
                key={c.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-purple-900 block">{c.certificate_id}</span>
                      <h3 className="font-bold text-slate-900 text-sm mt-0.5">{c.intern_name}</h3>
                      <span className="text-[11px] text-slate-400 font-mono">{c.intern_id}</span>
                    </div>
                    <StatusBadge status={c.status} size="sm" />
                  </div>

                  {/* QR Preview Box */}
                  <div className="flex justify-center p-4 bg-purple-50/50 rounded-2xl border border-purple-100 mb-3">
                    {hasActiveQr ? (
                      <div
                        onClick={() => setSelectedQrCert(c)}
                        className="w-40 h-40 bg-white p-2.5 rounded-xl border border-purple-200 shadow-xs flex items-center justify-center cursor-pointer hover:border-purple-400 transition-all hover:scale-102"
                        title="Click to view high-resolution QR"
                      >
                        <img
                          src={`/api/v1/public/certificates/${c.verification_token}/qr`}
                          alt={`QR for ${c.certificate_id}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : isEligibleForQr ? (
                      <div className="w-40 h-40 bg-white p-3 rounded-xl border border-dashed border-blue-300 flex flex-col items-center justify-center text-center space-y-2">
                        <Sparkles className="w-8 h-8 text-blue-500" />
                        <span className="text-xs font-bold text-blue-900">Approved & Eligible</span>
                        <p className="text-[10px] text-slate-500">Click below to generate and activate QR</p>
                      </div>
                    ) : (
                      <div className="w-40 h-40 bg-white p-3 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center text-slate-400 space-y-1">
                        <QrCode className="w-8 h-8 text-slate-300" />
                        <span className="text-xs font-medium">Pending Approval</span>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 text-center font-mono truncate px-2" title={c.verification_url}>
                    {c.verification_url}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  {hasActiveQr ? (
                    <>
                      <button
                        onClick={() => handleDownloadQr(c)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold border border-purple-200 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PNG</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedQrCert(c)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                          title="View QR Code"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleCopyUrl(c)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                          title="Copy URL"
                        >
                          {copiedId === c.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <Link
                          to={`/verify/${c.verification_token}`}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                          title="Open public verification page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </>
                  ) : isEligibleForQr ? (
                    <button
                      onClick={() => handleGenerateAndIssueQr(c)}
                      disabled={issuingId === c.id}
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors shadow-xs shadow-purple-600/20 disabled:opacity-50"
                    >
                      {issuingId === c.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                      )}
                      <span>Generate & Issue QR</span>
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 italic text-center w-full">
                      Evaluation approval required
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* High-Resolution QR Modal */}
      {selectedQrCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-purple-100 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 mb-1">
                  <QrCode className="w-3 h-3 text-purple-600" />
                  Official Verification Anchor
                </span>
                <h3 className="text-lg font-bold text-slate-900">{selectedQrCert.intern_name}</h3>
                <p className="text-xs text-slate-500 font-mono">
                  {selectedQrCert.certificate_id} &bull; {selectedQrCert.intern_id}
                </p>
              </div>
              <button
                onClick={() => setSelectedQrCert(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* High-Resolution QR Code */}
            <div className="flex flex-col items-center justify-center p-6 bg-purple-50/60 rounded-2xl border border-purple-100">
              <div className="w-56 h-56 bg-white p-3 rounded-2xl border-2 border-purple-200 shadow-md flex items-center justify-center">
                <img
                  src={`/api/v1/public/certificates/${selectedQrCert.verification_token}/qr`}
                  alt={`QR for ${selectedQrCert.certificate_id}`}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="mt-3 text-center">
                <StatusBadge status={selectedQrCert.status} size="sm" />
                <p className="text-[11px] text-slate-500 mt-1 font-mono break-all px-2">
                  {selectedQrCert.verification_url}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleDownloadQr(selectedQrCert)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm transition-colors shadow-md shadow-purple-600/20"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG</span>
              </button>

              <button
                onClick={() => handleCopyUrl(selectedQrCert)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors"
              >
                {copiedId === selectedQrCert.id ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>{copiedId === selectedQrCert.id ? 'Copied' : 'Copy Link'}</span>
              </button>

              <Link
                to={`/verify/${selectedQrCert.verification_token}`}
                target="_blank"
                className="col-span-2 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-purple-200 text-purple-700 hover:bg-purple-50 font-semibold text-xs sm:text-sm transition-colors"
              >
                <span>Open Public Verification Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
