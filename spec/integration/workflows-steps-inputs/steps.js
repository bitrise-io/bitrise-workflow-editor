import { Given, When } from "cypress-cucumber-preprocessor/steps";

import { click } from "../common";
import $ from "../elements";

afterEach(() => {
	$("Discard Button").then((btn) => {
		if (!btn.is(":disabled")) {
			btn.click();
		}
	});
});

Given("{string} step is selected", (stepPositionName) => {
	click(`${stepPositionName} step`);
});

Given("Insert Variable popup is open", () => {
	click("Selected Step First Input");
	click("Selected Input Insert Variable Button");
});

When("Highlight all text in {string}", (element) => {
	$(element).type("{selectall}");
});
