export const elements = {
    "Add Workflow Button": ".add-workflow",
    "Workflow Type Dropdown": "#add-workflow-popup-based-on-select",
    "Workflow Name": "#add-workflow-popup-body input[type=text]",
    "Workflow Add Button": "input.rebo.big.purple[type=submit]",
    "Workflow Add Popup": "#add-workflow-popup-body",

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

    "Danger Icon": ".icon-danger",
    "Success Icon": ".icon-ok"
};

const getIndex = (selector) => {
    const regex = /\:eq\((\d)\)/gm;
    const matches = regex.exec(selector);

    if (matches) {
        return [selector.replace(matches[0], ''), parseInt(matches[1])];
    }

    return null;
};

export const selector = (elementSelector) => elements[elementSelector] || elementSelector;

export default (elementName) => {
    let expr = selector(elementName);
    let index = 0;

    const indexRes = getIndex(expr);
    if (indexRes) {
        expr = indexRes[0];
        index = indexRes[1];
    }

    return cy.get(expr).eq(index);
};