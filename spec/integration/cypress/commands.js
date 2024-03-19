Cypress.Commands.add("waitForSteps", () => {
  // TODO: cypress does not support polling :(
  // https://github.com/cypress-io/cypress/issues/3308
  cy.wait(["@steplib-inputs"]);
  cy.wait(3000);
});

Cypress.Commands.add("loadSteps", (cb) => {
  cy.intercept("POST", "/1/indexes/steplib_inputs/**").as("steplib-inputs");
  cy.fixture("steps.json").then((steps) => {
    cy.intercept("POST", "/1/indexes/steplib_steps/**", (req) => {
      req.reply({
        body: steps
      });
    }).as("steplib-steps");

    cb();
    cy.waitForSteps();
  });
});
