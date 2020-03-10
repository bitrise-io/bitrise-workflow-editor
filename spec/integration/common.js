import { Given, When, Then } from "cypress-cucumber-preprocessor/steps";
import $, { selector } from "./elements";
import { version } from '../../package.json';

const PORT = Cypress.env('PORT');

export const click = (element) => {
  $(element).click();
};

export const select = (value, element) => {
  $(element).select(value);
};

export const type = (text, element) => {
  $(element).type(text, { force: true }).trigger('input');
};

export const popupConfirm = (type) => {
  let selector = '#default-confirm-popup-body .yes';

  if (type === 'alert') {
    selector = '#default-alert-popup-body button';
  }

  cy.get(selector).click();
};

export const assertInputValueEQ = (value, element) => {
  $(element).should($el => {
    expect($el).to.contain(value);
  });
};

export const assertNotInputValueNotEQ = (text, element) => {
  $(element).should($el => {
    expect($el).not.to.contain(text);
  })
};

export const save = () => {
  cy.get('button.save.rebo').then(btn => {
    if (!btn.is(':disabled')) {
      btn.click();
    }
  });
};

Given('editor is open', () => {
  cy.visit(`http://localhost:${PORT}/${version}/#!/workflows`);
});

When('I click on {string}', click);
When('I select {string} from {string}', select);
When('I type {string} in {string}', type);
When('I confirm on {string} popup', popupConfirm);
Then('I should see {string} in {string}', assertInputValueEQ);
Then('I should not see {string} in {string}', assertNotInputValueNotEQ);

Then('{string} should {string}', (element, expectation) => {
  const cExpectation = expectation.replace(/\s/g, '.');
  $(element).should(cExpectation);
});

Then('I save', save);
