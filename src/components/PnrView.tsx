import React, { useState } from 'react';
import { 
  TicketCheck, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  Clock, 
  ExternalLink,
  ShieldAlert,
  Train
} from 'lucide-react';
import { PnrRecord } from '../types';
import { MOCK_PNR_DATABASE } from '../data/mockRailwayData';

interface PnrViewProps {
  onShowToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export const PnrView: React.FC<PnrViewProps> = ({ onShowToast }) => {
  const [pnrInput, setPnrInput] = useState('');
  const [searchedPnr, setSearchedPnr] = useState<PnrRecord | null>(MOCK_PNR_DATABASE[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = (pnrToQuery?: string) => {
    const query = (pnrToQuery || pnrInput).replace(/\D/g, '');
    if (query.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit Indian Railways PNR number.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Check in mock database
      const found = MOCK_PNR_DATABASE.find(item => item.pnrNumber === query);
      if (found) {
        setSearchedPnr(found);
        onShowToast(`PNR record ${query} loaded successfully.`, 'success');
      } else {
        // Generate a simulated demo record for any other 10-digit number
        const demoRecord: PnrRecord = {
          pnrNumber: query,
          trainNumber: '12301',
          trainName: 'Howrah Rajdhani Express',
          fromStationCode: 'HWH',
          fromStationName: 'Howrah Junction',
          toStationCode: 'NDLS',
          toStationName: 'New Delhi',
          journeyDate: '29-Oct-2026',
          boardingDate: '29-Oct-2026',
          travelClass: '3A',
          quota: 'TATKAL',
          chartStatus: 'Chart Not Prepared',
          remarks: 'Demonstration enquiry result. Chart prepares 4 hours before departure.',
          isDemoData: true,
          passengers: [
            {
              passengerIndex: 1,
              bookingStatus: 'CNF',
              currentStatus: 'CNF B2-34 (Side Lower)',
              berth: '34 (Side Lower)',
              coach: 'B2',
              statusType: 'CNF'
            }
          ]
        };
        setSearchedPnr(demoRecord);
        onShowToast(`Simulated demo PNR ${query} generated.`, 'info');
      }
    }, 450);
  };

  return (
    <div className="space-y-6">
      {/* Search Header Banner */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <TicketCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Passenger Name Record (PNR) Status Lookup
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Check booking confirmation, current berth status, and chart preparation status.
              </p>
            </div>
          </div>

          <a
            href="https://www.indianrail.gov.in/enquiry/PNR/PnrEnquiry.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors shrink-0"
          >
            <span>Official PRS Indian Rail Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row gap-2.5 max-w-2xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              maxLength={10}
              placeholder="Enter 10-digit PNR (e.g. 2458910234)"
              value={pnrInput}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '');
                setPnrInput(val);
                if (val.length === 10) setErrorMsg('');
              }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="w-full pl-9 pr-3 py-2 text-xs font-mono font-semibold bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={isLoading}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] rounded-xl shadow-xs transition-all disabled:bg-slate-400 whitespace-nowrap"
          >
            {isLoading ? 'Checking PNR...' : 'Check Status'}
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 text-rose-600 text-xs font-medium mt-2">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Sample PNR Quick Chips */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium text-[11px]">Quick Demo PNRs:</span>
          {MOCK_PNR_DATABASE.map(item => (
            <button
              key={item.pnrNumber}
              onClick={() => {
                setPnrInput(item.pnrNumber);
                handleSearch(item.pnrNumber);
              }}
              className="px-2.5 py-1 text-xs font-mono font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
            >
              {item.pnrNumber} ({item.travelClass} {item.passengers[0]?.statusType})
            </button>
          ))}
        </div>
      </div>

      {/* Demo Notice Banner */}
      <div className="p-4 bg-amber-50/80 border border-amber-200/90 rounded-2xl flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-950">
          <span className="font-bold text-amber-900">Demonstration Mode Notice: </span>
          The Indian Railways PRS server requires authenticated official API tokens or captive CAPTCHA verification. The results displayed below are formatted demonstration data and do not reflect real ticketing records without an active commercial railway API key.
        </div>
      </div>

      {/* PNR Results Card */}
      {searchedPnr && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 bg-slate-50 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">PNR NUMBER</span>
                <span className="font-mono text-base font-extrabold text-slate-900 tracking-wider">
                  {searchedPnr.pnrNumber.slice(0, 3)}-{searchedPnr.pnrNumber.slice(3)}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md font-semibold">
                  DEMO DATA
                </span>
              </div>
              <div className="text-xs text-slate-600 font-semibold mt-0.5">
                Train #{searchedPnr.trainNumber} · {searchedPnr.trainName}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                searchedPnr.chartStatus === 'Chart Prepared'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
              }`}>
                {searchedPnr.chartStatus}
              </span>
            </div>
          </div>

          {/* Journey Meta Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Origin Station</span>
              <div className="font-bold text-slate-900 mt-0.5">
                {searchedPnr.fromStationName} ({searchedPnr.fromStationCode})
              </div>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Destination Station</span>
              <div className="font-bold text-slate-900 mt-0.5">
                {searchedPnr.toStationName} ({searchedPnr.toStationCode})
              </div>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Date of Journey</span>
              <div className="font-bold text-slate-900 mt-0.5">
                {searchedPnr.journeyDate}
              </div>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Class / Quota</span>
              <div className="font-bold text-slate-900 mt-0.5">
                {searchedPnr.travelClass} · {searchedPnr.quota}
              </div>
            </div>
          </div>

          {/* Passenger Berth Allocation Table */}
          <div className="p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Passenger Booking & Current Status
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-semibold">
                  <tr>
                    <th className="px-4 py-2.5">Passenger</th>
                    <th className="px-4 py-2.5">Booking Status</th>
                    <th className="px-4 py-2.5">Current Status</th>
                    <th className="px-4 py-2.5">Coach & Berth</th>
                    <th className="px-4 py-2.5 text-right">Confirmation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {searchedPnr.passengers.map(psgn => (
                    <tr key={psgn.passengerIndex} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-bold text-slate-900">
                        Passenger {psgn.passengerIndex}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700">
                        {psgn.bookingStatus}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-slate-900">
                        {psgn.currentStatus}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        Coach {psgn.coach} · Berth {psgn.berth}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          psgn.statusType === 'CNF'
                            ? 'bg-emerald-50 text-emerald-800'
                            : psgn.statusType === 'RAC'
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-rose-50 text-rose-800'
                        }`}>
                          {psgn.statusType === 'CNF' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          <span>{psgn.statusType}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-500 pt-2">
              Remarks: {searchedPnr.remarks}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
