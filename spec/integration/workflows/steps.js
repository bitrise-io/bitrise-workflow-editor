import { Then } from "cypress-cucumber-preprocessor/steps";
import "../common";

Then('Workflow appeared with name {string}', (name) => {
  cy.get('.selected-workflow button.mak').contains(name);
});
