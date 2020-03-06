import { Given, When, Then } from "cypress-cucumber-preprocessor/steps";
import $el, { selector, elements } from "./elements";

const PORT = Cypress.env('PORT')

Given('editor is open', () => {
  cy.visit(`http://localhost:${PORT}/1.3.0/#!/workflows`);
});

When('I click on {string}', (element) => {
    $el(element).click();
});

When('I select {string} from {string}', (value, element) => {
  $el(element).select(value);
});

When('I type {string} in {string}', (text, element) => {
  $el(element).type(text, { force: true }).trigger('input');
});

When('I confirm on {string} popup', (type) => {
  let selector = '#default-confirm-popup-body .yes';

  if (type === 'alert') {
    selector = '#default-alert-popup-body button';
  }

  cy.get(selector).click();
});

Then('I should see {string} in {string}', (text, element) => {
  $el(element).should($el => {
    expect($el).to.contain(text);
  });
});

Then('I should not see {string} in {string}', (text, element) => {
  $el(element).should($el => {
    expect($el).not.to.contain(text);
  })
});

Then('{string} should {string}', (element, expectation) => {
  const cExpectation = expectation.replace(/\s/g, '.');
  $el(element).should(cExpectation);
});

Then('I should not see {string}', (element) => {
  $el(element).should('not.be.visible');
});

Then('I save', () => {
  cy.get('button.save.rebo').then(btn => {
    if (!btn.is(':disabled')) {
      btn.click();
    }
  });
});
