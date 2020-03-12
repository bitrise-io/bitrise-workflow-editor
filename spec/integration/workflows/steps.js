import { Given, Then } from 'cypress-cucumber-preprocessor/steps';
import $el, { elements } from '../elements';
import { click, select, type } from '../common';

afterEach(() => {
  $el(elements['Discard Button']).then(btn => {
    if (!btn.is(':disabled')) {
      btn.click();
    }
  });
});

Given('Workflow with name {string}', (name) => {
  click('Add Workflow Button');
  select('Empty workflow', 'Base Workflow Dropdown');
  type(name, 'Workflow Name');
  click('Workflow Add Button');
});

Then('Workflow appeared with name {string}', (name) => {
  cy.get('.selected-workflow button.mak').contains(name);
});
