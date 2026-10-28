/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveTab, JourneyConfig, Passenger } from './types';
import { INITIAL_JOURNEYS, INITIAL_PASSENGERS } from './data/mockRailwayData';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardView } from './components/DashboardView';
import { WorkspaceView } from './components/WorkspaceView';
import { PassengersView } from './components/PassengersView';
import { ReadinessAssistantView } from './components/ReadinessAssistantView';
import { TrainsView } from './components/TrainsView';
import { PnrView } from './components/PnrView';
import { GuidelinesView } from './components/GuidelinesView';
import { SettingsView } from './components/SettingsView';
import { AdminConsoleView } from './components/AdminConsoleView';
import { PassengerModal } from './components/PassengerModal';
import { PreFlightModal } from './components/PreFlightModal';
import { CreateUserModal } from './components/CreateUserModal';
import { LoginModal } from './components/LoginModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Menu } from 'lucide-react';

function TatkalAppContent() {
  const { currentUser, isAdmin, createNewUser } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [isAudioAlertEnabled, setIsAudioAlertEnabled] = useState(true);

  // Persistent state with LocalStorage fallback
  const [journeys, setJourneys] = useState<JourneyConfig[]>(() => {
    try {
      const saved = localStorage.getItem('tatkal_assist_journeys');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_JOURNEYS;
  });

  const [passengers, setPassengers] = useState<Passenger[]>(() => {
    try {
      const saved = localStorage.getItem('tatkal_assist_passengers');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_PASSENGERS;
  });

  // Modals state
  const [isPassengerModalOpen, setIsPassengerModalOpen] = useState(false);
  const [editingPassenger, setEditingPassenger] = useState<Passenger | null>(null);

  const [isPreFlightModalOpen, setIsPreFlightModalOpen] = useState(false);
  const [preFlightJourney, setPreFlightJourney] = useState<JourneyConfig | null>(null);

  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('tatkal_assist_journeys', JSON.stringify(journeys));
    } catch {
      // ignore
    }
  }, [journeys]);

  useEffect(() => {
    try {
      localStorage.setItem('tatkal_assist_passengers', JSON.stringify(passengers));
    } catch {
      // ignore
    }
  }, [passengers]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Handlers for Journeys
  const handleUpdateJourney = (index: number, updated: JourneyConfig) => {
    setJourneys(prev => {
      const copy = [...prev];
      copy[index] = updated;
      return copy;
    });
  };

  // Handlers for Passengers
  const handleSavePassenger = (passenger: Passenger) => {
    setPassengers(prev => {
      const existingIdx = prev.findIndex(p => p.id === passenger.id);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = passenger;
        showToast(`Updated profile for ${passenger.fullName}`, 'success');
        return copy;
      } else {
        showToast(`Added ${passenger.fullName} to Master List`, 'success');
        return [...prev, passenger];
      }
    });
  };

  const handleDeletePassenger = (id: string) => {
    setPassengers(prev => prev.filter(p => p.id !== id));
    setJourneys(prev => prev.map(j => ({
      ...j,
      selectedPassengerIds: j.selectedPassengerIds.filter(pid => pid !== id)
    })));
    showToast('Passenger profile removed.', 'info');
  };

  const handleImportPassengers = (imported: Passenger[]) => {
    setPassengers(imported);
    showToast(`Loaded ${imported.length} passenger profiles.`, 'success');
  };

  const handleResetToDefaults = () => {
    setJourneys(INITIAL_JOURNEYS);
    setPassengers(INITIAL_PASSENGERS);
    try {
      localStorage.removeItem('tatkal_assist_journeys');
      localStorage.removeItem('tatkal_assist_passengers');
    } catch {
      // ignore
    }
  };

  const handleOpenPreflight = (journey: JourneyConfig) => {
    setPreFlightJourney(journey);
    setIsPreFlightModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={tab => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        savedJourneysCount={journeys.length}
        passengerProfilesCount={passengers.length}
        isOpenMobile={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0b1329] text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-bold text-sm tracking-tight">Tatkal Assist Pro</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold"
            >
              {currentUser?.role.toUpperCase() || 'LOGIN'}
            </button>
          </div>
        </div>

        {/* Desktop Sticky Header */}
        <TopHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isAudioAlertEnabled={isAudioAlertEnabled}
          onToggleAudioAlert={() => {
            setIsAudioAlertEnabled(!isAudioAlertEnabled);
            showToast(isAudioAlertEnabled ? 'Audio alerts muted' : 'Audio alerts enabled', 'info');
          }}
          isDemoMode={isDemoMode}
          onToggleDemoMode={() => {
            setIsDemoMode(!isDemoMode);
            showToast(!isDemoMode ? 'Demo mode enabled' : 'Live-ready mode enabled', 'info');
          }}
          onOpenIrctcModal={() => {
            if (journeys.length > 0) {
              handleOpenPreflight(journeys[0]);
            }
          }}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onOpenCreateUserModal={() => setIsCreateUserModalOpen(true)}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              journeys={journeys}
              passengers={passengers}
              onNavigateTab={setActiveTab}
              onOpenPreflight={handleOpenPreflight}
              onOpenPassengerModal={() => {
                setEditingPassenger(null);
                setIsPassengerModalOpen(true);
              }}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'workspace' && (
            <WorkspaceView
              journeys={journeys}
              allPassengers={passengers}
              onUpdateJourney={handleUpdateJourney}
              onOpenPreflight={handleOpenPreflight}
              onOpenPassengerModal={() => {
                setEditingPassenger(null);
                setIsPassengerModalOpen(true);
              }}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'passengers' && (
            <PassengersView
              passengers={passengers}
              onOpenAddModal={() => {
                setEditingPassenger(null);
                setIsPassengerModalOpen(true);
              }}
              onOpenEditModal={p => {
                setEditingPassenger(p);
                setIsPassengerModalOpen(true);
              }}
              onDeletePassenger={handleDeletePassenger}
              onImportPassengers={handleImportPassengers}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'readiness' && (
            <ReadinessAssistantView
              journeys={journeys}
              allPassengers={passengers}
              isAudioAlertEnabled={isAudioAlertEnabled}
              onToggleAudioAlert={() => {
                setIsAudioAlertEnabled(!isAudioAlertEnabled);
                showToast(isAudioAlertEnabled ? 'Audio alerts muted' : 'Audio alerts enabled', 'info');
              }}
              onOpenPreflight={handleOpenPreflight}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'admin' && (
            <AdminConsoleView
              onOpenCreateUserModal={() => setIsCreateUserModalOpen(true)}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'trains' && <TrainsView />}

          {activeTab === 'pnr' && <PnrView onShowToast={showToast} />}

          {activeTab === 'guidelines' && <GuidelinesView />}

          {activeTab === 'settings' && (
            <SettingsView
              isDemoMode={isDemoMode}
              onToggleDemoMode={() => {
                setIsDemoMode(!isDemoMode);
                showToast(!isDemoMode ? 'Demo mode enabled' : 'Live-ready mode enabled', 'info');
              }}
              isAudioAlertEnabled={isAudioAlertEnabled}
              onToggleAudioAlert={() => {
                setIsAudioAlertEnabled(!isAudioAlertEnabled);
                showToast(isAudioAlertEnabled ? 'Audio alerts muted' : 'Audio alerts enabled', 'info');
              }}
              onResetToDefaults={handleResetToDefaults}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <PassengerModal
        isOpen={isPassengerModalOpen}
        onClose={() => {
          setIsPassengerModalOpen(false);
          setEditingPassenger(null);
        }}
        onSavePassenger={handleSavePassenger}
        editingPassenger={editingPassenger}
      />

      <PreFlightModal
        isOpen={isPreFlightModalOpen}
        onClose={() => setIsPreFlightModalOpen(false)}
        journey={preFlightJourney}
        allPassengers={passengers}
        onShowToast={showToast}
      />

      <CreateUserModal
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
        onSubmit={createNewUser}
        onShowToast={showToast}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onShowToast={showToast}
      />

      {/* Floating Action Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TatkalAppContent />
    </AuthProvider>
  );
}
