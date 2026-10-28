import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  QrCode,
  FileText,
  Lock,
  ArrowRight,
  Search,
  Building2,
  GraduationCap,
  Users2,
  Download,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const LandingPage: React.FC = () => {
  const [verifyInput, setVerifyInput] = useState('');
  const navigate = useNavigate();

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyInput.trim()) {
      navigate(`/verify/${verifyInput.trim()}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-radial from-purple-50/70 via-white to-white">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f5f3ff_1px,transparent_1px),linear-gradient(to_bottom,#f5f3ff_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100/80 border border-purple-200 text-purple-900 text-xs sm:text-sm font-medium mb-8 animate-in fade-in duration-700">
            <ShieldCheck className="w-4 h-4 text-purple-700" />
            <span>Next-Generation Cryptographic Internship Credentialing</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Verify Your Internship.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600">
              Showcase Your Skills.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The official enterprise verification platform for interns, mentors, and employers.
            Authenticate internship completion, mentor evaluations, and production projects with tamper-resistant QR credentials.
          </p>

          {/* Quick Verification Search Box */}
          <div className="mt-10 max-w-xl mx-auto">
            <form
              onSubmit={handleVerifySubmit}
              className="p-2 sm:p-2.5 bg-white rounded-2xl shadow-xl shadow-purple-500/10 border border-purple-200/80 flex flex-col sm:flex-row gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Enter Certificate ID (e.g. CERT-PSM-2026-987654) or Token..."
                  value={verifyInput}
                  onChange={(e) => setVerifyInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 text-sm bg-transparent rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-2"
              >
                <span>Verify Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
              <span>Try sample verifications:</span>
              <Link
                to="/verify/psm-verify-aarav-2026-valid-token-alpha"
                className="font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-200 transition-colors"
              >
                Issued Certificate
              </Link>
              <Link
                to="/verify/psm-verify-marcus-2026-revoked-token-gamma"
                className="font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-md border border-rose-200 transition-colors"
              >
                Revoked Certificate
              </Link>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/login"
              className="px-6 py-3 text-sm font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-all hover:border-purple-300"
            >
              Student Portal
            </Link>
            <Link
              to="/admin/login"
              className="px-6 py-3 text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-all"
            >
              Company Administrator
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl shadow-md shadow-purple-600/20 transition-all"
            >
              Create Student Account
            </Link>
          </div>
        </div>
      </section>

      {/* How Verification Works */}
      <section id="how-it-works" className="py-20 bg-slate-50/70 border-y border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-purple-700 uppercase tracking-widest mb-3">
              Trust & Transparency
            </h2>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
              How Certificate Verification Works
            </h3>
            <p className="mt-4 text-slate-600 text-sm sm:text-base">
              A 3-step cryptographically enforced lifecycle preventing fraud, credential tampering, and unverified claims.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-lg mb-6 shadow-xs">
                1
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Internship & Project Review</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Students submit project repositories, live demonstrations, and technical documentation. Mentors evaluate 5 core competencies and submit official ratings.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-lg mb-6 shadow-xs">
                2
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Cryptographic Issuance</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Authorized company administrators issue the certificate, binding it to an unpredictable verification token, high-res QR code, and official PDF document.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-lg mb-6 shadow-xs">
                3
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Instant Public Verification</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Anyone scanning the QR code or visiting the verification link instantly sees real-time validity, intern details, mentor ratings, and revocation history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-purple-700 uppercase tracking-widest mb-3">
              Built for Scale & Security
            </h2>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
              Enterprise Verification Architecture
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-slate-200/80 bg-white hover:border-purple-300 transition-all">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <QrCode className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Dynamic QR Codes</h4>
              <p className="text-xs sm:text-sm text-slate-600">
                Every issued certificate is stamped with an unguessable QR token pointing to the live verification registry.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200/80 bg-white hover:border-purple-300 transition-all">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">High-Fidelity PDF Generation</h4>
              <p className="text-xs sm:text-sm text-slate-600">
                Generates vector-crisp PDF certificates with double borders, company seals, and verified authorized signatories.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200/80 bg-white hover:border-purple-300 transition-all">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Mentor Skill Evaluations</h4>
              <p className="text-xs sm:text-sm text-slate-600">
                Five-dimensional evaluation matrix spanning technical skills, problem solving, code quality, communication, and teamwork.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200/80 bg-white hover:border-purple-300 transition-all">
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Instant Revocation Registry</h4>
              <p className="text-xs sm:text-sm text-slate-600">
                Administrators can revoke certificates with mandatory audited reasons. The public verification immediately reflects revoked status.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200/80 bg-white hover:border-purple-300 transition-all">
              <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Role-Based Access Control</h4>
              <p className="text-xs sm:text-sm text-slate-600">
                Rigorous backend-enforced permissions prevent IDOR, unauthorized privilege escalation, and credential tampering.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200/80 bg-white hover:border-purple-300 transition-all">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Custom Company Branding</h4>
              <p className="text-xs sm:text-sm text-slate-600">
                Company administrators configure official contacts, authorized signatories, logo branding, and certificate templates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stakeholder Benefits */}
      <section className="py-20 bg-slate-50/60 border-t border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-purple-700 uppercase tracking-widest mb-3">
              Value Proposition
            </h2>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
              Benefits for Everyone
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-6">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-3">For Students & Interns</h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Permanent verifiable proof of work and completed project repository.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Instant downloadable official PDF certificate with embedded QR.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Sharable verification link for LinkedIn, resumes, and job applications.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-6">
                <Users2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-3">For Mentors</h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Standardized 5-criteria rubric for technical skills and teamwork.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Direct project review pipeline with revision requests and feedback.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Formal endorsement preserved on official company credentials.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6">
                <Building2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-3">For Companies & Employers</h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Eliminate certificate forgery with cryptographic verification tokens.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Immediate revocation authority with permanent audit logging.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Brand protection with centralized authorized signatory settings.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-extrabold tracking-tight mb-4">
            Ready to Verify or Issue Internship Credentials?
          </h3>
          <p className="text-purple-200 max-w-2xl mx-auto text-sm sm:text-base mb-8">
            Access the PSM.Intern portal today to manage intern cohorts, evaluate projects, and generate tamper-proof certificates.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-6 py-3 text-sm font-semibold text-purple-900 bg-white hover:bg-purple-50 rounded-xl shadow-lg transition-all"
            >
              Get Started as Student
            </Link>
            <Link
              to="/admin/login"
              className="px-6 py-3 text-sm font-semibold text-white bg-purple-600/60 hover:bg-purple-600 border border-purple-400 rounded-xl transition-all"
            >
              Company Administrator Sign In
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
