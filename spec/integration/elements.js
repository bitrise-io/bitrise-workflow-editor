export const elements = {
  "Add Workflow Button": ".add-workflow",
  "Base Workflow Dropdown": "#add-workflow-popup-based-on-select",
  "Workflow Name": "#add-workflow-popup-body input[type=text]",
  "Workflow Add Button": "input.rebo.big.purple[type=submit]",
  "Workflow Add popup": "#add-workflow-popup-body",

  "Default popup": "#default-confirm-popup-body",
  "Alert popup": "#default-alert-popup-body",

  "Done Button": "button.done",
  "Save Button": "button.save",
  "Discard Button": "button.discard",

  "Delete Workflow Button": ".manage-button.delete-workflow",
  "Selected Workflow Name": ".selected-workflow button.mak",

  "Step Title": ".selected-step .title",
  "Step Inputs": ".selected-step .inputs",
  "Step Versions": ".selected-step .version",
  "Step Version": ".selected-step .version__text",
  "Version selector": "#selected-step-version-select",
  "Step Version Success Icon": ".selected-step .icon-ok",
  "Step Latest Version Updater": ".selected-step .icon-danger",

  "First step": ".step-actions:eq(0)",
  "First step name": ".step-actions:eq(0) .info .title",
  "First step version indicator": ".step-actions:eq(0) em.version",
  "Second step": ".step-actions:eq(1)",
  "Third step": ".step-actions:eq(2)",

  "Add Before Workflow button": ".add-before-run-workflow",
  "Add Before Workflow popup": "#add-run-workflow-popup-body",
  "Before Workflow Dropdown": ".run-workflow-selector.before-run",
  "Workflow Sections": ".content .workflows",
  "Workflow Section": "section.workflow",
  "Before Workflow Name": ".workflow.edited .icons-and-name .workflow-name",
  "First Before Workflow Name": ".workflow .icons-and-name .workflow-name",

  "Add After Workflow button": ".add-after-run-workflow",
  "Add After Workflow popup": "#add-run-workflow-popup-body",
  "After Workflow Dropdown": ".run-workflow-selector.after-run",
  "First After Workflow Name": ".workflow:nth-last-child(2) .icons-and-name .workflow-name",
  "Last After Workflow Name": ".workflow:last-child .icons-and-name .workflow-name",
  "After Workflow Name": ".workflow:last-child .icons-and-name .workflow-name",

  "Danger Icon": ".icon-danger",
  "Success Icon": ".icon-ok",

  "Selected Workflow": "section.workflow.selected",
  "Selected Workflow description": ".workflow-description .description p",
  "Step element": "li",
  "Add Step element": ".add-step",

  "wf3 workflow": ".workflow-selector ul li:nth-child(3)",
  "wf3 steps": ".workflow:nth-child(2) ul.steps ul",
  "wf3 steps container": ".workflow:nth-child(2) ul.steps",

  "wf4 workflow name": ".workflow:nth-child(1) .workflow-header .edit",
  "wf4 workflow description": ".workflow:nth-child(1) article aside",
  "wf4 steps": ".workflow:nth-child(1) ul.steps ul",
  "wf4 steps container": ".workflow:nth-child(1) ul.steps",
  "wf4 steps add step icons": ".workflow:nth-child(1) ul.steps .add-step",
  "wf4 Remove button": ".workflow:nth-child(1) .header-info .remove",

  "wf5 steps": ".workflow:nth-child(3) ul.steps ul",
  "wf5 steps container": ".workflow:nth-child(3) ul.steps",
  "wf5 steps add step icons": ".workflow:nth-child(3) ul.steps .add-step",
  "wf5 Remove button": ".workflow:nth-child(3) .header-info .remove",

  "wf6 steps": ".workflow:nth-child(4) ul.steps ul",
  "wf6 steps container": ".workflow:nth-child(4) ul.steps",
  "wf6 Remove button": ".workflow:nth-child(4) .header-info .remove"
};

export const selector = (elementSelector) => elements[elementSelector] || elementSelector;

const elementIndex = (expression) => {
  const matches = /\:eq\((\d)\)/gm.exec(expression);

  return matches && {
    expression: matches[0],
    index: parseInt(matches[1])
  };
};

export default (elementName) => {
  let expr = selector(elementName);
  let index = 0;

  const elementPosition = elementIndex(expr);

  if (elementPosition) {
    expr = expr.replace(elementPosition.expression, '');
    index = elementPosition.index;
  }

  return cy.get(expr).eq(index);
};
