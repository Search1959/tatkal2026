import React, { useState } from 'react';
import { 
  ArrowRightLeft, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  ExternalLink, 
  UserPlus, 
  Code2, 
  Save, 
  Info,
  Clock,
  Check
} from 'lucide-react';
import { JourneyConfig, Station, Passenger, TravelClass, QuotaType } from '../types';
import { STATIONS, TRAINS, getTomorrowDateString } from '../data/mockRailwayData';
import { evaluateJourneyReadiness, isAcClass } from '../utils/tatkalRules';
import { generateQuickCopyText, generateIrctcConsoleHelper } from '../utils/irctcPayload';

interface JourneyPanelProps {
  journey: JourneyConfig;
  allPassengers: Passenger[];
  onUpdateJourney: (updated: JourneyConfig) => void;
  onOpenPreflight: (journey: JourneyConfig) => void;
  onOpenPassengerModal: () => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  panelLabel?: string;
}

const QUOTA_OPTIONS: { id: QuotaType; label: string; desc: string }[] = [
  { id: 'TATKAL', label: 'Tatkal (CK)', desc: 'Opens 1 day prior (10 AM AC / 11 AM Non-AC)' },
  { id: 'GENERAL', label: 'General (GN)', desc: 'Standard advance booking up to 120 days' },
  { id: 'PREMIUM_TATKAL', label: 'Premium Tatkal (PT)', desc: 'Dynamic pricing quota on select trains' },
  { id: 'LADIES', label: 'Ladies (LD)', desc: 'Dedicated coaches / berths for solo women & children' },
  { id: 'SENIOR_CITIZEN', label: 'Lower Berth (SS)', desc: 'Senior Citizen lower berth quota (General only)' }
];

const AVAILABLE_CLASSES: TravelClass[] = ['1A', '2A', '3A', '3E', 'SL', 'CC', 'EC'];

