import React from 'react';
import { Settings, Shield, RefreshCw, Volume2, Key, Database, CheckCircle2 } from 'lucide-react';

interface SettingsViewProps {
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  isAudioAlertEnabled: boolean;
  onToggleAudioAlert: () => void;
  onResetToDefaults: () => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  isDemoMode,
  onToggleDemoMode,
  isAudioAlertEnabled,
  onToggleAudioAlert,
  onResetToDefaults,
  onShowToast
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Application Settings & Configuration
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage data persistence, mode toggles, sound alerts, and railway API integration readiness.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Data & Mode Preferences */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <Database className="w-4 h-4" />
            <span>Operational Modes & Storage</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Demo Mode Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <div className="font-bold text-slate-900">Demo Data Simulator</div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Display fictional railway timetables and PNR status records for prototyping.
                </p>
              </div>
              <button
                onClick={onToggleDemoMode}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  isDemoMode 
                    ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {isDemoMode ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            {/* Sound Alerts */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <div className="font-bold text-slate-900">Audio Countdown Chime</div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Audio chime notification at T-60s and T-10s before Tatkal window.
                </p>
              </div>
              <button
                onClick={onToggleAudioAlert}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  isAudioAlertEnabled 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {isAudioAlertEnabled ? 'Enabled' : 'Muted'}
              </button>
            </div>

            {/* Reset Defaults */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <div className="font-bold text-slate-900">Reset Local Storage</div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Revert journeys and passenger roster back to initial demo dataset.
                </p>
              </div>
              <button
                onClick={() => {
                  onResetToDefaults();
                  onShowToast('Application state reset to defaults.', 'info');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-rose-700 hover:bg-rose-50 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* API Integration Readiness */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <Key className="w-4 h-4" />
            <span>Authorized Railway API Integration</span>
          </div>

          <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
            <p>
              Tatkal Assist Pro is engineered with modular integration points. When authorized commercial Indian Railways or IRCTC Partner APIs are provided via environment variables, live train tracking and authorized PNR enquiry activate automatically:
            </p>

            <div className="p-3 rounded-xl bg-slate-900 text-slate-300 font-mono text-[11px] space-y-1">
              <div className="text-slate-400"># .env configuration:</div>
              <div>RAILWAY_API_KEY="MY_AUTHORIZED_KEY"</div>
              <div>IRCTC_PARTNER_ID="COMMERCIAL_ID"</div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-2">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Zero-Credentials Architecture: </span>
                Personal user passwords and payment CVVs are never transmitted, requested, or persisted.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
