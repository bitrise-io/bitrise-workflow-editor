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

Given('Delete popup is open', () => {
  click('Delete Workflow Button');
});

Given('the Workflow dropdown is open', () => {
  click("Selected Workflow Name");
});

Then('Workflow appeared with name {string}', (name) => {
  $('.selected-workflow button.mak').contains(name);
});

Then('Workflow selector options should not contain {string}', (workflow) => {
  $("Workflow selector options").then((el) => {
    const exists = el.contents().map((_, wf) => wf.data).toArray().includes(workflow);
    expect(exists).to.be.false;
  });
});