export const JourneyPanel: React.FC<JourneyPanelProps> = ({
  journey,
  allPassengers,
  onUpdateJourney,
  onOpenPreflight,
  onOpenPassengerModal,
  onShowToast,
  panelLabel
}) => {
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [showConsoleSnippet, setShowConsoleSnippet] = useState(false);

  // Compute live readiness
  const readiness = evaluateJourneyReadiness(journey, allPassengers);

  // Find trains for this route
  const matchingTrains = TRAINS.filter(
    t => t.fromStationCode === journey.sourceStation?.code && t.toStationCode === journey.destinationStation?.code
  );
  const displayTrains = matchingTrains.length > 0 ? matchingTrains : TRAINS.slice(0, 5);

  const selectedTrainObj = TRAINS.find(t => t.number === journey.selectedTrainNumber) || displayTrains[0];

  const handleSwapStations = () => {
    if (!journey.sourceStation || !journey.destinationStation) return;
    onUpdateJourney({
      ...journey,
      sourceStation: journey.destinationStation,
      destinationStation: journey.sourceStation,
      lastUpdated: 'Just now'
    });
    onShowToast(`Swapped route: ${journey.destinationStation.code} → ${journey.sourceStation.code}`, 'info');
  };

  const handleDateSelect = (dateStr: string) => {
    onUpdateJourney({
      ...journey,
      journeyDate: dateStr,
      lastUpdated: 'Just now'
    });
  };

  const handleTogglePassenger = (passengerId: string) => {
    const isAlreadySelected = journey.selectedPassengerIds.includes(passengerId);
    let newIds = [...journey.selectedPassengerIds];

    if (isAlreadySelected) {
      newIds = newIds.filter(id => id !== passengerId);
    } else {
      // Check Tatkal quota max 4 limit
      if (journey.quota === 'TATKAL' || journey.quota === 'PREMIUM_TATKAL') {
        if (newIds.length >= 4) {
          onShowToast('Tatkal quota allows maximum 4 passengers per PNR.', 'warning');
          return;
        }
      } else if (newIds.length >= 6) {
        onShowToast('General quota allows maximum 6 passengers per PNR.', 'warning');
        return;
      }
      newIds.push(passengerId);
    }

    onUpdateJourney({
      ...journey,
      selectedPassengerIds: newIds,
      lastUpdated: 'Just now'
    });
  };

  const handleCopySummary = () => {
    const text = generateQuickCopyText(journey, allPassengers);
    navigator.clipboard.writeText(text);
    setCopiedPayload(true);
    onShowToast('Booking payload copied to clipboard!', 'success');
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const isAc = isAcClass(journey.selectedClass);

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all hover:border-slate-300">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50/90 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
          <h3 className="font-bold text-slate-900 text-sm tracking-tight">
            {panelLabel || journey.title}
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {journey.sourceStation?.code} → {journey.destinationStation?.code}
          </span>
        </div>

        {/* Readiness Badge */}
        <div className="flex items-center gap-2">
          <span 
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              readiness.isFullyReady 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            {readiness.isFullyReady ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            )}
            <span>{readiness.scorePercent}% Ready</span>
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Origin and Destination Stations */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Railway Route
          </label>
          <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
            {/* From Station */}
            <div>
              <div className="text-[10px] text-slate-500 font-medium mb-1">From Station</div>
              <select
                aria-label="From Station"
                value={journey.sourceStation?.code || ''}
                onChange={e => {
                  const st = STATIONS.find(s => s.code === e.target.value);
                  if (st) {
                    onUpdateJourney({
                      ...journey,
                      sourceStation: st,
                      lastUpdated: 'Just now'
                    });
                  }
                }}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                {STATIONS.map(s => (
                  <option key={`from-${s.code}`} value={s.code}>
                    {s.code} - {s.name} ({s.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <button
              onClick={handleSwapStations}
              title="Swap From and To stations"
              className="mt-4 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors border border-slate-200"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>

            {/* To Station */}
            <div>
              <div className="text-[10px] text-slate-500 font-medium mb-1">To Station</div>
              <select
                aria-label="To Station"
                value={journey.destinationStation?.code || ''}
                onChange={e => {
                  const st = STATIONS.find(s => s.code === e.target.value);
                  if (st) {
                    onUpdateJourney({
                      ...journey,
                      destinationStation: st,
                      lastUpdated: 'Just now'
                    });
                  }
                }}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                {STATIONS.map(s => (
                  <option key={`to-${s.code}`} value={s.code}>
                    {s.code} - {s.name} ({s.city})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Date Selector with Tatkal target shortcuts */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              Journey Date
            </label>
            <span className="text-[11px] text-indigo-700 font-medium">
              Tatkal target: Day before journey
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 items-center">
            <input
              type="date"
              aria-label="Target Journey Date"
              value={journey.journeyDate}
              onChange={e => handleDateSelect(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            {/* Quick date shortcuts */}
            <button
              onClick={() => handleDateSelect(getTomorrowDateString(0))}
              className={`px-2.5 py-1 text-xs rounded-md border font-medium transition-colors ${
                journey.journeyDate === getTomorrowDateString(0)
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => handleDateSelect(getTomorrowDateString(1))}
              className={`px-2.5 py-1 text-xs rounded-md border font-medium transition-colors ${
                journey.journeyDate === getTomorrowDateString(1)
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 font-semibold'
              }`}
            >
              Tomorrow (Tatkal Target)
            </button>
            <button
              onClick={() => handleDateSelect(getTomorrowDateString(2))}
              className={`px-2.5 py-1 text-xs rounded-md border font-medium transition-colors ${
                journey.journeyDate === getTomorrowDateString(2)
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              +2 Days
            </button>
          </div>
        </div>

        {/* Quota & Train Selector Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Quota */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Quota
            </label>
            <select
              aria-label="Booking Quota"
              value={journey.quota}
              onChange={e => {
                const newQuota = e.target.value as QuotaType;
                let newPassengerIds = [...journey.selectedPassengerIds];
                // enforce 4 passenger max if switching to Tatkal
                if ((newQuota === 'TATKAL' || newQuota === 'PREMIUM_TATKAL') && newPassengerIds.length > 4) {
                  newPassengerIds = newPassengerIds.slice(0, 4);
                  onShowToast('Passenger list trimmed to 4 (Tatkal maximum rule).', 'info');
                }
                onUpdateJourney({
                  ...journey,
                  quota: newQuota,
                  selectedPassengerIds: newPassengerIds,
                  lastUpdated: 'Just now'
                });
              }}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {QUOTA_OPTIONS.map(q => (
                <option key={q.id} value={q.id}>
                  {q.label}
                </option>
              ))}
            </select>
          </div>

          {/* Train */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Train Number & Name
            </label>
            <select
              aria-label="Select Train"
              value={journey.selectedTrainNumber}
              onChange={e => {
                onUpdateJourney({
                  ...journey,
                  selectedTrainNumber: e.target.value,
                  lastUpdated: 'Just now'
                });
              }}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {displayTrains.map(t => (
                <option key={t.number} value={t.number}>
                  {t.number} - {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Travel Class Selector */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              Travel Class & Booking Window
            </label>
            <div className="flex items-center gap-1.5 text-[11px] font-mono">
              <Clock className="w-3 h-3 text-indigo-600" />
              <span className={isAc ? 'text-indigo-700 font-semibold' : 'text-amber-700 font-semibold'}>
                {isAc ? 'AC: Opens 10:00 AM IST' : 'Non-AC: Opens 11:00 AM IST'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {AVAILABLE_CLASSES.map(cls => {
              const isSelected = journey.selectedClass === cls;
              const isClassAc = isAcClass(cls);
              return (
                <button
                  key={cls}
                  onClick={() => {
                    onUpdateJourney({
                      ...journey,
                      selectedClass: cls,
                      lastUpdated: 'Just now'
                    });
                  }}
                  className={`py-1.5 text-xs font-semibold rounded-lg border text-center transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : isClassAc
                        ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        : 'bg-amber-50/60 text-amber-900 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <div>{cls}</div>
                  <div className="text-[9px] font-normal text-slate-400">
                    {isClassAc ? '10 AM' : '11 AM'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Passenger Profile Selection */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                Select Passengers ({journey.selectedPassengerIds.length}/
                {journey.quota === 'TATKAL' || journey.quota === 'PREMIUM_TATKAL' ? '4 max' : '6 max'})
              </label>
            </div>
            <button
              onClick={onOpenPassengerModal}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
            >
              <UserPlus className="w-3 h-3" />
              <span>Manage Master List</span>
            </button>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {allPassengers.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-slate-200">
                No passengers in master list. Add a passenger to continue.
              </div>
            ) : (
              allPassengers.map(p => {
                const isChecked = journey.selectedPassengerIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => handleTogglePassenger(p.id)}
                    className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950 font-medium'
                        : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                        isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="truncate">
                        <span className="font-semibold">{p.fullName}</span>
                        <span className="text-slate-500 ml-1.5">
                          ({p.age}y · {p.gender[0]} · {p.berthPreference})
                        </span>
                      </div>
                    </div>
                    {p.seniorCitizenOpt && (
                      <span className="text-[10px] text-amber-700 font-medium shrink-0 ml-1">
                        Sr. Citizen
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Readiness Checklist Summary Strip */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
          <div className="flex items-center justify-between font-semibold text-slate-800">
            <span>Readiness Checklist</span>
            <span className="font-mono text-[11px] text-slate-500">
              {readiness.checks.filter(c => c.isPassed).length} of {readiness.checks.length} items validated
            </span>
          </div>
          <div className="space-y-1">
            {readiness.checks.slice(0, 3).map(check => (
              <div key={check.id} className="flex items-center gap-2 text-[11px]">
                {check.isPassed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                )}
                <span className={`truncate ${check.isPassed ? 'text-slate-600' : 'text-amber-800 font-medium'}`}>
                  {check.title}: {check.description}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Console Helper Snippet Toggle (Optional legitimate autofill helper) */}
        {showConsoleSnippet && (
          <div className="p-3 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold text-white">IRCTC Console Helper Script</span>
              <button 
                onClick={() => setShowConsoleSnippet(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Legitimate copy helper to paste passenger roster onto IRCTC without typing manually. Does NOT bypass CAPTCHA or payment.
            </p>
            <pre className="p-2 bg-slate-950 rounded-lg text-[10px] overflow-x-auto text-indigo-300">
              {generateIrctcConsoleHelper(journey, allPassengers)}
            </pre>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="pt-2 space-y-2">
          {/* Main Launch Official IRCTC */}
          <button
            onClick={() => onOpenPreflight(journey)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] rounded-xl shadow-xs transition-all"
          >
            <span>Continue to Official IRCTC Booking</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {/* Secondary Utilities: Copy Payload & Helper */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopySummary}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg border border-slate-200 transition-colors"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>{copiedPayload ? 'Copied Details!' : 'Copy Summary'}</span>
            </button>
            <button
              onClick={() => setShowConsoleSnippet(!showConsoleSnippet)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg border border-slate-200 transition-colors"
            >
              <Code2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{showConsoleSnippet ? 'Hide Helper' : 'Autofill Script'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
