describe('Classifier flow', () => {
  
  it('classifies and shows results', () => {
    cy.visit('/classify');
    
    // Button should be disabled until project name is entered
    cy.get('button[type="button"]:not([type="reset"])').first().should('be.disabled');
    
    // Enter project name
    cy.get('input[placeholder="Ej: Electrificación rural"]').type('Proyecto E2E');
    
    // Button should now be enabled
    cy.get('button[type="button"]:not([type="reset"])').first().should('not.be.disabled');
    
    // Click button
    cy.get('button[type="button"]:not([type="reset"])').first().click();
    
    // Verify results appear - check for either gaps or "No se identificaron brechas" message
    cy.contains(/Brechas|No se identificaron/i, { timeout: 10000 }).should('exist');
  });

  it('should respond in less than 5 seconds', () => {
    const startTime = Date.now();
    
    cy.visit('/classify');
    cy.get('input[name="projectName"]').type('PROYECTO DE AGUA POTABLE');
    cy.get('button[type="button"]:not([type="reset"])').first().click();
    
    // Wait for any results or gaps to appear
    cy.get('p').contains(/Sin brechas|Brecha|gap/i, { timeout: 5000 }).should('exist').then(() => {
      const elapsed = Date.now() - startTime;
      expect(elapsed).to.be.lessThan(5000);
    });
  });

  it('should show error message when API fails', () => {
    cy.intercept('POST', '**/api/v1/classify', {
      statusCode: 500,
      body: { error: 'Error temporal de la API' }
    }).as('classifyError');
    
    cy.visit('/classify');
    cy.get('input[name="projectName"]').type('PROYECTO TEST');
    cy.get('button[type="button"]:not([type="reset"])').first().click();
    
    cy.wait('@classifyError');
    cy.contains(/error|fallo/i).should('be.visible');
  });

  it('should display color indicators for confidence levels', () => {
    // Mock API response with different confidence levels
    cy.intercept('POST', '**/api/v1/classify', {
      statusCode: 200,
      body: {
        labels: [
          { id: 1, label: 'High confidence', confianza: 0.85, justificacion: 'High confidence test' },
          { id: 2, label: 'Medium confidence', confianza: 0.70, justificacion: 'Medium confidence test' },
          { id: 3, label: 'Low confidence', confianza: 0.45, justificacion: 'Low confidence test' }
        ]
      }
    }).as('classifyWithColors');
    
    cy.visit('/classify');
    cy.get('input[name="projectName"]').type('Test project');
    cy.get('button[type="button"]:not([type="reset"])').first().click();
    
    cy.wait('@classifyWithColors');
    
    // Verify green color indicator appears (confidence ≥80%)
    cy.get('[class*="bg-green-"][class*="text-green-"]').should('exist');
    
    // Verify yellow color indicator appears (confidence 60-79%)
    cy.get('[class*="bg-yellow-"][class*="text-yellow-"]').should('exist');
    
    // Verify red color indicator appears (confidence <60%)
    cy.get('[class*="bg-red-"][class*="text-red-"]').should('exist');
    
    // Verify percentages are displayed
    cy.contains('85%').should('exist');
    cy.contains('70%').should('exist');
    cy.contains('45%').should('exist');
  });
});
