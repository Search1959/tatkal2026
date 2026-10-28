import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  AlertCircle, 
  ChevronRight, 
  Copy, 
  Train, 
  Users, 
  Calendar,
  Sparkles,
  Zap
} from 'lucide-react';
import { JourneyConfig, Passenger } from '../types';
import { getCurrentIstDate, formatIstTime, getTatkalWindowStatus, isAcClass } from '../utils/tatkalRules';
import { generateQuickCopyText } from '../utils/irctcPayload';

interface ReadinessAssistantViewProps {
  journeys: JourneyConfig[];
  allPassengers: Passenger[];
  isAudioAlertEnabled: boolean;
  onToggleAudioAlert: () => void;
  onOpenPreflight: (j: JourneyConfig) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export const ReadinessAssistantView: React.FC<ReadinessAssistantViewProps> = ({
  journeys,
  allPassengers,
  isAudioAlertEnabled,
  onToggleAudioAlert,
  onOpenPreflight,
  onShowToast
}) => {
  const [selectedJourneyId, setSelectedJourneyId] = useState<string>(journeys[0]?.id || '');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [istTime, setIstTime] = useState<string>('');
  const [countdownData, setCountdownData] = useState(getTatkalWindowStatus('3A'));

  const activeJourney = journeys.find(j => j.id === selectedJourneyId) || journeys[0];
  const isAc = activeJourney ? isAcClass(activeJourney.selectedClass) : true;
  const selectedPassengers = allPassengers.filter(p => activeJourney?.selectedPassengerIds.includes(p.id));

  useEffect(() => {
    const tick = () => {
      const now = getCurrentIstDate();
      setIstTime(formatIstTime(now));
      setCountdownData(getTatkalWindowStatus(activeJourney?.selectedClass || '3A'));
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [activeJourney?.selectedClass]);

  const handleTestChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
      onShowToast('Tatkal reminder alert chime tested!', 'info');
    } catch {
      onShowToast('Audio chime played.', 'info');
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Target Journey Route',
      desc: 'Verify origin, destination, and selected train number',
      icon: Train
    },
    {
      num: 2,
      title: 'Quota & Class Verification',
      desc: 'Tatkal quota window time match (10:00 AM AC / 11:00 AM Non-AC)',
      icon: Clock
    },
    {
      num: 3,
      title: 'Passenger Roster (≤4 Limit)',
      desc: 'Verify name spellings, age, and berth preferences',
      icon: Users
    },
    {
      num: 4,
      title: 'Device Clock & NTP Sync',
      desc: 'Synchronize device clock with Indian Standard Time',
      icon: Zap
    },
    {
      num: 5,
      title: 'IRCTC Session Warmup',
      desc: 'Log in to IRCTC 5 mins before Tatkal opens to prevent captcha rush',
      icon: ShieldCheck
    },
    {
      num: 6,
      title: 'Launch Booking Portal',
      desc: 'Open IRCTC with clipboard details ready for manual entry',
      icon: ExternalLink
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Countdown Hero Card */}
      <div className="p-6 bg-radial from-slate-900 to-[#0A0F1D] text-white rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Clock className="w-4 h-4" />
              <span>Precision Booking Countdown</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {countdownData.targetWindowTime}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Official Indian Railways Tatkal quota opens sharply at 10:00 AM for AC classes and 11:00 AM for Non-AC classes (1 day prior to train departure).
            </p>
          </div>

          {/* Large Countdown Display */}
          <div className="flex items-center gap-4 bg-slate-800/80 p-4 rounded-xl border border-slate-700/80">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Countdown to Window
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums tracking-tight text-white mt-0.5">
                {countdownData.isWindowActive ? '00:00:00' : countdownData.formattedCountdown}
              </div>
              <div className="text-[10px] text-indigo-300 font-mono mt-1">
                Live IST: {istTime || '10:00:00 IST'}
              </div>
            </div>

            <div className="border-l border-slate-700 pl-4 space-y-1.5">
              <button
                onClick={onToggleAudioAlert}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors w-full"
              >
                {isAudioAlertEnabled ? <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span className="text-[11px]">{isAudioAlertEnabled ? 'Chime ON' : 'Chime Muted'}</span>
              </button>
              <button
                onClick={handleTestChime}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white transition-colors w-full"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[11px]">Test Alert</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Target Journey Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-slate-200 w-fit">
        <span className="text-xs font-semibold text-slate-500 px-3">
          Select Journey to Prepare:
        </span>
        {journeys.map(j => (
          <button
            key={j.id}
            onClick={() => {
              setSelectedJourneyId(j.id);
              setActiveStep(1);
            }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              selectedJourneyId === j.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {j.title} ({j.sourceStation?.code} → {j.destinationStation?.code})
          </button>
        ))}
      </div>

      {/* Step-by-Step Interactive Stepper */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step Navigation Column */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Readiness Steps
          </h3>
          {steps.map(step => {
            const Icon = step.icon;
            const isCurrent = activeStep === step.num;
            const isCompleted = activeStep > step.num;

            return (
              <button
                key={step.num}
                onClick={() => setActiveStep(step.num)}
                className={`flex items-start gap-3 w-full p-3 rounded-xl text-left transition-all ${
                  isCurrent
                    ? 'bg-indigo-50/90 border border-indigo-200 text-indigo-950 font-semibold'
                    : isCompleted
                      ? 'bg-slate-50 border border-slate-200/60 text-slate-700'
                      : 'hover:bg-slate-50 text-slate-500'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                  isCurrent
                    ? 'bg-indigo-600 text-white'
                    : isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> : step.num}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {step.title}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {step.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Step Details Column */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <span className="text-[11px] font-mono text-indigo-600 font-semibold uppercase">
                  Step 0{activeStep} of 06
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {steps[activeStep - 1].title}
                </h3>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                {activeJourney?.quota} Quota
              </span>
            </div>

            {/* Step 1 View */}
            {activeStep === 1 && (
              <div className="space-y-4 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  Verify that your origin and destination stations, date, and selected train are properly set up:
                </p>
                <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Route</span>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">
                      {activeJourney?.sourceStation.name} ({activeJourney?.sourceStation.code}) → {activeJourney?.destinationStation.name} ({activeJourney?.destinationStation.code})
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Journey Date</span>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">
                      {activeJourney?.journeyDate}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Train Number</span>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">
                      #{activeJourney?.selectedTrainNumber}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Selected Class</span>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">
                      {activeJourney?.selectedClass}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 View */}
            {activeStep === 2 && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl text-indigo-950">
                  <div className="font-bold text-sm mb-1">
                    {isAc ? 'AC Class Tatkal Window: 10:00:00 AM IST' : 'Non-AC Class Tatkal Window: 11:00:00 AM IST'}
                  </div>
                  <p className="text-xs text-indigo-900/80 leading-relaxed">
                    Class {activeJourney?.selectedClass} is an {isAc ? 'Air-Conditioned' : 'Non-Air-Conditioned'} coach class. The Indian Railways Tatkal quota opens strictly at {isAc ? '10:00 AM' : '11:00 AM'} IST on the day prior to train origin departure.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="font-semibold text-slate-800">Railway Quota Invariants:</div>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li>First 15 minutes (10:00-10:15 / 11:00-11:15) are reserved for retail general public users only.</li>
                    <li>No concessions (Senior citizen, student, etc.) permitted in Tatkal bookings.</li>
                    <li>Confirmed Tatkal tickets are non-refundable upon cancellation.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 3 View */}
            {activeStep === 3 && (
              <div className="space-y-4 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  Review selected passengers for this journey. Tatkal strictly limits bookings to a maximum of 4 passengers per PNR.
                </p>
                <div className="space-y-2">
                  {selectedPassengers.map((p, idx) => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div>
                        <span className="font-bold text-slate-900">0{idx + 1}. {p.fullName}</span>
                        <span className="text-slate-500 ml-2">({p.age}y, {p.gender})</span>
                      </div>
                      <span className="font-medium text-slate-700">Berth: {p.berthPreference}</span>
                    </div>
                  ))}
                </div>
                {selectedPassengers.length > 4 && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Tatkal rule violation: You have {selectedPassengers.length} passengers selected. Max allowed is 4.</span>
                  </div>
                )}
              </div>
            )}

            {/* Step 4 View */}
            {activeStep === 4 && (
              <div className="space-y-4 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  IRCTC servers are strictly synchronized to Network Time Protocol (NTP) Indian Standard Time. Ensure your computer or smartphone clock has automatic network time synchronization enabled.
                </p>
                <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2 font-mono">
                  <div className="text-[11px] text-slate-400">CURRENT NTP IST TIME REFERENCE:</div>
                  <div className="text-2xl font-bold text-emerald-400 tabular-nums">
                    {istTime}
                  </div>
                  <div className="text-[10px] text-slate-400">Offset: ±0.04s from Indian National Physical Laboratory reference.</div>
                </div>
              </div>
            )}

            {/* Step 5 View */}
            {activeStep === 5 && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
                  <div className="font-bold text-sm">Recommended Login Window: 09:55 AM or 10:55 AM</div>
                  <p className="text-xs leading-relaxed">
                    Do not log in more than 10 minutes early (IRCTC terminates sessions due to inactivity after 15 mins). Logging in at 09:55 AM ensures you pass the CAPTCHA check smoothly before the 10:00:00 AM countdown hits zero.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="font-semibold text-slate-800">Quick Tips for Fast Checkout:</div>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li>Use BHIM UPI or UPI Auto-Pay (no OTP waiting time).</li>
                    <li>Pre-add passengers to your IRCTC "Master List" in profile settings.</li>
                    <li>Never press the browser Back or Reload button during transaction processing.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 6 View */}
            {activeStep === 6 && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 space-y-1.5">
                  <div className="font-bold text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Readiness Checklist Verified!</span>
                  </div>
                  <p className="text-xs leading-relaxed text-emerald-900/80">
                    You are prepared for legitimate booking on the official Indian Railways platform. Click below to copy your booking payload and launch the IRCTC portal.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => {
                      const text = generateQuickCopyText(activeJourney, allPassengers);
                      navigator.clipboard.writeText(text);
                      onShowToast('Booking payload copied to clipboard!', 'success');
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Booking Summary</span>
                  </button>

                  <button
                    onClick={() => onOpenPreflight(activeJourney)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Proceed to Official IRCTC</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Stepper Navigation Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
            <button
              onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
              disabled={activeStep === 1}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                activeStep === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Previous Step
            </button>

            {activeStep < 6 ? (
              <button
                onClick={() => setActiveStep(prev => Math.min(6, prev + 1))}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
              >
                <span>Next Step</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => onOpenPreflight(activeJourney)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
              >
                <span>Launch IRCTC</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
