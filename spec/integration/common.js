import { Given, When, Then } from "cypress-cucumber-preprocessor/steps";
import $ from "./elements";
import { selector } from "./elements";
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
  const popup = `${selector(type)} button.confirm`;
  click(popup);
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
  cy.server()
    .route('POST', '/1/indexes/steplib_steps/browse**').as('steplib-steps')
    .route('POST', '/1/indexes/steplib_inputs/browse**').as('steplib-inputs');

  cy.visit(`http://localhost:${PORT}/${version}/#!/workflows`);

  cy.wait(['@steplib-steps', '@steplib-inputs']);
  // // TODO: cypress does not support polling :(
  // // https://github.com/cypress-io/cypress/issues/3308
  cy.wait(2000);
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
