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

export const popupButtonClick = (popup, buttonType) => {
  const popupButton = `${selector(popup)} button.${buttonType}`;
  click(popupButton);
};

export const popupConfirm = (popup) => {
  popupButtonClick(popup, "confirm");
};

export const popupCancel = (popup) => {
  popupButtonClick(popup, "cancel");
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

Given('add workflow popup is open', () => {
  click('Add Worklow Button');
});

When('I click on {string}', click);
When('I select {string} from {string}', select);
When('I type {string} in {string}', type);
When('I confirm on {string}', popupConfirm);
When('I cancel on {string}', popupCancel);
Then('I should see {string} in {string}', assertInputValueEQ);
Then('I should not see {string} in {string}', assertNotInputValueNotEQ);

Then('{string} should {string}', (element, expectation) => {
  const cExpectation = expectation.replace(/\s/g, '.');
  $(element).should(cExpectation);
});
Then('{string} should have number of {string}', (element, expectation) => {
  $(element).should("have.length", expectation);
});

Then('I save', save);
