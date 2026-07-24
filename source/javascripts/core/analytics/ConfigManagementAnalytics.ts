import { EntityKind, TreeNode } from '@/core/models/Tree';
import { bitriseYmlStore, isFileDirty } from '@/core/stores/BitriseYmlStore';
import GlobalProps from '@/core/utils/GlobalProps';
import PageProps from '@/core/utils/PageProps';

import { segmentTrack } from './SegmentBaseTracking';

type YmlSource = 'git' | 'bitrise';

/** How a YAML module tab was opened, for `Workflow Editor Yml Module Opened`. */
export type ModuleOpenMethod = 'file_explorer' | 'edit_definition';

// The Avo tracking plan uses singular entity_type values; map our internal EntityKind to them.
const ENTITY_TYPE_BY_KIND: Record<EntityKind, string> = {
  workflows: 'workflow',
  pipelines: 'pipeline',
  stepBundles: 'step_bundle',
  containers: 'container',
  appEnvs: 'env_var',
};

/**
 * Modular-config properties shared by several events: whether the config is modular (has any
 * include) and, if so, how many includes it has in total and how many of those are cross-repo.
 * Derived from the loaded tree; `{ is_modular_config: false }` in single-file mode.
 */
function modularConfigProps() {
  const { tree } = bitriseYmlStore.getState();
  if (!tree) {
    return { is_modular_config: false as const };
  }

  let includes = 0;
  let crossRepoIncludes = 0;
  const walk = (node: TreeNode) => {
    node.includes.forEach((child) => {
      includes += 1;
      if (child.source?.repository) {
        crossRepoIncludes += 1;
      }
      walk(child);
    });
  };
  walk(tree);

  return {
    is_modular_config: true as const,
    number_of_includes_in_bitrise_yml: includes,
    number_of_cross_repo_includes_in_bitrise_yml: crossRepoIncludes,
  };
}

/**
 * How many module files changed in the current save/push. In modular mode it's the number of files
 * with unsaved edits; in single-file mode the one root bitrise.yml counts as the single changed
 * module (a push only happens when there are changes).
 */
function changedModulesCount() {
  const { tree, files } = bitriseYmlStore.getState();
  if (!tree) {
    return 1;
  }
  return Object.values(files).filter((file) => isFileDirty(file)).length;
}

export function trackSaveButtonClicked(
  source: 'save_changes_button' | 'save_changes_keyboard_shortcut_pressed',
  tabName: string | undefined,
  currentBranch: string | undefined,
  conversationId: string | undefined,
  turnCount: number | undefined,
) {
  segmentTrack('Workflow Editor Save Button Clicked', {
    app_slug: PageProps.appSlug(),
    workspace_slug: GlobalProps.workspaceSlug(),
    source,
    tab_name: tabName,
    platform: 'website',
    ai_assistant_conversation_id: conversationId,
    turn_count: turnCount,
    current_branch: currentBranch,
    default_branch: PageProps.app()?.defaultBranch,
    git_provider: PageProps.app()?.gitProvider,
  });
}

export function trackDownloadYmlClicked(ymlSource: YmlSource, source: string) {
  segmentTrack('Workflow Editor Download Yml Button Clicked', {
    app_slug: PageProps.appSlug(),
    workspace_slug: GlobalProps.workspaceSlug(),
    yml_source: ymlSource,
    source,
    platform: 'website',
  });
}

export function trackCopyYmlClicked(ymlSource: YmlSource, source: string) {
  segmentTrack('Workflow Editor Copy Current Bitrise Yml Content Button Clicked', {
    yml_source: ymlSource,
    source,
  });
}

export function trackChangeStorageButtonClicked(ymlSource: YmlSource) {
  segmentTrack('Change Configuration Yml Source Button Clicked', {
    app_slug: PageProps.appSlug(),
    workspace_slug: GlobalProps.workspaceSlug(),
    git_provider: PageProps.app()?.gitProvider,
    yml_source: ymlSource,
  });
}

