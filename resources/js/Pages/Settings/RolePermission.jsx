import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Key,
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
  Lock,
  Unlock,
  CheckSquare,
  Square,
  ChevronRight,
  X,
  UserCheck,
  RefreshCw,
  Building,
} from 'lucide-react';

export default function RolePermission({
  roles,
  permissions,
  permissionGroups,
  users,
  userSearch: initialUserSearch,
}) {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('tab') || 'roles';
    }
    return 'roles';
  });

  // Modal states
  const [createRoleOpen, setCreateRoleOpen] = useState(false);
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const [createPermOpen, setCreatePermOpen] = useState(false);
  const [permMatrixOpen, setPermMatrixOpen] = useState(false);
  const [activeRoleForMatrix, setActiveRoleForMatrix] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const [userRoleModalOpen, setUserRoleModalOpen] = useState(false);
  const [activeUserForRole, setActiveUserForRole] = useState(null);
  const [selectedUserRoles, setSelectedUserRoles] = useState([]);

  const [searchPermQuery, setSearchPermQuery] = useState('');
  const [searchUserQuery, setSearchUserQuery] = useState(initialUserSearch || '');

  // Forms
  const roleForm = useForm({
    name: '',
    permissions: [],
  });

  const editRoleForm = useForm({
    name: '',
  });

  const permForm = useForm({
    name: '',
  });

  // Handle Role Submit
  const handleStoreRole = (e) => {
    e.preventDefault();
    roleForm.post(route('settings.roles.store'), {
      preserveScroll: true,
      onSuccess: () => {
        setCreateRoleOpen(false);
        roleForm.reset();
      },
    });
  };

  const handleUpdateRole = (e) => {
    e.preventDefault();
    if (!editingRole) return;
    editRoleForm.put(route('settings.roles.update', editingRole.id), {
      preserveScroll: true,
      onSuccess: () => {
        setEditRoleOpen(false);
        setEditingRole(null);
        editRoleForm.reset();
      },
    });
  };

  const handleDeleteRole = (role) => {
    if (role.name === 'super-admin') {
      alert('Role super-admin adalah role inti sistem dan tidak dapat dihapus.');
      return;
    }
    if (confirm(`Hapus role "${role.name}"? Pengguna dengan role ini akan kehilangan akses terkait.`)) {
      router.delete(route('settings.roles.destroy', role.id), {
        preserveScroll: true,
      });
    }
  };

  // Open Permission Matrix for Role
  const openPermissionMatrix = (role) => {
    setActiveRoleForMatrix(role);
    const rolePermNames = (role.permissions || []).map((p) => p.name);
    setSelectedPermissions(rolePermNames);
    setPermMatrixOpen(true);
  };

  // Toggle single permission for matrix
  const togglePermission = (name) => {
    setSelectedPermissions((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  };

  // Toggle all permissions in a group
  const toggleGroupPermissions = (groupName, perms) => {
    const groupPermNames = perms.map((p) => p.name);
    const allSelected = groupPermNames.every((name) => selectedPermissions.includes(name));

    if (allSelected) {
      setSelectedPermissions((prev) =>
        prev.filter((name) => !groupPermNames.includes(name))
      );
    } else {
      setSelectedPermissions((prev) => [
        ...prev,
        ...groupPermNames.filter((name) => !prev.includes(name)),
      ]);
    }
  };

  // Save Role Permissions Matrix
  const saveRolePermissions = () => {
    if (!activeRoleForMatrix) return;
    router.post(
      route('settings.roles.sync-permissions', activeRoleForMatrix.id),
      { permissions: selectedPermissions },
      {
        preserveScroll: true,
        onSuccess: () => setPermMatrixOpen(false),
      }
    );
  };

  // Create Permission
  const handleStorePermission = (e) => {
    e.preventDefault();
    permForm.post(route('settings.permissions.store'), {
      preserveScroll: true,
      onSuccess: () => {
        setCreatePermOpen(false);
        permForm.reset();
      },
    });
  };

  const handleDeletePermission = (permission) => {
    if (confirm(`Hapus permission "${permission.name}"?`)) {
      router.delete(route('settings.permissions.destroy', permission.id), {
        preserveScroll: true,
      });
    }
  };

  // Seed default recommended permissions
  const handleSeedDefaults = () => {
    if (
      confirm(
        'Generate dan sinkronkan daftar permissions rekomendasi operasional (Work Order, Tyres, Tools, Settings) ke super-admin?'
      )
    ) {
      router.post(route('settings.permissions.seed'), {}, { preserveScroll: true });
    }
  };

  // Open User Role Assignment
  const openUserRoleModal = (user) => {
    setActiveUserForRole(user);
    setSelectedUserRoles((user.roles || []).map((r) => r.name));
    setUserRoleModalOpen(true);
  };

  const toggleUserRole = (roleName) => {
    setSelectedUserRoles((prev) =>
      prev.includes(roleName) ? prev.filter((r) => r !== roleName) : [...prev, roleName]
    );
  };

  const saveUserRoles = () => {
    if (!activeUserForRole) return;
    router.post(
      route('settings.users.sync-roles', activeUserForRole.id),
      { roles: selectedUserRoles },
      {
        preserveScroll: true,
        onSuccess: () => setUserRoleModalOpen(false),
      }
    );
  };

  // User search trigger
  const handleSearchUsers = (e) => {
    e.preventDefault();
    router.get(
      route('settings.roles-permissions.index'),
      { tab: 'users', user_search: searchUserQuery },
      { preserveState: true, preserveScroll: true }
    );
  };

  // Filter permissions
  const filteredPermissions = useMemo(() => {
    if (!searchPermQuery.trim()) return permissions;
    const q = searchPermQuery.toLowerCase();
    return permissions.filter((p) => p.name.toLowerCase().includes(q));
  }, [permissions, searchPermQuery]);

  return (
    <AuthenticatedLayout header="Role & Permission Management">
      <Head title="Role & Permission Management" />

      <div className="space-y-6">
        {/* Banner Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-emerald-950/70 p-6 sm:p-8 border border-indigo-500/30 backdrop-blur-xl shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
                <Shield className="w-3.5 h-3.5" />
                Access Control & Security
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Role & Permission Matrix
              </h1>
              <p className="text-sm sm:text-base text-gray-300 mt-1 max-w-2xl">
                Kelola hak akses pengguna, matriks permission per role sistem, dan penetapan role karyawan secara terpusat dan aman.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={handleSeedDefaults}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white border border-white/10 text-sm font-semibold transition-all shadow-md active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                Auto-Generate Permissions
              </button>

              <button
                onClick={() => setCreateRoleOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Role Baru
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-gray-100 dark:bg-gray-900/80 border border-gray-200 dark:border-white/10 w-fit shadow-inner">
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 ${
              activeTab === 'roles'
                ? 'bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            Roles & Matrix Akses ({roles.length})
          </button>

          <button
            onClick={() => setActiveTab('permissions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 ${
              activeTab === 'permissions'
                ? 'bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Key className="w-4 h-4" />
            Daftar Permissions ({permissions.length})
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 ${
              activeTab === 'users'
                ? 'bg-white dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Penugasan User
          </button>
        </div>

        {/* ─── TAB 1: ROLES & MATRIX ─── */}
        {activeTab === 'roles' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {roles.map((role) => {
              const isSuper = role.name === 'super-admin';
              const permCount = isSuper ? permissions.length : (role.permissions || []).length;

              return (
                <div
                  key={role.id}
                  className="rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl p-5 shadow-lg flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300"
                >
                  {isSuper && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
                  )}

                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-md ${
                            isSuper
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          <Shield className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-base text-gray-900 dark:text-white capitalize">
                            {role.name}
                          </h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Guard: {role.guard_name || 'web'}
                          </span>
                        </div>
                      </div>

                      {isSuper ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-500 border border-amber-500/30">
                          Core Super Admin
                        </span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingRole(role);
                              editRoleForm.setData('name', role.name);
                              setEditRoleOpen(true);
                            }}
                            className="p-1 rounded text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10"
                            title="Edit nama role"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role)}
                            className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                            title="Hapus role"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-xl bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/5">
                      <div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                          Pengguna Aktif
                        </div>
                        <div className="text-lg font-extrabold text-gray-900 dark:text-white">
                          {role.users_count || 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                          Permissions
                        </div>
                        <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                          {isSuper ? 'Semua (Bypass)' : permCount}
                        </div>
                      </div>
                    </div>

                    {/* Sample permissions badges */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {isSuper ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          🌟 Full System Access (Semua Hak Akses)
                        </span>
                      ) : role.permissions && role.permissions.length > 0 ? (
                        role.permissions.slice(0, 4).map((p) => (
                          <span
                            key={p.id}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 truncate max-w-[140px]"
                          >
                            {p.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          Belum ada hak akses khusus
                        </span>
                      )}

                      {!isSuper && role.permissions && role.permissions.length > 4 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-white/5 text-gray-500">
                          +{role.permissions.length - 4} lainnya
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Matrix Button */}
                  <div className="mt-5 pt-3 border-t border-gray-200 dark:border-white/10">
                    <button
                      onClick={() => openPermissionMatrix(role)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        isSuper
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      <Key className="w-3.5 h-3.5" />
                      {isSuper ? 'Lihat Matriks Permissions' : 'Atur Matriks Permissions'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── TAB 2: PERMISSIONS MANAGER ─── */}
        {activeTab === 'permissions' && (
          <div className="rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-white/10">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Katalog Hak Akses (Permissions)
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Daftar seluruh permission atomik yang dapat diberikan kepada peran pengguna
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative min-w-[220px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchPermQuery}
                    onChange={(e) => setSearchPermQuery(e.target.value)}
                    placeholder="Filter permission..."
                    className="w-full pl-9 pr-4 py-1.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  onClick={() => setCreatePermOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs inline-flex items-center gap-1.5 shadow-md shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Permission Baru
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredPermissions.map((perm) => (
                <div
                  key={perm.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-200/60 dark:border-white/5 bg-gray-50/50 dark:bg-black/30 hover:border-emerald-500/30 transition-all"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <Key className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="font-mono text-xs text-gray-800 dark:text-gray-200 truncate">
                      {perm.name}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeletePermission(perm)}
                    className="p-1 rounded text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                    title="Hapus permission"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB 3: USER ROLE ASSIGNMENT ─── */}
        {activeTab === 'users' && (
          <div className="rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-white/10">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Penugasan Peran Pengguna (User Roles)
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tetapkan role kepada akun pengguna agar memiliki hak akses sesuai jabatannya
                </p>
              </div>

              <form onSubmit={handleSearchUsers} className="flex items-center gap-2">
                <div className="relative min-w-[260px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchUserQuery}
                    onChange={(e) => setSearchUserQuery(e.target.value)}
                    placeholder="Cari nama, email, NRP, departemen..."
                    className="w-full pl-9 pr-4 py-1.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold text-xs"
                >
                  Cari
                </button>
              </form>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-4 font-bold">Karyawan / Akun</th>
                    <th className="py-3 px-4 font-bold">NRP & Departemen</th>
                    <th className="py-3 px-4 font-bold">Role Aktif</th>
                    <th className="py-3 px-4 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {users.data.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50/80 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              user.avatar_url ||
                              (user.avatar ? `/storage/${user.avatar}` : '/images/planner_logo.jpg')
                            }
                            alt={user.name}
                            onError={(e) => {
                              e.currentTarget.src = '/images/planner_logo.jpg';
                            }}
                            className="w-9 h-9 rounded-full object-cover border border-emerald-500/30"
                          />
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white text-sm">
                              {user.name}
                            </div>
                            <div className="text-[11px] text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono text-gray-700 dark:text-gray-300">
                          {user.nrp || '-'}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">
                          {user.department || user.position || 'Plant Operation'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {user.roles && user.roles.length > 0 ? (
                            user.roles.map((r) => (
                              <span
                                key={r.id}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                  r.name === 'super-admin'
                                    ? 'bg-amber-500/20 text-amber-500 border-amber-500/30'
                                    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                }`}
                              >
                                {r.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 italic">Tanpa role khusus</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openUserRoleModal(user)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold text-xs border border-emerald-500/20 inline-flex items-center gap-1.5"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Ubah Role
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Links if needed */}
            {users.links && users.links.length > 3 && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/10">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Menampilkan {users.from || 0} - {users.to || 0} dari {users.total} pengguna
                </div>
                <div className="flex items-center gap-1">
                  {users.links.map((link, idx) => (
                    <button
                      key={idx}
                      onClick={() => link.url && router.get(link.url)}
                      disabled={!link.url}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        link.active
                          ? 'bg-emerald-500 text-gray-950 font-bold'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── MODAL: PERMISSION MATRIX FOR ROLE ─── */}
      <AnimatePresence>
        {permMatrixOpen && activeRoleForMatrix && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPermMatrixOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow-2xl z-10 max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between shrink-0 bg-gray-50/50 dark:bg-black/20">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">
                      Matriks Hak Akses: Role{' '}
                      <span className="text-emerald-500 capitalize">
                        {activeRoleForMatrix.name}
                      </span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Pilih hak akses spesifik untuk role ini atau gunakan tombol centang grup
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setPermMatrixOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto p-6 space-y-6 flex-1">
                {/* Fast Action Buttons */}
                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/5">
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    Dipilih:{' '}
                    <span className="font-bold text-emerald-500">
                      {selectedPermissions.length}
                    </span>{' '}
                    dari {permissions.length} permission
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPermissions(permissions.map((p) => p.name))
                      }
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                    >
                      Pilih Semua
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPermissions([])}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700"
                    >
                      Kosongkan
                    </button>
                  </div>
                </div>

                {/* Grouped Permissions */}
                {Object.entries(permissionGroups).map(([groupName, groupPerms]) => {
                  const allSelectedInGroup = groupPerms.every((p) =>
                    selectedPermissions.includes(p.name)
                  );

                  return (
                    <div
                      key={groupName}
                      className="rounded-xl border border-gray-200 dark:border-white/5 bg-gray-50/40 dark:bg-black/20 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-white/5">
                        <span className="font-bold text-xs uppercase tracking-wider text-gray-800 dark:text-gray-200">
                          {groupName} ({groupPerms.length})
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            toggleGroupPermissions(groupName, groupPerms)
                          }
                          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          {allSelectedInGroup ? (
                            <>
                              <CheckSquare className="w-3.5 h-3.5" /> Lepas Semua
                            </>
                          ) : (
                            <>
                              <Square className="w-3.5 h-3.5" /> Pilih Grup Ini
                            </>
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {groupPerms.map((perm) => {
                          const isChecked = selectedPermissions.includes(perm.name);
                          return (
                            <label
                              key={perm.id}
                              onClick={() => togglePermission(perm.name)}
                              className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                                isChecked
                                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                                  : 'bg-white dark:bg-gray-800/60 border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-gray-700 pointer-events-none"
                              />
                              <span className="font-mono truncate">{perm.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-white/10 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setPermMatrixOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={saveRolePermissions}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm shadow-md"
                >
                  Simpan Hak Akses
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL: CREATE ROLE ─── */}
      <AnimatePresence>
        {createRoleOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCreateRoleOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow-2xl z-10 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Buat Role Baru
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Nama role akan diformat menjadi huruf kecil (contoh: planner, supervisor)
              </p>

              <form onSubmit={handleStoreRole} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                    Nama Role <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={roleForm.data.name}
                    onChange={(e) => roleForm.setData('name', e.target.value)}
                    placeholder="Contoh: planner, mechanic, tyre-specialist"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  {roleForm.errors.name && (
                    <p className="text-xs text-rose-500 mt-1">{roleForm.errors.name}</p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setCreateRoleOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={roleForm.processing}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm shadow-md"
                  >
                    Buat Role
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL: EDIT ROLE ─── */}
      <AnimatePresence>
        {editRoleOpen && editingRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditRoleOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow-2xl z-10 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Edit Nama Role
              </h3>

              <form onSubmit={handleUpdateRole} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                    Nama Role
                  </label>
                  <input
                    type="text"
                    value={editRoleForm.data.name}
                    onChange={(e) => editRoleForm.setData('name', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  {editRoleForm.errors.name && (
                    <p className="text-xs text-rose-500 mt-1">{editRoleForm.errors.name}</p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setEditRoleOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={editRoleForm.processing}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm shadow-md"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL: CREATE PERMISSION ─── */}
      <AnimatePresence>
        {createPermOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCreatePermOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow-2xl z-10 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Tambah Permission Baru
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Gunakan format modul.aksi (contoh: work-orders.create, tyres.rotate)
              </p>

              <form onSubmit={handleStorePermission} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1.5">
                    Nama Permission <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={permForm.data.name}
                    onChange={(e) => permForm.setData('name', e.target.value)}
                    placeholder="Contoh: work-orders.export"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                    required
                  />
                  {permForm.errors.name && (
                    <p className="text-xs text-rose-500 mt-1">{permForm.errors.name}</p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setCreatePermOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={permForm.processing}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm shadow-md"
                  >
                    Simpan Permission
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL: USER ROLE ASSIGNMENT ─── */}
      <AnimatePresence>
        {userRoleModalOpen && activeUserForRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUserRoleModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow-2xl z-10 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={
                    activeUserForRole.avatar_url ||
                    (activeUserForRole.avatar
                      ? `/storage/${activeUserForRole.avatar}`
                      : '/images/planner_logo.jpg')
                  }
                  alt={activeUserForRole.name}
                  className="w-10 h-10 rounded-full object-cover border border-emerald-500/30"
                />
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">
                    Atur Role: {activeUserForRole.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activeUserForRole.email} • NRP: {activeUserForRole.nrp || '-'}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 my-4 max-h-60 overflow-y-auto pr-1">
                {roles.map((role) => {
                  const isChecked = selectedUserRoles.includes(role.name);
                  return (
                    <label
                      key={role.id}
                      onClick={() => toggleUserRole(role.name)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                        isChecked
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-bold'
                          : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 pointer-events-none"
                        />
                        <span className="capitalize">{role.name}</span>
                      </div>

                      {role.name === 'super-admin' && (
                        <span className="text-[10px] text-amber-500 font-semibold">
                          Super Admin
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setUserRoleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={saveUserRoles}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm shadow-md"
                >
                  Simpan Role User
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AuthenticatedLayout>
  );
}
