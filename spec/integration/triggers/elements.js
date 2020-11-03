const filterSelector = name => `#trigger-type-filter-${name}`;

const triggerElements = {
	"Add trigger button": ".add-trigger",
	Triggers: ".tab-triggers .trigger",
	"First trigger": ".tab-triggers li:first-of-type .trigger",
	"First trigger pattern": ".tab-triggers li:first-of-type .trigger .trigger-info.pattern .value",
	"First trigger workflow": ".tab-triggers li:first-of-type .trigger .trigger-info.workflow",
	"First trigger delete": ".tab-triggers li:first-of-type .trigger .delete",
	"Push filter": filterSelector("push"),
	"Pull Request filter": filterSelector("pull-request"),
	"Tag filter": filterSelector("tag"),
	"Trigger cancel": ".trigger .cancel",
	"Trigger done": ".trigger .done",
};

export default triggerElements;
