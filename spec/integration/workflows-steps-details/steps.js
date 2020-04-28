import { Given, Then } from "cypress-cucumber-preprocessor/steps";
import $, { selector } from "../elements";
import { click } from "../common";

afterEach(() => {
	$("Discard Button").then(btn => {
		if (!btn.is(":disabled")) {
			btn.click();
		}
	});
});

Given("First step is selected", () => {
	click("First step");
});

Then("no step selected", () => {
	$("Steps").each($el => {
		cy.wrap($el).should("not.have.class", "selected");
	});
});

Then("{string} in {string} should have attribute {string} with value {string}",
	(childElement, parentElement, attribute, value) => {
	$(parentElement)
		.find(selector(childElement))
		.invoke("attr", attribute)
		.should("contain", value);
});
