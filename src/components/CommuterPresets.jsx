import React from 'react';
import { Home, Briefcase, ArrowRightLeft, Navigation, MapPin } from 'lucide-react';
import { STATIONS, PRIMARY_STATIONS } from '../data/stations';

export function CommuterPresets({
  selectedStation,
  onSelectStation,
  directionFilter,
  onChangeDirection,
}) {
  const isLasMargaritas = selectedStation.id === STATIONS.LAS_MARGARITAS.id;
  const isSol = selectedStation.id === STATIONS.SOL.id;
  const isNuevosMinisterios = selectedStation.id === STATIONS.NUEVOS_MINISTERIOS.id;

  // Contextual labels for directions based on chosen station
  const directionOptions = isLasMargaritas
    ? [
        { key: 'MADRID', label: 'Hacia Madrid / Trabajo 🏢', desc: 'Atocha, Sol, N. Ministerios, Alcobendas / Colmenar' },
        { key: 'PARLA', label: 'Hacia Parla 📍', desc: 'Getafe Centro, Sector 3, Parla' },
        { key: 'ALL', label: 'Ambas direcciones', desc: 'Ver todos los trenes' },
      ]
    : [
        { key: 'PARLA', label: 'Hacia Las Margaritas / Parla 🏠', desc: 'Atocha, Villaverde, Las Margaritas, Parla' },
        { key: 'MADRID', label: 'Hacia Chamartín / Norte 📍', desc: 'Chamartín, Alcobendas, Colmenar' },
        { key: 'ALL', label: 'Ambas direcciones', desc: 'Ver todos los trenes' },
      ];

  return (
    <div className="space-y-4">
      {/* Station Selector Cards */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            Estación actual
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Pulsa para cambiar de estación
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {PRIMARY_STATIONS.map((station) => {
            const isSelected = station.id === selectedStation.id;
            const isHome = station.id === STATIONS.LAS_MARGARITAS.id;

            return (
              <button
                key={station.id}
                onClick={() => onSelectStation(station)}
                className={`group relative p-3.5 rounded-xl border text-left transition-all duration-200 ${
                  isSelected
                    ? 'bg-gradient-to-br from-blue-950/80 to-slate-900 border-blue-500/80 shadow-lg shadow-blue-950/50 ring-2 ring-blue-500/30'
                    : 'bg-slate-900/60 hover:bg-slate-850 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-700/30'
                          : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      {isHome ? <Home className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-400">
                          {isHome ? 'Mi Casa' : 'Mi Trabajo'}
                        </span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        )}
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-white tracking-tight">
                        {station.name}
                      </h3>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isSelected
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    Línea C-4
                  </span>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    {isHome
                      ? '⏱️ ~20-25 min a Madrid'
                      : '⏱️ ~20-25 min a Margaritas'}
                  </span>
                  <span className="font-mono text-slate-500">Zona {station.zone}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Direction Filter Bar */}
      <div className="bg-slate-900/70 p-2 sm:p-2.5 rounded-xl border border-slate-800/80 flex flex-wrap sm:flex-nowrap gap-1.5 items-center justify-between">
        <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-slate-400">
          <Navigation className="w-3.5 h-3.5 text-blue-400" />
          <span>Sentido:</span>
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {directionOptions.map((opt) => {
            const isActive = directionFilter === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => onChangeDirection(opt.key)}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-700/30'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white'
                }`}
                title={opt.desc}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
