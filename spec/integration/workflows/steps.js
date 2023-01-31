import { Given, Then } from "cypress-cucumber-preprocessor/steps";
import $ from "../elements";
import { click, select, type } from "../common";

afterEach(() => {
	$("Discard Button").then(btn => {
		if (!btn.is(":disabled")) {
			btn.click();
		}
	});
});

Given("Workflow with name {string}", name => {
	click("Add Workflow Button");
	select("Empty workflow", "Base Workflow Dropdown");
	type(name, "Workflow Name");
	click("Workflow Add Button");
});

Given("add workflow popup is open", () => {
	click("Add Workflow Button");
});

Given("Delete popup is open", () => {
	click("Manage Workflows dropdown button");
	click("Delete Workflow Button");
});

Given("the Workflow dropdown is open", () => {
	click("Selected Workflow Name");
});

Given("Workflow description is in edit mode", () => {
	click("Selected Workflow description button");
});

Given("Rearrange popup is open", () => {
	click("Manage Workflows dropdown button");
	click("Change Workflow execution order button");
});

Then("Workflow appeared with name {string}", name => {
	$("[data-e2e-tag=\"workflow-selector-selected-workflow-name\"]").contains(name);
});

Then("all the steps are loaded", () => {
	$("Step Icons").each($el => {
		cy.wrap($el)
			.invoke("attr", "src")
			.should("not.contain", "images/icon-default.svg");
	});
});

Then("Workflow selector options should not contain {string}", workflow => {
	$("Workflow selector options").then(el => {
		const exists = el
			.contents()
			.map((_, wf) => wf.data)
			.toArray()
			.includes(workflow);
		expect(exists).to.be.false;
	});
});
