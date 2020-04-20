import { react2angular } from "react2angular";
import ErrorNotification from "./components/ErrorNotification";
import StepItem from "./components/StepItem/StepItem";
import AddStepItem from "./components/StepItem/AddStepItem";
import StepVersion from "./components/StepVersion";

var register = react2angular;

angular
	.module("BitriseWorkflowEditor")
	.component("rErrorNotification", register(ErrorNotification, ["message"]))
	.component(
		"rStepItem",
		register(StepItem, [
			"step",
			"title",
			"version",
			"isDeprecated",
			"isVerified",
			"strings",
			"selected",
			"stepIndex",
			"highlightVersionUpdate",
			"onSelected"
		])
	)
	.component(
		"rStepVersion",
		register(StepVersion, [
			"step",
			"isLatestVersion",
			"onUpdateStep",
			"workflowIndex",
			"versions",
			"selectedVersion",
			"versionSelectorOpts",
			"strings"
		])
	)
	.component("rAddStepItem", register(AddStepItem, ["step", "onSelected"]));
