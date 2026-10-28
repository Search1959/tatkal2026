import React, { useState } from 'react';
import { X, Lock, Mail, ShieldCheck, ArrowRight, AlertCircle, User, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onShowToast }) => {
  const { login, quickSwitchUser, currentUser, allUsers } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Tatkal@2026');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter an email address.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      onShowToast(`Welcome back, ${email}!`, 'success');
      onClose();
    } else {
      setErrorMsg(result.error || 'Authentication failed.');
    }
  };

  const handleQuickLogin = async (targetEmail: string, roleName: string, userPassword?: string) => {
    setEmail(targetEmail);
    if (userPassword) {
      setPassword(userPassword);
    }
    setIsSubmitting(true);
    const result = await login(targetEmail, userPassword || password);
    setIsSubmitting(false);
    if (result.success) {
      onShowToast(`Signed in as ${roleName} (${targetEmail})`, 'success');
      onClose();
    } else {
      setErrorMsg(result.error || 'Login failed.');
    }
  };

  // Find custom accounts created by admin
  const customUsers = allUsers.filter(
    u => !['admin@tatkalassist.pro', 'operator@tatkalassist.pro', 'passenger@tatkalassist.pro'].includes(u.email)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div 
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">
                User Authentication & Login
              </h3>
              <p className="text-xs text-slate-400">
                Cloud-Synced: Access from mobile, desktop, or anywhere
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

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Cloud Synchronization Notice */}
          <div className="p-3 bg-emerald-50/80 border border-emerald-200/90 rounded-xl text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-emerald-950 leading-relaxed text-[11px]">
              <span className="font-bold text-emerald-900">Cross-Device Cloud Sync Active: </span>
              Accounts created by System Admin are stored in Firestore and can be accessed from any phone, tablet, or PC worldwide.
            </div>
          </div>

          {/* Quick Demo Credentials Switcher */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              1-Click Fast Switch Accounts ({allUsers.length} in Cloud DB)
            </span>
            <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {/* Default accounts */}
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@tatkalassist.pro', 'Chief System Administrator', 'Tatkal@2026')}
                className="flex items-center justify-between p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-left transition-colors text-xs"
              >
                <div>
                  <div className="font-bold text-indigo-950">Chief System Administrator</div>
                  <div className="text-[11px] text-indigo-700 font-mono">admin@tatkalassist.pro · Full Admin</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('operator@tatkalassist.pro', 'Rail Desk Operator', 'Tatkal@2026')}
                className="flex items-center justify-between p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-left transition-colors text-xs"
              >
                <div>
                  <div className="font-bold text-blue-950">Vikram Joshi (Senior Desk)</div>
                  <div className="text-[11px] text-blue-700 font-mono">operator@tatkalassist.pro · Operator</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('passenger@tatkalassist.pro', 'Regular Passenger', 'Tatkal@2026')}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">Arun Sharma (Personal)</div>
                  <div className="text-[11px] text-slate-500 font-mono">passenger@tatkalassist.pro · Passenger</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              </button>

              {/* Custom Admin-Created Accounts */}
              {customUsers.map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u.email, u.displayName, u.password)}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-left transition-colors text-xs"
                >
                  <div>
                    <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <span>{u.displayName}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-200/80 text-emerald-900 rounded font-semibold uppercase">
                        {u.role}
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-700 font-mono">{u.email}</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Or sign in with email
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="name@tatkalassist.pro"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] rounded-xl shadow-xs transition-all disabled:bg-slate-400 flex items-center justify-center gap-2"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Account'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
