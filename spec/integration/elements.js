const elementsMap = {
    "Add Workflow Button": ".add-workflow",
    "Workflow Type Dropdown": "#add-workflow-popup-based-on-select",
    "Workflow Name": "#add-workflow-popup-body input[type=text]",
    "Workflow Add Button": "input.rebo.big.purple[type=submit]",
    "Workflow Add Popup": "#add-workflow-popup-body",

    "Delete Workflow Button": ".manage-button.delete-workflow",
    "Selected Workflow Name": ".selected-workflow button.mak"
};

export default (element) => elementsMap[element] || element;