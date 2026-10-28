import React, { useState, useEffect } from 'react';
import {
  Star,
  User,
  Save,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  Award,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';

export const AdminEvaluationsPage: React.FC = () => {
  const [interns, setInterns] = useState<any[]>([]);
  const [selectedInternId, setSelectedInternId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [evalLoading, setEvalLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form
  const [technicalSkills, setTechnicalSkills] = useState(5);
  const [problemSolving, setProblemSolving] = useState(5);
  const [codeQuality, setCodeQuality] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [teamwork, setTeamwork] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [mentorName, setMentorName] = useState('Dr. Elena Vance');
  const [status, setStatus] = useState<'draft' | 'submitted'>('submitted');

  useEffect(() => {
    api
      .listInterns({ limit: 100 })
      .then((res) => {
        const list = res.items || [];
        setInterns(list);
        if (list.length > 0) {
          setSelectedInternId(list[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedInternId) return;
    setEvalLoading(true);
    setError(null);
    setSuccess(false);

    api
      .getEvaluation(selectedInternId)
      .then((res) => {
        setTechnicalSkills(res.technical_skills);
        setProblemSolving(res.problem_solving);
        setCodeQuality(res.code_quality);
        setCommunication(res.communication);
        setTeamwork(res.teamwork);
        setFeedback(res.feedback);
        setMentorName(res.mentor_name);
        setStatus(res.status);
      })
      .catch(() => {
        // default if not yet evaluated
        setTechnicalSkills(4);
        setProblemSolving(4);
        setCodeQuality(4);
        setCommunication(4);
        setTeamwork(4);
        setFeedback('Demonstrated positive problem solving and collaborative teamwork.');
        setMentorName('Dr. Elena Vance');
        setStatus('draft');
      })
      .finally(() => setEvalLoading(false));
  }, [selectedInternId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInternId) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    const overall = parseFloat(((technicalSkills + problemSolving + codeQuality + communication + teamwork) / 5.0).toFixed(1));

    try {
      await api.saveEvaluation(selectedInternId, {
        technical_skills: technicalSkills,
        problem_solving: problemSolving,
        code_quality: codeQuality,
        communication: communication,
        teamwork: teamwork,
        overall_rating: overall,
        feedback,
        mentor_name: mentorName,
        status,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save evaluation');
    } finally {
      setSaving(false);
    }
  };

  const calculatedOverall = (
    (technicalSkills + problemSolving + codeQuality + communication + teamwork) / 5.0
  ).toFixed(1);

  const renderRatingSelector = (label: string, value: number, onChange: (val: number) => void) => {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 gap-2">
        <span className="text-xs sm:text-sm font-bold text-slate-800">{label}</span>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onChange(num)}
              className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                num <= value
                  ? 'bg-amber-400 text-amber-950 shadow-xs'
                  : 'bg-white text-slate-400 border border-slate-200 hover:border-amber-300'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
            </button>
          ))}
          <span className="ml-2 font-bold text-xs text-purple-900 w-8 text-right">{value}/5</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mentor Evaluations Matrix</h1>
        <p className="text-sm text-slate-500 mt-1">
          Grade technical competencies, teamwork, and code quality according to the 5-criteria industry rubric.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Intern Selection List */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm max-h-[600px] overflow-y-auto space-y-2">
          <h2 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3 px-1">
            Select Intern Cohort
          </h2>
          {interns.map((i) => (
            <button
              key={i.id}
              onClick={() => setSelectedInternId(i.id)}
              className={`w-full text-left p-3 rounded-2xl transition-all border ${
                selectedInternId === i.id
                  ? 'bg-purple-100/70 border-purple-300 text-purple-900 shadow-xs font-semibold'
                  : 'border-transparent text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="text-xs font-bold truncate">{i.full_name}</div>
              <div className="text-[11px] font-mono text-purple-700">{i.intern_id}</div>
              <div className="text-[10px] text-slate-400 truncate">{i.internship_domain}</div>
            </button>
          ))}
        </div>

        {/* Evaluation Form */}
        <div className="lg:col-span-3">
          {evalLoading ? (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-purple-600" />
              <span>Loading evaluation record...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              {success && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Mentor evaluation successfully recorded.</span>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Live Rating Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div>
                  <span className="text-xs font-bold uppercase text-purple-700 tracking-wider">
                    Official Rubric
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                    {interns.find((i) => i.id === selectedInternId)?.full_name || 'Candidate Evaluation'}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block font-semibold uppercase">Computed Score</span>
                    <span className="text-2xl font-black text-purple-800">{calculatedOverall} / 5.0</span>
                  </div>
                </div>
              </div>

              {/* 5 Criteria */}
              <div className="space-y-3">
                {renderRatingSelector('1. Technical Skills & Engineering Fundamentals', technicalSkills, setTechnicalSkills)}
                {renderRatingSelector('2. Problem Solving & Architectural Rigor', problemSolving, setProblemSolving)}
                {renderRatingSelector('3. Code Quality, Testing & Maintainability', codeQuality, setCodeQuality)}
                {renderRatingSelector('4. Professional Communication & Documentation', communication, setCommunication)}
                {renderRatingSelector('5. Teamwork, Reliability & Agile Velocity', teamwork, setTeamwork)}
              </div>

              {/* Written Feedback */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Formal Mentor Written Review & Endorsement
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide detailed feedback on candidate strengths, technical milestones achieved, and recommendations for career advancement..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900"
                />
              </div>

              {/* Sign-off & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Mentor Signature Name
                  </label>
                  <input
                    type="text"
                    required
                    value={mentorName}
                    onChange={(e) => setMentorName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Evaluation Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'draft' | 'submitted')}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold"
                  >
                    <option value="draft">Save as Draft</option>
                    <option value="submitted">Submit & Finalize</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-purple-700 hover:bg-purple-800 transition-colors shadow-md shadow-purple-700/20 flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Evaluation</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
