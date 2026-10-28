import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Globe,
  FileCode,
  FileText,
  Clock,
  MessageSquare,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { GithubIcon } from '../../components/GithubIcon';

import { api } from '../../services/api';
import { Project } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';

export const StudentProjectPage: React.FC = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [documentationUrl, setDocumentationUrl] = useState('');

  useEffect(() => {
    api
      .getStudentProject()
      .then((res: Project) => {
        setProject(res);
        setTitle(res.title || '');
        setDescription(res.description || '');
        setDomain(res.domain || '');
        setTechnologies(res.technologies || '');
        setGithubUrl(res.github_url || '');
        setLiveDemoUrl(res.live_demo_url || '');
        setDocumentationUrl(res.documentation_url || '');
      })
      .catch((err) => setError(err.message || 'Failed to load project record'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const updated = await api.submitStudentProject({
        title,
        description,
        domain,
        technologies,
        github_url: githubUrl,
        live_demo_url: liveDemoUrl || null,
        documentation_url: documentationUrl || null,
      });
      setProject(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit project updates.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Capstone Project Submission</h1>
          <p className="text-sm text-slate-500 mt-1">
            Submit your source repository, technical documentation, and deployment URLs for review.
          </p>
        </div>
        {project && <StatusBadge status={project.status} size="lg" />}
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Project submission successfully recorded. Status updated to SUBMITTED.</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Mentor Feedback / Comments Box */}
      {project?.mentor_comments && (
        <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
          <div className="flex items-center gap-2 text-purple-900 font-bold text-sm mb-2">
            <MessageSquare className="w-4 h-4 text-purple-700" />
            <span>Mentor & Reviewer Evaluation Comments:</span>
          </div>
          <p className="text-slate-700 text-sm leading-relaxed">{project.mentor_comments}</p>
        </div>
      )}

      {/* Project Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Project Title
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Distributed Real-Time Financial Ledger"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-900 font-medium"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Project Domain
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Full Stack Web Development"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Technologies & Tools Used
            </label>
            <input
              type="text"
              required
              placeholder="e.g. React, TypeScript, FastAPI, PostgreSQL, Docker"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Detailed Project Description & Architecture
          </label>
          <textarea
            rows={4}
            required
            placeholder="Explain the technical problem solved, system architecture, endpoints developed, database design, and key milestones achieved..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-900 leading-relaxed"
          />
        </div>

        {/* URLs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              GitHub Repository URL
            </label>
            <div className="relative">
              <GithubIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="url"
                required
                placeholder="https://github.com/..."
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-900"
              />
            </div>
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-purple-600 hover:text-purple-700 mt-1"
              >
                <span>Test GitHub Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Live Demo URL (Optional)
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="url"
                placeholder="https://demo.app.com"
                value={liveDemoUrl}
                onChange={(e) => setLiveDemoUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-900"
              />
            </div>
            {liveDemoUrl && (
              <a
                href={liveDemoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-purple-600 hover:text-purple-700 mt-1"
              >
                <span>Test Live Demo</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Project Documentation URL (Optional)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="url"
                placeholder="https://docs.app.com or Google Doc"
                value={documentationUrl}
                onChange={(e) => setDocumentationUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-900"
              />
            </div>
            {documentationUrl && (
              <a
                href={documentationUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-purple-600 hover:text-purple-700 mt-1"
              >
                <span>Test Documentation Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Submitting updates will flag your capstone project for administrator and mentor review.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Submit Project Details</span>
          </button>
        </div>
      </form>
    </div>
  );
};
