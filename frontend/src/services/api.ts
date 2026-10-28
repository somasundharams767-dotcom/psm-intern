const API_ORIGIN = import.meta.env.VITE_API_URL ? (import.meta.env.VITE_API_URL as string).replace(/\/$/, '') : '';
const BASE_URL = `${API_ORIGIN}/api/v1`;

export function getMediaUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`;
}

export function getAuthToken(): string | null {
  return localStorage.getItem('psm_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('psm_token', token);
}

export function clearAuthToken(): void {
  localStorage.removeItem('psm_token');
  localStorage.removeItem('psm_user');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      // Non-JSON response
    }
    throw new Error(errorMessage);
  }

  // If response is a file download (blob)
  const contentType = response.headers.get('content-type');
  if (contentType && (contentType.includes('application/pdf') || contentType.includes('image/'))) {
    return (await response.blob()) as unknown as T;
  }

  return response.json();
}

export const api = {
  // Auth
  register: (data: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  adminLogin: (data: any) => request<any>('/auth/admin/login', { method: 'POST', body: JSON.stringify(data) }),
  forgotPassword: (email: string) => request<any>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (data: any) => request<any>('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request<any>('/auth/me'),
  changePassword: (data: any) => request<any>('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),

  // Student
  getStudentDashboard: () => request<any>('/student/dashboard'),
  getStudentProfile: () => request<any>('/student/profile'),
  updateStudentProfile: (data: any) => request<any>('/student/profile', { method: 'PUT', body: JSON.stringify(data) }),
  uploadProfilePhoto: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<any>('/student/profile/photo', { method: 'POST', body: formData });
  },
  deleteProfilePhoto: () => request<any>('/student/profile/photo', { method: 'DELETE' }),
  downloadStudentProfileQr: () => request<Blob>('/student/profile/qr'),
  getStudentProject: () => request<any>('/student/project'),
  submitStudentProject: (data: any) => request<any>('/student/project', { method: 'PUT', body: JSON.stringify(data) }),
  getStudentEvaluation: () => request<any>('/student/evaluation'),
  getStudentCertificate: () => request<any>('/student/certificate'),
  downloadStudentCertificate: async (): Promise<Blob> => {
    return request<Blob>('/student/certificate/download');
  },

  // Admin
  getAdminDashboard: () => request<any>('/admin/dashboard'),
  listInterns: (params: { query?: string; domain?: string; cert_status?: string; skip?: number; limit?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.query) q.set('query', params.query);
    if (params.domain) q.set('domain', params.domain);
    if (params.cert_status) q.set('cert_status', params.cert_status);
    if (params.skip !== undefined) q.set('skip', String(params.skip));
    if (params.limit !== undefined) q.set('limit', String(params.limit));
    return request<any>(`/admin/interns?${q.toString()}`);
  },
  createIntern: (data: any) => request<any>('/admin/interns', { method: 'POST', body: JSON.stringify(data) }),
  getIntern: (id: number) => request<any>(`/admin/interns/${id}`),
  updateIntern: (id: number, data: any) => request<any>(`/admin/interns/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteIntern: (id: number) => request<any>(`/admin/interns/${id}`, { method: 'DELETE' }),

  listProjects: (status_filter?: string) => {
    const q = status_filter ? `?status_filter=${status_filter}` : '';
    return request<any>(`/admin/projects${q}`);
  },
  updateProjectReview: (id: number, data: any) => request<any>(`/admin/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  getEvaluation: (profileId: number) => request<any>(`/admin/evaluations/${profileId}`),
  saveEvaluation: (profileId: number, data: any) => request<any>(`/admin/evaluations/${profileId}`, { method: 'PUT', body: JSON.stringify(data) }),

  listCertificates: (status_filter?: string) => {
    const q = status_filter ? `?status_filter=${status_filter}` : '';
    return request<any>(`/admin/certificates${q}`);
  },
  approveCertificate: (id: number) => request<any>(`/admin/certificates/${id}/approve`, { method: 'POST' }),
  rejectCertificate: (id: number, reason: string) => request<any>(`/admin/certificates/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
  issueCertificate: (id: number) => request<any>(`/admin/certificates/${id}/issue`, { method: 'POST' }),
  revokeCertificate: (id: number, reason: string) => request<any>(`/admin/certificates/${id}/revoke`, { method: 'POST', body: JSON.stringify({ reason }) }),
  reissueCertificate: (id: number) => request<any>(`/admin/certificates/${id}/reissue`, { method: 'POST' }),
  adminDownloadCertificate: (id: number) => request<Blob>(`/admin/certificates/${id}/download`),
  adminDownloadQr: (id: number) => request<Blob>(`/admin/certificates/${id}/qr`),

  getAuditLogs: (limit = 100) => request<any>(`/admin/audit-logs?limit=${limit}`),
  getSettings: () => request<any>('/admin/settings'),
  updateSettings: (data: any) => request<any>('/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Public
  verifyCertificatePublic: (token: string) => request<any>(`/public/verify/${token}`),
  getPublicProfile: (internId: string) => request<any>(`/public/profile/${internId}`),
  downloadPublicProfileQr: (internId: string) => request<Blob>(`/public/profile/${internId}/qr`),
  downloadPublicCertificateQr: (token: string) => request<Blob>(`/public/certificates/${token}/qr`),
  getCompanyContact: () => request<any>('/public/company-contact'),
};
