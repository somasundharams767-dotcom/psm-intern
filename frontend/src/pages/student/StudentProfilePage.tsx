import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  ShieldCheck,
  Building2,
  Calendar,
  Phone,
  GraduationCap,
  FileText,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Camera,
  Trash2,
  Upload,
  QrCode,
  Download,
  Copy,
  ExternalLink,
  Check,
  Eye,
  Info,
} from 'lucide-react';
import { GithubIcon } from '../../components/GithubIcon';
import { api, getMediaUrl } from '../../services/api';
import { StudentProfile } from '../../types';

export const StudentProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Editable fields by student
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [bio, setBio] = useState('');
  const [githubUrl, setGithubUrl] = useState('');

  // Profile Photo Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState(false);

  // QR Code Actions State
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadingQr, setDownloadingQr] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    setLoading(true);
    api
      .getStudentProfile()
      .then((res: StudentProfile) => {
        setProfile(res);
        setPhone(res.phone_number || '');
        setCollege(res.college || '');
        setBio(res.bio || '');
        setGithubUrl(res.github_url || '');
      })
      .catch((err) => setError(err.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPG, JPEG, PNG, or WEBP).');
      return;
    }

    // Validate size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('The selected image exceeds 5MB. Please choose a smaller image.');
      return;
    }

    setError(null);
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleUploadPhoto = async () => {
    if (!selectedFile) return;
    setUploadingPhoto(true);
    setError(null);

    try {
      const response = await api.uploadProfilePhoto(selectedFile);
      if (profile) {
        setProfile({
          ...profile,
          profile_photo_url: response.profile_photo_url,
          completion_percentage: response.completion_percentage ?? profile.completion_percentage,
        });
      }
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setSuccess('Profile photo uploaded successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload profile photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCancelPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm('Are you sure you want to remove your profile photo?')) return;
    setRemovingPhoto(true);
    setError(null);

    try {
      const response = await api.deleteProfilePhoto();
      if (profile) {
        setProfile({
          ...profile,
          profile_photo_url: null,
          completion_percentage: response.completion_percentage ?? profile.completion_percentage,
        });
      }
      handleCancelPreview();
      setSuccess('Profile photo removed.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to remove profile photo.');
    } finally {
      setRemovingPhoto(false);
    }
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await api.updateStudentProfile({
        phone_number: phone,
        college,
        bio,
        github_url: githubUrl,
      });
      setProfile(updated);
      setSuccess('Profile details saved successfully.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const publicProfileUrl = profile
    ? `${window.location.origin}/profile/${profile.intern_id}`
    : '';

  const handleCopyProfileLink = () => {
    if (!publicProfileUrl) return;
    navigator.clipboard.writeText(publicProfileUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadProfileQr = async () => {
    if (!profile) return;
    setDownloadingQr(true);
    try {
      const blob = await api.downloadStudentProfileQr();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PSM_Profile_QR_${profile.intern_id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || 'Failed to download Profile QR Code');
    } finally {
      setDownloadingQr(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Intern Profile & Credentials</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your verified internship profile, profile avatar photo, and shareable verification QR code.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Photo & Quick Identity Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with Circular Crop */}
          <div className="relative group shrink-0">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-100 shadow-md bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="New Profile Preview"
                  className="w-full h-full object-cover"
                />
              ) : profile.profile_photo_url ? (
                <img
                  src={getMediaUrl(profile.profile_photo_url)}
                  alt={profile.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-white font-extrabold text-4xl">
                  {profile.full_name.charAt(0)}
                </div>
              )}
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 p-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-md border-2 border-white transition-transform hover:scale-105"
              title="Upload new photo"
            >
              <Camera className="w-4 h-4" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Photo Actions & Details */}
          <div className="flex-1 text-center sm:text-left space-y-3">
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl font-bold text-slate-900">{profile.full_name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                  {profile.intern_id}
                </span>
                {profile.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                  >
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}
              </div>
              <p className="text-sm font-medium text-purple-600">{profile.internship_domain}</p>
            </div>

            {previewUrl ? (
              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Image preview ready. Confirm to save to your profile.</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleUploadPhoto}
                    disabled={uploadingPhoto}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {uploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    Save Photo
                  </button>
                  <button
                    onClick={handleCancelPreview}
                    disabled={uploadingPhoto}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs border border-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 shadow-sm shadow-purple-600/20"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Profile Photo</span>
                </button>

                {profile.profile_photo_url && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={removingPhoto}
                    className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {removingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    <span>Remove Photo</span>
                  </button>
                )}

                <span className="text-[11px] text-slate-400 block sm:inline-block ml-0 sm:ml-2">
                  JPG, PNG, or WebP (max 5MB)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Left: Official Record & Info Form; Right: Dedicated Profile QR Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Official Details & Edit Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Official Administrator-Controlled Record */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Official Internship Record</h2>
                  <p className="text-xs text-slate-500">Verified and controlled by company administration</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                <Lock className="w-3 h-3" />
                Protected Record
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Intern ID
                </span>
                <span className="font-mono text-sm font-bold text-purple-900">{profile.intern_id}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Host Company
                </span>
                <span className="font-bold text-slate-800">{profile.company_name}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Assigned Mentor
                </span>
                <span className="font-medium text-slate-800">{profile.mentor_name}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Duration
                </span>
                <span className="font-bold text-slate-800">{profile.duration_weeks} Weeks</span>
              </div>
            </div>
          </div>

          {/* Editable Personal Information Form */}
          <form onSubmit={handleSaveInfo} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Personal Information</h2>
                <p className="text-xs text-slate-500">Update your contact details and academic institution</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Profile Strength</span>
                <span className="text-xs font-bold text-purple-700">{profile.completion_percentage}% Completed</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Legal Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    disabled
                    value={profile.full_name}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed"
                    title="Legal name is locked by verified registration"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Official name verified for certificate generation</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="email"
                    disabled
                    value={profile.email}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Kept confidential; never exposed publicly</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Private administrative contact</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  College or Institution (Optional)
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. Stanford University / MIT / IIT"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-900"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  GitHub Profile Link (Optional)
                </label>
                <div className="relative">
                  <GithubIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="url"
                    placeholder="https://github.com/your-username"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Public engineering profile linked to your verified credentials
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Brief Professional Bio / Statement (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Share a brief statement about your engineering focus and career aspirations..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-900"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-md shadow-purple-600/20 flex items-center gap-2 disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Profile Information</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Dedicated Student Profile QR Code Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-purple-100 shadow-xl shadow-purple-500/5 text-center space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold uppercase tracking-wider">
              <QrCode className="w-3.5 h-3.5" />
              Student Profile QR
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Your Shareable Verification QR</h3>
              <p className="text-xs text-slate-500 mt-1">
                Anyone scanning this QR code is directed to your official, tamper-proof student profile verification page.
              </p>
            </div>

            {/* QR Code Preview */}
            <div className="flex justify-center p-4 bg-purple-50/60 rounded-2xl border border-purple-100">
              <img
                src={`/api/v1/public/profile/${profile.intern_id}/qr`}
                alt={`Profile verification QR code for ${profile.full_name}`}
                className="w-44 h-44 object-contain rounded-xl bg-white p-2 shadow-sm"
              />
            </div>

            {/* Action Buttons: Download, View Public Profile, Copy Link */}
            <div className="space-y-2.5 pt-1">
              <button
                onClick={handleDownloadProfileQr}
                disabled={downloadingQr}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm transition-all shadow-md shadow-purple-600/20 disabled:opacity-50"
              >
                {downloadingQr ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>Download QR Code</span>
              </button>

              <Link
                to={`/profile/${profile.intern_id}`}
                target="_blank"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-medium text-sm border border-purple-200 transition-all"
              >
                <Eye className="w-4 h-4" />
                <span>View Public Profile</span>
                <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
              </Link>

              <button
                onClick={handleCopyProfileLink}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-all"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Profile Link'}</span>
              </button>
            </div>
          </div>

          {/* Privacy Protection Notice */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-2.5">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              Student Privacy Guarantee
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your public profile QR code shares only verified academic & internship achievements (domain, company, duration, project summary, certificate status).
              <span className="block mt-1 font-semibold text-slate-700">
                Your email address, phone number, and account credentials are NEVER shared.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
