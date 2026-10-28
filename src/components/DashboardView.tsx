import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  TicketCheck, 
  ArrowRight, 
  Sparkles, 
  Copy,
  TrainTrack,
  ShieldCheck,
  Calendar,
  Share2,
  ChevronRight
} from 'lucide-react';
import { JourneyConfig, Passenger, ActiveTab } from '../types';
import { getCurrentIstDate, formatIstTime, getTatkalWindowStatus, evaluateJourneyReadiness, isAcClass } from '../utils/tatkalRules';
import { generateQuickCopyText } from '../utils/irctcPayload';

interface DashboardViewProps {
  journeys: JourneyConfig[];
  passengers: Passenger[];
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenPreflight: (journey: JourneyConfig) => void;
  onOpenPassengerModal: () => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  journeys,
  passengers,
  onNavigateTab,
  onOpenPreflight,
  onOpenPassengerModal,
  onShowToast
}) => {
  const [istTime, setIstTime] = useState<string>('');
  const [acStatus, setAcStatus] = useState(getTatkalWindowStatus('3A'));
  const [nonAcStatus, setNonAcStatus] = useState(getTatkalWindowStatus('SL'));

  useEffect(() => {
    const updateTimes = () => {
      const now = getCurrentIstDate();
      setIstTime(formatIstTime(now));
      setAcStatus(getTatkalWindowStatus('3A'));
      setNonAcStatus(getTatkalWindowStatus('SL'));
    };
    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  const journeyA = journeys[0];
  const journeyB = journeys[1] || journeys[0];

  const readinessA = journeyA ? evaluateJourneyReadiness(journeyA, passengers) : null;
  const readinessB = journeyB ? evaluateJourneyReadiness(journeyB, passengers) : null;

  const quickRailwayLinks = [
    { name: 'IRCTC eTicketing', url: 'https://www.irctc.co.in/nget/train-search', desc: 'Official Ticket Booking' },
    { name: 'NTES Train Enquiry', url: 'https://enquiry.indianrail.gov.in', desc: 'National Train Running Status' },
    { name: 'PRS PNR Enquiry', url: 'https://www.indianrail.gov.in/enquiry/PNR/PnrEnquiry.html', desc: 'Live Chart & Reservation' },
    { name: 'RailMadad Helpline', url: 'https://railmadad.indianrailways.gov.in', desc: 'Indian Railways Support 139' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome & Countdown Hero */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-[#101b3b] to-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <TrainTrack className="w-4 h-4" />
              <span>Smart Railway Booking Companion</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Tatkal Assist Pro
            </h1>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Legitimate preparation companion for official IRCTC railway reservations. Pre-verify journeys, sync passenger master profiles, and track live booking window countdowns.
            </p>
          </div>

          {/* Dual Tatkal Windows Countdown Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
            {/* AC Window */}
            <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/80">
              <div className="flex items-center justify-between gap-2 text-[10px] font-semibold text-indigo-300 uppercase">
                <span>AC Tatkal Window (10:00 AM)</span>
                <Clock className="w-3 h-3" />
              </div>
              <div className="text-2xl font-extrabold font-mono tabular-nums text-white mt-1">
                {acStatus.isWindowActive ? 'WINDOW OPEN' : acStatus.formattedCountdown}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {acStatus.isWindowActive ? 'General user priority active' : '1A, 2A, 3A, 3E, CC, EC'}
              </div>
            </div>

            {/* Non-AC Window */}
            <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/80">
              <div className="flex items-center justify-between gap-2 text-[10px] font-semibold text-amber-300 uppercase">
                <span>Non-AC Tatkal (11:00 AM)</span>
                <Clock className="w-3 h-3" />
              </div>
              <div className="text-2xl font-extrabold font-mono tabular-nums text-white mt-1">
                {nonAcStatus.isWindowActive ? 'WINDOW OPEN' : nonAcStatus.formattedCountdown}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {nonAcStatus.isWindowActive ? 'General user priority active' : 'Sleeper (SL) & 2S Classes'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Layout: Journey A & Journey B Quick Overview Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Active Multi-Journey Workspace
            </h2>
            <p className="text-xs text-slate-500">
              Two independent journey configurations ready for review and quick execution
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('workspace')}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <span>Open Full Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Journey A Quick Card */}
          {journeyA && (
            <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    <h3 className="font-bold text-sm text-slate-900">
                      Journey A
                    </h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    readinessA?.isFullyReady 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {readinessA?.scorePercent}% Ready
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-3">
                  <div className="font-bold text-slate-900 text-sm">
                    {journeyA.sourceStation?.name} ({journeyA.sourceStation?.code}) → {journeyA.destinationStation?.name} ({journeyA.destinationStation?.code})
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-2">
                    <span>Train #{journeyA.selectedTrainNumber}</span>
                    <span>·</span>
                    <span>Class: <strong className="text-slate-800">{journeyA.selectedClass}</strong></span>
                    <span>·</span>
                    <span>Date: {journeyA.journeyDate}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                  <div className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">
                    Readiness Checklist
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Journey details & train verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{journeyA.selectedPassengerIds.length} passenger profiles assigned (≤4 Tatkal limit)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>{isAcClass(journeyA.selectedClass) ? '10:00:00 AM IST AC Window' : '11:00:00 AM IST Non-AC Window'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    const text = generateQuickCopyText(journeyA, passengers);
                    navigator.clipboard.writeText(text);
                    onShowToast('Journey A payload copied to clipboard!', 'success');
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Payload</span>
                </button>

                <button
                  onClick={() => onOpenPreflight(journeyA)}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Launch on IRCTC</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Journey B Quick Card */}
          {journeyB && (
            <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-600" />
                    <h3 className="font-bold text-sm text-slate-900">
                      Journey B
                    </h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    readinessB?.isFullyReady 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {readinessB?.scorePercent}% Ready
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-3">
                  <div className="font-bold text-slate-900 text-sm">
                    {journeyB.sourceStation?.name} ({journeyB.sourceStation?.code}) → {journeyB.destinationStation?.name} ({journeyB.destinationStation?.code})
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-2">
                    <span>Train #{journeyB.selectedTrainNumber}</span>
                    <span>·</span>
                    <span>Class: <strong className="text-slate-800">{journeyB.selectedClass}</strong></span>
                    <span>·</span>
                    <span>Date: {journeyB.journeyDate}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                  <div className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">
                    Readiness Checklist
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Train details & travel class configured</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{journeyB.selectedPassengerIds.length} passenger profile selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Booking preparation ready for window</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    const text = generateQuickCopyText(journeyB, passengers);
                    navigator.clipboard.writeText(text);
                    onShowToast('Journey B payload copied to clipboard!', 'success');
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Payload</span>
                </button>

                <button
                  onClick={() => onOpenPreflight(journeyB)}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Launch on IRCTC</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Middle Row: Master Passenger Roster & PNR Quick Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Passenger Profiles Widget */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Passenger Master List Profiles
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('passengers')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Manage All ({passengers.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {passengers.slice(0, 4).map(p => (
              <div 
                key={p.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
              >
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 truncate">{p.fullName}</div>
                  <div className="text-[11px] text-slate-500">
                    {p.age} yrs · {p.gender} · {p.berthPreference}
                  </div>
                </div>
                {p.seniorCitizenOpt && (
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md shrink-0">
                    Senior
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* PNR Quick Action Widget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TicketCheck className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                PNR Status Lookup
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              Look up confirmation statuses, coach berth allocations, and chart preparation states.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('pnr')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors"
          >
            <TicketCheck className="w-4 h-4" />
            <span>Check 10-Digit PNR Status</span>
          </button>
        </div>
      </div>

      {/* Quick Links to Official Railway Portals */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Official Indian Railways Digital Services
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {quickRailwayLinks.map(link => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 transition-all text-xs flex flex-col justify-between group"
            >
              <div>
                <div className="font-bold text-slate-900 group-hover:text-indigo-900 flex items-center justify-between">
                  <span>{link.name}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {link.desc}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
