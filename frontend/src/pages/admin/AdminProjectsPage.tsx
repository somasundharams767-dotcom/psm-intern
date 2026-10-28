import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Globe,
  FileText,
  ExternalLink,
  MessageSquare,
  Edit,
  Save,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { GithubIcon } from '../../components/GithubIcon';

import { api } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';

export const AdminProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Review Modal
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<string>('in_progress');
  const [mentorComments, setMentorComments] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchProjects = () => {
    setLoading(true);
    api
      .listProjects(statusFilter || undefined)
      .then((res) => setProjects(res || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

  const handleOpenReview = (proj: any) => {
    setSelectedProject(proj);
    setReviewStatus(proj.status);
    setMentorComments(proj.mentor_comments || '');
    setModalOpen(true);
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    setReviewLoading(true);
    try {
      await api.updateProjectReview(selectedProject.id, {
        status: reviewStatus,
        mentor_comments: mentorComments,
      });
      setModalOpen(false);
      fetchProjects();
    } catch (err: any) {
      alert(err.message || 'Failed to update review status');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Capstone Projects Review</h1>
          <p className="text-sm text-slate-500 mt-1">
            Evaluate code repositories, live demo deployments, and engineering documentation.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-700 shadow-xs"
        >
          <option value="">All Project Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="needs_revision">Needs Revision</option>
        </select>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 gap-5">
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-purple-600" />
            <span>Loading submissions...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200">
            No projects found matching the filter.
          </div>
        ) : (
          projects.map((proj) => (
            <div
              key={proj.id}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs hover:border-purple-200 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">{proj.title}</h3>
                    <StatusBadge status={proj.status} size="sm" />
                  </div>
                  <p className="text-xs text-purple-800 font-semibold mt-0.5">
                    Intern: {proj.intern_name} ({proj.intern_id}) &bull; {proj.domain}
                  </p>
                </div>

                <button
                  onClick={() => handleOpenReview(proj)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-purple-700 text-white hover:bg-purple-800 transition-colors shadow-xs"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Review & Grade</span>
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{proj.description}</p>

              <div className="text-xs text-slate-500 font-medium">
                <span className="font-bold text-slate-700">Technologies: </span>
                {proj.technologies}
              </div>

              {/* Links Row */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {proj.github_url && (
                  <a
                    href={proj.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                  >
                    <GithubIcon className="w-4 h-4" />
                    <span>View Repository</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}

                {proj.live_demo_url && (
                  <a
                    href={proj.live_demo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Live Demo</span>
                    <ExternalLink className="w-3 h-3 text-indigo-400" />
                  </a>
                )}

                {proj.documentation_url && (
                  <a
                    href={proj.documentation_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Technical Docs</span>
                    <ExternalLink className="w-3 h-3 text-purple-400" />
                  </a>
                )}
              </div>

              {/* Comments display */}
              {proj.mentor_comments && (
                <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs text-purple-900 leading-relaxed">
                  <span className="font-bold block mb-0.5">Mentor Feedback:</span>
                  {proj.mentor_comments}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Project Milestone Review" maxWidth="lg">
        {selectedProject && (
          <form onSubmit={handleSaveReview} className="space-y-4 text-xs sm:text-sm">
            <div>
              <span className="text-xs text-slate-500 font-semibold block">Intern</span>
              <span className="font-bold text-slate-900 text-base">{selectedProject.intern_name}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Project Review Decision
              </label>
              <select
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              >
                <option value="in_progress">In Progress</option>
                <option value="submitted">Submitted for Evaluation</option>
                <option value="completed">Completed (Approved)</option>
                <option value="needs_revision">Needs Revision</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Mentor Evaluation Comments & Action Items
              </label>
              <textarea
                rows={4}
                required
                placeholder="Provide constructive review notes, milestone sign-off, or required revisions..."
                value={mentorComments}
                onChange={(e) => setMentorComments(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reviewLoading}
                className="px-5 py-2 rounded-xl text-white bg-purple-700 hover:bg-purple-800 font-semibold shadow-md shadow-purple-700/20"
              >
                {reviewLoading ? 'Saving...' : 'Update Review Status'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
