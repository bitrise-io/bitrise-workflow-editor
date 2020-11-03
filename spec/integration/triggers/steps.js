import { Given, When, Then } from "cypress-cucumber-preprocessor/steps";
import $ from "../elements";
import { version } from "../../../package.json";
import "../common";

const PORT = Cypress.env("PORT");

const assertTriggerCount = (count) => {
	$("Triggers").should("have.length", count)
}

Given("triggers tab is open", () => {
	cy.visit(`http://localhost:${PORT}/${version}/#!/triggers`);
	cy.wait(1000);
});

Then("I should see {int} triggers", assertTriggerCount);
Then("I should see a trigger", () => assertTriggerCount(1));

Then("{string} should not be editable", (element) => {
	$(element).find("input.value").should("have.length", 0);
});

Then("{string} should be editable", (element) => {
	$(element).find("input.value").should("have.length", 1);
});

When("I drag {string} down", (element) => {
	$(element)
	.trigger("mousedown", { which: 1 })
	.trigger("mousemove", { pageX: 0, pageY: 500 })
	.trigger("mouseup", { force: true })
})

