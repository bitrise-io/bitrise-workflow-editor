import PageProps from '@/core/utils/PageProps';
import GlobalProps from '@/core/utils/GlobalProps';

import { segmentTrack } from './SegmentBaseTracking';

export function trackCreateWorkflowDialogShown(source: 'workflow_empty_state' | 'workflow_selector') {
  segmentTrack('Create Workflow Popup Shown', {
    source,
    event_type: 'interaction',
    app_slug: PageProps.appSlug(),
    workspace_slug: GlobalProps.workspaceSlug(),
  });
}

export function trackWorkflowCreated(workflowId: string, baseWorkflowId?: string) {
  segmentTrack('Workflow Created', {
    event_type: 'product',
    platform: 'website',
    workspace_slug: GlobalProps.workspaceSlug(),
    app_slug: PageProps.appSlug(),
    workflow_name: workflowId,
    based_on_workflow_name: baseWorkflowId,
    is_based_on_existing_workflow: !!baseWorkflowId,
  });
}
