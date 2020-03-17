import { Given, Then } from 'cypress-cucumber-preprocessor/steps';
import $, { selector } from '../elements';
import { click, select, type } from '../common';

afterEach(() => {
  $('Discard Button').then(btn => {
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

Given('add workflow popup is open', () => {
  click('Add Workflow Button');
});

Then('Workflow appeared with name {string}', (name) => {
  cy.get('.selected-workflow button.mak').contains(name);
});

