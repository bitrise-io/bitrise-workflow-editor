import { Then } from "cypress-cucumber-preprocessor/steps";
import $ from '../elements';
import "../common"

afterEach(() => {
  $('Discard Button').then(btn => {
    if (!btn.is(':disabled')) {
      btn.click();
    }
  });
});

Then('no step selected', () => {
	$("Steps").each($el => {
		cy.wrap($el).should('not.have.class', 'selected');
	});
});
