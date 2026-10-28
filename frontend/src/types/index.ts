export type UserRole = 'student' | 'admin';

export type CertificateStatus = 'pending' | 'approved' | 'issued' | 'revoked' | 'rejected';

export type ProjectStatus = 'not_started' | 'in_progress' | 'submitted' | 'completed' | 'needs_revision';

export type EvaluationStatus = 'draft' | 'submitted';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  role: UserRole;
  user_id: number;
  email: string;
  full_name: string;
}

export interface StudentProfile {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  intern_id: string;
  internship_domain: string;
  start_date: string | null;
  end_date: string | null;
  duration_weeks: number;
  company_name: string;
  mentor_name: string;
  profile_photo_url: string | null;
  phone_number: string | null;
  college: string | null;
  bio: string | null;
  github_url?: string | null;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  student_profile_id: number;
  title: string;
  description: string;
  domain: string;
  technologies: string;
  github_url: string;
  live_demo_url: string | null;
  documentation_url: string | null;
  status: ProjectStatus;
  submission_date: string | null;
  mentor_comments: string | null;
  created_at: string;
  updated_at: string;
}

export interface MentorEvaluation {
  id: number;
  student_profile_id: number;
  technical_skills: number;
  problem_solving: number;
  code_quality: number;
  communication: number;
  teamwork: number;
  overall_rating: number;
  feedback: string;
  mentor_name: string;
  status: EvaluationStatus;
  evaluation_date: string;
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: number;
  certificate_id: string;
  verification_token: string;
  student_profile_id: number;
  intern_name: string;
  intern_id: string;
  internship_domain: string;
  company_name: string;
  duration_weeks: number;
  status: CertificateStatus;
  issue_date: string | null;
  revocation_reason: string | null;
  revoked_at: string | null;
  rejection_reason: string | null;
  verification_url: string;
  qr_code_image_path: string | null;
  pdf_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicVerification {
  is_valid: boolean;
  status: CertificateStatus;
  certificate_id: string;
  verification_token: string;
  intern_name: string;
  intern_id: string;
  internship_domain: string;
  company_name: string;
  start_date: string | null;
  end_date: string | null;
  duration_weeks: number;
  issue_date: string | null;
  authorized_signatory_name: string;
  authorized_signatory_title: string;
  company_contact_email: string;
  company_website: string;
  revoked_at: string | null;
  revocation_reason: string | null;
}

export interface CompanySettings {
  id: number;
  company_name: string;
  logo_url: string | null;
  contact_email: string;
  contact_phone: string | null;
  website_url: string;
  authorized_signatory_name: string;
  authorized_signatory_title: string;
  certificate_template_title: string;
  updated_at: string;
}

export interface AdminDashboardData {
  total_interns: number;
  active_internships: number;
  pending_project_reviews: number;
  pending_evaluations: number;
  certificates_issued: number;
  certificates_revoked: number;
  certificates_pending: number;
  domain_breakdown: Record<string, number>;
  recent_activities: Array<{
    id: number;
    certificate_id: number;
    action: string;
    details: string;
    timestamp: string;
  }>;
}

export interface StudentDashboardData {
  intern_name: string;
  intern_id: string;
  internship_domain: string;
  duration_weeks: number;
  profile_completion: number;
  profile_photo_url?: string | null;
  project_status: ProjectStatus;
  evaluation_status: EvaluationStatus;
  overall_rating: number | null;
  certificate_status: CertificateStatus;
  certificate_id: string | null;
  verification_token: string | null;
  can_download_certificate: boolean;
}
