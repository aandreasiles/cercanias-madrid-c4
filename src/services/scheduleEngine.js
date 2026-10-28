/**
 * Generador de Horarios Oficiales C-4 Renfe Cercanías Madrid
 * Frecuencias oficiales de la línea C-4 (C4a y C4b):
 * - Horas punta (06:30 - 09:30 y 13:30 - 19:30): cada 6 - 8 minutos combinados
 * - Horas valle: cada 10 - 15 minutos combinados
 * - Noches (22:00 - 00:00): cada 15 - 20 minutos
 */

export function generateSimulatedDepartures(stationId, now = new Date()) {
  const currentHour = now.getHours();
  const isPeak = (currentHour >= 6 && currentHour <= 9) || (currentHour >= 13 && currentHour <= 19);
  const intervalMinutes = isPeak ? 7 : 12;

  const departures = [];
  const startOffset = -2; // 2 minutes ago or next minute
  const totalTrains = 12;

  for (let i = 0; i < totalTrains; i++) {
    const departureDate = new Date(now.getTime() + (startOffset + i * intervalMinutes) * 60 * 1000);
    // Alternate branches and directions
    const isBranchA = i % 2 === 0;
    const isToParla = i % 2 !== 0;

    let linea = isBranchA ? 'C4a' : 'C4b';
    let destino = '37012';
    let destinoNombre = 'Parla';
    let via = '2';

    if (stationId === '37010') { // Las Margaritas
      // In Las Margaritas, user mostly wants Madrid (Alcobendas/Colmenar) or Parla
      if (i % 2 === 0) {
        destino = isBranchA ? '19003' : '17005';
        destinoNombre = isBranchA ? 'Alcobendas-San Sebastián de los Reyes' : 'Colmenar Viejo';
        via = '1';
      } else {
        destino = '37012';
        destinoNombre = 'Parla';
        via = '2';
      }
    } else if (stationId === '18101') { // Sol
      if (i % 2 === 0) {
        destino = '37012';
        destinoNombre = 'Parla';
        via = '2';
      } else {
        destino = isBranchA ? '19003' : '17005';
        destinoNombre = isBranchA ? 'Alcobendas-San Sebastián de los Reyes' : 'Colmenar Viejo';
        via = '1';
      }
    } else if (stationId === '18002') { // Nuevos Ministerios
      if (i % 2 === 0) {
        destino = '37012';
        destinoNombre = 'Parla';
        via = '8';
      } else {
        destino = isBranchA ? '19003' : '17005';
        destinoNombre = isBranchA ? 'Alcobendas-San Sebastián de los Reyes' : 'Colmenar Viejo';
        via = '6';
      }
    }

    const pad = (n) => String(n).padStart(2, '0');
    const dStr = `${pad(departureDate.getDate())}-${pad(departureDate.getMonth() + 1)}-${departureDate.getFullYear()}`;
    const tStr = `${pad(departureDate.getHours())}:${pad(departureDate.getMinutes())}:00`;
    const horaSalida = `${dStr} ${tStr}`;

    // Add small random delay occasionally (0 or 2 min) for realism
    const delayMins = (i === 1 || i === 4) ? 2 : 0;
    const realDate = new Date(departureDate.getTime() + delayMins * 60 * 1000);
    const realTStr = `${pad(realDate.getHours())}:${pad(realDate.getMinutes())}:00`;
    const horaSalidaReal = `${dStr} ${realTStr}`;

    departures.push({
      trenId: `SIM-${stationId}-${1000 + i}`,
      tripId: `SIM-TRIP-${i}`,
      routeId: `10T00${isBranchA ? '14C4a' : '16C4b'}`,
      linea,
      destino,
      destinoNombre,
      horaSalida: horaSalidaReal,
      horaSalidaReal,
      horaSalidaPlanificada: horaSalida,
      via,
      accesible: 1,
      locEstacion: stationId === '37010' ? (via === '1' ? '37002' : '60100') : '18000',
      position: i === 0 ? 'A' : 'S',
      isSimulated: true
    });
  }

  return {
    estacion: {
      stopId: stationId,
      nombre: stationId === '37010' ? 'Las Margaritas' : (stationId === '18101' ? 'Sol' : 'Nuevos Ministerios'),
      nucleo: '10',
      salidas: departures
    },
    fechaActualizacion: new Date().toLocaleTimeString('es-ES'),
    fuente: 'Horarios Oficiales Renfe (Simulación)'
  };
}
