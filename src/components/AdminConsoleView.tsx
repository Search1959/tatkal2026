import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Building, 
  MapPin, 
  Lock,
  ArrowRightLeft,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AppUser, UserRole, UserStatus } from '../types';

interface AdminConsoleViewProps {
  onOpenCreateUserModal: () => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export const AdminConsoleView: React.FC<AdminConsoleViewProps> = ({
  onOpenCreateUserModal,
  onShowToast
}) => {
  const { 
    currentUser, 
    isAdmin, 
    allUsers, 
    auditLogs, 
    updateUserStatus, 
    updateUserRole, 
    deleteUser, 
    refreshUsers,
    quickSwitchUser
  } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'users' | 'audit'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshUsers();
    setIsRefreshing(false);
    onShowToast('Users directory refreshed from Firestore.', 'info');
  };

  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = 
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const adminCount = allUsers.filter(u => u.role === 'admin').length;
  const operatorCount = allUsers.filter(u => u.role === 'operator').length;
  const activeCount = allUsers.filter(u => u.status === 'active').length;

  if (!isAdmin) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">
          Access Restricted: System Administrator Only
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          You are currently logged in as a <strong>{currentUser?.role.toUpperCase()}</strong> ({currentUser?.email}). System Admin authorization is required to create new users, manage roles, and review audit trails.
        </p>
        <button
          onClick={() => quickSwitchUser('admin@tatkalassist.pro')}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
        >
          Switch to System Administrator
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                System Administration & User Management
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold">
                Database Synced
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Provision new users, manage role-based permissions (RBAC), and monitor security audit logs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync DB</span>
          </button>

          <button
            onClick={onOpenCreateUserModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] rounded-xl shadow-xs transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New User</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Accounts
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {String(allUsers.length).padStart(2, '0')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Provisioned users</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider">
            Administrators
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-indigo-600 mt-1">
            {String(adminCount).padStart(2, '0')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Full governance rights</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider">
            Rail Desk Operators
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-blue-600 mt-1">
            {String(operatorCount).padStart(2, '0')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Dual-workspace managers</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">
            Active Accounts
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 mt-1">
            {String(activeCount).padStart(2, '0')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Ready for booking</div>
        </div>
      </div>

      {/* Sub Tabs: Users Directory vs Audit Trail */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50/60">
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveSubTab('users')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeSubTab === 'users'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Users Directory ({allUsers.length})
            </button>
            <button
              onClick={() => setActiveSubTab('audit')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeSubTab === 'audit'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Audit Activity Log ({auditLogs.length})
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Logged in as: <strong className="text-slate-900">{currentUser?.email}</strong> (Admin)
          </div>
        </div>

        {activeSubTab === 'users' ? (
          <div>
            {/* Filter and Search Bar */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search users by name, email, or department..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value as any)}
                  className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Administrators</option>
                  <option value="operator">Operators</option>
                  <option value="passenger">Passengers</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-600 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">User & Department</th>
                    <th className="px-4 py-3">Assigned Role</th>
                    <th className="px-4 py-3">Account Status</th>
                    <th className="px-4 py-3">Created / By</th>
                    <th className="px-4 py-3">Last Login</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredUsers.map(user => {
                    const isRootAdmin = user.email === 'admin@tatkalassist.pro';

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 ${
                              user.role === 'admin' 
                                ? 'bg-indigo-100 text-indigo-700' 
                                : user.role === 'operator' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-slate-100 text-slate-700'
                            }`}>
                              {user.displayName[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                <span>{user.displayName}</span>
                                {isRootAdmin && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                                    ROOT
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-500 text-[11px] font-mono">{user.email}</div>
                              {user.department && (
                                <div className="text-[10px] text-slate-400 mt-0.5">{user.department}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <select
                            value={user.role}
                            disabled={isRootAdmin}
                            onChange={e => {
                              updateUserRole(user.id, e.target.value as UserRole);
                              onShowToast(`Updated role for ${user.displayName} to ${e.target.value.toUpperCase()}`, 'info');
                            }}
                            className={`text-xs font-semibold rounded-lg px-2 py-1 border transition-colors ${
                              user.role === 'admin'
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                : user.role === 'operator'
                                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                                  : 'bg-slate-50 text-slate-700 border-slate-200'
                            } ${isRootAdmin ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                          >
                            <option value="admin">Administrator</option>
                            <option value="operator">Operator</option>
                            <option value="passenger">Passenger</option>
                          </select>
                        </td>

                        <td className="px-4 py-3.5">
                          <button
                            disabled={isRootAdmin}
                            onClick={() => {
                              const nextStatus = user.status === 'active' ? 'suspended' : 'active';
                              updateUserStatus(user.id, nextStatus);
                              onShowToast(`Account for ${user.displayName} is now ${nextStatus.toUpperCase()}`, 'info');
                            }}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
                              user.status === 'active'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                            } ${isRootAdmin ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                          >
                            {user.status === 'active' ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                            )}
                            <span className="capitalize">{user.status}</span>
                          </button>
                        </td>

                        <td className="px-4 py-3.5 text-slate-600 text-[11px]">
                          <div>{new Date(user.createdAt).toLocaleDateString()}</div>
                          <div className="text-slate-400 text-[10px]">by {user.createdBy || 'System'}</div>
                        </td>

                        <td className="px-4 py-3.5 text-slate-600 font-mono text-[11px]">
                          {user.lastLogin || 'Never'}
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Impersonate / Test as this user */}
                            <button
                              onClick={() => {
                                quickSwitchUser(user.email);
                                onShowToast(`Switched active session to ${user.displayName} (${user.role})`, 'info');
                              }}
                              title="Test session as this user"
                              className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors"
                            >
                              Test Login
                            </button>

                            {/* Delete User */}
                            {!isRootAdmin && (
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete user ${user.displayName}?`)) {
                                    deleteUser(user.id);
                                    onShowToast(`Deleted account ${user.email}`, 'info');
                                  }
                                }}
                                title="Delete user account"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Audit Logs View */
          <div className="p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Immutable Security Audit Trails
            </h3>
            <div className="space-y-2">
              {auditLogs.map(log => (
                <div 
                  key={log.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-start gap-2.5">
                    <Activity className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span className="font-mono text-indigo-700">{log.action}</span>
                        <span>·</span>
                        <span className="text-slate-600">{log.targetUserEmail}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {log.details}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[11px] font-mono text-slate-600">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                    <div className="text-[10px] text-slate-400">by {log.performedBy}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
