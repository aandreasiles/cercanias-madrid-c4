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

export const DEFAULT_PROXY = 'https://cercanias-renfe-proxy.silesandrea.workers.dev/?url={url}';

/**
 * Main fetch function with multi-tier failover
 */
export async function fetchDeparturesForStation(stationId) {
  const customProxy = localStorage.getItem('cercanias_custom_proxy');
  const proxyToUse = customProxy !== null ? customProxy : DEFAULT_PROXY;
  const baseRenfeUrl = `https://tiempo-real.renfe.com/renfe-json-cutter/write/salidas/estacion/${stationId}.json?v=${Date.now()}`;
  
  // Strategy 1: Cloudflare Worker CORS Proxy (Default or Custom)
  if (proxyToUse) {
    try {
      const proxyUrl = proxyToUse.replace('{url}', encodeURIComponent(baseRenfeUrl));
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(4500) });
      if (res.ok) {
        const json = await res.json();
        if (json && json.estacion && Array.isArray(json.estacion.salidas)) {
          return {
            data: json,
            source: 'LIVE_DIRECT',
            label: 'En Vivo (API Renfe Oficial)'
          };
        }
      }
    } catch (e) {
      console.warn('Proxy request failed:', e);
    }
  }

  // Strategy 2: Vite Dev Server Proxy (Active during local development: npm run dev)
  // Bypasses CORS completely via backend proxy in vite.config.js
  if (import.meta.env.DEV) {
    try {
      const devProxyUrl = `/api-renfe/write/salidas/estacion/${stationId}.json?v=${Date.now()}`;
      const res = await fetch(devProxyUrl, { signal: AbortSignal.timeout(3500) });
      if (res.ok) {
        const json = await res.json();
        if (json && json.estacion && Array.isArray(json.estacion.salidas)) {
          return {
            data: json,
            source: 'LIVE_DIRECT',
            label: 'En Vivo (API Renfe Oficial)'
          };
        }
      }
    } catch (e) {
      console.warn('Vite dev proxy failed:', e);
    }
  }

  // Strategy 3: Direct Renfe API (Fast check if browser has CORS unblocked or same-origin)
  try {
    const res = await fetch(baseRenfeUrl, {
      signal: AbortSignal.timeout(1500)
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.estacion && Array.isArray(json.estacion.salidas)) {
        return {
          data: json,
          source: 'LIVE_DIRECT',
          label: 'En Vivo (API Renfe Oficial)'
        };
      }
    }
  } catch (e) {
    // Expected to fail in standard browsers due to Renfe lacking CORS headers
  }

  // Strategy 4: Local snapshot from repository (only if it has upcoming departures)
  try {
    const baseUrl = import.meta.env.BASE_URL || './';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const repoSnapshotUrl = `${cleanBase}data/salidas_${stationId}.json?v=${Date.now()}`;
    const res = await fetch(repoSnapshotUrl, { signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      const json = await res.json();
      const rawSalidas = json?.estacion?.salidas || [];
      const normalized = normalizeDepartures(rawSalidas, stationId);
      // Only accept snapshot if it actually contains future departures
      if (normalized.length > 0) {
        return {
          data: json,
          source: 'SNAPSHOT',
          label: 'Datos Reales Recientes (Caché)'
        };
      }
    }
  } catch (e) {
    // Continue to next fallback
  }

  // Strategy 5: High fidelity C-4 schedule engine
  // Generates departures using official Renfe C-4 peak/off-peak frequencies, lines & tracks
  const simulated = generateSimulatedDepartures(stationId, new Date());
  return {
    data: simulated,
    source: 'SCHEDULE_ENGINE',
    label: 'Horario Oficial C-4 (Frecuencias Reales)'
  };
}

/**
 * Fetch alerts from Renfe
 */
export async function fetchRenfeAlerts() {
  const customProxy = localStorage.getItem('cercanias_custom_proxy');
  const proxyToUse = customProxy !== null ? customProxy : DEFAULT_PROXY;
  const baseAlertsUrl = `https://tiempo-real.renfe.com/renfe-visor/alerts.json?v=${Date.now()}`;

  if (proxyToUse) {
    try {
      const proxyUrl = proxyToUse.replace('{url}', encodeURIComponent(baseAlertsUrl));
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // ignore
    }
  }

  if (import.meta.env.DEV) {
    try {
      const res = await fetch(`/api-renfe-visor/alerts.json?v=${Date.now()}`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // ignore
    }
  }

  try {
    const baseUrl = import.meta.env.BASE_URL || './';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const res = await fetch(`${cleanBase}data/alerts.json?v=${Date.now()}`, { signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (e) {
    // ignore
  }
  return null;
}
