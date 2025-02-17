import { react2angular } from '@bitrise/react2angular';
import { Checkbox, Icon } from '@bitrise/bitkit';

import { RootComponent, withRootProvider } from './utils/withRootProvider';

import Header from './components/Header';
import Toggle from './components/Toggle';
import StepBadge from './components/StepBadge';
import Navigation from './components/Navigation';
import InfoTooltip from './components/InfoTooltip';
import Notification from './components/Notification';
import DiffEditorDialog from './components/DiffEditor/DiffEditorDialog';
import ConfigMergeDialog from './components/ConfigMergeDialog/ConfigMergeDialog';
import NotificationMessageWithLink from './components/NotificationMessageWithLink';
import UpdateConfigurationDialog from './components/unified-editor/UpdateConfigurationDialog/UpdateConfigurationDialog';

import {
  PipelinesPage,
  SecretsPage,
  StepBundlesPage,
  TriggersPage,
  WorkflowsPage,
  YmlPage,
  LicensesPage,
} from './pages';

function register(component, props, injects) {
  return react2angular(withRootProvider(component), props, injects);
}

// Page components
angular
  .module('BitriseWorkflowEditor')
  .component('rTriggersPage', register(TriggersPage, ['yml', 'onChange']))
  .component(
    'rSecretsPage',
    register(SecretsPage, [
      'appSlug',
      'onSecretsChange',
      'sharedSecretsAvailable',
      'secretSettingsUrl',
      'planSelectorPageUrl',
    ]),
  )
  .component('rPipelinesPage', register(PipelinesPage, ['yml', 'onChange']))
  .component('rWorkflowsPage', register(WorkflowsPage, ['yml', 'onChange']))
  .component('rStepBundlesPage', register(StepBundlesPage, ['yml', 'onChange']))
  .component(
    'rYmlPage',
    register(YmlPage, ['ciConfigYml', 'isEditorLoading', 'onConfigSourceChangeSaved', 'onEditorChange', 'ymlSettings']),
  )
  .component('rLicensesPage', register(LicensesPage, ['yml', 'onChange']));

// Components
angular
  .module('BitriseWorkflowEditor')
  .component('rNotification', register(Notification, ['message', 'title', 'status']))
  .component(
    'rNotificationMessageWithLink',
    register(NotificationMessageWithLink, ['message', 'type', 'linkUrl', 'linkText']),
  )
  .component('rCheckbox', register(Checkbox, ['children', 'isDisabled']))
  .component('rRootComponent', react2angular(RootComponent))
  .component('rIcon', register(Icon, ['name', 'textColor', 'size']))
  .component('rStepItemBadge', register(StepBadge, ['step']))
  .component(
    'rUpdateConfigurationDialog',
    register(UpdateConfigurationDialog, [
      'onClose',
      'appSlug',
      'getDataToSave',
      'onComplete',
      'defaultBranch',
      'gitRepoSlug',
    ]),
  )
  .component('rInfoTooltip', register(InfoTooltip, ['label']))
  .component('rToggle', register(Toggle, ['tooltipLabel', 'isDisabled', 'isChecked', 'onChange', 'listItemId']))
  .component(
    'rHeader',
    register(Header, [
      'appName',
      'appPath',
      'workspacePath',
      'isDiffEditorEnabled',
      'onDiffClick',
      'isDiffDisabled',
      'onSaveClick',
      'isSaveDisabled',
      'isSaveInProgress',
      'onDiscardClick',
      'isDiscardDisabled',
      'isWebsiteMode',
    ]),
  )
  .component(
    'rDiffDialog',
    register(DiffEditorDialog, ['isOpen', 'onClose', 'originalText', 'modifiedText', 'onChange']),
  )
  .component('rNavigation', register(Navigation, ['items', 'activeItem', 'onItemSelected']))
  .component('rConfigMergeDialog', register(ConfigMergeDialog, ['onSave', 'onClose']));
