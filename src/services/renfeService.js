import { generateSimulatedDepartures } from './scheduleEngine';

/**
 * Parses a date string formatted as "DD-MM-YYYY HH:mm:ss" into a Date object.
 */
export function parseRenfeDate(dateStr) {
  if (!dateStr) return null;
  try {
    const [datePart, timePart] = dateStr.trim().split(' ');
    if (!datePart || !timePart) return null;
    const [day, month, year] = datePart.split('-').map(Number);
    const [hours, minutes, seconds = 0] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes, seconds);
  } catch (e) {
    return null;
  }
}

/**
 * Calculates countdown details between targetDate and referenceDate (default now)
 */
export function getCountdown(targetDate, refDate = new Date()) {
  if (!targetDate) return { minutes: 0, seconds: 0, totalSeconds: 0, isPast: true, text: '--' };

  const diffMs = targetDate.getTime() - refDate.getTime();
  const totalSeconds = Math.round(diffMs / 1000);

  if (totalSeconds < -60) {
    return { minutes: 0, seconds: 0, totalSeconds, isPast: true, text: 'Ya salió' };
  }

  if (totalSeconds <= 30 && totalSeconds >= -60) {
    return { minutes: 0, seconds: Math.max(0, totalSeconds), totalSeconds, isImminent: true, text: 'En andén / Saliendo' };
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return { minutes, seconds, totalSeconds, text: `${seconds}s` };
  }

  return { minutes, seconds, totalSeconds, text: `${minutes} min` };
}

/**
 * Normalizes departure entries from Renfe JSON
 */
export function normalizeDepartures(rawSalidas = [], stationId, refDate = new Date()) {
  return rawSalidas
    .map((s, idx) => {
      const departureDate = parseRenfeDate(s.horaSalidaReal || s.horaSalida || s.horaSalidaPlanificada);
      const plannedDate = parseRenfeDate(s.horaSalidaPlanificada || s.horaSalida);
      const countdown = getCountdown(departureDate, refDate);

      // Delay calculation
      let delayMinutes = 0;
      if (departureDate && plannedDate) {
        delayMinutes = Math.round((departureDate.getTime() - plannedDate.getTime()) / 60000);
      }

      // Direction: Parla (South) vs Madrid / Alcobendas / Colmenar (North)
      const destLower = (s.destinoNombre || '').toLowerCase();
      const isToParla = destLower.includes('parla') || s.destino === '37012';
      const direction = isToParla ? 'PARLA' : 'MADRID';

      return {
        id: s.tripId || s.trenId || `train-${idx}`,
        trenId: s.trenId,
        tripId: s.tripId,
        linea: s.linea || 'C4',
        destino: s.destino,
        destinoNombre: s.destinoNombre,
        horaSalida: s.horaSalida,
        horaSalidaReal: s.horaSalidaReal,
        horaSalidaPlanificada: s.horaSalidaPlanificada,
        departureDate,
        plannedDate,
        via: s.via || (direction === 'PARLA' ? '2' : '1'),
        accesible: s.accesible === 1 || s.accesible === true,
        locEstacion: s.locEstacion,
        position: s.position, // 'E' = en estacion, 'S' = saliendo, 'A' = aproximándose
        localizacion: s.localizacion,
        delayMinutes,
        countdown,
        direction,
        isSimulated: Boolean(s.isSimulated)
      };
    })
    .filter((s) => s.countdown.totalSeconds >= -90) // Keep trains up to 1.5 min after departure
    .sort((a, b) => {
      const timeA = a.departureDate ? a.departureDate.getTime() : Infinity;
      const timeB = b.departureDate ? b.departureDate.getTime() : Infinity;
      return timeA - timeB;
    });
}

/**
 * Main fetch function with multi-tier failover
 */
export async function fetchDeparturesForStation(stationId) {
  const customProxy = localStorage.getItem('cercanias_custom_proxy');
  const baseRenfeUrl = `https://tiempo-real.renfe.com/renfe-json-cutter/write/salidas/estacion/${stationId}.json?v=${Date.now()}`;
  
  // Strategy 1: User custom proxy if defined
  if (customProxy) {
    try {
      const proxyUrl = customProxy.replace('{url}', encodeURIComponent(baseRenfeUrl));
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const json = await res.json();
        return {
          data: json,
          source: 'LIVE_PROXY',
          label: 'En Vivo (Proxy Personalizado)'
        };
      }
    } catch (e) {
      console.warn('Custom proxy failed:', e);
    }
  }

  // Strategy 2: Direct Renfe API (Works if browser has CORS extension or same-origin)
  try {
    const res = await fetch(baseRenfeUrl, {
      signal: AbortSignal.timeout(3500)
    });
    if (res.ok) {
      const json = await res.json();
      return {
        data: json,
        source: 'LIVE_DIRECT',
        label: 'En Vivo (API Renfe Oficial)'
      };
    }
  } catch (e) {
    // CORS or network failure is expected on standard web browsers without proxy
  }

  // Strategy 3: Fast local snapshot from GitHub Pages repository
  try {
    const repoSnapshotUrl = `./data/salidas_${stationId}.json?v=${Date.now()}`;
    const res = await fetch(repoSnapshotUrl, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const json = await res.json();
      // If snapshot is recent (today), we can use its train list and adapt times
      if (json && json.estacion && json.estacion.salidas) {
        return {
          data: json,
          source: 'SNAPSHOT',
          label: 'Datos Reales Recientes (Caché Renfe)'
        };
      }
    }
  } catch (e) {
    // Continue to next fallback
  }

  // Strategy 4: High fidelity C-4 schedule engine
  const simulated = generateSimulatedDepartures(stationId, new Date());
  return {
    data: simulated,
    source: 'SCHEDULE_ENGINE',
    label: 'Horario Oficial C-4 (Tiempo Estimado)'
  };
}

/**
 * Fetch alerts from Renfe
 */
export async function fetchRenfeAlerts() {
  try {
    const res = await fetch(`./data/alerts.json?v=${Date.now()}`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (e) {
    // ignore
  }
  return null;
}
