import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Phone, Globe, Lock, ExternalLink } from 'lucide-react';
import { api } from '../services/api';

export const Footer: React.FC = () => {
  const [contactInfo, setContactInfo] = useState<{
    company_name: string;
    contact_email: string;
    contact_phone: string | null;
    website_url: string;
  }>({
    company_name: 'PSM Technologies Inc.',
    contact_email: 'contact@psmintern.com',
    contact_phone: '+1 (800) 555-0199',
    website_url: 'https://psmintern.com',
  });

  useEffect(() => {
    api.getCompanyContact().then((data) => {
      if (data) setContactInfo(data);
    }).catch(() => {});
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                PSM<span className="text-purple-400">.Intern</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verify Your Internship. Showcase Your Skills. Enterprise-grade cryptographically verified internship credentials.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>Tamper-Resistant QR Registry</span>
            </div>
          </div>

          {/* Verification Links */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Verification Portal
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/verify/psm-verify-aarav-2026-valid-token-alpha" className="hover:text-purple-400 transition-colors">
                  Sample Valid Certificate
                </Link>
              </li>
              <li>
                <Link to="/verify/psm-verify-marcus-2026-revoked-token-gamma" className="hover:text-rose-400 transition-colors">
                  Sample Revoked Verification
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-purple-400 transition-colors">
                  Student Portal Login
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-purple-400 transition-colors">
                  Administrator Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Official Company Contact (dynamic from settings) */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Company Contact
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="text-slate-300 font-medium">{contactInfo.company_name}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <a href={`mailto:${contactInfo.contact_email}`} className="hover:text-purple-400 transition-colors">
                  {contactInfo.contact_email}
                </a>
              </li>
              {contactInfo.contact_phone && (
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>{contactInfo.contact_phone}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Legal / Policy */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Governance & Trust
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <span className="hover:text-purple-400 transition-colors cursor-pointer">
                  Privacy Policy &bull; Data Handling
                </span>
              </li>
              <li>
                <span className="hover:text-purple-400 transition-colors cursor-pointer">
                  Terms of Certificate Issuance
                </span>
              </li>
              <li>
                <span className="hover:text-purple-400 transition-colors cursor-pointer">
                  Revocation Registry Guidelines
                </span>
              </li>
              <li>
                <span className="hover:text-purple-400 transition-colors cursor-pointer">
                  Security & Audit Compliance
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} {contactInfo.company_name}. All rights reserved.</p>
          <p className="text-slate-500">
            PSM.Intern Certificate Registry System v1.0.0
          </p>
        </div>
      </div>
    </footer>
  );
};
