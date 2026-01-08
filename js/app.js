/**
 * Carbon Calculator Application
 * Handles initialization and form submission logic
 */

// Wait for DOM to be ready before initializing
document.addEventListener('DOMContentLoaded', function() {
  /**
   * INITIALIZATION
   */

  // Populate city datalist for autocomplete
  CONFIG.populateDatalist();

  // Enable automatic distance autofill when destination is selected
  CONFIG.setupDistanceAutofill();

  // Get the calculator form element
  const calculatorForm = document.getElementById('calculator-form');

  // Add submit event listener to form
  if (calculatorForm) {
    calculatorForm.addEventListener('submit', handleFormSubmit);
  }

  // Log successful initialization
  console.log('✅ Calculadora inicializada!');
});

/**
 * FORM SUBMIT HANDLER
 * Processes the calculator form submission
 * @param {Event} event - The form submit event
 */
function handleFormSubmit(event) {
  // Prevent default form submission behavior
  event.preventDefault();

  /**
   * STEP 1: Extract form values
   */
  const form = event.target;
  const origin = form.querySelector('input[name="origin"]').value.trim();
  const destination = form.querySelector('input[name="destination"]').value.trim();
  const distance = parseFloat(form.querySelector('input[name="distance"]').value);
  const transportMode = form.querySelector('input[name="transport"]:checked').value;

  /**
   * STEP 2: Validate inputs
   */
  if (!origin || !destination || !distance || distance <= 0) {
    alert('❌ Por favor, preencha todos os campos com valores válidos. A distância deve ser maior que 0.');
    return;
  }

  /**
   * STEP 3: Get submit button and show loading state
   */
  const submitButton = form.querySelector('button[type="submit"]');
  UI.showLoading(submitButton);

  /**
   * STEP 4: Hide previous results sections
   */
  UI.hideElement('results-section');
  UI.hideElement('comparison-section');
  UI.hideElement('carbon-credits-section');

  /**
   * STEP 5: Simulate processing delay and perform calculations
   */
  setTimeout(function() {
    try {
      /**
       * CALCULATIONS
       */

      // Calculate emission for selected transport mode
      const selectedModeEmission = Calculator.calculateEmission(
        distance,
        transportMode
      );

      // Calculate car emission as baseline for comparison
      const carEmission = Calculator.calculateEmission(distance, 'car');

      // Calculate savings if mode is not car
      const savings = transportMode !== 'car'
        ? {
            emission: carEmission - selectedModeEmission,
            carEmission: carEmission
          }
        : null;

      // Calculate all modes for comparison chart
      const allModesComparison = Calculator.calculateAllModes(distance);

      // Calculate carbon credits needed and price estimate
      const creditsNeeded = Calculator.calculateCarbonCredits(selectedModeEmission);
      const creditsPrice = Calculator.estimateCreditPrice(creditsNeeded);
      
      const creditsData = {
        credits: creditsNeeded,
        price: creditsPrice,
        emission: selectedModeEmission
      };

      /**
       * BUILD DATA OBJECTS
       */

      // Results data object
      const resultsData = {
        origin: origin,
        destination: destination,
        distance: distance,
        emission: selectedModeEmission,
        mode: transportMode,
        savings: savings
      };

      // Render and display results
      const resultsHTML = UI.renderResults(resultsData);
      const resultsContent = document.getElementById('results-content');
      if (resultsContent) {
        resultsContent.innerHTML = resultsHTML;
      }

      // Render and display comparison
      const comparisonHTML = UI.renderComparison(allModesComparison, transportMode);
      const comparisonContent = document.getElementById('comparison-content');
      if (comparisonContent) {
        comparisonContent.innerHTML = comparisonHTML;
      }

      // Render and display carbon credits
      const creditsHTML = UI.renderCarbonCredits(creditsData);
      const creditsContent = document.getElementById('carbon-credits-content');
      if (creditsContent) {
        creditsContent.innerHTML = creditsHTML;
      }

      /**
       * SHOW RESULTS AND SCROLL
       */

      // Show all result sections
      UI.showElement('results-section');
      UI.showElement('comparison-section');
      UI.showElement('carbon-credits-section');

      // Scroll to results section smoothly
      UI.scrollToElement('results-section');

      /**
       * STOP LOADING
       */

      // Hide loading state and restore button text
      UI.hideLoading(submitButton);

    } catch (error) {
      /**
       * ERROR HANDLING
       */

      // Log error to console for debugging
      console.error('🧠 Erro ao calcular emissões:', error);

      // Show user-friendly error message
      alert('❌ Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.');

      // Hide loading state on error
      UI.hideLoading(submitButton);
    }

  }, 1500); // 1.5 second delay to simulate processing
}
