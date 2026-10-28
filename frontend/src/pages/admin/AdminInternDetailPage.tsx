import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Building2,
  Calendar,
  Save,
  Award,
  FolderKanban,
  Star,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';

export const AdminInternDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editable fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [internId, setInternId] = useState('');
  const [domain, setDomain] = useState('');
  const [durationWeeks, setDurationWeeks] = useState(12);
  const [companyName, setCompanyName] = useState('');
  const [mentorName, setMentorName] = useState('');
  const [college, setCollege] = useState('');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchDetail = () => {
    if (!id) return;
    setLoading(true);
    api
      .getIntern(parseInt(id))
      .then((res) => {
        setData(res);
        const p = res.profile;
        setFullName(p.full_name || '');
        setEmail(p.email || '');
        setInternId(p.intern_id || '');
        setDomain(p.internship_domain || '');
        setDurationWeeks(p.duration_weeks || 12);
        setCompanyName(p.company_name || '');
        setMentorName(p.mentor_name || '');
        setCollege(p.college || '');
        setPhone(p.phone_number || '');
        setIsActive(p.is_active);
      })
      .catch((err) => setError(err.message || 'Intern not found'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await api.updateIntern(parseInt(id!), {
        full_name: fullName,
        email,
        intern_id: internId,
        internship_domain: domain,
        duration_weeks: durationWeeks,
        company_name: companyName,
        mentor_name: mentorName,
        college,
        phone_number: phone,
        is_active: isActive,
      });
      setSuccess(true);
      fetchDetail();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update intern');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <Link
          to="/admin/interns"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Manage Intern: {data.profile.full_name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-mono">ID: {data.profile.intern_id}</p>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Intern record successfully updated.</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Linked Modules Quick Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Project Link Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Capstone Project</span>
            <FolderKanban className="w-4 h-4 text-purple-600" />
          </div>
          <div className="font-bold text-sm text-slate-900 truncate mb-1">
            {data.project?.title || 'No Project Assigned'}
          </div>
          <div className="flex items-center justify-between mt-2">
            <StatusBadge status={data.project?.status || 'not_started'} size="sm" />
            <Link to="/admin/projects" className="text-xs text-purple-700 font-semibold hover:underline">
              Review &rarr;
            </Link>
          </div>
        </div>

        {/* Evaluation Link Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Mentor Rating</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="font-bold text-sm text-slate-900 mb-1">
            {data.evaluation ? `${data.evaluation.overall_rating} / 5.0` : 'Not Evaluated'}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-slate-500">{data.evaluation?.status || 'Draft'}</span>
            <Link to="/admin/evaluations" className="text-xs text-purple-700 font-semibold hover:underline">
              Grade &rarr;
            </Link>
          </div>
        </div>

        {/* Certificate Link Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Certificate</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-mono text-xs font-bold text-purple-900 truncate mb-1">
            {data.certificate?.certificate_id || 'Pending'}
          </div>
          <div className="flex items-center justify-between mt-2">
            <StatusBadge status={data.certificate?.status || 'pending'} size="sm" />
            <Link to="/admin/certificates" className="text-xs text-purple-700 font-semibold hover:underline">
              Actions &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Profile Edit Form */}
      <form onSubmit={handleUpdate} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900 pb-4 border-b border-slate-100">
          Official Intern Information & Cohort Governance
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Full Legal Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Official Intern ID</label>
            <input
              type="text"
              required
              value={internId}
              onChange={(e) => setInternId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Internship Domain</label>
            <input
              type="text"
              required
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Duration (Weeks)</label>
            <input
              type="number"
              min="1"
              max="52"
              value={durationWeeks}
              onChange={(e) => setDurationWeeks(parseInt(e.target.value) || 12)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Host Company</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Assigned Mentor</label>
            <input
              type="text"
              required
              value={mentorName}
              onChange={(e) => setMentorName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Institution / College</label>
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded-sm"
            />
            <label htmlFor="isActive" className="text-xs font-bold text-slate-800">
              Active Intern Account Status
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-purple-700 hover:bg-purple-800 transition-colors shadow-md shadow-purple-700/20 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Intern Record</span>
          </button>
        </div>
      </form>

      {/* Audit History for this Intern's Certificate */}
      {data.audit_logs && data.audit_logs.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
            Certificate Audit Trail
          </h2>
          <div className="space-y-3">
            {data.audit_logs.map((log: any) => (
              <div key={log.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex justify-between gap-4">
                <div>
                  <span className="font-bold text-slate-800 capitalize block mb-0.5">
                    {log.action.replace(/_/g, ' ')}
                  </span>
                  <p className="text-slate-600">{log.details}</p>
                </div>
                <span className="text-[11px] text-slate-400 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
