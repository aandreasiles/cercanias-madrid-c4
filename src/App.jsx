import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { CommuterPresets } from './components/CommuterPresets';
import { NextTrainHero } from './components/NextTrainHero';
import { UpcomingTrainsList } from './components/UpcomingTrainsList';
import { C4LineDiagram } from './components/C4LineDiagram';
import { AlertsBanner } from './components/AlertsBanner';
import { SettingsModal } from './components/SettingsModal';
import { STATIONS, PRIMARY_STATIONS } from './data/stations';
import { fetchDeparturesForStation, normalizeDepartures, fetchRenfeAlerts } from './services/renfeService';
import { ArrowLeftRight, Clock, AlertCircle } from 'lucide-react';

export default function App() {
  // Load settings
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('cercanias_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      defaultStationId: STATIONS.LAS_MARGARITAS.id,
      refreshInterval: 30,
      customProxy: ''
    };
  });

  // Selected station
  const [selectedStation, setSelectedStation] = useState(() => {
    const match = PRIMARY_STATIONS.find((s) => s.id === settings.defaultStationId);
    return match || STATIONS.LAS_MARGARITAS;
  });

  // Direction filter ('MADRID', 'PARLA', or 'ALL')
  const [directionFilter, setDirectionFilter] = useState(() => {
    return selectedStation.id === STATIONS.LAS_MARGARITAS.id ? 'MADRID' : 'PARLA';
  });

  const [rawSalidas, setRawSalidas] = useState([]);
  const [dataSource, setDataSource] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [nextRefreshSeconds, setNextRefreshSeconds] = useState(settings.refreshInterval || 30);
  const [alerts, setAlerts] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState(null);

  // Fetch data for current station
  const loadStationData = useCallback(async (stationId, isBackground = false) => {
    if (!isBackground) setIsRefreshing(true);
    try {
      const res = await fetchDeparturesForStation(stationId);
      if (res && res.data) {
        const salidas = res.data?.estacion?.salidas || [];
        setRawSalidas(salidas);
        setDataSource(res);
        setLastUpdatedTime(new Date());
      }
    } catch (err) {
      console.error('Error fetching station departures:', err);
    } finally {
      if (!isBackground) setIsRefreshing(false);
      setNextRefreshSeconds(settings.refreshInterval || 30);
    }
  }, [settings.refreshInterval]);

  // Initial load & alerts
  useEffect(() => {
    loadStationData(selectedStation.id);
    fetchRenfeAlerts().then((data) => {
      if (data) setAlerts(data);
    });
  }, [selectedStation.id, loadStationData]);

  // Auto-refresh countdown loop
  useEffect(() => {
    const interval = setInterval(() => {
      setNextRefreshSeconds((prev) => {
        if (prev <= 1) {
          loadStationData(selectedStation.id, true);
          return settings.refreshInterval || 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedStation.id, loadStationData, settings.refreshInterval]);

  // Handle station change
  const handleSelectStation = (station) => {
    setSelectedStation(station);
    // Auto switch direction for commuter workflow
    if (station.id === STATIONS.LAS_MARGARITAS.id) {
      setDirectionFilter('MADRID'); // Going to work
    } else {
      setDirectionFilter('PARLA'); // Going home
    }
  };

  // Toggle commuting direction quickly
  const handleToggleCommute = () => {
    if (selectedStation.id === STATIONS.LAS_MARGARITAS.id) {
      // Switch to Sol
      handleSelectStation(STATIONS.SOL);
    } else {
      // Switch to Las Margaritas
      handleSelectStation(STATIONS.LAS_MARGARITAS);
    }
  };

  // Save settings
  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('cercanias_settings', JSON.stringify(newSettings));
  };

  // Normalized and filtered trains
  const normalizedTrains = useMemo(() => {
    return normalizeDepartures(rawSalidas, selectedStation.id);
  }, [rawSalidas, selectedStation.id]);

  const filteredTrains = useMemo(() => {
    if (directionFilter === 'ALL') return normalizedTrains;
    return normalizedTrains.filter((t) => t.direction === directionFilter);
  }, [normalizedTrains, directionFilter]);

  const nextTrain = filteredTrains[0] || null;
  const upcomingTrains = filteredTrains.slice(1, 9);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <Header
        dataSource={dataSource}
        onRefresh={() => loadStationData(selectedStation.id)}
        isRefreshing={isRefreshing}
        nextRefreshSeconds={nextRefreshSeconds}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-5 space-y-6">
        {/* Alerts Banner if any */}
        <AlertsBanner alerts={alerts} />

        {/* Quick Commuter Direction Toggle & Station Selector */}
        <CommuterPresets
          selectedStation={selectedStation}
          onSelectStation={handleSelectStation}
          directionFilter={directionFilter}
          onChangeDirection={setDirectionFilter}
        />

        {/* Hero Section: The Next Train */}
        <section aria-label="Próximo tren">
          <NextTrainHero
            train={nextTrain}
            station={selectedStation}
            targetDestinationName={
              selectedStation.id === STATIONS.LAS_MARGARITAS.id
                ? 'Sol / Nuevos Ministerios'
                : 'Las Margaritas'
            }
          />
        </section>

        {/* Commute Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={handleToggleCommute}
            className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold px-4 py-2 rounded-full border border-slate-700/80 shadow-md transition active:scale-95"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-blue-400" />
            <span>
              {selectedStation.id === STATIONS.LAS_MARGARITAS.id
                ? 'Cambiar a: Vuelvo del Trabajo (Sol / N. Ministerios)'
                : 'Cambiar a: Salgo de Casa (Las Margaritas)'}
            </span>
          </button>
        </div>

        {/* Upcoming Trains (Los siguientes) */}
        <section aria-label="Siguientes trenes">
          <UpcomingTrainsList
            trains={upcomingTrains}
            onSelectTrain={(t) => console.log('Selected train:', t)}
          />
        </section>

        {/* C-4 Line Scheme Map */}
        <section aria-label="Esquema de línea">
          <C4LineDiagram
            selectedStation={selectedStation}
            onSelectStationId={(id) => {
              const found = PRIMARY_STATIONS.find((s) => s.id === id);
              if (found) handleSelectStation(found);
            }}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 space-y-1">
        <p>
          Cercanías Madrid Línea C-4 • Datos en directo vía API Renfe
        </p>
        <p className="text-[11px] text-slate-600">
          Las Margaritas Universidad ↔ Madrid Sol ↔ Nuevos Ministerios
        </p>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSettings={settings}
        onSaveSettings={handleSaveSettings}
      />
    </div>
  );
}
