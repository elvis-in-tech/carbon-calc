/**
 * Calculator - Global calculator object for carbon emissions
 * 
 * Methods:
 * - calculateEmission(distanceKm, transportMode): Calculate CO₂ for a single transport mode
 * - calculateAllModes(distanceKm): Calculate emissions for all transport modes with comparison to car
 * - calculateSavings(emission, baselineEmission): Calculate CO₂ savings vs baseline
 * - calculateCarbonCredits(emissionKg): Convert kg CO₂ to carbon credits
 * - estimateCreditPrice(credits): Estimate price range for carbon credits
 */

const Calculator = {
  /**
   * calculateEmission(distanceKm, transportMode)
   * Calculates CO₂ emission for a given distance and transport mode
   * 
   * @param {number} distanceKm - Distance in kilometers
   * @param {string} transportMode - Transport mode key (e.g., 'car', 'bus')
   * @returns {number} CO₂ emission in kg, rounded to 2 decimal places
   */
  calculateEmission: function(distanceKm, transportMode) {
    const factor = CONFIG.EMISSION_FACTORS[transportMode];
    const emission = distanceKm * factor;
    return Math.round(emission * 100) / 100;
  },

  /**
   * calculateAllModes(distanceKm)
   * Calculates emissions for all transport modes and compares to car baseline
   * 
   * @param {number} distanceKm - Distance in kilometers
   * @returns {Array} Array of objects with mode, emission, and percentageVsCar
   *                  Sorted by emission (lowest first)
   */
  calculateAllModes: function(distanceKm) {
    const results = [];
    const carEmission = this.calculateEmission(distanceKm, 'car');

    // Calculate emission for each transport mode
    for (const mode in CONFIG.EMISSION_FACTORS) {
      const emission = this.calculateEmission(distanceKm, mode);
      const percentageVsCar = (emission / carEmission) * 100;

      results.push({
        mode: mode,
        emission: emission,
        percentageVsCar: Math.round(percentageVsCar * 100) / 100
      });
    }

    // Sort by emission (lowest first)
    results.sort((a, b) => a.emission - b.emission);

    return results;
  },

  /**
   * calculateSavings(emission, baselineEmission)
   * Calculates CO₂ savings compared to a baseline emission
   * 
   * @param {number} emission - Actual emission in kg CO₂
   * @param {number} baselineEmission - Baseline emission in kg CO₂
   * @returns {Object} Object with savedKg and percentage (both rounded to 2 decimals)
   */
  calculateSavings: function(emission, baselineEmission) {
    const savedKg = baselineEmission - emission;
    const percentage = (savedKg / baselineEmission) * 100;

    return {
      savedKg: Math.round(savedKg * 100) / 100,
      percentage: Math.round(percentage * 100) / 100
    };
  },

  /**
   * calculateCarbonCredits(emissionKg)
   * Converts kg of CO₂ emission to number of carbon credits
   * 
   * @param {number} emissionKg - Emission in kg CO₂
   * @returns {number} Number of carbon credits, rounded to 2 decimal places
   */
  calculateCarbonCredits: function(emissionKg) {
    const credits = emissionKg / CONFIG.CARBON_CREDIT.KG_PER_CREDIT;
    return Math.round(credits * 100) / 100;
  },

  /**
   * estimateCreditPrice(credits)
   * Estimates price range for a given number of carbon credits
   * 
   * @param {number} credits - Number of carbon credits
   * @returns {Object} Object with min, max, and average prices in BRL
   *                   All values rounded to 2 decimal places
   */
  estimateCreditPrice: function(credits) {
    const min = credits * CONFIG.CARBON_CREDIT.PRICE_MIN_BRL;
    const max = credits * CONFIG.CARBON_CREDIT.PRICE_MAX_BRL;
    const average = (min + max) / 2;

    return {
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      average: Math.round(average * 100) / 100
    };
  }
};
