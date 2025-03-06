import GlobalProps from '@/core/utils/GlobalProps';
import PageProps from '@/core/utils/PageProps';
import { segmentTrack } from './SegmentBaseTracking';

export function trackPipelineDialogShown(source: 'pipeline_empty_state' | 'pipeline_selector') {
  segmentTrack('Create Pipeline Popup Shown', {
    source,
    event_type: 'interaction',
    app_slug: PageProps.appSlug(),
    workspace_slug: GlobalProps.workspaceSlug(),
  });
}

export function trackPipelineCreated(
  pipelineId: string,
  basePipelineId: string | undefined,
  basePipelineType: 'graph' | 'staged' | undefined,
) {
  segmentTrack('Pipeline Created', {
    event_type: 'product',
    platform: 'website',
    workspace_slug: GlobalProps.workspaceSlug(),
    app_slug: PageProps.appSlug(),
    pipeline_name: pipelineId,
    pipeline_type: 'graph',
    based_on_pipeline_name: basePipelineId,
    based_on_pipeline_type: basePipelineType,
    is_based_on_existing_pipeline: !!basePipelineId,
  });
}

export function trackConversionSignpostingBannerDisplayed(pipelineId: string, numberOfStages: number | undefined) {
  segmentTrack('Pipeline Conversion Signposting Banner Displayed', {
    event_type: 'technical',
    workspace_slug: GlobalProps.workspaceSlug(),
    app_slug: PageProps.appSlug(),
    pipeline_name: pipelineId,
    pipeline_type: 'staged',
    number_of_stages: numberOfStages,
  });
}

export function trackConversionSignpostingBannerDismissed(pipelineId: string, numberOfStages: number | undefined) {
  segmentTrack('Pipeline Conversion Signposting Banner Dismissed', {
    workspace_slug: GlobalProps.workspaceSlug(),
    app_slug: PageProps.appSlug(),
    pipeline_name: pipelineId,
    pipeline_type: 'staged',
    number_of_stages: numberOfStages,
  });
}

export function trackConversionSignpostingBannerCtaClicked(pipelineId: string, basePipelineId: string) {
  trackPipelineCreated(pipelineId, basePipelineId, 'staged');
}
