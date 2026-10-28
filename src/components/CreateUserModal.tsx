import React, { useState } from 'react';
import { X, UserPlus, Shield, Building, Lock, Mail, User, AlertCircle, Check } from 'lucide-react';
import { UserRole } from '../types';
import { STATIONS } from '../data/mockRailwayData';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: {
    email: string;
    password?: string;
    displayName: string;
    role: UserRole;
    department?: string;
    assignedStations?: string[];
  }) => Promise<{ success: boolean; error?: string }>;
  onShowToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onShowToast
}) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Tatkal@2026');
  const [role, setRole] = useState<UserRole>('operator');
  const [department, setDepartment] = useState('Central Ticketing Desk');
  const [selectedStations, setSelectedStations] = useState<string[]>(['NDLS', 'HWH']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleToggleStation = (code: string) => {
    setSelectedStations(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!displayName.trim() || displayName.trim().length < 3) {
      setErrorMsg('Display Name must be at least 3 characters.');
      return;
    }

    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setErrorMsg('Please specify a valid email address.');
      return;
    }

    if (password && password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    const result = await onSubmit({
      displayName: displayName.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      department: department.trim(),
      assignedStations: selectedStations
    });

    setIsSubmitting(false);

    if (result.success) {
      onShowToast(`Created ${role.toUpperCase()} account for ${displayName} (Password: ${password})! Accessible on mobile & desktop worldwide.`, 'success');
      onClose();
      // Reset form
      setDisplayName('');
      setEmail('');
      setPassword('Tatkal@2026');
      setRole('operator');
    } else {
      setErrorMsg(result.error || 'Failed to create user.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">
                Provision New User
              </h3>
              <p className="text-xs text-slate-400">
                System Administrator User Enrollment & RBAC
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Full Name & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunil Kumar"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Department
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. Northern Division"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Email and Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Official Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="user@tatkalassist.pro"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Temporary Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Assigned System Role & Permissions
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div
                onClick={() => setRole('admin')}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  role === 'admin'
                    ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-semibold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">Administrator</span>
                  {role === 'admin' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </div>
                <p className="text-[10px] text-slate-500">Full system & user governance</p>
              </div>

              <div
                onClick={() => setRole('operator')}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  role === 'operator'
                    ? 'bg-blue-50 border-blue-400 text-blue-950 font-semibold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">Operator</span>
                  {role === 'operator' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <p className="text-[10px] text-slate-500">Dual workspace & master rosters</p>
              </div>

              <div
                onClick={() => setRole('passenger')}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  role === 'passenger'
                    ? 'bg-slate-100 border-slate-400 text-slate-950 font-semibold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">Passenger</span>
                  {role === 'passenger' && <Check className="w-3.5 h-3.5 text-slate-700" />}
                </div>
                <p className="text-[10px] text-slate-500">Personal journey planning</p>
              </div>
            </div>
          </div>

          {/* Assigned Station Access (For Operators) */}
          {role === 'operator' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Authorized Railway Hubs (Select Access)
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
                {STATIONS.slice(0, 10).map(s => {
                  const isSelected = selectedStations.includes(s.code);
                  return (
                    <button
                      type="button"
                      key={s.code}
                      onClick={() => handleToggleStation(s.code)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-mono font-semibold transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {s.code}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Security & Firestore Notice */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-indigo-950 text-[11px]">
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              <span>Cloud Persistence Across All Devices</span>
            </div>
            <p className="text-[11px] text-indigo-900/80 leading-relaxed">
              This account is saved directly into the live Cloud Firestore database. It is immediately accessible from mobile phones, tablets, or desktop browsers anywhere over the internet.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors disabled:bg-indigo-400 flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Provisioning...' : 'Provision Account'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
