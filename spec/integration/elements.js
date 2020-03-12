export const elements = {
  "Add Workflow Button": ".add-workflow",
  "Workflow Type Dropdown": "#add-workflow-popup-based-on-select",
  "Workflow Name": "#add-workflow-popup-body input[type=text]",
  "Workflow Add Button": "input.rebo.big.purple[type=submit]",
  "Workflow Add Popup": "#add-workflow-popup-body",

  "default": "#default-confirm-popup-body",
  "alert": "#default-alert-popup-body",

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
  "First step version indicator": ".step-actions:eq(0) em.version",
  "Second step": ".step-actions:eq(1)",
  "Third step": ".step-actions:eq(2)",

  "Add Before Workflow button": ".add-before-run-workflow",
  "Add Before Workflow": "#add-run-workflow-popup-body",
  "Before Workflow Dropdown": ".run-workflow-selector.before-run",
  "Workflow Sections": "section.workflow",
  "Before Workflow Name": ".workflow.edited .icons-and-name .workflow-name",

  "Add After Workflow button": ".add-after-run-workflow",
  "Add After Workflow": "#add-run-workflow-popup-body",
  "After Workflow Dropdown": ".run-workflow-selector.after-run",
  "After Workflow Name": ".workflow .icons-and-name .workflow-name",

  "Danger Icon": ".icon-danger",
  "Success Icon": ".icon-ok"
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
