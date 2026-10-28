import React from 'react';
import { 
  LayoutDashboard, 
  SplitSquareVertical, 
  Users, 
  Timer, 
  Search, 
  TicketCheck, 
  BookOpen, 
  Settings,
  TrainTrack,
  ExternalLink,
  Shield,
  ShieldCheck,
  CheckCircle2,
  LogIn
} from 'lucide-react';
import { ActiveTab } from '../types';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  savedJourneysCount: number;
  passengerProfilesCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenLoginModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  savedJourneysCount,
  passengerProfilesCount,
  isOpenMobile,
  onCloseMobile,
  onOpenLoginModal
}) => {
  const { currentUser } = useAuth();
  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: undefined
    },
    {
      id: 'workspace' as ActiveTab,
      label: 'Multi-Journey Workspace',
      icon: SplitSquareVertical,
      badge: 'Dual'
    },
    {
      id: 'passengers' as ActiveTab,
      label: 'Passenger Profiles',
      icon: Users,
      badge: passengerProfilesCount ? String(passengerProfilesCount).padStart(2, '0') : undefined
    },
    {
      id: 'readiness' as ActiveTab,
      label: 'Readiness Assistant',
      icon: Timer,
      badge: 'Live'
    },
    {
      id: 'trains' as ActiveTab,
      label: 'Train Directory',
      icon: Search,
      badge: undefined
    },
    {
      id: 'pnr' as ActiveTab,
      label: 'PNR Status Lookup',
      icon: TicketCheck,
      badge: undefined
    },
    {
      id: 'admin' as ActiveTab,
      label: 'System Admin (RBAC)',
      icon: ShieldCheck,
      badge: 'Admin'
    },
    {
      id: 'guidelines' as ActiveTab,
      label: 'Rules & Guidelines',
      icon: BookOpen,
      badge: undefined
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Settings & Data',
      icon: Settings,
      badge: undefined
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Main Dark Navy Sidebar */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col bg-[#0b1329] text-slate-300 border-r border-slate-800 transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo Section */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800/80">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md shadow-indigo-900/30">
            <TrainTrack className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base tracking-tight truncate">
                Tatkal Assist Pro
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium truncate">
              Smart Railway Booking Companion
            </span>
          </div>
        </div>

        {/* Quick Stat Pill Bar */}
        <div className="grid grid-cols-2 gap-2 px-5 py-3.5 mx-4 my-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Saved Journeys
            </div>
            <div className="text-sm font-bold text-white font-mono tabular-nums mt-0.5">
              {String(savedJourneysCount).padStart(2, '0')}
            </div>
          </div>
          <div className="border-l border-slate-800 pl-3">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Passenger Profiles
            </div>
            <div className="text-sm font-bold text-indigo-400 font-mono tabular-nums mt-0.5">
              {String(passengerProfilesCount).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 pb-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            Navigation
          </div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onCloseMobile();
                }}
                className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                    isActive 
                      ? 'bg-indigo-700/80 text-white font-semibold' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Authenticated User Status Card */}
        <div className="mx-3 my-2 p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center text-xs shrink-0 ${
              currentUser?.role === 'admin'
                ? 'bg-indigo-600 text-white'
                : currentUser?.role === 'operator'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-200'
            }`}>
              {currentUser?.displayName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 truncate">
              <div className="font-bold text-white text-[11px] truncate">
                {currentUser?.displayName || 'Guest User'}
              </div>
              <div className="text-[10px] text-slate-400 capitalize truncate">
                {currentUser?.role || 'passenger'} · {currentUser?.email || 'not signed in'}
              </div>
            </div>
          </div>
          <button
            onClick={onOpenLoginModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            title="Switch User / Login"
          >
            <LogIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Compliance & Quick Railway Links Footer */}
        <div className="p-4 mx-3 mb-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-medium mb-1.5 text-[11px]">
            <Shield className="w-3.5 h-3.5 shrink-0" />
            <span>Legitimate Assist Only</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
            Assists preparation for official IRCTC booking. Zero botting, zero CAPTCHA bypass.
          </p>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <a 
              href="https://www.irctc.co.in" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
            >
              <span>irctc.co.in</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-slate-400 flex items-center gap-1 font-mono text-[10px]">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>NTP Synced</span>
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
