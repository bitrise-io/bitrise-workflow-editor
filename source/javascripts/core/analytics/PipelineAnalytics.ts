import GlobalProps from '@/core/utils/GlobalProps';
import PageProps from '@/core/utils/PageProps';
import { segmentTrack } from './SegmentBaseTracking';

export function trackCreatePipelineDialogShown(source: 'pipeline_empty_state' | 'pipeline_selector') {
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
  numberOfStages: number | undefined,
  source: 'create_pipeline_popup' | 'pipeline_conversion_signposting_banner',
) {
  segmentTrack('Pipeline Created', {
    event_type: 'product',
    platform: 'website',
    source,
    workspace_slug: GlobalProps.workspaceSlug(),
    app_slug: PageProps.appSlug(),
    pipeline_name: pipelineId,
    pipeline_type: 'graph',
    based_on_pipeline_name: basePipelineId,
    based_on_pipeline_type: basePipelineType,
    based_on_pipeline_number_of_stages: numberOfStages,
    is_based_on_existing_pipeline: !!basePipelineId,
  });
}

export function trackConvertPipelineBannerDisplayed(pipelineId: string, numberOfStages: number | undefined) {
  segmentTrack('Pipeline Conversion Signposting Banner Displayed', {
    event_type: 'technical',
    workspace_slug: GlobalProps.workspaceSlug(),
    app_slug: PageProps.appSlug(),
    pipeline_name: pipelineId,
    pipeline_type: 'staged',
    number_of_stages_in_pipeline: numberOfStages,
  });
}

export function trackConvertPipelineBannerDismissed(pipelineId: string, numberOfStages: number | undefined) {
  segmentTrack('Pipeline Conversion Signposting Banner Dismissed', {
    workspace_slug: GlobalProps.workspaceSlug(),
    app_slug: PageProps.appSlug(),
    pipeline_name: pipelineId,
    pipeline_type: 'staged',
    number_of_stages_in_pipeline: numberOfStages,
  });
}

export function trackConvertPipelineBannerCtaClicked(
  pipelineId: string,
  basePipelineId: string,
  numberOfStages?: number,
) {
  trackPipelineCreated(pipelineId, basePipelineId, 'staged', numberOfStages, 'pipeline_conversion_signposting_banner');
}
