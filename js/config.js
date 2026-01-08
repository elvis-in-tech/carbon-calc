/**
 * CONFIG - Global configuration object for Carbon Calculator
 * 
 * Contains:
 * - EMISSION_FACTORS: CO2 emission factors for different transport modes (kg CO₂/km)
 * - TRANSPORT_MODES: Metadata for each transport mode (label, icon, color)
 * - CARBON_CREDIT: Carbon credit pricing and conversion information
 * - populateDatalist(): Function to populate cities datalist from RoutesDB
 * - setupDistanceAutofill(): Function to handle automatic distance lookup
 */

const CONFIG = {
  // Emission factors in kg CO₂ per kilometer
  EMISSION_FACTORS: {
    bicycle: 0,
    car: 0.12,
    bus: 0.089,
    truck: 0.96
  },

  // Transport mode metadata with labels, icons, and colors
  TRANSPORT_MODES: {
    bicycle: {
      label: "Bicicleta",
      icon: "🚴",
      color: "#27ae60"  // Green
    },
    car: {
      label: "Carro",
      icon: "🚗",
      color: "#3498db"  // Blue
    },
    bus: {
      label: "Ônibus",
      icon: "🚌",
      color: "#9b59b6"  // Purple
    },
    truck: {
      label: "Caminhão",
      icon: "🛻",
      color: "#7f8c8d"  // Gray
    }
  },

  // Carbon credit information
  CARBON_CREDIT: {
    KG_PER_CREDIT: 1000,      // 1 credit = 1000 kg CO₂
    PRICE_MIN_BRL: 50,        // Minimum price in BRL
    PRICE_MAX_BRL: 150        // Maximum price in BRL
  },

  /**
   * populateDatalist()
   * Populates the cities datalist with all unique cities from RoutesDB
   * 
   * Creates option elements for each city and appends to the datalist element
   * with id 'cities-list'
   */
  populateDatalist: function() {
    // Get the datalist element
    const datalist = document.getElementById('cities-list');
    
    if (!datalist) {
      console.warn("Datalist element with id 'cities-list' not found");
      return;
    }

    // Clear existing options
    datalist.innerHTML = '';

    // Get all unique cities from RoutesDB
    const cities = RoutesDB.getAllCities();

    // Create and append option element for each city
    cities.forEach(city => {
      const option = document.createElement('option');
      option.value = city;
      datalist.appendChild(option);
    });

    console.log(`Populated datalist with ${cities.length} cities`);
  },

  /**
   * setupDistanceAutofill()
   * Sets up automatic distance lookup based on origin and destination inputs
   * 
   * Features:
   * - Listens to changes on origin and destination inputs
   * - Automatically fills distance if route is found in RoutesDB
   * - Makes distance field readonly when auto-filled
   * - Shows success/error messages via helper text
   * - Allows manual override via checkbox
   */
  setupDistanceAutofill: function() {
    // Get input elements
    const originInput = document.querySelector('input[name="origin"]');
    const destinationInput = document.querySelector('input[name="destination"]');
    const distanceInput = document.querySelector('input[name="distance"]');
    const manualCheckbox = document.querySelector('input[name="manual-distance"]');
    const helperText = document.querySelector('.calculator__help');

    // Validate required elements exist
    if (!originInput || !destinationInput || !distanceInput) {
      console.warn("Required input elements (origin, destination, distance) not found");
      return;
    }

    /**
     * Helper function to attempt auto-fill of distance
     */
    const attemptAutoFill = () => {
      // Skip if manual mode is enabled
      if (manualCheckbox && manualCheckbox.checked) {
        return;
      }

      // Get and trim values
      const origin = originInput.value.trim();
      const destination = destinationInput.value.trim();

      // Both fields must be filled
      if (!origin || !destination) {
        return;
      }

      // Try to find distance in RoutesDB
      const distance = RoutesDB.findDistance(origin, destination);

      if (distance !== null) {
        // Route found - fill distance and make readonly
        distanceInput.value = distance;
        distanceInput.readOnly = true;

        // Show success message
        if (helperText) {
          helperText.textContent = "✓ Rota encontrada automaticamente";
          helperText.style.color = "#27ae60";  // Green
        }
      } else {
        // Route not found - clear distance and show message
        distanceInput.value = '';
        distanceInput.readOnly = false;

        if (helperText) {
          helperText.textContent = "ℹ Rota não encontrada. Insira a distância manualmente.";
          helperText.style.color = "#e74c3c";  // Red
        }
      }
    };

    // Add change event listeners to origin and destination inputs
    originInput.addEventListener('change', attemptAutoFill);
    destinationInput.addEventListener('change', attemptAutoFill);

    // Add change listener to manual checkbox if it exists
    if (manualCheckbox) {
      manualCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          // Manual mode enabled - allow editing distance
          distanceInput.readOnly = false;

          if (helperText) {
            helperText.textContent = "ℹ Modo manual ativado. Insira a distância desejada.";
            helperText.style.color = "#f39c12";  // Orange
          }
        } else {
          // Manual mode disabled - try to find route again
          attemptAutoFill();
        }
      });
    }

    console.log("Distance autofill setup completed");
  }
};