export function trackValidateAndSaveStorageClicked(ymlSource: YmlSource, selectedYmlSource?: YmlSource) {
  const eventProps: Record<string, unknown> = {
    yml_source: ymlSource,
    workspace_slug: GlobalProps.workspaceSlug(),
    app_slug: PageProps.appSlug(),
    git_provider: PageProps.app()?.gitProvider || '',
    platform: 'website',
  };
  if (selectedYmlSource !== undefined) {
    eventProps.selected_yml_source = selectedYmlSource;
  }
  segmentTrack('Validate And Save Configuration Yml Source Button Clicked', eventProps);
}

export function trackStorageSuccessfullyChanged(ymlSource: YmlSource) {
  segmentTrack('Configuration Yml Source Successfully Changed Message Shown', {
    yml_source: ymlSource,
  });
}

export function trackBranchSwitchPopupShown() {
  segmentTrack('Branch Switch Popup Shown', {
    app_slug: PageProps.appSlug(),
    workspace_slug: GlobalProps.workspaceSlug(),
    git_provider: PageProps.app()?.gitProvider,
  });
}

export function trackBranchSwitchAttempted(currentBranch: string | undefined, requestedBranch: string) {
  segmentTrack('Branch Switch Attempted', {
    app_slug: PageProps.appSlug(),
    workspace_slug: GlobalProps.workspaceSlug(),
    git_provider: PageProps.app()?.gitProvider,
    current_branch: currentBranch,
    requested_branch: requestedBranch,
    default_branch: PageProps.app()?.defaultBranch,
  });
}

export function trackBranchSwitchSucceeded(currentBranch: string | undefined, requestedBranch: string) {
  segmentTrack('Branch Switch Succeeded', {
    app_slug: PageProps.appSlug(),
    workspace_slug: GlobalProps.workspaceSlug(),
    git_provider: PageProps.app()?.gitProvider,
    current_branch: currentBranch,
    requested_branch: requestedBranch,
    default_branch: PageProps.app()?.defaultBranch,
  });
}

export function trackBranchSwitchFailed(
  currentBranch: string | undefined,
  requestedBranch: string,
  errorReason: string | undefined,
) {
  segmentTrack('Branch Switch Failed', {
    app_slug: PageProps.appSlug(),
    workspace_slug: GlobalProps.workspaceSlug(),
    git_provider: PageProps.app()?.gitProvider,
    current_branch: currentBranch,
    requested_branch: requestedBranch,
    default_branch: PageProps.app()?.defaultBranch,
    error_reason: errorReason,
  });
}

export function trackPushConfigChangesPopupShown(currentBranch: string | undefined) {
  segmentTrack('Push Config Changes Popup Shown', {
    app_slug: PageProps.appSlug(),
    workspace_slug: GlobalProps.workspaceSlug(),
    git_provider: PageProps.app()?.gitProvider,
    current_branch: currentBranch,
    default_branch: PageProps.app()?.defaultBranch,
  });
}

export function trackPushConfigChangesAttempted(currentBranch: string | undefined, targetBranch: string) {
  segmentTrack('Push Config Changes Attempted', {
    app_slug: PageProps.appSlug(),
    workspace_slug: GlobalProps.workspaceSlug(),
    git_provider: PageProps.app()?.gitProvider,
    current_branch: currentBranch,
    target_branch: targetBranch,
    is_new_target_branch: targetBranch !== currentBranch,
    default_branch: PageProps.app()?.defaultBranch,
    ...modularConfigProps(),
    number_of_modules_changed: changedModulesCount(),
  });
}

export function trackPushConfigChangesSucceeded(currentBranch: string | undefined, targetBranch: string) {
  segmentTrack('Push Config Changes Succeeded', {
    app_slug: PageProps.appSlug(),
    workspace_slug: GlobalProps.workspaceSlug(),
    git_provider: PageProps.app()?.gitProvider,
    current_branch: currentBranch,
    target_branch: targetBranch,
    is_new_target_branch: targetBranch !== currentBranch,
    default_branch: PageProps.app()?.defaultBranch,
    ...modularConfigProps(),
    // Tracked before the post-push reload clears the local dirty state, so the count is still accurate.
    number_of_modules_changed: changedModulesCount(),
  });
}

