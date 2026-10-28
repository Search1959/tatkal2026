import React, { useState, useEffect } from 'react';
import { X, User, Shield, AlertCircle } from 'lucide-react';
import { Passenger, BerthPreference, FoodPreference } from '../types';

interface PassengerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePassenger: (passenger: Passenger) => void;
  editingPassenger: Passenger | null;
}

const BERTH_OPTIONS: BerthPreference[] = [
  'No Preference',
  'Lower Berth',
  'Middle Berth',
  'Upper Berth',
  'Side Lower',
  'Side Upper',
  'Window Seat'
];

const FOOD_OPTIONS: FoodPreference[] = ['Veg', 'Non-Veg', 'No Food'];

export const PassengerModal: React.FC<PassengerModalProps> = ({
  isOpen,
  onClose,
  onSavePassenger,
  editingPassenger
}) => {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number | ''>(30);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Transgender'>('Male');
  const [berthPreference, setBerthPreference] = useState<BerthPreference>('No Preference');
  const [foodPreference, setFoodPreference] = useState<FoodPreference>('Veg');
  const [seniorCitizenOpt, setSeniorCitizenOpt] = useState(false);
  const [idCardType, setIdCardType] = useState<Passenger['idCardType']>('Aadhaar');
  const [idCardNumberMasked, setIdCardNumberMasked] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingPassenger) {
      setFullName(editingPassenger.fullName);
      setAge(editingPassenger.age);
      setGender(editingPassenger.gender);
      setBerthPreference(editingPassenger.berthPreference);
      setFoodPreference(editingPassenger.foodPreference);
      setSeniorCitizenOpt(editingPassenger.seniorCitizenOpt);
      setIdCardType(editingPassenger.idCardType || 'Aadhaar');
      setIdCardNumberMasked(editingPassenger.idCardNumberMasked || '');
      setConsentGiven(true);
    } else {
      setFullName('');
      setAge(30);
      setGender('Male');
      setBerthPreference('Lower Berth');
      setFoodPreference('Veg');
      setSeniorCitizenOpt(false);
      setIdCardType('Aadhaar');
      setIdCardNumberMasked('');
      setConsentGiven(false);
    }
    setErrorMsg('');
  }, [editingPassenger, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 3) {
      setErrorMsg('Full name must be at least 3 characters as per railway rules.');
      return;
    }
    if (typeof age !== 'number' || age < 1 || age > 125) {
      setErrorMsg('Please specify a valid passenger age between 1 and 125.');
      return;
    }
    if (!consentGiven) {
      setErrorMsg('Please confirm your consent to save this profile locally on your device.');
      return;
    }

    const passengerToSave: Passenger = {
      id: editingPassenger ? editingPassenger.id : `pass-${Date.now()}`,
      fullName: fullName.trim(),
      age: Number(age),
      gender,
      berthPreference,
      foodPreference,
      seniorCitizenOpt: Boolean(seniorCitizenOpt && Number(age) >= 60),
      idCardType,
      idCardNumberMasked: idCardNumberMasked.trim() || undefined
    };

    onSavePassenger(passengerToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-bold text-base tracking-tight">
                {editingPassenger ? 'Edit Passenger Profile' : 'New Passenger Profile'}
              </h3>
              <p className="text-xs text-slate-400">
                Official IRCTC Master List format compliant
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Passenger Full Name (As per Govt Photo ID)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rajesh Kumar Sharma"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Max 16 characters for IRCTC first name / initials
            </span>
          </div>

          {/* Age and Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Age (Years)
              </label>
              <input
                type="number"
                min={1}
                max={125}
                required
                value={age}
                onChange={e => {
                  const val = e.target.value === '' ? '' : parseInt(e.target.value);
                  setAge(val);
                  if (typeof val === 'number' && val >= 60) {
                    setSeniorCitizenOpt(true);
                  } else {
                    setSeniorCitizenOpt(false);
                  }
                }}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as any)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Transgender">Transgender</option>
              </select>
            </div>
          </div>

          {/* Berth and Food Preference */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Berth Preference
              </label>
              <select
                value={berthPreference}
                onChange={e => setBerthPreference(e.target.value as BerthPreference)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                {BERTH_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Food Preference
              </label>
              <select
                value={foodPreference}
                onChange={e => setFoodPreference(e.target.value as FoodPreference)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                {FOOD_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional ID Document Info */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Govt Photo ID (Optional)
              </label>
              <select
                value={idCardType}
                onChange={e => setIdCardType(e.target.value as any)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Aadhaar">Aadhaar Card</option>
                <option value="PAN Card">PAN Card</option>
                <option value="Passport">Passport</option>
                <option value="Voter ID">Voter ID</option>
                <option value="Driving License">Driving License</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Masked ID Number
              </label>
              <input
                type="text"
                placeholder="e.g. XXXX-XXXX-4512"
                value={idCardNumberMasked}
                onChange={e => setIdCardNumberMasked(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Senior Citizen Notification if applicable */}
          {typeof age === 'number' && age >= 60 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
              <span className="font-semibold">Senior Citizen Note:</span> Passenger is eligible for lower berth allocation under General quota. Remember concessions are not applicable in Tatkal.
            </div>
          )}

          {/* Security & Consent Notice */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-[11px]">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Data Protection & Privacy Policy</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              We never collect or store your IRCTC passwords, bank cards, OTPs, or payment credentials. Profiles are saved locally to speed up manual booking preparation.
            </p>
            <label className="flex items-start gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={consentGiven}
                onChange={e => setConsentGiven(e.target.checked)}
                className="mt-0.5 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-[11px] font-medium text-slate-700">
                I give consent to store this passenger profile locally for legitimate ticket booking assistance.
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
