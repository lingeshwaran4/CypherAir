// import axios from 'axios'; // Replaced with fetch to comply with "no new packages" constraint

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export const MOCK_DATA = {
  current_aqi: 168,
  pm25: 72.4,
  temperature: 34,
  humidity: 78,
  wind_speed: 12,
  wind_direction: 'NW',
  pressure: 1008,
  boundary_layer: 420,
  station: 'Thiruvottiyur',
  hotspots: [
    { lat: 13.22, lon: 80.32, aqi: 210, name: 'NCTPS' },
    { lat: 13.17, lon: 80.27, aqi: 185, name: 'Manali' },
    { lat: 13.11, lon: 80.30, aqi: 145, name: 'Chennai Port' },
  ],
};

export const api = {
  getCurrentAQI: async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/current`);
      return await res.json();
    } catch {
      return MOCK_DATA;
    }
  },
  getForecast: async (horizon: number) => {
    try {
      const res = await fetch(`${BASE_URL}/api/forecast/${horizon}`);
      return await res.json();
    } catch {
      return { horizon, stations: MOCK_DATA.hotspots };
    }
  },
  getRisk: async (profile: string, horizon: number) => {
    try {
      const res = await fetch(`${BASE_URL}/api/risk/${profile}/${horizon}`);
      return await res.json();
    } catch {
      return { risk: 'MEDIUM', message: 'Moderate air quality forecast.' };
    }
  },
};