export function trackPushConfigChangesFailed(
  currentBranch: string | undefined,
  targetBranch: string,
  errorReason: string | undefined,
) {
  segmentTrack('Push Config Changes Failed', {
    app_slug: PageProps.appSlug(),
    workspace_slug: GlobalProps.workspaceSlug(),
    git_provider: PageProps.app()?.gitProvider,
    current_branch: currentBranch,
    target_branch: targetBranch,
    is_new_target_branch: targetBranch !== currentBranch,
    default_branch: PageProps.app()?.defaultBranch,
    error_reason: errorReason,
    ...modularConfigProps(),
    number_of_modules_changed: changedModulesCount(),
  });
}

export function trackOpenPrAttempted(targetBranch: string) {
  segmentTrack('Open Pr Attempted', {
    app_slug: PageProps.appSlug(),
    workspace_slug: GlobalProps.workspaceSlug(),
    git_provider: PageProps.app()?.gitProvider,
    target_branch: targetBranch,
  });
}

export function trackConfigBranchLoaded(currentBranch: string | undefined) {
  segmentTrack('Config Branch Loaded', {
    app_slug: PageProps.appSlug(),
    workspace_slug: GlobalProps.workspaceSlug(),
    git_provider: PageProps.app()?.gitProvider,
    current_branch: currentBranch,
    default_branch: PageProps.app()?.defaultBranch,
    ...modularConfigProps(),
  });
}

/**
 * The user opened the file-explorer drawer (the "+" at the end of the module tab bar) to open a
 * YAML module. — Avo dc-5427
 */
export function trackWorkflowEditorFileExplorerOpened() {
  segmentTrack('Workflow Editor File Explorer Opened', {
    app_slug: PageProps.appSlug(),
    workspace_slug: GlobalProps.workspaceSlug(),
    platform: 'website',
  });
}

/**
 * A YAML module was opened as a tab (next to the read-only Merged Config tab). `openMethod` is the
 * source that opened it; `entityType` / `numberOfDefinitions` are only sent for `edit_definition`
 * (the "Edit definition" jump). — Avo dc-5427
 */
export function trackWorkflowEditorYmlModuleOpened({
  openMethod,
  entityKind,
  numberOfDefinitions,
}: {
  openMethod: ModuleOpenMethod;
  entityKind?: EntityKind;
  numberOfDefinitions?: number;
}) {
  segmentTrack('Workflow Editor Yml Module Opened', {
    app_slug: PageProps.appSlug(),
    workspace_slug: GlobalProps.workspaceSlug(),
    platform: 'website',
    open_method: openMethod,
    ...(openMethod === 'edit_definition' && {
      entity_type: entityKind ? ENTITY_TYPE_BY_KIND[entityKind] : 'other',
      number_of_definitions: numberOfDefinitions,
    }),
  });
}

export function trackConfigMergePopupShown(
  tabName: string | undefined,
  targetBranch: string | undefined,
  isNewTargetBranch: boolean,
) {
  segmentTrack('Workflow Editor Config Merge Popup Shown', {
    tab_name: tabName,
    app_slug: PageProps.appSlug(),
    workspace_slug: GlobalProps.workspaceSlug(),
    platform: 'website',
    git_provider: PageProps.app()?.gitProvider,
    target_branch: targetBranch,
    is_new_target_branch: isNewTargetBranch,
  });
}

export function trackConfigMergePopupDismissed(tabName: string | undefined) {
  segmentTrack('Workflow Editor Config Merge Popup Dismissed', {
    tab_name: tabName,
    popup_step_dismiss_method: 'close_button',
  });
}

export function trackConfigMergeSaveClicked(
  tabName: string | undefined,
  targetBranch: string,
  isNewTargetBranch: boolean,
) {
  segmentTrack('Workflow Editor Config Merge Popup Save Results Button Clicked', {
    tab_name: tabName,
    app_slug: PageProps.appSlug(),
    workspace_slug: GlobalProps.workspaceSlug(),
    platform: 'website',
    git_provider: PageProps.app()?.gitProvider,
    target_branch: targetBranch,
    is_new_target_branch: isNewTargetBranch,
  });
}
