import React, { useState, useEffect } from 'react';
import { Train, RefreshCw, Settings, Clock, Activity, Wifi } from 'lucide-react';

export function Header({
  dataSource,
  onRefresh,
  isRefreshing,
  nextRefreshSeconds,
  onOpenSettings
}) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatClock = (date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const isLive = dataSource?.source?.startsWith('LIVE');

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg shadow-blue-900/30 text-white">
            <Train className="w-6 h-6" />
            <span className="absolute -bottom-1 -right-1 bg-red-600 text-[10px] font-black px-1.5 py-0.5 rounded-full border-2 border-slate-900 text-white">
              C4
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                Cercanías <span className="text-blue-400">Madrid</span>
              </h1>
              <span className="bg-blue-500/20 text-blue-300 text-[11px] font-bold px-2 py-0.5 rounded-md border border-blue-500/30">
                Línea C-4
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Las Margaritas • Sol • Nuevos Ministerios
            </p>
          </div>
        </div>

        {/* Right side: Live Clock & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Real-time Clock */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60 text-xs font-mono font-bold text-slate-200">
            <Clock className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>{formatClock(currentTime)}</span>
          </div>

          {/* Status Indicator Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${
              isLive
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
            title={dataSource?.label || 'Estado de datos'}
          >
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            <span className="hidden md:inline">{isLive ? 'En Directo' : 'Horarios C4'}</span>
          </div>

          {/* Manual Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 transition active:scale-95 disabled:opacity-50"
            title="Actualizar datos ahora"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="font-mono text-slate-400">{nextRefreshSeconds}s</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
            title="Configuración"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
