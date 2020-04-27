import { Given, Then } from "cypress-cucumber-preprocessor/steps";
import $ from "../elements";
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

Then("I should see the {string} badge in {string} with the title {string}", (badge, element, title) => {
	$(element)
		.children($(badge))
		.invoke("attr", "title")
		.should("contain", title);
});
