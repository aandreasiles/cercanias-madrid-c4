export const STATIONS = {
  LAS_MARGARITAS: {
    id: '37010',
    name: 'Las Margaritas',
    fullName: 'Las Margaritas - Universidad (Getafe)',
    badge: 'Casa 🏠',
    icon: 'home',
    lines: ['C4', 'C4a', 'C4b'],
    defaultViaMadrid: '1',
    defaultViaParla: '2',
    zone: 'B1',
    travelTimeToSolMin: 20,
    travelTimeToNuevosMin: 25,
  },
  SOL: {
    id: '18101',
    name: 'Sol',
    fullName: 'Madrid - Sol',
    badge: 'Trabajo 💼',
    icon: 'briefcase',
    lines: ['C3', 'C4', 'C4a', 'C4b'],
    defaultViaMadrid: '1',
    defaultViaParla: '2',
    zone: '0',
    travelTimeToLasMargaritasMin: 20,
  },
  NUEVOS_MINISTERIOS: {
    id: '18002',
    name: 'Nuevos Ministerios',
    fullName: 'Madrid - Nuevos Ministerios',
    badge: 'Trabajo 💼',
    icon: 'briefcase',
    lines: ['C1', 'C2', 'C3', 'C4', 'C7', 'C8', 'C10'],
    defaultViaMadrid: '1', // or 2
    defaultViaParla: '6', // or 8
    zone: '0',
    travelTimeToLasMargaritasMin: 25,
  },
  PARLA: { id: '37012', name: 'Parla' },
  GETAFE_SECTOR_3: { id: '37011', name: 'Getafe Sector 3' },
  GETAFE_CENTRO: { id: '37002', name: 'Getafe Centro' },
  VILLAVERDE_ALTO: { id: '60100', name: 'Villaverde Alto' },
  VILLAVERDE_BAJO: { id: '60107', name: 'Villaverde Bajo' },
  ATOCHA: { id: '60109', name: 'Madrid - Atocha Cercanías' },
  CHAMARTIN: { id: '17000', name: 'Madrid - Chamartín Clara Campoamor' },
  FUENCARRAL: { id: '17001', name: 'Fuencarral' },
  CANTOBLANCO: { id: '17009', name: 'Cantoblanco Universidad' },
  COMILLAS: { id: '19001', name: 'Universidad P. Comillas' },
  VALDELASFUENTES: { id: '19002', name: 'Valdelasfuentes' },
  ALCOBENDAS: { id: '19003', name: 'Alcobendas - S.S. de los Reyes' },
  EL_GOLOSO: { id: '17002', name: 'El Goloso' },
  TRES_CANTOS: { id: '17003', name: 'Tres Cantos' },
  COLMENAR: { id: '17005', name: 'Colmenar Viejo' }
};

export const C4_LINE_SEQUENCE = [
  { id: '37012', name: 'Parla' },
  { id: '37011', name: 'Getafe Sector 3' },
  { id: '37002', name: 'Getafe Centro' },
  { id: '37010', name: 'Las Margaritas', isKey: true },
  { id: '60100', name: 'Villaverde Alto' },
  { id: '60107', name: 'Villaverde Bajo' },
  { id: '60109', name: 'Atocha' },
  { id: '18101', name: 'Sol', isKey: true },
  { id: '18002', name: 'Nuevos Ministerios', isKey: true },
  { id: '17000', name: 'Chamartín' },
  { id: '17001', name: 'Fuencarral' },
  { id: '17009', name: 'Cantoblanco' },
  // C4a Branch
  { id: '19001', name: 'Univ. Comillas', branch: 'C4a' },
  { id: '19002', name: 'Valdelasfuentes', branch: 'C4a' },
  { id: '19003', name: 'Alcobendas - SSRR', branch: 'C4a' },
  // C4b Branch
  { id: '17002', name: 'El Goloso', branch: 'C4b' },
  { id: '17003', name: 'Tres Cantos', branch: 'C4b' },
  { id: '17005', name: 'Colmenar Viejo', branch: 'C4b' },
];

export const PRIMARY_STATIONS = [
  STATIONS.LAS_MARGARITAS,
  STATIONS.SOL,
  STATIONS.NUEVOS_MINISTERIOS
];
