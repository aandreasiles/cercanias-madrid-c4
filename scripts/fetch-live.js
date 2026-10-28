import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STATIONS = [
  { id: '37010', name: 'Las Margaritas' },
  { id: '18002', name: 'Nuevos Ministerios' },
  { id: '18101', name: 'Sol' },
];

const TARGET_DIR = path.resolve(__dirname, '../public/data');
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

async function fetchStationData(stationId) {
  const url = `https://tiempo-real.renfe.com/renfe-json-cutter/write/salidas/estacion/${stationId}.json?v=${Date.now()}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://tiempo-real.renfe.com/'
      }
    });
    if (!res.ok) {
      console.warn(`[WARN] Station ${stationId} returned HTTP ${res.status}`);
      return null;
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`[ERROR] Fetching station ${stationId}:`, err.message);
    return null;
  }
}

async function main() {
  console.log('Fetching live Renfe departures...');
  for (const station of STATIONS) {
    const data = await fetchStationData(station.id);
    if (data) {
      const filePath = path.join(TARGET_DIR, `salidas_${station.id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`Saved: salidas_${station.id}.json (${data?.estacion?.salidas?.length || 0} departures)`);
    }
  }

  // Also fetch line alerts
  try {
    const alertsRes = await fetch(`https://tiempo-real.renfe.com/renfe-visor/alerts.json?v=${Date.now()}`);
    if (alertsRes.ok) {
      const alerts = await alertsRes.json();
      fs.writeFileSync(path.join(TARGET_DIR, 'alerts.json'), JSON.stringify(alerts, null, 2));
      console.log('Saved alerts.json');
    }
  } catch (err) {
    console.warn('Could not fetch alerts:', err.message);
  }
}

main();
