import { react2angular } from "@bitrise/react2angular";
import { Icon, Checkbox } from "@bitrise/bitkit";

import ErrorNotification from "./components/ErrorNotification";
import NotificationMessageWithLink from "./components/NotificationMessageWithLink";
import { AddStepItem, StepItem } from "./components/StepItem";
import StepItemBadge from "./components/StepItem/StepItemBadge";
import StepVersionDetails from "./components/StepVersionDetails/StepVersionDetails";
import YmlStorageSettings from "./components/YmlStorageSettings/YmlStorageSettings";
import UpdateYmlInRepositoryModal from "./components/UpdateYmlInRepositoryModal/UpdateYmlInRepositoryModal";
import WorkflowSelector from "./components/WorkflowSelector/WorkflowSelector";
import YmlEditorHeader from "./components/YmlEditorHeader/YmlEditorHeader";
import TriggersDescription from "./components/triggers/Description";
import WorkflowMainToolbar from "./components/WorkflowMainToolbar/WorkflowMainToolbar";
import WorkflowRecipesInfoBanner from "./components/workflow-recipes/WorkflowRecipesInfoBanner/WorkflowRecipesInfoBanner";
import { BitkitRoot, withBitkitProvider } from "./utils/withBitkitProvider";

function register(component, props, injects) {
	return react2angular(withBitkitProvider(component), props, injects);
}

angular
	.module("BitriseWorkflowEditor")
	.component("rErrorNotification", register(ErrorNotification, ["message"]))
	.component("rNotificationMessageWithLink", register(NotificationMessageWithLink, ["message", "type", "linkUrl", "linkText"]))
	.component("rCheckbox", register(Checkbox, ["children", "isDisabled"]))
	.component("rBitkitRoot", react2angular(BitkitRoot))
	.component("rIcon", register(Icon, ["name", "textColor", "size"]))
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
	.component(
		"rYmlStorageSettings",
		register(YmlStorageSettings, ["appSlug", "usesRepositoryYml", "onUsesRepositoryYmlChangeSaved"])
	)
	.component(
		"rUpdateYmlInRepositoryModal",
		register(UpdateYmlInRepositoryModal, ["appSlug", "isVisible", "onClose", "onComplete", "getDataToSave"])
	)
	.component(
		"rWorkflowSelector",
		register(WorkflowSelector, ["selectedWorkflow", "workflows", "selectWorkflow", "renameWorkflowConfirmed"])
	)
	.component("rYmlEditorHeader", register(YmlEditorHeader, ["url", "usesRepositoryYml"]))
	.component("rTriggersDescription", register(TriggersDescription, ["hasTriggers"]))
	.component(
		"rWorkflowMainToolbar",
		register(WorkflowMainToolbar, [
			"defaultBranch",
			"canRunWorkflow",
			"isRunWorkflowDisabled",
			"selectedWorkflow",
			"workflows",
			"selectWorkflow",
			"renameWorkflowConfirmed",
			"onAddNewWorkflow",
			"onInsertBeforeWorkflow",
			"onInsertAfterWorkflow",
			"onRearrangeWorkflow",
			"onDeleteSelectedWorkflow",
			"onRunWorkflow"
		])
	)
	.component("rWorkflowRecipesInfoBanner", register(WorkflowRecipesInfoBanner, []))

