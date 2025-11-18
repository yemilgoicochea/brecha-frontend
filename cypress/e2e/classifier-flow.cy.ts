describe('Classifier flow', () => {
  it('classifies and shows results', () => {
    cy.visit('/classify');
    cy.contains('Identificar brechas').should('be.disabled');
    cy.get('input[placeholder="Ej: Electrificación rural"]').type('Proyecto E2E');
    cy.contains('Identificar brechas').click();
    cy.contains('Brechas').should('exist');
    cy.contains(/Brecha 1|Brecha A|Brecha B/).should('exist');
  });
});