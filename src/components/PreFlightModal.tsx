import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  CreditCard, 
  Clock, 
  UserCheck 
} from 'lucide-react';
import { JourneyConfig, Passenger } from '../types';
import { generateQuickCopyText } from '../utils/irctcPayload';
import { evaluateJourneyReadiness, isAcClass } from '../utils/tatkalRules';

interface PreFlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  journey: JourneyConfig | null;
  allPassengers: Passenger[];
  onShowToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export const PreFlightModal: React.FC<PreFlightModalProps> = ({
  isOpen,
  onClose,
  journey,
  allPassengers,
  onShowToast
}) => {
  const [hasCopied, setHasCopied] = useState(false);
  const [consentAcknowledged, setConsentAcknowledged] = useState(false);

  if (!isOpen || !journey) return null;

  const readiness = evaluateJourneyReadiness(journey, allPassengers);
  const selectedPassengers = allPassengers.filter(p => journey.selectedPassengerIds.includes(p.id));
  const isAc = isAcClass(journey.selectedClass);

  const handleCopyPayload = () => {
    const text = generateQuickCopyText(journey, allPassengers);
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    onShowToast('Pre-flight details copied to clipboard!', 'success');
    setTimeout(() => setHasCopied(false), 2500);
  };

  const handleLaunchOfficialIrctc = () => {
    // Standard legitimate redirection to official railway portal
    window.open('https://www.irctc.co.in/nget/train-search', '_blank', 'noopener,noreferrer');
    onShowToast('Redirecting to official IRCTC portal...', 'info');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div 
        className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base tracking-tight">
                IRCTC Pre-Flight Verification
              </h3>
              <p className="text-xs text-slate-400">
                Final preparation checklist before booking on official portal
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

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Target Journey Summary Strip */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 text-sm">
                {journey.sourceStation.name} ({journey.sourceStation.code}) → {journey.destinationStation.name} ({journey.destinationStation.code})
              </span>
              <span className="font-mono px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 font-semibold">
                {journey.quota} QUOTA
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
              <span>Date: <strong className="text-slate-900">{journey.journeyDate}</strong></span>
              <span>·</span>
              <span>Train: <strong className="text-slate-900">#{journey.selectedTrainNumber}</strong></span>
              <span>·</span>
              <span>Class: <strong className="text-slate-900">{journey.selectedClass}</strong></span>
              <span>·</span>
              <span className="font-mono text-indigo-700 font-medium">
                {isAc ? 'Opens 10:00:00 AM IST' : 'Opens 11:00:00 AM IST'}
              </span>
            </div>
          </div>

          {/* Passenger Roster */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
                Passenger Roster ({selectedPassengers.length} Selected)
              </span>
              <button
                onClick={handleCopyPayload}
                className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{hasCopied ? 'Copied to Clipboard!' : 'Copy Roster'}</span>
              </button>
            </div>
            <div className="space-y-1.5">
              {selectedPassengers.map((p, idx) => (
                <div 
                  key={p.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400 font-semibold">0{idx + 1}.</span>
                    <span className="font-semibold text-slate-900">{p.fullName}</span>
                    <span className="text-slate-500">
                      ({p.age}y, {p.gender})
                    </span>
                  </div>
                  <span className="text-slate-600 text-[11px] font-medium">
                    Berth: {p.berthPreference}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pre-Booking Checklist Advice */}
          <div className="space-y-2.5 text-xs">
            <h4 className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
              Critical IRCTC Tatkal Steps
            </h4>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-indigo-950">
                <Clock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Log In 3 to 5 Minutes Prior</div>
                  <p className="text-[11px] text-indigo-900/80 leading-relaxed mt-0.5">
                    Log in to IRCTC at 09:55 AM (for AC) or 10:55 AM (for Non-AC) to prevent session timeouts.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                <CreditCard className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Fast Payment Method Ready</div>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                    UPI Auto-Pay / BHIM UPI or IRCTC iMudra allows direct payment approval on your phone without waiting for banking OTP delays.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-950">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Official Compliance & Legitimate Assistance</div>
                  <p className="text-[11px] text-emerald-900/80 leading-relaxed mt-0.5">
                    Tatkal Assist Pro aids your preparation. You will complete the booking manually, solve the legitimate CAPTCHA, and authenticate payment on official IRCTC.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={consentAcknowledged}
                onChange={e => setConsentAcknowledged(e.target.checked)}
                className="mt-0.5 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="leading-snug">
                I have verified passenger identities and agree to finalize this booking directly on the official IRCTC portal.
              </span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPayload}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>Copy All Details</span>
            </button>

            <button
              onClick={handleLaunchOfficialIrctc}
              className={`flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-xl text-white shadow-xs transition-all ${
                consentAcknowledged
                  ? 'bg-slate-900 hover:bg-slate-800 active:scale-[0.98]'
                  : 'bg-slate-400 cursor-not-allowed'
              }`}
              disabled={!consentAcknowledged}
            >
              <span>Launch Official IRCTC</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
