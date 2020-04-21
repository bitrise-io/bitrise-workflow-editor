const workflowSelectElement = workflowName =>
	`.workflow-selector ul li:has(.workflow .workflow-id:contains("${workflowName}"))`;
const stepSelector = index => `.workflow.edited .steps ul li:eq(${index - 1})`;
const badgeSelector = type => `.selected-step .manage-step .title .${type} svg`;
const inputVariableSelector = name =>
	`#insert-variable-popup-body .variable-source > li:has(button strong:contains("$${name}"))`;

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
	"Variables for insert": "#insert-variable-popup-body .variable-source:has(li)",
	"First variable for insert": "#insert-variable-popup-body .variable-source > li:eq(0)",
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
	"Selected Workflow description container": ".workflow-description",
	"Selected Workflow description button": ".workflow-description button.edit",
	"Selected Workflow description textarea": ".workflow-description textarea",
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
	"wf6 Remove button": ".workflow:nth-child(5) .header-info .remove",

	"Rearrange button": ".manage-button.rearrange",
	"Rearrange popup": "#rearrange-workflow-chain-popup-body",
	"Workflow chain": ".workflow-chain",
	"Workflow chain selected workflow": "#rearrange-workflow-chain-popup-body .workflow-chain .selected",
	"Workflow chain before workflows": ".workflow-chain .before-run",
	"Workflow chain before wf4 workflow": "#rearrange-workflow-chain-popup-body .workflow-chain .before-run li:first",
	"Workflow chain after workflows": ".workflow-chain .after-run",
	"Workflow chain first after wf5 workflow": ".workflow-chain .after-run li:nth(0)",
	"Workflow chain second after wf5 workflow": ".workflow-chain .after-run li:nth(1)",
	"Workflow chain after wf6 workflow": ".workflow-chain .after-run li:nth(2)",

	"Step clone button": "button.clone",
	"Step source link": "a.source",

	"Insert variable element called BITRISE_SOURCE_DIR": inputVariableSelector("BITRISE_SOURCE_DIR"),
	"Insert variable element called BITRISE_SOURCE_DIR source": `${inputVariableSelector("BITRISE_SOURCE_DIR")} em`,
	"Insert variable element called BITRISE_DEPLOY_DIR": inputVariableSelector("BITRISE_DEPLOY_DIR"),
	"Insert variable element called BITRISE_DEPLOY_DIR source": `${inputVariableSelector("BITRISE_DEPLOY_DIR")} em`,
	"Insert variable element called BITRISE_BUILD_STATUS": inputVariableSelector("BITRISE_BUILD_STATUS"),
	"Insert variable element called BITRISE_BUILD_STATUS source": `${inputVariableSelector("BITRISE_BUILD_STATUS")} em`,
	"Insert variable element called BITRISE_TRIGGERED_WORKFLOW_ID": inputVariableSelector(
		"BITRISE_TRIGGERED_WORKFLOW_ID"
	),
	"Insert variable element called BITRISE_TRIGGERED_WORKFLOW_ID source": `${inputVariableSelector(
		"BITRISE_TRIGGERED_WORKFLOW_ID"
	)} em`,
	"Insert variable element called BITRISE_TRIGGERED_WORKFLOW_TITLE": inputVariableSelector(
		"BITRISE_TRIGGERED_WORKFLOW_TITLE"
	),
	"Insert variable element called BITRISE_TRIGGERsED_WORKFLOW_TITLE source": `${inputVariableSelector(
		"BITRISE_TRIGGERED_WORKFLOW_TITLE"
	)} em`,
	"Insert variable element called CI": inputVariableSelector("CI"),
	"Insert variable element called CI source": `${inputVariableSelector("CI")} em`,
	"Insert variable element called PR": inputVariableSelector("PR"),
	"Insert variable element called PR source": `${inputVariableSelector("PR")} em`,
	"Insert variable element called VERYSECRET": inputVariableSelector("VERYSECRET"),
	"Insert variable element called VERYSECRET source": `${inputVariableSelector("VERYSECRET")} em`,
	"Insert variable element called project": inputVariableSelector("project"),
	"Insert variable element called project source": `${inputVariableSelector("project")} em`,
	"Insert variable element called SLACK_WEBHOOK": inputVariableSelector("SLACK_WEBHOOK"),
	"Insert variable element called SLACK_WEBHOOK source": `${inputVariableSelector("SLACK_WEBHOOK")} em`,
	"Insert variable element called COMPANY_NAME": inputVariableSelector("COMPANY_NAME"),
	"Insert variable element called COMPANY_NAME source": `${inputVariableSelector("COMPANY_NAME")} em`,
	"Insert variable filter field": "#insert-variable-popup-body header input"
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
