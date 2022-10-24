import { react2angular } from "@bitrise/react2angular";
import { Icon } from "@bitrise/bitkit";

import ErrorNotification from "./components/ErrorNotification";
import { StepItem, AddStepItem } from "./components/StepItem";
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
import { withBitkitProvider, BitkitRoot } from "./utils/withBitkitProvider";
import { GuidedOnboarding } from "./components/GuidedOnboarding/GuidedOnboarding";

function register(component, props, injects) {
	return react2angular(withBitkitProvider(component), props, injects);
}

angular
	.module("BitriseWorkflowEditor")
	.component("rErrorNotification", register(ErrorNotification, ["message"]))
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
			"selectedWorkflow",
			"workflows",
			"selectWorkflow",
			"renameWorkflowConfirmed",
			"onAddNewWorkflow",
			"onInsertBeforeWorkflow",
			"onInsertAfterWorkflow",
			"onRearrangeWorkflow",
			"onDeleteSelectedWorkflow"
		])
	)
	.component("rWorkflowRecipesInfoBanner", register(WorkflowRecipesInfoBanner, []))
	.component("rProductTour", register(ProductTour, ["menuIds", "currentUser", "productTourShown", "onDismiss"]))
	.component("rGuidedOnboarding", register(GuidedOnboarding, ["isEnabled", "isOpen", "onTurnOff", "buildStatus"]));
