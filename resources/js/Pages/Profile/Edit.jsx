import React, { useState, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building,
  Key,
  Lock,
  Shield,
  Camera,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function Edit({ mustVerifyEmail, status, user: initialUser }) {
  const pageAuthUser = usePage().props.auth.user;
  const user = initialUser || pageAuthUser;

  const [activeTab, setActiveTab] = useState('info');
  const [avatarPreview, setAvatarPreview] = useState(
    user?.avatar_url || (user?.avatar ? `/storage/${user.avatar}` : null)
  );
  const [showPassword, setShowPassword] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const fileInputRef = useRef(null);

  // Profile Information Form
  const profileForm = useForm({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    nrp: user?.nrp || '',
    department: user?.department || '',
    position: user?.position || '',
    avatar: null,
    remove_avatar: false,
  });

  // Password Form
  const passwordForm = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  // Delete User Form
  const deleteForm = useForm({
    password: '',
  });

  // Handle Avatar Change
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      profileForm.setData('avatar', file);
      profileForm.setData('remove_avatar', false);
      const reader = new FileReader();
      reader.onload = (upload) => {
        setAvatarPreview(upload.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove Avatar
  const handleRemoveAvatar = () => {
    profileForm.setData('avatar', null);
    profileForm.setData('remove_avatar', true);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit Profile Information
  const handleProfileSubmit = (e) => {
    e.preventDefault();

    // Use router.post with multipart form to handle file upload smoothly
    profileForm.post(route('profile.update.post'), {
      preserveScroll: true,
      onSuccess: () => {
        profileForm.setData('avatar', null);
      },
    });
  };

  // Submit Password Update
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    passwordForm.put(route('password.update'), {
      preserveScroll: true,
      onSuccess: () => {
        passwordForm.reset();
      },
    });
  };

  // Submit Delete Account
  const handleDeleteSubmit = (e) => {
    e.preventDefault();
    deleteForm.delete(route('profile.destroy'), {
      preserveScroll: true,
      onSuccess: () => setDeleteModalOpen(false),
      onFinish: () => deleteForm.reset(),
    });
  };

  // Password strength evaluation
  const passwordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const currentStrength = passwordStrength(passwordForm.data.password);

  return (
    <AuthenticatedLayout header="My Profile">
      <Head title="Profil Saya - Akun & Pengaturan" />

      <div className="space-y-6 max-w-5xl mx-auto">
        {/* ─── Hero Header Card ─── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-cyan-950/80 p-6 sm:p-8 border border-emerald-500/30 backdrop-blur-2xl shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar container with hover overlay */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-emerald-400/50 shadow-[0_0_25px_rgba(16,185,129,0.3)] bg-gray-900 flex items-center justify-center">
                <img
                  src={avatarPreview || '/images/planner_logo.jpg'}
                  alt={user?.name || 'User'}
                  onError={(e) => {
                    e.currentTarget.src = '/images/planner_logo.jpg';
                  }}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Upload Overlay Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 backdrop-blur-xs rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-semibold gap-1 cursor-pointer"
                title="Ganti Foto Profil"
              >
                <Camera className="w-5 h-5 text-emerald-400" />
                <span>Ganti Foto</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* User Meta Information */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight truncate">
                  {user?.name || 'User Name'}
                </h1>

                {/* Role Badges */}
                <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                  {user?.roles && user.roles.length > 0 ? (
                    user.roles.map((r) => (
                      <span
                        key={r.id || r.name}
                        className="px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      >
                        {r.name}
                      </span>
                    ))
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-gray-500/20 text-gray-300">
                      Standard User
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-400 text-sm flex items-center justify-center sm:justify-start gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>{user?.email}</span>
              </p>

              {/* Badges details */}
              <div className="flex items-center justify-center sm:justify-start gap-3 mt-4 flex-wrap text-xs text-gray-300">
                {user?.nrp && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 font-mono">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    NRP: {user.nrp}
                  </span>
                )}

                {user?.department && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10">
                    <Building className="w-3.5 h-3.5 text-amber-400" />
                    {user.department}
                  </span>
                )}

                {user?.position && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10">
                    <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                    {user.position}
                  </span>
                )}

                {user?.created_at && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    Bergabung: {user.created_at}
                  </span>
                )}
              </div>
            </div>

            {/* Quick avatar remove button if user has custom avatar */}
            {avatarPreview && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-xl border border-rose-500/20 hover:bg-rose-500/10 inline-flex items-center gap-1.5 transition-colors self-center sm:self-start"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Foto
              </button>
            )}
          </div>
        </div>

        {/* ─── Navigation Tabs ─── */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-gray-100 dark:bg-gray-900/80 border border-gray-200 dark:border-white/10 w-fit shadow-inner overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 ${
              activeTab === 'info'
                ? 'bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            Informasi Profil & Karyawan
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 ${
              activeTab === 'security'
                ? 'bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4" />
            Keamanan & Sandi
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 ${
              activeTab === 'roles'
                ? 'bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            Ringkasan Hak Akses ({user?.permissions?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('danger')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 ${
              activeTab === 'danger'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-rose-500'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Zona Berbahaya
          </button>
        </div>

        {/* ─── TAB 1: INFORMASI PROFIL & KARYAWAN ─── */}
        {activeTab === 'info' && (
          <div className="rounded-3xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl p-6 sm:p-8 shadow-xl">
            <div className="pb-5 mb-6 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Informasi Akun & Data Karyawan
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Perbarui nama, nomor kontak, NRP, departemen, serta posisi kerja Anda di System Plant
                </p>
              </div>

              {profileForm.recentlySuccessful && (
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4" /> Profil Berhasil Disimpan
                </span>
              )}
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Row 1: Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={profileForm.data.name}
                      onChange={(e) => profileForm.setData('name', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  {profileForm.errors.name && (
                    <p className="text-xs text-rose-500 mt-1">{profileForm.errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">
                    Alamat Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={profileForm.data.email}
                      onChange={(e) => profileForm.setData('email', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  {profileForm.errors.email && (
                    <p className="text-xs text-rose-500 mt-1">{profileForm.errors.email}</p>
                  )}
                </div>
              </div>

              {/* Row 2: NRP & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">
                    NRP (Nomor Registrasi Pokok)
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={profileForm.data.nrp}
                      onChange={(e) => profileForm.setData('nrp', e.target.value)}
                      placeholder="Contoh: 12093847"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  {profileForm.errors.nrp && (
                    <p className="text-xs text-rose-500 mt-1">{profileForm.errors.nrp}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">
                    Nomor WhatsApp / HP
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={profileForm.data.phone}
                      onChange={(e) => profileForm.setData('phone', e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  {profileForm.errors.phone && (
                    <p className="text-xs text-rose-500 mt-1">{profileForm.errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Row 3: Department & Position */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">
                    Departemen
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={profileForm.data.department}
                      onChange={(e) => profileForm.setData('department', e.target.value)}
                      placeholder="Contoh: Plant & Fleet Maintenance"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  {profileForm.errors.department && (
                    <p className="text-xs text-rose-500 mt-1">{profileForm.errors.department}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">
                    Jabatan / Posisi
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={profileForm.data.position}
                      onChange={(e) => profileForm.setData('position', e.target.value)}
                      placeholder="Contoh: Senior Maintenance Planner"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  {profileForm.errors.position && (
                    <p className="text-xs text-rose-500 mt-1">{profileForm.errors.position}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-gray-200 dark:border-white/10 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={profileForm.processing}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all inline-flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {profileForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ─── TAB 2: KEAMANAN & SANDI ─── */}
        {activeTab === 'security' && (
          <div className="rounded-3xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl p-6 sm:p-8 shadow-xl">
            <div className="pb-5 mb-6 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Pembaruan Kata Sandi
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Pastikan akun Anda menggunakan kata sandi yang panjang dan acak demi keamanan data operasional
                </p>
              </div>

              {passwordForm.recentlySuccessful && (
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4" /> Sandi Berhasil Diperbarui
                </span>
              )}
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-xl">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">
                  Kata Sandi Saat Ini
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordForm.data.current_password}
                    onChange={(e) =>
                      passwordForm.setData('current_password', e.target.value)
                    }
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordForm.errors.current_password && (
                  <p className="text-xs text-rose-500 mt-1">
                    {passwordForm.errors.current_password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordForm.data.password}
                    onChange={(e) => passwordForm.setData('password', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                {/* Password strength meter */}
                {passwordForm.data.password && (
                  <div className="mt-2 space-y-1">
                    <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          currentStrength <= 25
                            ? 'bg-rose-500 w-1/4'
                            : currentStrength <= 50
                            ? 'bg-amber-500 w-2/4'
                            : currentStrength <= 75
                            ? 'bg-blue-500 w-3/4'
                            : 'bg-emerald-500 w-full'
                        }`}
                      />
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 flex justify-between">
                      <span>Kekuatan Sandi</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {currentStrength <= 25
                          ? 'Lemah'
                          : currentStrength <= 50
                          ? 'Cukup'
                          : currentStrength <= 75
                          ? 'Kuat'
                          : 'Sangat Kuat'}
                      </span>
                    </div>
                  </div>
                )}

                {passwordForm.errors.password && (
                  <p className="text-xs text-rose-500 mt-1">
                    {passwordForm.errors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">
                  Konfirmasi Kata Sandi Baru
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordForm.data.password_confirmation}
                    onChange={(e) =>
                      passwordForm.setData('password_confirmation', e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                {passwordForm.errors.password_confirmation && (
                  <p className="text-xs text-rose-500 mt-1">
                    {passwordForm.errors.password_confirmation}
                  </p>
                )}
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={passwordForm.processing}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm shadow-md transition-all inline-flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  {passwordForm.processing ? 'Menyimpan...' : 'Perbarui Kata Sandi'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ─── TAB 3: ROLES & PERMISSIONS SUMMARY ─── */}
        {activeTab === 'roles' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 pb-5 mb-6 border-b border-gray-200 dark:border-white/10">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Peran & Hak Akses Akun
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Otorisasi dan izin operasional yang aktif pada akun Anda saat ini
                  </p>
                </div>
              </div>

              {/* Roles Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role yang Diberikan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {user?.roles && user.roles.length > 0 ? (
                    user.roles.map((r) => (
                      <div
                        key={r.id || r.name}
                        className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-sm"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-base text-emerald-600 dark:text-emerald-400 capitalize">
                            {r.name}
                          </span>
                          <Shield className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {r.name === 'super-admin'
                            ? 'Akses penuh tanpa batas ke seluruh modul sistem.'
                            : `Role operasional ${r.name} dengan izin terkait.`}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl border border-gray-200 dark:border-white/10 text-gray-500 text-xs">
                      Tidak ada role khusus yang terikat.
                    </div>
                  )}
                </div>
              </div>

              {/* Permissions Section */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Daftar Hak Akses Efektif ({user?.permissions?.length || 0})
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1">
                  {user?.permissions && user.permissions.length > 0 ? (
                    user.permissions.map((perm) => (
                      <div
                        key={perm.id || perm.name}
                        className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200/60 dark:border-white/5 bg-gray-50/50 dark:bg-black/30 text-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="font-mono text-gray-800 dark:text-gray-200 truncate">
                          {perm.name}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-6 text-gray-500 text-xs italic">
                      Tidak ada permissions spesifik yang terdaftar.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 4: ZONA BERBAHAYA ─── */}
        {activeTab === 'danger' && (
          <div className="rounded-3xl border border-rose-500/30 bg-rose-500/5 backdrop-blur-xl p-6 sm:p-8 shadow-xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400">
                  Hapus Akun Pengguna
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Setelah akun dihapus, seluruh data profil Anda akan dihapus secara permanen.
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. Pastikan Anda telah menyimpan atau mencadangkan informasi penting sebelum melanjutkan penghapusan akun.
            </p>

            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md inline-flex items-center gap-2 transition-all active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              Hapus Akun Saya
            </button>
          </div>
        )}
      </div>

      {/* ─── MODAL CONFIRM DELETE ACCOUNT ─── */}
      <AnimatePresence>
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white dark:bg-gray-900 border border-rose-500/30 shadow-2xl z-10 p-6 space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-500">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-bold">Konfirmasi Penghapusan Akun</h3>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Silakan masukkan kata sandi Anda untuk mengonfirmasi bahwa Anda benar-benar ingin menghapus akun ini secara permanen.
              </p>

              <form onSubmit={handleDeleteSubmit} className="space-y-4">
                <div>
                  <input
                    type="password"
                    value={deleteForm.data.password}
                    onChange={(e) => deleteForm.setData('password', e.target.value)}
                    placeholder="Kata sandi saat ini"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                    required
                  />
                  {deleteForm.errors.password && (
                    <p className="text-xs text-rose-500 mt-1">
                      {deleteForm.errors.password}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setDeleteModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={deleteForm.processing}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-md"
                  >
                    Hapus Permanen
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AuthenticatedLayout>
  );
}
