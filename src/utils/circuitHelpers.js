// Helper functions for circuit location and coordinates
// These are simplified versions - you may want to expand these based on your needs

export const getCircuitLocation = (circuitName) => {
  // Basic mapping of circuit names to cities
  // You can expand this with your full mapping from the native app
  const circuitCityMap = {
    "Bahrain International Circuit": { city: "Sakhir" },
    "Jeddah Corniche Circuit": { city: "Jeddah" },
    "Albert Park Grand Prix Circuit": { city: "Melbourne" },
    "Shanghai International Circuit": { city: "Shanghai" },
    "Suzuka Circuit": { city: "Suzuka" },
    "Miami International Autodrome": { city: "Miami" },
    "Circuit de Monaco": { city: "Monaco" },
    "Circuit Gilles Villeneuve": { city: "Montreal" },
    "Circuit de Barcelona-Catalunya": { city: "Barcelona" },
    "Red Bull Ring": { city: "Spielberg" },
    "Silverstone Circuit": { city: "Silverstone" },
    "Hungaroring": { city: "Budapest" },
    "Circuit de Spa-Francorchamps": { city: "Spa" },
    "Circuit Zandvoort": { city: "Zandvoort" },
    "Autodromo Nazionale Monza": { city: "Monza" },
    "Baku City Circuit": { city: "Baku" },
    "Marina Bay Street Circuit": { city: "Singapore" },
    "Circuit of the Americas": { city: "Austin" },
    "Autodromo Hermanos Rodriguez": { city: "Mexico City" },
    "Autodromo Jose Carlos Pace": { city: "Sao Paulo" },
    "Las Vegas Strip Street Circuit": { city: "Las Vegas" },
    "Lusail International Circuit": { city: "Doha" },
    "Yas Marina Circuit": { city: "Abu Dhabi" },
  };

  return circuitCityMap[circuitName] || null;
};

export const getCircuitCoordinates = (city, circuitName) => {
  // Basic mapping of cities/circuits to coordinates
  // You can expand this with your full mapping from the native app
  const coordinatesMap = {
    "Sakhir": { lat: 26.0325, lon: 50.5106 },
    "Jeddah": { lat: 21.6319, lon: 39.1044 },
    "Melbourne": { lat: -37.8497, lon: 144.9680 },
    "Shanghai": { lat: 31.3389, lon: 121.2200 },
    "Suzuka": { lat: 34.8431, lon: 136.5414 },
    "Miami": { lat: 25.9581, lon: -80.2389 },
    "Monaco": { lat: 43.7347, lon: 7.4206 },
    "Montreal": { lat: 45.5017, lon: -73.5228 },
    "Barcelona": { lat: 41.5700, lon: 2.2611 },
    "Spielberg": { lat: 47.2197, lon: 14.7647 },
    "Silverstone": { lat: 52.0786, lon: -1.0169 },
    "Budapest": { lat: 47.5789, lon: 19.2486 },
    "Spa": { lat: 50.4372, lon: 5.9714 },
    "Zandvoort": { lat: 52.3888, lon: 4.5442 },
    "Monza": { lat: 45.6156, lon: 9.2811 },
    "Baku": { lat: 40.3725, lon: 49.8533 },
    "Singapore": { lat: 1.2914, lon: 103.8640 },
    "Austin": { lat: 30.1327, lon: -97.6351 },
    "Mexico City": { lat: 19.4042, lon: -99.0907 },
    "Sao Paulo": { lat: -23.7036, lon: -46.6997 },
    "Las Vegas": { lat: 36.1147, lon: -115.1728 },
    "Doha": { lat: 25.4901, lon: 51.4542 },
    "Abu Dhabi": { lat: 24.4672, lon: 54.6031 },
  };

  return coordinatesMap[city] || null;
};

