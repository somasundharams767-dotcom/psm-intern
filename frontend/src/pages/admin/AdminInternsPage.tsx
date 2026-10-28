import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  ExternalLink,
  Loader2,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';

export const AdminInternsPage: React.FC = () => {
  const [interns, setInterns] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create Intern Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
    full_name: '',
    email: '',
    password: 'Intern@2026!',
    intern_id: '',
    internship_domain: 'Full Stack Web Development',
    duration_weeks: 12,
    company_name: 'PSM Technologies Inc.',
    mentor_name: 'Dr. Elena Vance',
    college: '',
    phone_number: '',
  });

  const fetchInterns = () => {
    setLoading(true);
    api
      .listInterns({
        query: search || undefined,
        domain: domainFilter || undefined,
        cert_status: statusFilter || undefined,
      })
      .then((res) => {
        setInterns(res.items || []);
        setTotal(res.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInterns();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, domainFilter, statusFilter]);

  const handleCreateIntern = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await api.createIntern(createForm);
      setCreateModalOpen(false);
      setCreateForm({
        full_name: '',
        email: '',
        password: 'Intern@2026!',
        intern_id: '',
        internship_domain: 'Full Stack Web Development',
        duration_weeks: 12,
        company_name: 'PSM Technologies Inc.',
        mentor_name: 'Dr. Elena Vance',
        college: '',
        phone_number: '',
      });
      fetchInterns();
    } catch (err: any) {
      alert(err.message || 'Failed to create intern');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeactivate = async (id: number, internId: string) => {
    if (!window.confirm(`Are you sure you want to deactivate intern ${internId}?`)) return;
    try {
      await api.deleteIntern(id);
      fetchInterns();
    } catch (err: any) {
      alert(err.message || 'Failed to deactivate intern');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Interns</h1>
          <p className="text-sm text-slate-500 mt-1">
            Registered intern cohorts, official identifiers, domain assignments, and verification statuses.
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-purple-700 hover:bg-purple-800 shadow-md shadow-purple-700/20 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Intern</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by intern name, ID (PSM-...), or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-900"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-2">
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="">All Domains</option>
            <option value="Full Stack Web Development">Full Stack Web Development</option>
            <option value="AI & Machine Learning">AI & Machine Learning</option>
            <option value="Cybersecurity & Cloud Systems">Cybersecurity & Cloud Systems</option>
            <option value="Data Science & Analytics">Data Science & Analytics</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="">All Certificate Statuses</option>
            <option value="issued">Issued</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="revoked">Revoked</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Interns Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Intern & ID</th>
                <th className="py-3.5 px-4">Domain</th>
                <th className="py-3.5 px-4">Project</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4">Certificate</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
                    <span>Loading intern records...</span>
                  </td>
                </tr>
              ) : interns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No interns found matching the criteria.
                  </td>
                </tr>
              ) : (
                interns.map((intern) => (
                  <tr key={intern.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-bold text-slate-900">{intern.full_name}</div>
                      <div className="font-mono text-[11px] text-purple-700 font-semibold">{intern.intern_id}</div>
                      <div className="text-[11px] text-slate-400">{intern.email}</div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      <div>{intern.internship_domain}</div>
                      <div className="text-[11px] text-slate-400">{intern.duration_weeks} Weeks &bull; {intern.mentor_name}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={intern.project_status} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {intern.overall_rating ? `${intern.overall_rating} / 5.0` : '--'}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={intern.certificate_status} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-right space-x-2">
                      <Link
                        to={`/admin/interns/${intern.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </Link>

                      {intern.is_active && (
                        <button
                          onClick={() => handleDeactivate(intern.id, intern.intern_id)}
                          className="inline-flex items-center p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Deactivate intern"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {interns.length} of {total} registered interns</span>
          <span>Cohort 2026</span>
        </div>
      </div>

      {/* Modal: Add New Intern */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Intern Record" maxWidth="lg">
        <form onSubmit={handleCreateIntern} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Samantha Lin"
              value={createForm.full_name}
              onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email</label>
              <input
                type="email"
                required
                placeholder="samantha@example.com"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Custom Intern ID (Optional)</label>
              <input
                type="text"
                placeholder="Auto-generated if blank"
                value={createForm.intern_id}
                onChange={(e) => setCreateForm({ ...createForm, intern_id: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Domain</label>
              <select
                value={createForm.internship_domain}
                onChange={(e) => setCreateForm({ ...createForm, internship_domain: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Full Stack Web Development">Full Stack Web Development</option>
                <option value="AI & Machine Learning">AI & Machine Learning</option>
                <option value="Cybersecurity & Cloud Systems">Cybersecurity & Cloud Systems</option>
                <option value="Data Science & Analytics">Data Science & Analytics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Duration Weeks</label>
              <input
                type="number"
                min="1"
                max="52"
                value={createForm.duration_weeks}
                onChange={(e) => setCreateForm({ ...createForm, duration_weeks: parseInt(e.target.value) || 12 })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Assigned Mentor</label>
              <input
                type="text"
                value={createForm.mentor_name}
                onChange={(e) => setCreateForm({ ...createForm, mentor_name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Institution / College</label>
              <input
                type="text"
                placeholder="Optional"
                value={createForm.college}
                onChange={(e) => setCreateForm({ ...createForm, college: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createLoading}
              className="px-5 py-2 rounded-xl text-white bg-purple-700 hover:bg-purple-800 font-semibold shadow-md shadow-purple-700/20"
            >
              {createLoading ? 'Registering...' : 'Create Intern'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
