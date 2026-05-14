import GlobalProps from '@/core/utils/GlobalProps';
import PageProps from '@/core/utils/PageProps';

import { segmentTrack } from './SegmentBaseTracking';

type YmlSource = 'git' | 'bitrise';

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
