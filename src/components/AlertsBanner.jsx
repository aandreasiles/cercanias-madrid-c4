import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, X, Bell } from 'lucide-react';

export function AlertsBanner({ alerts }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed || !alerts) return null;

  // Find alerts matching nucleo 10 (Madrid) or line C4
  const avisosEstacion = alerts?.avisos?.estacion || [];
  const avisosLinea = alerts?.avisos?.linea || [];

  const madridStationAlerts = avisosEstacion.filter((a) => a.idnegocio === '10');
  const totalAlerts = madridStationAlerts.length + avisosLinea.length;

  if (totalAlerts === 0) return null;

  return (
    <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3 sm:p-3.5 text-amber-200 text-xs shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-bold text-amber-300">
            Avisos de Cercanías Madrid ({totalAlerts})
          </span>
          {!isExpanded && madridStationAlerts[0]?.idiomas?.[0]?.texto && (
            <span className="text-amber-200/80 truncate max-w-xs sm:max-w-md hidden sm:inline">
              {madridStationAlerts[0].idiomas[0].texto}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-amber-900/50 rounded transition text-amber-300"
            title={isExpanded ? 'Contraer avisos' : 'Ver todos los avisos'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 hover:bg-amber-900/50 rounded transition text-amber-400/80 hover:text-amber-200"
            title="Descartar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-2.5 pt-2 border-t border-amber-500/30 space-y-2 max-h-48 overflow-y-auto">
          {madridStationAlerts.map((aviso, idx) => (
            <div key={idx} className="bg-amber-900/30 p-2 rounded-lg border border-amber-500/20 text-[11px] leading-relaxed">
              <span className="font-bold text-amber-300 block mb-0.5">
                Estación {aviso.estacion}:
              </span>
              <p>{aviso.idiomas?.[0]?.texto || 'Información de servicio'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
