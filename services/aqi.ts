export const AQI_LEVELS = [
  { max: 50,  label: 'Good',         color: '#00C853', bg: '#0A1A0F' },
  { max: 100, label: 'Satisfactory', color: '#64DD17', bg: '#0F1A0A' },
  { max: 200, label: 'Moderate',     color: '#FFD600', bg: '#1A180A' },
  { max: 300, label: 'Poor',         color: '#FF6D00', bg: '#1A0F0A' },
  { max: 400, label: 'Very Poor',    color: '#DD2C00', bg: '#1A0A0A' },
  { max: 500, label: 'Severe',       color: '#AA00FF', bg: '#150A1A' },
];

export function getAQILevel(aqi: number) {
  return AQI_LEVELS.find(l => aqi <= l.max) || AQI_LEVELS[5];
}

export function pm25ToAQI(pm25: number): number {
  const breakpoints: [number, number, number, number][] = [
    [0,   30,  0,   50],
    [30,  60,  51,  100],
    [60,  90,  101, 200],
    [90,  120, 201, 300],
    [120, 250, 301, 400],
    [250, 500, 401, 500],
  ];
  for (const [cLo, cHi, iLo, iHi] of breakpoints) {
    if (pm25 >= cLo && pm25 <= cHi) {
      return Math.round(((iHi - iLo) / (cHi - cLo)) * (pm25 - cLo) + iLo);
    }
  }
  return 500;
}
