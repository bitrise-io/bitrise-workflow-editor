import { Given, When, Then } from "cypress-cucumber-preprocessor/steps";
import $, { selector } from "./elements";
import { styleValueSelector } from "./styles";
import { typeKeySelector } from "./typeKeys";
import { version } from "../../package.json";

const PORT = Cypress.env("PORT");

export const click = element => {
	$(element).click();
};

export const clickAway = () => {
	click("main header:eq(0)");
};

export const clear = element => {
	$(element).clear();
};

export const pressKey = key => {
	$("body").type(typeKeySelector(key));
};

export const select = (value, element) => {
	$(element).then(elem => {
		if (!elem.is("select")) {
			click(element);
			return click(value);
		}

		$(elem).select(value);
	});
};

export const type = (text, element) => {
	$(element)
		.type(text, { force: true })
		.trigger("input");
};

export const toggleCheckbox = (element, checked) => {
	if (checked) {
		$(element).check();
	} else {
		$(element).uncheck();
	}
};

export const popupButtonClick = (popup, buttonType) => {
	const popupButton = `${selector(popup)} [data-e2e-tag="${buttonType}-button"]`;
	click(popupButton);
};

export const popupConfirm = popup => {
	popupButtonClick(popup, "confirm");
};

export const popupCancel = popup => {
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
	});
};

export const save = () => {
	cy.get("button.save.rebo").then(btn => {
		if (!btn.is(":disabled")) {
			btn.click();
		}
	});
};

export const wait = ms => {
	cy.wait(ms);
};

export const should = (element, expectation) => {
	let [shouldExpr, ...values] = expectation.split(":");
	const trimmedValues = values.map(val => val.trim());

	shouldExpr = shouldExpr.replace(/\s/g, ".");

	if (trimmedValues) {
		return $(element).should(shouldExpr, ...trimmedValues);
	}

	$(element).should(shouldExpr);
};

Given("editor is open", () => {
	cy.server()
		.route("POST", "/1/indexes/steplib_steps/**", "fixture:steps.json")
		.as("steplib-steps")
		.route("POST", "/1/indexes/steplib_inputs/**", "fixture:inputs.json")
		.as("steplib-inputs");

	cy.visit(`http://localhost:${PORT}/${version}/#!/workflows`);

	// // TODO: cypress does not support polling :(
	// // https://github.com/cypress-io/cypress/issues/3308
	cy.wait(3000);
});

Given("{string} workflow is selected", workflow => {
	click("Selected Workflow Name");
	click(`${workflow} workflow`);
});

When("I click on {string}", click);
When("I click away", clickAway);
When("I clear {string}", clear);
When("I press {string}", pressKey);
When("I select {string} from {string}", select);
When("I type {string} in {string}", type);
When("I check {string}", element => toggleCheckbox(element, true));
When("I uncheck {string}", element => toggleCheckbox(element));
When("I confirm on {string}", popupConfirm);
When("I cancel on {string}", popupCancel);
Then("I should see {string} in {string}", assertInputValueEQ);
Then("I should not see {string} in {string}", assertNotInputValueNotEQ);
Then("I wait {int}", wait);
Then("{string} should {string}", should);
Then("{string} should contain {int} {string}", (element, expectation, childElement) => {
	$(element)
		.find(selector(childElement))
		.should("have.length", expectation);
});

Then("{string} should have {string} {string} style", (element, cssValue, cssProperty) => {
	$(element).should("have.css", cssProperty, styleValueSelector(cssValue));
});

Then("I save", save);
