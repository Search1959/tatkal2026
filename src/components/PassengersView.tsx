import React, { useState } from 'react';
import { 
  UserPlus, 
  Search, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  Download, 
  Upload, 
  Users, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { Passenger } from '../types';

interface PassengersViewProps {
  passengers: Passenger[];
  onOpenAddModal: () => void;
  onOpenEditModal: (p: Passenger) => void;
  onDeletePassenger: (id: string) => void;
  onImportPassengers: (imported: Passenger[]) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export const PassengersView: React.FC<PassengersViewProps> = ({
  passengers,
  onOpenAddModal,
  onOpenEditModal,
  onDeletePassenger,
  onImportPassengers,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = passengers.filter(p =>
    p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.berthPreference.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.idCardType?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(passengers, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'tatkal_assist_passengers.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast('Passenger profiles exported as JSON.', 'success');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          onImportPassengers(imported);
          onShowToast(`Successfully imported ${imported.length} passenger profiles.`, 'success');
        } else {
          onShowToast('Invalid JSON file format.', 'warning');
        }
      } catch {
        onShowToast('Error reading passenger JSON file.', 'warning');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Passenger Master List
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Pre-saved passenger profiles allow you to populate booking details in 1-click when high-speed Tatkal windows open.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <label className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import</span>
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              onChange={handleImportJson} 
            />
          </label>
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] rounded-xl shadow-xs transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Passenger</span>
          </button>
        </div>
      </div>

      {/* Privacy Guarantee Card */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-950">
          <span className="font-bold text-emerald-900">Zero-Credential Storage Policy: </span>
          We never ask for or store your IRCTC account passwords, net banking credentials, or OTP codes. All profile data stays on your local device.
        </div>
      </div>

      {/* Search and Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by passenger name, berth preference..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-900">{filtered.length}</strong> of {passengers.length} profiles
          </div>
        </div>

        {/* Profiles Table */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="font-semibold text-slate-700 text-sm">No passenger profiles found</div>
            <p className="text-xs text-slate-400">
              {searchQuery ? 'Try matching another name or clear your search query.' : 'Add your first passenger profile to speed up Tatkal preparation.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Passenger Name</th>
                  <th className="px-4 py-3">Age / Gender</th>
                  <th className="px-4 py-3">Berth Preference</th>
                  <th className="px-4 py-3">Food Preference</th>
                  <th className="px-4 py-3">Govt ID Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {p.fullName[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">
                            {p.fullName}
                          </div>
                          {p.seniorCitizenOpt && (
                            <span className="text-[10px] text-amber-700 font-semibold">
                              Senior Citizen (60+)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">
                      <span className="font-mono tabular-nums">{p.age}</span> yrs · {p.gender}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {p.berthPreference}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">
                      {p.foodPreference}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {p.idCardType ? (
                        <span className="flex items-center gap-1.5 text-emerald-700 font-medium text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{p.idCardType}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">Not recorded</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onOpenEditModal(p)}
                          title="Edit profile"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeletePassenger(p.id)}
                          title="Delete profile"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
