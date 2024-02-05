import { react2angular } from "@bitrise/react2angular";
import { Icon, Checkbox } from "@bitrise/bitkit";

import Notification from "./components/Notification";
import InfoTooltip from "./components/InfoTooltip";
import Toggle from "./components/Toggle";
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
import { ProductTour } from "./components/ProductTour/ProductTour";
import { BitkitRoot, withBitkitProvider } from "./utils/withBitkitProvider";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";

function register(component, props, injects) {
	return react2angular(withBitkitProvider(component), props, injects);
}

angular
	.module("BitriseWorkflowEditor")
	.component("rNotification", register(Notification, ["message", "title", "status"]))
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
	.component("rAddStepItem", register(AddStepItem, ["step", "disabled", "onSelected"]))
	.component("rStepItemBadge", register(StepItemBadge, ["step"]))
	.component(
		"rYmlStorageSettings",
		register(YmlStorageSettings, ["appSlug", "usesRepositoryYml", "onUsesRepositoryYmlChangeSaved", "repositoryYmlAvailable"])
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
			"onRunWorkflow",
			"uniqueStepCount",
			"uniqueStepLimit",
			"organizationSlug"
		])
	)
	.component("rWorkflowRecipesInfoBanner", register(WorkflowRecipesInfoBanner, []))
	.component("rProductTour", register(ProductTour, ["menuIds", "currentUser", "productTourShown"]))
	.component("rInfoTooltip", register(InfoTooltip, ["label"]))
	.component("rToggle", register(Toggle, ["tooltipLabel", "isDisabled", "isChecked", "onChange", "listItemId"]))
	.component("rHeader", register(Header, [
		"appName",
		"appPath",
		"workspacePath",
		"workflowsAndPipelinesPath",
		"onSaveClick",
		"isSaveDisabled",
		"isSaveInProgress",
		"onDiscardClick",
		"isDiscardDisabled",
	]))
	.component("rNavigation", register(Navigation, ["items", "activeItem", "onItemSelected"]))
	.component("rFooter", register(Footer, ["version"]));
