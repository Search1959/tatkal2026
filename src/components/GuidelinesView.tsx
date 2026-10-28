import React from 'react';
import { 
  BookOpen, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  CheckCircle2, 
  ExternalLink,
  Ban
} from 'lucide-react';

export const GuidelinesView: React.FC = () => {
  const faqs = [
    {
      q: 'What time does Tatkal booking open?',
      a: 'Tatkal booking opens precisely at 10:00:00 AM IST for all Air-Conditioned (AC) classes (1A, 2A, 3A, 3E, CC, EC), and at 11:00:00 AM IST for Non-AC classes (Sleeper SL, Second Sitting 2S), exactly one day prior to the scheduled departure of the train from its originating station.'
    },
    {
      q: 'How many passengers can be booked on a single Tatkal ticket?',
      a: 'Indian Railways strictly restricts Tatkal bookings to a maximum of 4 passengers per PNR (in contrast to General quota where up to 6 passengers are permitted).'
    },
    {
      q: 'What is the Agent Embargo window?',
      a: 'To safeguard genuine general public rail travelers, authorized ticketing agents (travel agents, web portals) are legally blocked from accessing Tatkal quota between 10:00 AM - 10:15 AM (for AC) and 11:00 AM - 11:15 AM (for Non-AC).'
    },
    {
      q: 'Can I get a refund if I cancel a confirmed Tatkal ticket?',
      a: 'No. As per official Indian Railways refund rules, NO REFUND is granted on the cancellation of confirmed Tatkal tickets, except under rare circumstances such as train cancellation by railways or train running over 3 hours late.'
    },
    {
      q: 'Are senior citizen concessions allowed in Tatkal?',
      a: 'No. No concession of any type (senior citizen, student, disability) is permissible in Tatkal or Premium Tatkal quota tickets.'
    },
    {
      q: 'Does Tatkal Assist Pro book the ticket automatically or bypass CAPTCHA?',
      a: 'No. Tatkal Assist Pro is an ethical preparation companion. It never bypasses CAPTCHA, EVADE QUEUES, or simulates unauthorized browser botting. You manually review, solve legitimate security challenges, and authorize payment on the official IRCTC portal.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Official Indian Railways Tatkal Regulations
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive guidelines, timetable rules, and ethical compliance standards.
            </p>
          </div>
        </div>
      </div>

      {/* Primary Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rule 1: Booking Timings */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Tatkal Opening Schedule</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            Strict Timings by Travel Class
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Booking opens 1 day before journey date from origin station:
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-100 text-indigo-950 text-xs">
              <div className="font-bold text-indigo-900">10:00:00 AM IST</div>
              <div className="text-[11px] text-indigo-700 mt-0.5">AC Classes (2A, 3A, 3E, CC, EC)</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-100 text-amber-950 text-xs">
              <div className="font-bold text-amber-900">11:00:00 AM IST</div>
              <div className="text-[11px] text-amber-700 mt-0.5">Non-AC Classes (Sleeper, 2S)</div>
            </div>
          </div>
        </div>

        {/* Rule 2: Booking Limits */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Passenger Roster Invariants</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            4 Passenger Ceiling per PNR
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            In Tatkal bookings, Indian Railways caps passengers at 4 per reservation. At least one passenger must carry an original government-approved photo ID (Aadhaar, Passport, PAN, Voter ID, or DL) during travel.
          </p>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium">
            Tip: Pre-fill passenger details in your IRCTC Master Passenger List beforehand.
          </div>
        </div>

        {/* Rule 3: Cancellation Policy */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Refund & Cancellation</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            Zero Refund on Confirmed Tatkal
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Once a Tatkal ticket is confirmed, no refund is granted upon cancellation by the passenger. Waitlisted Tatkal tickets are refunded automatically after chart preparation deducting standard clerkage charges (~₹60).
          </p>
        </div>

        {/* Rule 4: Ethical Assistance */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
            <Ban className="w-4 h-4" />
            <span>No Automated Exploits</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            Legitimate Booking Assistance
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Tatkal Assist Pro strictly complies with railway digital integrity rules. It does not tamper with IRCTC APIs, evade waiting rooms, automate payment OTPs, or bypass security checks.
          </p>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-600" />
          <span>Frequently Asked Questions</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
              <div className="font-bold text-slate-900 text-xs">
                {faq.q}
              </div>
              <p className="text-slate-600 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
