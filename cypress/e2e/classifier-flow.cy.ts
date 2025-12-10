describe('Classifier flow', () => {
  
  it('classifies and shows results', () => {
    cy.visit('/classify');
    cy.contains('Identificar brechas').should('be.disabled');
    cy.get('input[placeholder="Ej: Electrificación rural"]').type('Proyecto E2E');
    cy.contains('Identificar brechas').click();
    cy.contains('Brechas').should('exist');
    cy.contains(/Brecha 1|Brecha A|Brecha B/).should('exist');
  });

  it('should respond in less than 5 seconds', () => {
    const startTime = Date.now();
    
    cy.visit('/classify');
    cy.get('input[name="projectName"]').type('PROYECTO DE AGUA POTABLE');
    cy.get('button').contains('Identificar brechas').click();
    
    cy.get('.gap-card, [class*="gap"]', { timeout: 5000 }).should('exist').then(() => {
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
    cy.get('button').contains('Identificar brechas').click();
    
    cy.wait('@classifyError');
    cy.contains(/error|fallo/i).should('be.visible');
  });
});