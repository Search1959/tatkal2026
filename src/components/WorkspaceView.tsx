import React, { useState } from 'react';
import { 
  SplitSquareVertical, 
  RotateCcw, 
  Plus, 
  Save, 
  Copy, 
  ArrowRightLeft, 
  CheckCircle2, 
  Info,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import { JourneyConfig, Passenger } from '../types';
import { JourneyPanel } from './JourneyPanel';

interface WorkspaceViewProps {
  journeys: JourneyConfig[];
  allPassengers: Passenger[];
  onUpdateJourney: (index: number, updated: JourneyConfig) => void;
  onOpenPreflight: (journey: JourneyConfig) => void;
  onOpenPassengerModal: () => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  journeys,
  allPassengers,
  onUpdateJourney,
  onOpenPreflight,
  onOpenPassengerModal,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'both' | 'journey-a' | 'journey-b'>('both');

  const journeyA = journeys[0];
  const journeyB = journeys[1];

  const handleCopyConfigAtoB = () => {
    if (!journeyA || !journeyB) return;
    onUpdateJourney(1, {
      ...journeyB,
      sourceStation: journeyA.sourceStation,
      destinationStation: journeyA.destinationStation,
      journeyDate: journeyA.journeyDate,
      quota: journeyA.quota,
      selectedClass: journeyA.selectedClass,
      selectedPassengerIds: [...journeyA.selectedPassengerIds],
      lastUpdated: 'Synced from Journey A'
    });
    onShowToast('Synced configuration from Journey A to Journey B!', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <SplitSquareVertical className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Multi-Journey Workspace
              </h2>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                Dual Panels
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Side-by-side independent booking workspaces. Prepare two alternative routes simultaneously.
            </p>
          </div>
        </div>

        {/* View Toggle on Smaller Screens / Utility Buttons */}
        <div className="flex items-center gap-2">
          {/* Quick Sync Journey A -> B */}
          <button
            onClick={handleCopyConfigAtoB}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors"
            title="Duplicate Journey A parameters to Journey B"
          >
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>Sync A → B</span>
          </button>

          {/* Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab('both')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeTab === 'both' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dual Split
            </button>
            <button
              onClick={() => setActiveTab('journey-a')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeTab === 'journey-a' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Journey A
            </button>
            <button
              onClick={() => setActiveTab('journey-b')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeTab === 'journey-b' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Journey B
            </button>
          </div>
        </div>
      </div>

      {/* Info notice about dual panels */}
      <div className="p-3.5 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl flex items-center justify-between text-xs text-indigo-950">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            <strong>Pro-Tip: </strong> Prepare an alternative secondary train (e.g. Rajdhani in Journey A and Vande Bharat / Superfast in Journey B) so you can switch instantly if Tatkal waitlists surge.
          </span>
        </div>
      </div>

      {/* Side-by-Side Dual Panels on Desktop */}
      <div className={`grid gap-6 ${
        activeTab === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-2xl mx-auto'
      }`}>
        {(activeTab === 'both' || activeTab === 'journey-a') && journeyA && (
          <JourneyPanel
            panelLabel="Journey A Workspace"
            journey={journeyA}
            allPassengers={allPassengers}
            onUpdateJourney={updated => onUpdateJourney(0, updated)}
            onOpenPreflight={onOpenPreflight}
            onOpenPassengerModal={onOpenPassengerModal}
            onShowToast={onShowToast}
          />
        )}

        {(activeTab === 'both' || activeTab === 'journey-b') && journeyB && (
          <JourneyPanel
            panelLabel="Journey B Workspace"
            journey={journeyB}
            allPassengers={allPassengers}
            onUpdateJourney={updated => onUpdateJourney(1, updated)}
            onOpenPreflight={onOpenPreflight}
            onOpenPassengerModal={onOpenPassengerModal}
            onShowToast={onShowToast}
          />
        )}
      </div>
    </div>
  );
};
