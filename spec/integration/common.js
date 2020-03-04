import { Given, When, Then } from "cypress-cucumber-preprocessor/steps";
import el from "./elements";

Given('editor is open', () => {
  cy.visit("http://localhost:57850/1.3.0/#!/workflows");
});

When('I click on {string}', (element) => {
    cy.get(el(element)).click();
});

When('I select {string} from {string}', (value, element) => {
  cy.get(el(element)).select(value);
});

When('I type {string} in {string}', (text, element) => {
  cy.get(el(element)).type(text, { force: true }).trigger('input');
});

When('I confirm on popup', () => {
  cy.get('#default-confirm-popup-body .yes').click();
});

Then('I should see {string}', (element) => {
    cy.get(el(element)).should('be.visible');
});

Then('I should not see text {string} in {string}', (text, element) => {
  cy.get(el(element)).should($el => {
    expect($el).not.to.contain(text);
  })
});

Then('I should not see {string}', (element) => {
  cy.get(el(element)).should('not.be.visible');
});

// force saving workflow if we can after every scenario!
afterEach(() => {
  cy.get('button.save.rebo').then(btn => {
    if (!btn.is(':disabled')) {
      btn.click();
    }
  });
});
