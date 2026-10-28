import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw, Server, HelpCircle, Check, Info } from 'lucide-react';
import { PRIMARY_STATIONS, STATIONS } from '../data/stations';

export function SettingsModal({ isOpen, onClose, currentSettings, onSaveSettings }) {
  const [defaultStationId, setDefaultStationId] = useState(
    currentSettings.defaultStationId || STATIONS.LAS_MARGARITAS.id
  );
  const [refreshInterval, setRefreshInterval] = useState(
    currentSettings.refreshInterval || 30
  );
  const [customProxy, setCustomProxy] = useState(
    currentSettings.customProxy || ''
  );
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDefaultStationId(currentSettings.defaultStationId || STATIONS.LAS_MARGARITAS.id);
      setRefreshInterval(currentSettings.refreshInterval || 30);
      setCustomProxy(localStorage.getItem('cercanias_custom_proxy') || '');
    }
  }, [isOpen, currentSettings]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (customProxy.trim()) {
      localStorage.setItem('cercanias_custom_proxy', customProxy.trim());
    } else {
      localStorage.removeItem('cercanias_custom_proxy');
    }

    onSaveSettings({
      defaultStationId,
      refreshInterval: Number(refreshInterval),
      customProxy: customProxy.trim()
    });

    setShowSavedFeedback(true);
    setTimeout(() => {
      setShowSavedFeedback(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <span>Ajustes y Configuración</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 text-sm">
          {/* Estación por defecto */}
          <div>
            <label className="block font-bold text-slate-200 mb-1.5">
              Estación inicial al abrir la app
            </label>
            <div className="grid grid-cols-1 gap-2">
              {PRIMARY_STATIONS.map((st) => (
                <label
                  key={st.id}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                    defaultStationId === st.id
                      ? 'bg-blue-600/15 border-blue-500/80 text-white'
                      : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="defaultStation"
                      value={st.id}
                      checked={defaultStationId === st.id}
                      onChange={() => setDefaultStationId(st.id)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold">{st.name}</span>
                  </div>
                  <span className="text-xs text-slate-400">{st.badge}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Intervalo de recarga */}
          <div>
            <label className="block font-bold text-slate-200 mb-1.5">
              Frecuencia de actualización automática
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[15, 30, 60].map((secs) => (
                <button
                  key={secs}
                  type="button"
                  onClick={() => setRefreshInterval(secs)}
                  className={`py-2 px-3 rounded-xl font-bold text-xs border transition ${
                    refreshInterval === secs
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900/30'
                      : 'bg-slate-800/50 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  Cada {secs}s
                </button>
              ))}
            </div>
          </div>

          {/* Información de la API de Renfe */}
          <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <Info className="w-4 h-4 text-blue-400" />
              <span>Fuente de datos Renfe</span>
            </div>
            <p className="leading-relaxed">
              La web consulta el panel de salidas en tiempo real de <strong>Renfe Cercanías</strong> para los códigos de estación:
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-slate-300 font-mono text-[11px]">
              <li>Las Margaritas: <code>37010</code></li>
              <li>Nuevos Ministerios: <code>18002</code></li>
              <li>Sol: <code>18101</code></li>
            </ul>
            <p className="text-[11px] text-slate-400">
              Si el navegador bloquea peticiones externas por CORS, la aplicación conmuta automáticamente al motor de horarios oficiales para mantener el servicio activo.
            </p>
          </div>

          {/* Proxy opcional */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1 text-xs">
              Proxy CORS opcional (Cloudflare Worker o similar)
            </label>
            <input
              type="text"
              placeholder="https://mi-proxy.workers.dev/?url={url}"
              value={customProxy}
              onChange={(e) => setCustomProxy(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-700/30 transition active:scale-95"
          >
            {showSavedFeedback ? (
              <>
                <Check className="w-4 h-4" />
                <span>Guardado</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar cambios</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
