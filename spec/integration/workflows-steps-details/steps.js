import { Then } from "cypress-cucumber-preprocessor/steps";
import $ from '../elements';
import "../common";

afterEach(() => {
  $('Discard Button').then(btn => {
    if (!btn.is(':disabled')) {
      btn.click();
    }
  });
});

Then("{string} should be switched {string}", (element, switchValue) => {
	if (switchValue === "on") {
		$(element).should('have.class', 'ng-not-empty');
	} else {
		$(element).should('have.class', 'ng-empty');
	}
});
