import { Given, Then, When } from "cypress-cucumber-preprocessor/steps";

import { version } from "../../package.json";
import $, { selector } from "./elements";
import { styleValueSelector } from "./styles";
import { typeKeySelector } from "./typeKeys";

const PORT = Cypress.env("PORT");

export const click = (element) => {
	$(element).click();
};

export const clickAway = () => {
	click("#away");
};

export const clear = (element) => {
	$(element).clear();
};

export const pressKey = (key) => {
	$("body").type(typeKeySelector(key));
};

export const select = (value, element) => {
	$(element).then((elem) => {
		if (!elem.is("select")) {
			click(element);
			return click(value);
		}

		$(elem).select(value);
	});
};

export const type = (text, element) => {
	$(element).type(text, { force: true }).trigger("input");
};

export const toggleCheckbox = (element, checked) => {
	if (checked) {
		$(element).check({ force: true });
	} else {
		$(element).uncheck({ force: true });
	}
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
	$(element).should(($el) => {
		expect($el).to.contain(value);
	});
};

export const assertNotInputValueNotEQ = (text, element) => {
	$(element).should(($el) => {
		expect($el).not.to.contain(text);
	});
};

export const save = () => {
	cy.get("button.save.rebo").then((btn) => {
		if (!btn.is(":disabled")) {
			btn.click();
		}
	});
};

export const wait = (ms) => {
	cy.wait(ms);
};

export const should = (element, expectation) => {
	let [shouldExpr, ...values] = expectation.split(":");
	const trimmedValues = values.map((val) => val.trim());

	shouldExpr = shouldExpr.replace(/\s/g, ".");

	if (trimmedValues) {
		return $(element).should(shouldExpr, ...trimmedValues);
	}

	$(element).should(shouldExpr);
};

const changeTab = (newTab) => {
	click(newTab);

	if (newTab === "Workflows tab") {
		cy.waitForSteps();
	}
};

const scrollTo = (position) => {
	cy.scrollTo(position);
};

const scrollElementToPx = (element, position) => {
	$(element).scrollTo(0, position);
};

Given("workflows tab is open", () => {
	cy.loadSteps(() => cy.visit(`http://localhost:${PORT}/${version}/#!/workflows`));
});

Given("{string} workflow is selected", (workflow) => {
	click("Selected Workflow Name");
	click(`${workflow} workflow`);
});

When("I click on {string}", click);
When("I click away", clickAway);
When("I clear {string}", clear);
When("I press {string}", pressKey);
When("I select {string} from {string}", select);
When("I type {string} in {string}", type);
When("I check {string}", (element) => toggleCheckbox(element, true));
When("I uncheck {string}", (element) => toggleCheckbox(element));
When("I confirm on {string}", popupConfirm);
When("I cancel on {string}", popupCancel);
When("I change tab to {string}", changeTab);
When("I scroll to the {string}", scrollTo);
When("I scroll {string} to {int}px", scrollElementToPx);
Then("I should see {string} in {string}", assertInputValueEQ);
Then("I should not see {string} in {string}", assertNotInputValueNotEQ);
Then("I wait {int}", wait);
Then("{string} should {string}", should);
Then("{string} should be the selected step", (element) => {
	$(element).closest("li").should("have.class", "selected");
});
Then("{string} should contain {int} {string}", (element, expectation, childElement) => {
	$(element).find(selector(childElement)).should("have.length", expectation);
});

Then("{string} should have {string} {string} style", (element, cssValue, cssProperty) => {
	$(element).should("have.css", cssProperty, styleValueSelector(cssValue));
});

Then("{string} should have attribute {string} with value {string}", (element, attrName, attrValue) => {
	$(element).should("have.attr", attrName, attrValue);
});

Then("I save", save);

Then("the {string} should have a {string} icon", (element, iconName) => {
	$(element).find(selector("r-icon")).should("be.visible").should("have.attr", "name", `'${iconName}'`);
});

When("I blur {string}", (element) => {
	$(element).blur();
})
