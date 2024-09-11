import { react2angular } from "@bitrise/react2angular";
import { Checkbox, Icon } from "@bitrise/bitkit";

import Header from "./components/Header";
import InfoTooltip from "./components/InfoTooltip";
import Navigation from "./components/Navigation";
import Notification from "./components/Notification";
import NotificationMessageWithLink from "./components/NotificationMessageWithLink";
import StepBadge from "./components/StepBadge";
import Toggle from "./components/Toggle";
import UpdateConfigurationDialog from "./components/UpdateConfigurationDialog/UpdateConfigurationDialog";
import WorkflowRecipesInfoBanner from "./components/WorkflowRecipesInfoBanner";
import YmlEditor from "./components/YmlEditor/YmlEditor";
import YmlEditorHeader from "./components/YmlEditorHeader/YmlEditorHeader";
import { RootComponent, withRootProvider } from "./utils/withRootProvider";

import {
  ChainWorkflowDrawer,
  CreateWorkflowDialog,
  DeleteWorkflowDialog,
  StepConfigPanel,
  StepItem,
  VersionChangeDialog,
  WorkflowConfigPanel,
  WorkflowToolbar,
} from "@/pages/WorkflowsPage";
import {
  PipelinesPage,
  SecretsPage,
  TriggersPage,
  WorkflowsPage,
} from "@/pages";
import {
  StepBundlePanel,
  StepSelectorDrawer,
  WithBlockPanel,
  WorkflowEmptyState,
} from "@/components/unified-editor";

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
      "workflows",
      "selectedWorkflow",
      "selectWorkflow",
      "createWorkflow",
      "chainWorkflow",
      "deleteWorkflow",
      "rearrangeWorkflows",
      "uniqueStepCount",
      "canRunWorkflow",
      "isRunWorkflowDisabled",
    ]),
  )
  .component(
    "rWorkflowEmptyState",
    register(WorkflowEmptyState, ["onCreateWorkflow"]),
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
    "rStepSelectorDrawer",
    register(StepSelectorDrawer, [
      "isOpen",
      "onClose",
      "enabledSteps",
      "onSelectStep",
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
      "onDeleteWorkflow",
    ]),
  )
  .component(
    "rCreateWorkflowDialog",
    register(CreateWorkflowDialog, [
      "yml",
      "isOpen",
      "onClose",
      "onCreateWorkflow",
    ]),
  )
  .component("rStepBundlePanel", register(StepBundlePanel, ["bundleName"]))
  .component(
    "rWithBlockPanel",
    register(WithBlockPanel, ["groupName", "imageName", "services"]),
  );
