import React, { useState, useEffect } from 'react';
import {
  Star,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  MessageSquare,
  Loader2,
  Lock,
} from 'lucide-react';
import { api } from '../../services/api';
import { MentorEvaluation } from '../../types';

export const StudentEvaluationPage: React.FC = () => {
  const [evaluation, setEvaluation] = useState<MentorEvaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getStudentEvaluation()
      .then((res: MentorEvaluation) => setEvaluation(res))
      .catch((err) => setError(err.message || 'Evaluation not found'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  const renderStars = (score: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= score
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-200 fill-slate-200'
            }`}
          />
        ))}
        <span className="ml-2 font-bold text-xs text-slate-700">{score} / 5</span>
      </div>
    );
  };

  const criteria = [
    { label: 'Technical Skills', key: 'technical_skills', score: evaluation?.technical_skills || 0 },
    { label: 'Problem Solving', key: 'problem_solving', score: evaluation?.problem_solving || 0 },
    { label: 'Code Quality', key: 'code_quality', score: evaluation?.code_quality || 0 },
    { label: 'Communication', key: 'communication', score: evaluation?.communication || 0 },
    { label: 'Teamwork & Collaboration', key: 'teamwork', score: evaluation?.teamwork || 0 },
  ];

  const isCompleted = evaluation?.status === 'submitted';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mentor Evaluation</h1>
          <p className="text-sm text-slate-500 mt-1">
            Formal competency assessment submitted by your designated industry mentor.
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold self-start sm:self-center ${
            isCompleted
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}
        >
          {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-amber-600" />}
          <span>{isCompleted ? 'Evaluation Finalized' : 'Draft / In Progress'}</span>
        </span>
      </div>

      {evaluation && (
        <div className="space-y-6">
          {/* Overall Rating Banner */}
          <div className="bg-gradient-to-r from-purple-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-900/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-200 block mb-1">
                Cumulative Evaluation Score
              </span>
              <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                <span className="text-4xl sm:text-5xl font-black tracking-tight">
                  {evaluation.overall_rating.toFixed(1)}
                </span>
                <span className="text-lg text-purple-200 font-semibold">/ 5.0</span>
              </div>
              <p className="text-xs text-purple-200 mt-1">
                Evaluator: <span className="font-bold text-white">{evaluation.mentor_name}</span>
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center sm:text-right">
              <span className="text-xs text-purple-200 block mb-1">Evaluation Date</span>
              <span className="font-bold text-sm block">
                {new Date(evaluation.evaluation_date).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-purple-200 mt-1">
                <Lock className="w-3 h-3" /> Read-Only Record
              </span>
            </div>
          </div>

          {/* 5-Criteria Rubric Grid */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">
              Core Competency Breakdown
            </h3>

            <div className="space-y-5">
              {criteria.map((c) => (
                <div
                  key={c.key}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-purple-50/40 transition-colors"
                >
                  <div>
                    <span className="text-sm font-bold text-slate-800">{c.label}</span>
                  </div>
                  {renderStars(c.score)}
                </div>
              ))}
            </div>
          </div>

          {/* Written Mentor Feedback */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-bold text-slate-900">Official Mentor Written Review</h3>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-normal">
              "{evaluation.feedback}"
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Sign-off: {evaluation.mentor_name}</span>
              <span>PSM.Intern Quality Assurance Verified</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
