import React, { useState, useEffect } from 'react';
import { 
  ExternalLink, 
  Volume2, 
  VolumeX, 
  Clock, 
  ShieldCheck, 
  Info,
  ChevronRight
} from 'lucide-react';
import { ActiveTab } from '../types';
import { getCurrentIstDate, formatIstTime, getTatkalWindowStatus } from '../utils/tatkalRules';
import { useAuth } from '../context/AuthContext';
import { User, UserPlus, LogIn } from 'lucide-react';

interface TopHeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isAudioAlertEnabled: boolean;
  onToggleAudioAlert: () => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  onOpenIrctcModal: () => void;
  onOpenLoginModal: () => void;
  onOpenCreateUserModal: () => void;
}

const TAB_TITLES: Record<ActiveTab, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard Overview', subtitle: 'Live tatkal windows, journey statuses & readiness' },
  workspace: { title: 'Multi-Journey Workspace', subtitle: 'Dual independent journey panels & preparation' },
  passengers: { title: 'Passenger Master List', subtitle: 'Manage verified passenger profiles for swift booking' },
  readiness: { title: 'Booking Readiness Assistant', subtitle: 'Pre-flight checklist & precision countdown' },
  trains: { title: 'Trains & Schedules Directory', subtitle: 'Search Indian Railways trains, routes & Tatkal quota' },
  pnr: { title: 'PNR Status Checker', subtitle: 'Instant booking & current chart confirmation status' },
  admin: { title: 'System Administration & RBAC', subtitle: 'Provision users, govern role-based access, and inspect audit trails' },
  guidelines: { title: 'Tatkal Rules & Guidelines', subtitle: 'Official Indian Railways regulations & best practices' },
  settings: { title: 'System Settings', subtitle: 'Data preferences & compliance parameters' }
};

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  onTabChange,
  isAudioAlertEnabled,
  onToggleAudioAlert,
  isDemoMode,
  onToggleDemoMode,
  onOpenIrctcModal,
  onOpenLoginModal,
  onOpenCreateUserModal
}) => {
  const { currentUser, isAdmin } = useAuth();
  const [istTimeStr, setIstTimeStr] = useState<string>('');
  const [acWindowStatus, setAcWindowStatus] = useState(getTatkalWindowStatus('3A'));

  useEffect(() => {
    const updateTime = () => {
      const now = getCurrentIstDate();
      setIstTimeStr(formatIstTime(now));
      setAcWindowStatus(getTatkalWindowStatus('3A'));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabInfo = TAB_TITLES[activeTab] || { title: 'Tatkal Assist Pro', subtitle: 'Railway Companion' };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 bg-white/95 px-6 py-3.5 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Zone 1: Breadcrumbs & Current View Info */}
      <div className="flex items-center gap-3 min-w-0">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
          <button 
            onClick={() => onTabChange('dashboard')}
            className="hover:text-slate-900 transition-colors font-medium whitespace-nowrap"
          >
            Tatkal Assist Pro
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-800 truncate">
            {tabInfo.title}
          </span>
        </nav>
      </div>

      {/* Zone 2: Live IST Precision Clock & Tatkal Timing */}
      <div className="hidden lg:flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2 bg-slate-100/90 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200/80">
          <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Indian Standard Time:</span>
            <span className="font-mono font-semibold tabular-nums text-slate-900 text-sm tracking-tight">
              {istTimeStr || '10:00:00 IST'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50/80 text-indigo-950 rounded-lg border border-indigo-100">
          <span className="text-indigo-600 font-medium">AC Tatkal:</span>
          <span className="font-mono font-semibold tabular-nums text-indigo-900">
            {acWindowStatus.isWindowActive 
              ? 'Window Open Now!' 
              : acWindowStatus.isBeforeWindow 
                ? `T - ${acWindowStatus.formattedCountdown}` 
                : '10:00 AM Passed'}
          </span>
        </div>
      </div>

      {/* Zone 3: Primary Actions & Utilities */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* User Account / Login Pill */}
        <button
          onClick={onOpenLoginModal}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-xs text-left"
          title="Switch User / Login"
        >
          <div className={`w-5 h-5 rounded-full font-bold flex items-center justify-center text-[10px] text-white shrink-0 ${
            currentUser?.role === 'admin' 
              ? 'bg-indigo-600' 
              : currentUser?.role === 'operator' 
                ? 'bg-blue-600' 
                : 'bg-slate-700'
          }`}>
            {currentUser?.displayName?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="hidden md:block truncate max-w-[130px]">
            <span className="font-semibold text-slate-800 text-xs block leading-none truncate">
              {currentUser?.displayName || 'Sign In'}
            </span>
            <span className="text-[10px] text-slate-400 capitalize block leading-tight mt-0.5">
              {currentUser?.role || 'Guest'}
            </span>
          </div>
          <LogIn className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </button>

        {/* Quick Admin Provision Shortcut */}
        {isAdmin && (
          <button
            onClick={onOpenCreateUserModal}
            title="Create New User Account"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ User</span>
          </button>
        )}

        {/* Demo Mode Toggle */}
        <button
          onClick={onToggleDemoMode}
          title={isDemoMode ? 'Demo data active - click to toggle live-ready mode' : 'Live-ready mode active'}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            isDemoMode 
              ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100' 
              : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">{isDemoMode ? 'Demo Mode Active' : 'Live Mode Ready'}</span>
        </button>

        {/* Audio Alert Chime Toggle */}
        <button
          onClick={onToggleAudioAlert}
          title={isAudioAlertEnabled ? 'Sound alert enabled at T-60s & T-10s' : 'Sound alert muted'}
          className={`p-2 rounded-lg border transition-colors ${
            isAudioAlertEnabled
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
              : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
          }`}
        >
          {isAudioAlertEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>

        {/* Official IRCTC Launcher Button */}
        <button
          onClick={onOpenIrctcModal}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] rounded-lg shadow-xs transition-all whitespace-nowrap"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Open IRCTC</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
        </button>
      </div>
    </header>
  );
};
