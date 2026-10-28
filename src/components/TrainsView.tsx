import React, { useState } from 'react';
import { Search, Train as TrainIcon, Clock, MapPin, CheckCircle2, Info, ArrowRight } from 'lucide-react';
import { TRAINS, STATIONS } from '../data/mockRailwayData';
import { isAcClass } from '../utils/tatkalRules';

export const TrainsView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');

  const types = ['All', 'Rajdhani Express', 'Vande Bharat', 'Shatabdi Express', 'Duronto Express', 'Superfast Express'];

  const filtered = TRAINS.filter(train => {
    const matchesSearch = 
      train.number.includes(searchQuery) ||
      train.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      train.fromStationCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      train.toStationCode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'All' || train.type === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <TrainIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Trains & Schedules Directory
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Explore major Indian Railways trains, routes, Tatkal quota eligibility, and departure timings.
              </p>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by train number, name, origin (NDLS), or destination (BSB)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 items-center">
            {types.map(t => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  selectedType === t
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Train Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(train => {
          const fromSt = STATIONS.find(s => s.code === train.fromStationCode);
          const toSt = STATIONS.find(s => s.code === train.toStationCode);

          return (
            <div
              key={train.number}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top Row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-600">
                        #{train.number}
                      </span>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {train.type}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">
                      {train.name}
                    </h3>
                  </div>

                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-100">
                    Tatkal Active
                  </span>
                </div>

                {/* Route & Times */}
                <div className="p-3 my-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <div className="font-mono font-bold text-slate-900">{train.departureTime}</div>
                    <div className="text-[11px] text-slate-500 font-semibold">{train.fromStationCode}</div>
                    <div className="text-[10px] text-slate-400 truncate">{fromSt?.city || train.fromStationCode}</div>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[10px] text-slate-400 font-mono">{train.duration}</span>
                    <div className="w-full flex items-center justify-center my-1 text-slate-400">
                      <div className="h-0.5 bg-slate-300 w-full" />
                      <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{train.distanceKm} km</span>
                  </div>

                  <div>
                    <div className="font-mono font-bold text-slate-900">{train.arrivalTime}</div>
                    <div className="text-[11px] text-slate-500 font-semibold">{train.toStationCode}</div>
                    <div className="text-[10px] text-slate-400 truncate">{toSt?.city || train.toStationCode}</div>
                  </div>
                </div>

                {/* Runs On Days */}
                <div className="mb-3 text-xs">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase mr-2">Runs On:</span>
                  <span className="text-slate-700 font-medium">
                    {train.runsOn.join(' · ')}
                  </span>
                </div>
              </div>

              {/* Classes & Tatkal Window Timing */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold mr-1">Classes:</span>
                  {train.classes.map(cls => (
                    <span
                      key={cls}
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                        isAcClass(cls) 
                          ? 'bg-indigo-50 text-indigo-700' 
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {cls}
                    </span>
                  ))}
                </div>

                <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-600" />
                  <span>10:00 AM (AC) / 11:00 AM</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
