import { react2angular } from "@bitrise/react2angular";
import { Checkbox, Icon } from "@bitrise/bitkit";

import Notification from "./components/Notification";
import InfoTooltip from "./components/InfoTooltip";
import Toggle from "./components/Toggle";
import NotificationMessageWithLink from "./components/NotificationMessageWithLink";
import { AddStepItem, StepItem } from "./components/StepItem";
import StepBadge from "./components/StepBadge/StepBadge";
import YmlStorageSettings from "./components/YmlStorageSettings/YmlStorageSettings";
import WorkflowSelector from "./components/WorkflowSelector/WorkflowSelector";
import YmlEditorHeader from "./components/YmlEditorHeader/YmlEditorHeader";
import WorkflowMainToolbar from "./components/WorkflowMainToolbar/WorkflowMainToolbar";
import WorkflowRecipesInfoBanner from "./components/workflow-recipes/WorkflowRecipesInfoBanner/WorkflowRecipesInfoBanner";
import { RootComponent, withRootProvider } from "./utils/withRootProvider";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import StepConfigPanel from "./components/StepConfigPanel/StepConfigPanel";
import VersionChangeDialog from "./components/StepConfigPanel/components/VersionChangeDialog";
import TriggersPage from "./components/TriggersPage/TriggersPage";
import SecretsPage from "./components/SecretsPage/SecretsPage";
import WorkflowEmptyState from "./components/WorkflowEmptyState/WorkflowEmptyState";
import PipelinesPage from "./components/PipelinesPage/PipelinesPage";
import WorkflowConfigPanel from "./components/WorkflowConfigPanel/WorkflowConfigPanel";
import StepDrawer from "./components/StepDrawer/StepDrawer";
import UpdateConfigurationDialog from "./components/UpdateConfigurationDialog/UpdateConfigurationDialog";

function register(component, props, injects) {
  return react2angular(withRootProvider(component), props, injects);
}

angular
  .module("BitriseWorkflowEditor")
  .component(
    "rNotification",
    register(Notification, ["message", "title", "status"]),
  )
  .component(
    "rNotificationMessageWithLink",
    register(NotificationMessageWithLink, [
      "message",
      "type",
      "linkUrl",
      "linkText",
    ]),
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
  .component(
    "rAddStepItem",
    register(AddStepItem, ["step", "disabled", "onSelected"]),
  )
  .component("rStepItemBadge", register(StepBadge, ["step"]))
  .component(
    "rYmlStorageSettings",
    register(YmlStorageSettings, [
      "appSlug",
      "usesRepositoryYml",
      "onUsesRepositoryYmlChangeSaved",
      "repositoryYmlAvailable",
    ]),
  )
  .component(
    "rUpdateConfigurationDialog",
    register(UpdateConfigurationDialog, [
      "isOpen",
      "onClose",
      "appSlug",
      "appConfig",
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
      "shouldShowYmlStorageSettings",
      "defaultBranch",            
      "gitRepoSlug",
      "lines",
      "split",
      "modularYamlSupported",
      "lastModified"
]),
  )
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
    "rStepConfig",
    register(StepConfigPanel, [
      "step",
      "tabId",
      "environmentVariables",
      "secrets",
      "resolvedVersion",
      "hasVersionUpdate",
      "versionsWithRemarks",
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
  .component(
    "rWorkflowConfigPanel",
    register(WorkflowConfigPanel, ["appSlug", "defaultValues", "onChange"]),
  )
  .component(
    "rStepDrawer",
    register(StepDrawer, [
      "isOpen",
      "onClose",
      "allowedStepIds",
      "onStepSelected",
    ]),
  );
