/**
 * Routes Database - City coordinates and distance lookup
 */
const ROUTES_DATA = {
  'São Paulo': { lat: -23.5505, lng: -46.6333 },
  'Rio de Janeiro': { lat: -22.9068, lng: -43.1729 },
  'Belo Horizonte': { lat: -19.9167, lng: -43.9345 },
  'Salvador': { lat: -12.9714, lng: -38.5014 },
  'Brasília': { lat: -15.8267, lng: -47.8711 },
  'Curitiba': { lat: -25.4284, lng: -49.2733 },
  'Manaus': { lat: -3.1190, lng: -60.0217 },
  'Belém': { lat: -1.4554, lng: -48.5039 },
  'Recife': { lat: -8.0476, lng: -34.8770 },
  'Fortaleza': { lat: -3.7319, lng: -38.5267 },
  'Porto Alegre': { lat: -30.0346, lng: -51.2177 },
  'Goiânia': { lat: -15.7942, lng: -48.0766 },
  'Campinas': { lat: -22.9068, lng: -47.0616 },
  'Santos': { lat: -23.9608, lng: -46.3338 },
  'Sorocaba': { lat: -23.5015, lng: -47.4584 }
};

/**
 * RoutesDB - Database object for city operations and distance calculations
 */
const RoutesDB = {
  /**
   * Haversine formula - Calculate distance between two coordinates
   * @param {number} lat1 - Latitude of first point
   * @param {number} lon1 - Longitude of first point
   * @param {number} lat2 - Latitude of second point
   * @param {number} lon2 - Longitude of second point
   * @returns {number} Distance in kilometers
   */
  haversineDistance: function(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  /**
   * Get all cities in the database
   * @returns {Array} Array of city names sorted alphabetically
   */
  getAllCities: function() {
    return Object.keys(ROUTES_DATA).sort();
  },

  /**
   * Find distance between two cities
   * @param {string} origin - Origin city name
   * @param {string} destination - Destination city name
   * @returns {number|null} Distance in km, or null if route not found
   */
  findDistance: function(origin, destination) {
    if (!ROUTES_DATA[origin] || !ROUTES_DATA[destination]) {
      return null;
    }

    const o = ROUTES_DATA[origin];
    const d = ROUTES_DATA[destination];

    const distance = this.haversineDistance(o.lat, o.lng, d.lat, d.lng);
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }
};
