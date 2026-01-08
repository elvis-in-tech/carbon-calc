/**
 * Global UI object containing utility and rendering methods
 * for the Carbon Calculator application
 */
const UI = {
  /**
   * UTILITY METHODS
   */

  /**
   * Formats a number with specified decimals and thousand separators
   * @param {number} number - The number to format
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted number string
   */
  formatNumber: function(number, decimals) {
    // Use toFixed() for decimals, then replace period with comma for pt-BR
    const fixed = parseFloat(number).toFixed(decimals);
    // Add thousand separators using toLocaleString for pt-BR
    return parseFloat(fixed).toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  },

  /**
   * Formats a value as Brazilian currency (R$)
   * @param {number} value - The value to format
   * @returns {string} Formatted currency string in "R$ 1.234,56" format
   */
  formatCurrency: function(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  },

  /**
   * Shows an element by removing 'hidden' class
   * @param {string} elementId - The ID of the element to show
   */
  showElement: function(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.remove('hidden');
    }
  },

  /**
   * Hides an element by adding 'hidden' class
   * @param {string} elementId - The ID of the element to hide
   */
  hideElement: function(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.add('hidden');
    }
  },

  /**
   * Scrolls to an element with smooth behavior
   * @param {string} elementId - The ID of the element to scroll to
   */
  scrollToElement: function(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  },

  /**
   * RENDERING METHODS
   */

  /**
   * Renders the results section with route, distance, emissions, and transport info
   * @param {object} data - Contains origin, destination, distance, emission, mode, savings
   * @returns {string} Complete HTML string for results
   */
  renderResults: function(data) {
    const modeMetadata = CONFIG.TRANSPORT_MODES[data.mode];
    
    // Build route card
    const routeCard = `
      <div class="results__card results__card--route">
        <div class="results__card-header">📍 Rota</div>
        <div class="results__card-content">
          <span class="results__origin">${data.origin}</span>
          <span class="results__arrow">→</span>
          <span class="results__destination">${data.destination}</span>
        </div>
      </div>
    `;

    // Build distance card
    const distanceCard = `
      <div class="results__card results__card--distance">
        <div class="results__card-header">📏 Distância</div>
        <div class="results__card-content">
          <span class="results__distance">${this.formatNumber(data.distance, 2)}</span>
          <span class="results__unit">km</span>
        </div>
      </div>
    `;

    // Build emission card with leaf icon
    const emissionCard = `
      <div class="results__card results__card--emission">
        <div class="results__card-header">🌍 Emissão CO₂</div>
        <div class="results__card-content">
          <span class="results__icon">🍃</span>
          <div>
            <span class="results__emission">${this.formatNumber(data.emission, 2)}</span>
            <span class="results__unit">kg</span>
          </div>
        </div>
      </div>
    `;

    // Build transport card
    const transportCard = `
      <div class="results__card results__card--transport">
        <div class="results__card-header">🚗 Transporte</div>
        <div class="results__card-content">
          <span class="results__icon">${modeMetadata.icon}</span>
          <span class="results__mode">${modeMetadata.label}</span>
        </div>
      </div>
    `;

    // Build savings card if applicable
    let savingsCard = '';
    if (data.mode !== 'car' && data.savings) {
      const savingsPercentage = ((data.savings.savedKg / data.savings.carEmission) * 100).toFixed(1);
      savingsCard = `
        <div class="results__card results__card--savings">
          <div class="results__card-header">✅ Economia</div>
          <div class="results__card-content">
            <div style="display: flex; align-items: baseline; gap: 4px;">
              <span class="results__savings-amount">${this.formatNumber(data.savings.savedKg, 2)}</span>
              <span class="results__unit">kg CO₂</span>
            </div>
            <span class="results__savings-percentage">${savingsPercentage}%</span>
          </div>
        </div>
      `;
    }

    // Combine all cards
    return `
      <div class="results__container">
        ${routeCard}
        ${distanceCard}
        ${emissionCard}
        ${transportCard}
        ${savingsCard}
      </div>
    `;
  },

  /**
   * Renders the comparison section showing all transport modes
   * @param {array} modesArray - Array of mode objects from Calculator.calculateAllModes()
   * @param {string} selectedMode - The currently selected transport mode
   * @returns {string} Complete HTML string for comparison
   */
  renderComparison: function(modesArray, selectedMode) {
    // Find max emission for progress bar reference
    const maxEmission = Math.max(...modesArray.map(m => m.emission));
    
    // Find car emission for percentage calculation
    const carMode = modesArray.find(m => m.mode === 'car');
    const carEmission = carMode ? carMode.emission : 0;

    // Build comparison items
    const comparisonItems = modesArray.map(modeData => {
      const modeMetadata = CONFIG.TRANSPORT_MODES[modeData.mode];
      const isSelected = modeData.mode === selectedMode;
      const emissionPercentage = carEmission > 0 
        ? ((modeData.emission / carEmission) * 100).toFixed(1)
        : 0;
      const barPercentage = (modeData.emission / maxEmission) * 100;
      
      // Determine color based on percentage
      let barColor = 'green';
      if (barPercentage > 25 && barPercentage <= 75) barColor = 'yellow';
      else if (barPercentage > 75 && barPercentage <= 100) barColor = 'orange';
      else if (barPercentage > 100) barColor = 'red';

      const selectedClass = isSelected ? ' comparison__item--selected' : '';
      const selectedBadge = isSelected 
        ? `<span class="comparison__badge">✨ Selecionado</span>` 
        : '';

      return `
        <div class="comparison__item${selectedClass}">
          <div class="comparison__item-header">
            <span class="comparison__icon">${modeMetadata.icon}</span>
            <span class="comparison__label">${modeMetadata.label}</span>
            ${selectedBadge}
          </div>
          
          <div class="comparison__item-stats">
            <div class="comparison__stat">
              <span class="comparison__stat-label">Emissão</span>
              <span class="comparison__stat-value">${this.formatNumber(modeData.emission, 2)} kg</span>
            </div>
            <div class="comparison__stat">
              <span class="comparison__stat-label">vs Carro</span>
              <span class="comparison__stat-value">${emissionPercentage}%</span>
            </div>
          </div>

          <div class="comparison__bar">
            <div class="comparison__bar-fill ${barColor}" 
                 style="width: ${Math.min(barPercentage, 100)}%"></div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="comparison__container">
        ${comparisonItems}
      </div>
    `;
  },

  /**
   * Renders the carbon credits section
   * @param {object} creditsData - Contains credits amount and price object with min, max, average
   * @returns {string} Complete HTML string for carbon credits
   */
  renderCarbonCredits: function(creditsData) {
    const creditsNeeded = creditsData.credits || 0;
    const priceData = creditsData.price || { min: 0, max: 0, average: 0 };
    const emission = creditsData.emission || 0;

    // Build credits and price cards
    const creditsCard = `
      <div class="carbon-credits__item">
        <div class="carbon-credits__item-icon">🎫</div>
        <div class="carbon-credits__item-label">Créditos Necessários</div>
        <div class="carbon-credits__item-value">${this.formatNumber(creditsNeeded, 2)}</div>
        <div class="carbon-credits__item-unit">créditos de carbono</div>
      </div>
    `;

    const priceCard = `
      <div class="carbon-credits__item">
        <div class="carbon-credits__item-icon">💵</div>
        <div class="carbon-credits__item-label">Preço Estimado</div>
        <div class="carbon-credits__item-value">${this.formatCurrency(priceData.average)}</div>
        <div class="carbon-credits__item-unit">${this.formatCurrency(priceData.min)} — ${this.formatCurrency(priceData.max)}</div>
      </div>
    `;

    // Build equivalences
    const equivalenceItems = [
      {
        icon: '🌳',
        text: 'Equivalente a',
        value: this.formatNumber(emission / 12, 1),
        unit: 'árvores plantadas por ano'
      },
      {
        icon: '⚡',
        text: 'Equivalente a',
        value: this.formatNumber(emission * 0.25 / 1000, 2),
        unit: 'MWh de eletricidade'
      },
      {
        icon: '🏎️',
        text: 'Equivalente a',
        value: this.formatNumber(emission / 0.2, 0),
        unit: 'km rodados por carro'
      }
    ].map(item => `
      <div class="carbon-credits__equivalence-item">
        <span class="carbon-credits__equivalence-icon">${item.icon}</span>
        <span class="carbon-credits__equivalence-text">${item.text}</span>
        <div style="display: flex; align-items: baseline; gap: 4px;">
          <span class="carbon-credits__equivalence-value">${item.value}</span>
          <span style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">${item.unit}</span>
        </div>
      </div>
    `).join('');

    const equivalenceBox = `
      <div class="carbon-credits__equivalence">
        <div class="carbon-credits__equivalence-title">
          📊 Entenda o Impacto
        </div>
        ${equivalenceItems}
      </div>
    `;

    return `
      <div class="carbon-credits__grid">
        ${creditsCard}
        ${priceCard}
      </div>
      ${equivalenceBox}
      <p style="font-size: var(--font-size-xs); color: var(--color-text-secondary); text-align: center; margin-top: var(--space-lg);">
        💡 Os créditos de carbono permitem compensar suas emissões apoiando projetos sustentáveis.
      </p>
    `;
  },

  /**
   * LOADING STATE METHODS
   */

  /**
   * Shows loading state on a button element
   * @param {HTMLElement} buttonElement - The button element to show loading on
   */
  showLoading: function(buttonElement) {
    if (!buttonElement) return;
    
    // Save original text in data attribute
    buttonElement.dataset.originalText = buttonElement.textContent;
    
    // Disable button
    buttonElement.disabled = true;
    
    // Change HTML to spinner + text
    buttonElement.innerHTML = '<span class="spinner"></span> Calculando...';
  },

  /**
   * Hides loading state on a button element and restores original text
   * @param {HTMLElement} buttonElement - The button element to restore
   */
  hideLoading: function(buttonElement) {
    if (!buttonElement) return;
    
    // Enable button
    buttonElement.disabled = false;
    
    // Restore original text from data attribute
    const originalText = buttonElement.dataset.originalText || 'Calcular';
    buttonElement.textContent = originalText;
  }
};
