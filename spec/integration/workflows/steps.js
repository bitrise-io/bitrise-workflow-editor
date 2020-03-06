import { Then } from "cypress-cucumber-preprocessor/steps";
import $el, { elements } from '../elements';
import "../common";

afterEach(() => {
  $el(elements["Discard Button"]).then(btn => {
    if (!btn.is(':disabled')) {
      btn.click();
    }
  });
});

Then('Workflow appeared with name {string}', (name) => {
  cy.get('.selected-workflow button.mak').contains(name);
});
