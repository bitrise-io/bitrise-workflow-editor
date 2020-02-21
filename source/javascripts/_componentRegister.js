import { react2angular } from "react2angular";
import ErrorNotification from "./components/ErrorNotification";
import StepItem from "./components/StepItem/StepItem";
import StepVersionInfo from "./components/StepVersionInfo/StepVersionInfo";

var register = react2angular;

angular
	.module("BitriseWorkflowEditor")
	.component("rErrorNotification", register(ErrorNotification, ["message"]))
	.component(
		"rStepItem", register(StepItem, [
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
		"rStepVersionInfo", register(StepVersionInfo, [
			"step",
			"isLatestVersion",
			"onUpdateStep",
			"workflowIndex",
			"isConfigured",
			"strings"
		])
	);
