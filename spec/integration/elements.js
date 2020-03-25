const workflowSelectElement = workflowName =>
	`.workflow-selector ul li:has(.workflow .workflow-id:contains("${workflowName}"))`;
const stepSelector = index => `.workflow.edited .steps ul li:eq(${index - 1})`;
const badgeSelector = type => `.selected-step .manage-step .title .${type} svg`;

export const elements = {
	"Add Workflow Button": ".add-workflow",
	"Base Workflow Dropdown": "#add-workflow-popup-based-on-select",
	"Workflow Name": "#add-workflow-popup-body input[type=text]",
	"Workflow Add Button": "input.rebo.big.purple[type=submit]",
	"Workflow Add popup": "#add-workflow-popup-body",

	"Default popup": "#default-confirm-popup-body",
	"Default popup message": "#default-confirm-popup-body article p",
	"Alert popup": "#default-alert-popup-body",

	"Done Button": "button.done",
	"Save Button": "button.save",
	"Discard Button": "button.discard",

	"Delete Workflow Button": ".manage-button.delete-workflow",
	"Selected Workflow Name": ".selected-workflow button.mak",
	"Workflow selector": ".workflow-selector",

	"Step Title": ".selected-step .title .rename",
	"Step Title Edit Box": ".selected-step .rename-title input",
	"Step Rename Confirm Button": ".selected-step .rename-title button.ok",
	"Step Description": ".step-details .description .markdown",
	"Step Description Toggle": ".step-details .description .toggle-visibility",
	"Step Delete Button": ".selected-step button.delete-step",
	"Step Delete Icon": ".selected-step button.delete",
	"Step Always run indicator": "#selected-step-is-always-run-checkbox",
	"Step Verified Badge": badgeSelector("verified"),
	"Step Community Badge": badgeSelector("community-created"),
	"Step Deprecation Badge": badgeSelector("deprecated"),
	"Step Inputs": ".selected-step .inputs",
	"Step Versions": ".selected-step .version",
	"Step Version": ".selected-step .version__text",
	"Version selector": "#selected-step-version-select",
	"Step Version Success Icon": ".selected-step .icon-ok",
	"Step Latest Version Updater": ".selected-step .icon-danger",
	"Selected Step First Input": ".selected-step .input:eq(0)",
	"Selected Step First Input Title": ".selected-step .input .input-info .title span:eq(0)",
	"Selected Step First Input Sensitive Badge": ".selected-step .input .input-info .sensitive:eq(0)",
	"Selected Step First Input Required Badge": ".selected-step .input .input-info .required:eq(0)",
	"Selected Step First Input Change Button": ".selected-step .input .input-change:eq(0)",
	"Selected Step First Input Description": ".selected-step .input:eq(0) .input-description",
	"Insert Variable Popup": "#insert-variable-popup-body",
	"Selected Step Second Input Category": ".selected-step .input-category:eq(1)",
	"Selected Step Second Input Category Toggle Button": ".selected-step .input-category:eq(1) .toggle-category",
	"Selected Step Second Input Category Title": ".selected-step .input-category:eq(1) .category-name",
	"Selected Step Second Input Category Inputs": ".selected-step .input-category:eq(1) .inputs-list",
	"Step Inputs Without Category": ".selected-step .inputs h3 + .input-category.open.main",
	"Selected Input": ".input.selected",
	"Selected Input Textarea": ".input.selected textarea",
	"Selected Input Insert Variable Button": ".input.selected .insert-variable",
	"Selected Input Clear Button": ".input.selected .clear-value",
	"Step Version Danger Icon": ".selected-step .icon-danger",
	"Step Latest Version Updater": ".selected-step .icon-danger",

	Steps: ".workflow.edited .steps ul li",
	"Step Icons": ".workflow.edited .steps ul li .icon",
	"First step": stepSelector(1),
	"Second step": stepSelector(2),
	"Third step": stepSelector(3),
	"Fourth step": stepSelector(4),
	"Sixth step": stepSelector(6),
	"Seventeenth step": stepSelector(17),
	"First step name": `${stepSelector(1)} .info .title`,
	"First step version indicator": `${stepSelector(1)} em.version`,
	"Second step version updater": `${stepSelector(2)} div[data-e2e-tag="version-update"]`,

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

	"Workflow selector options": ".workflow-selector ul li .workflow .workflow-id",
	"Workflow selector dropdown": ".workflow-selector ul",

	"wf1 workflow": workflowSelectElement("wf1"),
	"wf2 workflow": workflowSelectElement("wf2"),
	"wf3 workflow": workflowSelectElement("wf3"),
	"wf3 workflow list element": `${workflowSelectElement("wf3")} .workflow`,
	"wf3 workflow rename button": `${workflowSelectElement("wf3")} .workflow .rename-workflow`,
	"wf3 workflow rename field": `${workflowSelectElement("wf3")} .workflow-rename .name`,
	"wf3 workflow rename submit": `${workflowSelectElement("wf3")} .workflow-rename .ok`,
	"my_new_wf_name workflow rename field": `${workflowSelectElement("my_new_wf_name")} .workflow-rename .name`,
	"my_new_wf_name workflow rename submit": `${workflowSelectElement("my_new_wf_name")} .workflow-rename .ok`,
	"wf3 steps": ".workflow:nth-child(2) ul.steps ul",
	"wf3 steps container": ".workflow:nth-child(2) ul.steps",

	"wf4 workflow": workflowSelectElement("wf4"),
	"wf4 workflow name": ".workflow:nth-child(1) .workflow-header .edit",
	"wf4 workflow description": ".workflow:nth-child(1) article aside",
	"wf4 steps": ".workflow:nth-child(1) ul.steps ul",
	"wf4 steps container": ".workflow:nth-child(1) ul.steps",
	"wf4 steps add step icons": ".workflow:nth-child(1) ul.steps .add-step",
	"wf4 Remove button": ".workflow:nth-child(1) .header-info .remove",

	"wf5 workflow": workflowSelectElement("wf5"),
	"first wf5 steps": ".workflow:nth-child(3) ul.steps ul",
	"first wf5 steps add step icons": ".workflow:nth-child(3) ul.steps .add-step",
	"first wf5 Remove button": ".workflow:nth-child(3) .header-info .remove",

	"wf6 workflow": workflowSelectElement("wf6"),
	"wf6 steps": ".workflow:nth-child(5) ul.steps ul",
	"wf6 steps container": ".workflow:nth-child(5) ul.steps",
	"wf6 Remove button": ".workflow:nth-child(5) .header-info .remove"
};

export const selector = elementSelector => elements[elementSelector] || elementSelector;

const elementIndex = expression => {
	const matches = /\:eq\((\d)\)/gm.exec(expression);

	return (
		matches && {
			expression: matches[0],
			index: parseInt(matches[1])
		}
	);
};

const addressElementAt = (expression, pos) => {
	const [rootEl, childEl] = expression.split(pos.expression);

	if (childEl) {
		return cy
			.get(rootEl)
			.eq(pos.index)
			.find(childEl);
	}

	return cy.get(rootEl).eq(pos.index);
};

export default elementName => {
	let expression = selector(elementName);

	const elementPosition = elementIndex(expression);

	if (elementPosition) {
		return addressElementAt(expression, elementPosition);
	}

	return cy.get(expression);
};
