import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertTriangle, ShieldCheck, ShieldAlert, FileEdit } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', size = 'md' }) => {
  const norm = (status || '').toLowerCase().replace(/\s+/g, '_');

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  }[size];

  switch (norm) {
    case 'issued':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses} ${className}`}>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Verified &bull; Issued</span>
        </span>
      );
    case 'approved':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses} ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
          <span>Approved</span>
        </span>
      );
    case 'pending':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses} ${className}`}>
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Pending Review</span>
        </span>
      );
    case 'revoked':
      return (
        <span className={`inline-flex items-center font-semibold rounded-full bg-rose-50 text-rose-800 border border-rose-300 shadow-xs ${sizeClasses} ${className}`}>
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          <span>Revoked</span>
        </span>
      );
    case 'rejected':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-300 ${sizeClasses} ${className}`}>
          <XCircle className="w-3.5 h-3.5 text-slate-500" />
          <span>Rejected</span>
        </span>
      );
    case 'completed':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses} ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
          <span>Completed</span>
        </span>
      );
    case 'submitted':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 ${sizeClasses} ${className}`}>
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          <span>Submitted</span>
        </span>
      );
    case 'in_progress':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-sky-50 text-sky-700 border border-sky-200 ${sizeClasses} ${className}`}>
          <FileEdit className="w-3.5 h-3.5 text-sky-600" />
          <span>In Progress</span>
        </span>
      );
    case 'needs_revision':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-orange-50 text-orange-700 border border-orange-200 ${sizeClasses} ${className}`}>
          <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
          <span>Needs Revision</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-200 ${sizeClasses} ${className}`}>
          <span>{status || 'Unknown'}</span>
        </span>
      );
  }
};
