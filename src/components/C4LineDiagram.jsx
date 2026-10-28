import React from 'react';
import { Map, Train, CheckCircle2, ChevronRight } from 'lucide-react';
import { C4_LINE_SEQUENCE } from '../data/stations';

export function C4LineDiagram({ selectedStation, onSelectStationId }) {
  const isKeyStation = (id) => ['37010', '18101', '18002'].includes(id);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Map className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Esquema de la Línea C-4 Madrid
            </h3>
            <p className="text-[11px] text-slate-400">
              Conexión directa entre Las Margaritas, Sol y Nuevos Ministerios
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
          C4a / C4b
        </span>
      </div>

      {/* Horizontal scrolling timeline for mobile & desktop */}
      <div className="overflow-x-auto pb-2 pt-2 -mx-1 px-1">
        <div className="flex items-center min-w-max gap-1">
          {C4_LINE_SEQUENCE.map((st, idx) => {
            const isSelected = selectedStation.id === st.id;
            const isHome = st.id === '37010';
            const isWork = st.id === '18101' || st.id === '18002';
            const isKey = isKeyStation(st.id);

            return (
              <React.Fragment key={st.id}>
                {idx > 0 && (
                  <div
                    className={`h-1 w-5 sm:w-7 rounded-full transition-colors ${
                      isSelected ? 'bg-blue-500' : 'bg-slate-800'
                    }`}
                  />
                )}

                <button
                  onClick={() => onSelectStationId && isKey && onSelectStationId(st.id)}
                  disabled={!isKey}
                  className={`flex flex-col items-center group transition-transform ${
                    isKey ? 'cursor-pointer hover:scale-105' : 'cursor-default opacity-60'
                  }`}
                >
                  {/* Node icon */}
                  <div
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                      isSelected
                        ? 'bg-blue-600 border-white text-white shadow-lg shadow-blue-500/50 scale-110 ring-4 ring-blue-500/30'
                        : isHome
                        ? 'bg-slate-800 border-blue-400 text-blue-400'
                        : isWork
                        ? 'bg-slate-800 border-purple-400 text-purple-400'
                        : 'bg-slate-900 border-slate-700 text-slate-500'
                    }`}
                  >
                    {isHome ? (
                      <span className="text-[11px]">🏠</span>
                    ) : isWork ? (
                      <span className="text-[11px]">💼</span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-current" />
                    )}
                  </div>

                  {/* Station Name */}
                  <div className="mt-1.5 text-center max-w-[85px]">
                    <span
                      className={`text-[11px] block font-semibold leading-tight truncate ${
                        isSelected
                          ? 'text-blue-300 font-bold'
                          : isKey
                          ? 'text-slate-200 group-hover:text-white'
                          : 'text-slate-500'
                      }`}
                      title={st.name}
                    >
                      {st.name}
                    </span>
                    {isHome && (
                      <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider block">
                        Casa
                      </span>
                    )}
                    {isWork && (
                      <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider block">
                        Trabajo
                      </span>
                    )}
                    {st.branch && (
                      <span className="text-[9px] text-slate-500 block">
                        Ramal {st.branch}
                      </span>
                    )}
                  </div>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          <span>Trayecto Las Margaritas ↔ Sol: <strong>~20 min</strong></span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
          <span>Las Margaritas ↔ Nuevos Ministerios: <strong>~25 min</strong></span>
        </span>
      </div>
    </div>
  );
}
