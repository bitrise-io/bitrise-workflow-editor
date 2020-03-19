import { Given, When, Then } from "cypress-cucumber-preprocessor/steps";
import $, { selector } from "./elements";
import { styleValueSelector } from "./styles";
import { typeKeySelector } from "./typeKeys";
import { version } from '../../package.json';

const PORT = Cypress.env('PORT');

export const click = (element) => {
  $(element).click();
};

export const clickAway = () => {
  click('main header');
};

export const clear = (element) => {
  $(element).clear();
};

export const pressKey = (key) => {
  $("body").type(typeKeySelector(key));
};

export const select = (value, element) => {
	$(element).then(elem => {
		if (!elem.is('select')) {
			click(element);
			return click(value);
		}

		$(elem).select(value);
	});
};

export const type = (text, element) => {
  $(element).type(text, { force: true }).trigger('input');
};

export const popupButtonClick = (popup, buttonType) => {
  const popupButton = `${selector(popup)} [data-e2e-tag="${buttonType}-button"]`;
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

export const wait = (ms) => {
	cy.wait(ms);
};

Given('editor is open', () => {
  cy.server()
    .route('POST', '/1/indexes/steplib_steps/browse**').as('steplib-steps')
    .route('POST', '/1/indexes/steplib_inputs/browse**').as('steplib-inputs');

  cy.visit(`http://localhost:${PORT}/${version}/#!/workflows`);

	cy.wait(['@steplib-steps', '@steplib-inputs']);

  // // TODO: cypress does not support polling :(
  // // https://github.com/cypress-io/cypress/issues/3308
  cy.wait(3000);
});

Given('{string} workflow is selected', (workflow) => {
  click("Selected Workflow Name");
  click(`${workflow} workflow`);
});

When('I click on {string}', click);
When('I click away', clickAway);
When('I clear {string}', clear);
When('I press {string}', pressKey);
When('I select {string} from {string}', select);
When('I type {string} in {string}', type);
When('I confirm on {string}', popupConfirm);
When('I cancel on {string}', popupCancel);
Then('I should see {string} in {string}', assertInputValueEQ);
Then('I should not see {string} in {string}', assertNotInputValueNotEQ);
Then('I wait {int}', wait);

Then('{string} should {string}', (element, expectation) => {
	let [shouldExpr, value] = expectation.split(':');
	shouldExpr = shouldExpr.replace(/\s/g, '.');

	if (value) {
		return $(element).should(shouldExpr, value.trim());
	}

  $(element).should(shouldExpr);
});
Then('{string} should contain {int} {string}', (element, expectation, childElement) => {
  $(element).find(selector(childElement)).should("have.length", expectation);
});

Then('{string} should have {string} {string} style', (element, cssValue, cssProperty) => {
  $(element).should("have.css", cssProperty, styleValueSelector(cssValue));
});

Then('I save', save);
