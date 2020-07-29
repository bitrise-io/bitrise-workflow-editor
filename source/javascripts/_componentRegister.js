import { react2angular } from "react2angular";
import ErrorNotification from "./components/ErrorNotification";
import { StepItem, AddStepItem } from "./components/StepItem";
import StepItemBadge from "./components/StepItem/StepItemBadge";
import StepVersionDetails from "./components/StepVersionDetails/StepVersionDetails";
import SplashModal from "./components/SplashModal/SplashModal";

var register = react2angular;

angular
	.module("BitriseWorkflowEditor")
	.component("rErrorNotification", register(ErrorNotification, ["message"]))
	.component(
		"rStepItem",
		register(StepItem, ["step", "version", "strings", "selected", "stepIndex", "highlightVersionUpdate", "onSelected"])
	)
	.component(
		"rStepVersionDetails",
		register(StepVersionDetails, [
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
	.component("rAddStepItem", register(AddStepItem, ["step", "onSelected"]))
	.component("rStepItemBadge", register(StepItemBadge, ["step"]))
	.component("rSplashModal", register(SplashModal, ["show"]));
