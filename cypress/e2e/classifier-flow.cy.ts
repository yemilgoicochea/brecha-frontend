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
});