// src/lib/countries.ts

export const COUNTRY_COORDS: Record<string, { lat: number; lng: number }> = {
  // --- AMÉRICA ---
  "United States": { lat: 37.0902, lng: -95.7129 },
  "USA": { lat: 37.0902, lng: -95.7129 }, // Alias común
  "Canada": { lat: 56.1304, lng: -106.3468 },
  "Mexico": { lat: 23.6345, lng: -102.5528 },
  "Brazil": { lat: -14.2350, lng: -51.9253 },
  "Argentina": { lat: -38.4161, lng: -63.6167 },
  "Chile": { lat: -35.6751, lng: -71.5430 },
  "Colombia": { lat: 4.5709, lng: -74.2973 },
  "Peru": { lat: -9.1900, lng: -75.0152 },
  "Cuba": { lat: 21.5218, lng: -77.7812 },
  "Costa Rica": { lat: 9.7489, lng: -83.7534 },
  "Panama": { lat: 8.5380, lng: -80.7821 },
  
  // --- EUROPA ---
  "Spain": { lat: 40.4637, lng: -3.7492 },
  "France": { lat: 46.2276, lng: 2.2137 },
  "Germany": { lat: 51.1657, lng: 10.4515 },
  "Italy": { lat: 41.8719, lng: 12.5674 },
  "United Kingdom": { lat: 55.3781, lng: -3.4360 },
  "UK": { lat: 55.3781, lng: -3.4360 }, // Alias
  "Portugal": { lat: 39.3999, lng: -8.2245 },
  "Netherlands": { lat: 52.1326, lng: 5.2913 },
  "Belgium": { lat: 50.5039, lng: 4.4699 },
  "Switzerland": { lat: 46.8182, lng: 8.2275 },
  "Austria": { lat: 47.5162, lng: 14.5501 },
  "Greece": { lat: 39.0742, lng: 21.8243 },
  "Sweden": { lat: 60.1282, lng: 18.6435 },
  "Norway": { lat: 60.4720, lng: 8.4689 },
  "Denmark": { lat: 56.2639, lng: 9.5018 },
  "Finland": { lat: 61.9241, lng: 25.7482 },
  "Poland": { lat: 51.9194, lng: 19.1451 },
  "Iceland": { lat: 64.9631, lng: -19.0208 },
  "Ireland": { lat: 53.1424, lng: -7.6921 },
  "Croatia": { lat: 45.1, lng: 15.2 },
  "Turkey": { lat: 38.9637, lng: 35.2433 },

  // --- ASIA ---
  "Japan": { lat: 36.2048, lng: 138.2529 },
  "China": { lat: 35.8617, lng: 104.1954 },
  "India": { lat: 20.5937, lng: 78.9629 },
  "Thailand": { lat: 15.8700, lng: 100.9925 },
  "Vietnam": { lat: 14.0583, lng: 108.2772 },
  "Indonesia": { lat: -0.7893, lng: 113.9213 },
  "South Korea": { lat: 35.9078, lng: 127.7669 },
  "Philippines": { lat: 12.8797, lng: 121.7740 },
  "Singapore": { lat: 1.3521, lng: 103.8198 },
  "Malaysia": { lat: 4.2105, lng: 101.9758 },
  "UAE": { lat: 23.4241, lng: 53.8478 },
  
  // --- ÁFRICA ---
  "Morocco": { lat: 31.7917, lng: -7.0926 },
  "South Africa": { lat: -30.5595, lng: 22.9375 },
  "Egypt": { lat: 26.8206, lng: 30.8025 },
  "Kenya": { lat: -0.0236, lng: 37.9062 },
  "Tanzania": { lat: -6.3690, lng: 34.8888 },
  
  // --- OCEANÍA ---
  "Australia": { lat: -25.2744, lng: 133.7751 },
  "New Zealand": { lat: -40.9006, lng: 174.8860 },
  
  // Añade más países aquí si Sanity tiene nombres diferentes
};