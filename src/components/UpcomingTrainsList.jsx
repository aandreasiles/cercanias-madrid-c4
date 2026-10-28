import React from 'react';
import { Clock, Train, ArrowRight, Accessibility, AlertTriangle, CheckCircle } from 'lucide-react';

export function UpcomingTrainsList({ trains = [], onSelectTrain }) {
  if (trains.length === 0) {
    return (
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 text-center text-slate-400 text-sm">
        No hay más trenes próximos en este sentido.
      </div>
    );
  }

  const formatTime = (date) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Train className="w-4 h-4 text-blue-400" />
          Siguientes salidas programadas
        </h3>
        <span className="text-xs text-slate-500 font-medium">
          {trains.length} {trains.length === 1 ? 'tren' : 'trenes'} siguientes
        </span>
      </div>

      <div className="divide-y divide-slate-800/80 rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-lg">
        {trains.map((train, idx) => {
          const isC4a = train.linea?.toLowerCase().includes('c4a');
          const isDelayed = train.delayMinutes > 0;
          const mins = train.countdown?.minutes ?? 0;

          return (
            <div
              key={train.id || idx}
              onClick={() => onSelectTrain && onSelectTrain(train)}
              className="p-3.5 sm:p-4 hover:bg-slate-850/80 transition flex items-center justify-between gap-3 group"
            >
              {/* Left: Line badge & Destination */}
              <div className="flex items-center gap-3 min-w-0">
                {/* Line badge */}
                <div
                  className={`w-11 h-11 shrink-0 rounded-xl flex flex-col items-center justify-center font-black text-xs text-white shadow-md ${
                    isC4a
                      ? 'bg-blue-600 shadow-blue-900/30'
                      : 'bg-sky-600 shadow-sky-900/30'
                  }`}
                >
                  <span className="text-[11px] leading-tight font-black">{train.linea || 'C4'}</span>
                  <span className="text-[9px] font-bold text-blue-200">
                    {isC4a ? 'SSRR' : 'Colm.'}
                  </span>
                </div>

                {/* Destination & Meta */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm sm:text-base text-slate-100 truncate group-hover:text-blue-300 transition">
                      {train.destinoNombre}
                    </h4>
                    {train.accesible && (
                      <Accessibility className="w-3.5 h-3.5 text-slate-500 shrink-0" title="Accesible PMR" />
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>
                      Salida: <strong className="text-slate-300">{formatTime(train.departureDate)}</strong>
                    </span>
                    {isDelayed && (
                      <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3" />+{train.delayMinutes}m
                      </span>
                    )}
                    <span className="text-slate-600">•</span>
                    <span className="font-semibold text-blue-400">
                      Vía {train.via}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Countdown Badge */}
              <div className="text-right shrink-0">
                <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5 inline-block text-center shadow-sm">
                  <span className="text-xs sm:text-sm font-black text-slate-100 font-mono block">
                    {mins <= 0 ? 'Llegando' : `en ${mins} min`}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {formatTime(train.departureDate)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
