import React, { useState, useEffect } from 'react';
import { Train, Clock, ArrowRight, AlertTriangle, CheckCircle, Navigation2, Accessibility, Zap } from 'lucide-react';
import { getCountdown } from '../services/renfeService';

export function NextTrainHero({
  train,
  station,
  targetDestinationName = 'Destino'
}) {
  const [liveCountdown, setLiveCountdown] = useState(
    train ? getCountdown(train.departureDate) : null
  );

  // Update countdown smoothly every second
  useEffect(() => {
    if (!train?.departureDate) return;

    setLiveCountdown(getCountdown(train.departureDate));
    const interval = setInterval(() => {
      setLiveCountdown(getCountdown(train.departureDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [train]);

  if (!train) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center">
        <Train className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-pulse" />
        <h3 className="text-lg font-bold text-slate-300">No hay trenes próximos</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          No hay salidas programadas en los próximos minutos para el filtro seleccionado.
        </p>
      </div>
    );
  }

  const { minutes = 0, seconds = 0, isImminent, isPast, text } = liveCountdown || {};
  const isDelayed = train.delayMinutes > 0;
  const isC4a = train.linea?.toLowerCase().includes('c4a');
  const isC4b = train.linea?.toLowerCase().includes('c4b');

  // Estimate arrival time at user's workplace or home
  let estimatedArrivalStr = null;
  if (train.departureDate) {
    const travelMinutes = station.id === '37010' ? 20 : 20; // ~20 min between Las Margaritas and Sol
    const arrivalDate = new Date(train.departureDate.getTime() + travelMinutes * 60000);
    estimatedArrivalStr = arrivalDate.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const formatTime = (date) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 border-2 border-blue-500/50 shadow-2xl shadow-blue-950/60 glow-c4">
      {/* Top Banner: Next Train Label & Line Badge */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-blue-400">
            Próximo tren
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-xs text-slate-400">
            en <strong className="text-slate-200">{station.name}</strong>
          </span>
        </div>

        {/* Line badge */}
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black text-xs px-2.5 py-1 rounded-md text-white shadow-sm ${
              isC4a
                ? 'bg-blue-600 shadow-blue-600/30'
                : isC4b
                ? 'bg-sky-600 shadow-sky-600/30'
                : 'bg-blue-700'
            }`}
          >
            {train.linea || 'C-4'}
          </span>
          <span className="text-[11px] font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
            {isC4a ? 'Vía Alcobendas' : isC4b ? 'Vía Colmenar' : 'C-4'}
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left: Giant Countdown Display */}
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-400" />
              Tiempo de espera
            </div>

            <div className="flex items-baseline gap-2">
              {isPast ? (
                <div className="text-3xl sm:text-4xl font-black text-slate-400">
                  Saliendo ahora
                </div>
              ) : isImminent ? (
                <div className="text-3xl sm:text-4xl font-black text-emerald-400 animate-pulse flex items-center gap-2">
                  <Zap className="w-8 h-8 fill-emerald-400" />
                  <span>En andén / Llegando</span>
                </div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl sm:text-6xl font-black tracking-tight text-white font-mono">
                    {minutes}
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-slate-400 mr-2">
                    min
                  </span>
                  <span className="text-4xl sm:text-5xl font-black tracking-tight text-blue-400 font-mono">
                    {String(seconds).padStart(2, '0')}
                  </span>
                  <span className="text-lg sm:text-xl font-bold text-slate-400">
                    s
                  </span>
                </div>
              )}
            </div>

            {/* Punctuality Status */}
            <div className="flex items-center gap-2 pt-1">
              {isDelayed ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                  <AlertTriangle className="w-3 h-3" />
                  +{train.delayMinutes} min de retraso
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  A tiempo
                </span>
              )}

              {train.isSimulated && (
                <span className="text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
                  Horario habitual
                </span>
              )}
            </div>
          </div>

          {/* Right: Destination & Platform Pill */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-4 border-t md:border-t-0 md:border-l border-slate-800/80 pt-4 md:pt-0 md:pl-6">
            {/* Destination */}
            <div className="text-left md:text-right">
              <span className="text-xs font-semibold text-slate-400 block mb-0.5">
                Destino final
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center md:justify-end gap-2">
                <span>{train.destinoNombre}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Salida: <strong className="text-slate-200">{formatTime(train.departureDate)}</strong>
                {train.plannedDate && isDelayed && (
                  <span className="line-through text-slate-500 ml-1.5">
                    {formatTime(train.plannedDate)}
                  </span>
                )}
              </p>
            </div>

            {/* Platform / Vía & Travel Estimate */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-700 to-blue-900 border border-blue-500/50 rounded-xl px-4 py-2 text-center shadow-md">
                <span className="text-[10px] uppercase font-bold text-blue-200 block">
                  Andén
                </span>
                <span className="text-xl sm:text-2xl font-black text-white font-mono leading-none">
                  VÍA {train.via}
                </span>
              </div>

              {estimatedArrivalStr && (
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Llegada est.
                  </span>
                  <span className="text-base sm:text-lg font-bold text-slate-200 font-mono leading-none">
                    ~{estimatedArrivalStr}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Train GPS / Positioning status bar if present */}
        {train.position && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Navigation2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
              <span>
                Estado del convoy:{' '}
                <strong className="text-slate-300">
                  {train.position === 'E'
                    ? 'Parado en estación'
                    : train.position === 'A'
                    ? 'Aproximándose al andén'
                    : 'En tramo entre estaciones'}
                </strong>
              </span>
            </div>
            {train.accesible && (
              <span className="flex items-center gap-1 text-slate-400 text-[11px]" title="Tren accesible PMR">
                <Accessibility className="w-3.5 h-3.5 text-blue-400" />
                Accesible
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
