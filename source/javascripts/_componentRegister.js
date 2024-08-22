import { react2angular } from "@bitrise/react2angular";
import { Checkbox, Icon } from "@bitrise/bitkit";

import Notification from "./components/Notification";
import InfoTooltip from "./components/InfoTooltip";
import Toggle from "./components/Toggle";
import StepItem from "./components/StepItem/StepItem";
import StepBadge from "./components/StepBadge";
import {
  UpdateConfigurationDialog,
  YmlEditor,
  YmlEditorHeader,
} from "@/pages/ConfigurationYamlPage";
import {
  ChainWorkflowDrawer,
  CreateWorkflowDialog,
  DeleteWorkflowDialog,
  StepBundlePanel,
  StepConfigPanel,
  StepDrawer,
  VersionChangeDialog,
  WithBlockPanel,
  WorkflowConfigPanel,
  WorkflowEmptyState,
  WorkflowSelector,
  WorkflowToolbar,
} from "@/pages/WorkflowsPage";
import WorkflowRecipesInfoBanner from "./components/WorkflowRecipesInfoBanner";
import { RootComponent, withRootProvider } from "./utils/withRootProvider";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import {
  PipelinesPage,
  SecretsPage,
  TriggersPage,
  WorkflowsPage,
} from "@/pages";

function register(component, props, injects) {
  return react2angular(withRootProvider(component), props, injects);
}

// Page components
angular
  .module("BitriseWorkflowEditor")
  .component(
    "rTriggersPage",
    register(TriggersPage, [
      "onTriggerMapChange",
      "pipelines",
      "triggerMap",
      "setDiscard",
      "workflows",
      "isWebsiteMode",
      "integrationsUrl",
    ]),
  )
  .component(
    "rSecretsPage",
    register(SecretsPage, [
      "secrets",
      "secretsWriteNew",
      "onSecretsChange",
      "getSecretValue",
      "appSlug",
      "secretSettingsUrl",
      "sharedSecretsAvailable",
      "planSelectorPageUrl",
    ]),
  )
  .component("rPipelinesPage", register(PipelinesPage, ["yml", "defaultMeta"]))
  .component("rWorkflowsPage", register(WorkflowsPage, ["yml", "onChange"]));

// Components
angular
  .module("BitriseWorkflowEditor")
  .component(
    "rNotification",
    register(Notification, ["message", "title", "status"]),
  )
  .component("rCheckbox", register(Checkbox, ["children", "isDisabled"]))
  .component("rRootComponent", react2angular(RootComponent))
  .component("rIcon", register(Icon, ["name", "textColor", "size"]))
  .component(
    "rStepItem",
    register(StepItem, [
      "workflowIndex",
      "step",
      "displayName",
      "version",
      "hasVersionUpdate",
      "isSelected",
      "onSelected",
    ]),
  )
  .component("rStepItemBadge", register(StepBadge, ["step"]))
  .component(
    "rUpdateConfigurationDialog",
    register(UpdateConfigurationDialog, [
      "onClose",
      "appSlug",
      "getDataToSave",
      "onComplete",
      "defaultBranch",
      "gitRepoSlug",
    ]),
  )
  .component(
    "rWorkflowSelector",
    register(WorkflowSelector, [
      "selectedWorkflow",
      "workflows",
      "selectWorkflow",
      "renameWorkflowConfirmed",
    ]),
  )
  .component(
    "rYmlEditorHeader",
    register(YmlEditorHeader, [
      "url",
      "initialUsesRepositoryYml",
      "appSlug",
      "appConfig",
      "onUsesRepositoryYmlChangeSaved",
      "repositoryYmlAvailable",
      "isWebsiteMode",
      "defaultBranch",
      "gitRepoSlug",
      "lines",
      "split",
      "modularYamlSupported",
      "lastModified",
    ]),
  )
  .component(
    "rYmlEditor",
    register(YmlEditor, ["yml", "readonly", "onChange", "isLoading"]),
  )
  .component(
    "rWorkflowToolbar",
    register(WorkflowToolbar, [
      "defaultBranch",
      "canRunWorkflow",
      "isRunWorkflowDisabled",
      "selectedWorkflow",
      "workflows",
      "selectWorkflow",
      "renameWorkflowConfirmed",
      "onAddNewWorkflow",
      "onOpenChainWorkflowDialog",
      "onRearrangeWorkflow",
      "onDeleteSelectedWorkflow",
      "onRunWorkflow",
      "uniqueStepCount",
      "uniqueStepLimit",
      "organizationSlug",
      "hideWorkflowRecepiesLink",
    ]),
  )
  .component(
    "rWorkflowEmptyState",
    register(WorkflowEmptyState, ["onAddWorkflow"]),
  )
  .component(
    "rWorkflowRecipesInfoBanner",
    register(WorkflowRecipesInfoBanner, []),
  )
  .component("rInfoTooltip", register(InfoTooltip, ["label"]))
  .component(
    "rToggle",
    register(Toggle, [
      "tooltipLabel",
      "isDisabled",
      "isChecked",
      "onChange",
      "listItemId",
    ]),
  )
  .component(
    "rHeader",
    register(Header, [
      "appName",
      "appPath",
      "workspacePath",
      "workflowsAndPipelinesPath",
      "onSaveClick",
      "isSaveDisabled",
      "isSaveInProgress",
      "onDiscardClick",
      "isDiscardDisabled",
    ]),
  )
  .component(
    "rNavigation",
    register(Navigation, ["items", "activeItem", "onItemSelected"]),
  )
  .component(
    "rStepConfigPanel",
    register(StepConfigPanel, [
      "step",
      "tabId",
      "environmentVariables",
      "secrets",
      "resolvedVersion",
      "hasVersionUpdate",
      "versions",
      "inputCategories",
      "outputVariables",
      "onChange",
      "onClone",
      "onRemove",
      "onChangeTabId",
      "onCreateSecret",
      "onLoadSecrets",
      "onCreateEnvVar",
      "onLoadEnvVars",
      "appSlug",
      "secretsWriteNew",
    ]),
  )
  .component(
    "rVersionChangeDialog",
    register(VersionChangeDialog, [
      "isOpen",
      "onClose",
      "isMajorChange",
      "newInputs",
      "removedInputs",
      "releaseNotesUrl",
    ]),
  )
  .component(
    "rWorkflowConfigPanel",
    register(WorkflowConfigPanel, [
      "appSlug",
      "yml",
      "defaultValues",
      "onChange",
    ]),
  )
  .component(
    "rStepDrawer",
    register(StepDrawer, [
      "isOpen",
      "onClose",
      "allowedStepIds",
      "onStepSelected",
    ]),
  )
  .component(
    "rChainWorkflowDrawer",
    register(ChainWorkflowDrawer, [
      "workflowId",
      "yml",
      "isOpen",
      "onClose",
      "onChainWorkflow",
    ]),
  )
  .component(
    "rDeleteWorkflowDialog",
    register(DeleteWorkflowDialog, [
      "workflowId",
      "isOpen",
      "onClose",
      "onDelete",
    ]),
  )
  .component(
    "rCreateWorkflowDialog",
    register(CreateWorkflowDialog, ["yml", "isOpen", "onClose", "onCreate"]),
  )
  .component("rStepBundlePanel", register(StepBundlePanel, ["stepDisplayName"]))
  .component(
    "rWithBlockPanel",
    register(WithBlockPanel, ["stepDisplayName", "withBlockData"]),
  );
