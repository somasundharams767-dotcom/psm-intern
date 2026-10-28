import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Building2,
  Calendar,
  User,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Mail,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../services/api';
import { StudentProfile } from '../../types';

export const StudentInternshipPage: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getStudentProfile()
      .then((res) => setProfile(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Internship Overview</h1>
        <p className="text-sm text-slate-500 mt-1">
          Official enrollment details and cohort parameters recorded with company administration.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider block">
                Official Program
              </span>
              <h2 className="text-xl font-bold text-slate-900">{profile.internship_domain}</h2>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Active Enrollment
          </span>
        </div>

        {/* Core Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Intern Identifier
            </span>
            <span className="font-mono text-base font-bold text-purple-900">{profile.intern_id}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Host Enterprise
            </span>
            <span className="font-bold text-slate-800 text-base flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-purple-600" />
              {profile.company_name}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Total Duration
            </span>
            <span className="font-bold text-slate-800 text-base">{profile.duration_weeks} Weeks</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Start Date
            </span>
            <span className="font-medium text-slate-800">
              {profile.start_date ? new Date(profile.start_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              End Date
            </span>
            <span className="font-medium text-slate-800">
              {profile.end_date ? new Date(profile.end_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Assigned Mentor
            </span>
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <User className="w-4 h-4 text-purple-600" />
              {profile.mentor_name}
            </span>
          </div>
        </div>

        {/* Policy Notice */}
        <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs text-purple-900 leading-relaxed flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">Verification Integrity Policy:</span>
            Internship records, domain assignments, and formal dates are governed by authorized company administrators. If your dates or assigned domain require adjustments, please consult your mentor or submit an administrative inquiry.
          </div>
        </div>
      </div>
    </div>
  );
};
