import { toMerged } from 'es-toolkit';
import { AnalyticsBrowser } from '@segment/analytics-next';

import PageProps from '@/core/utils/PageProps';
import GlobalProps from '@/core/utils/GlobalProps';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import WindowUtils from '@/core/utils/WindowUtils';

const segmentKey = GlobalProps.env()?.SEGMENT_JS_WRITE_KEY_NEW || '';
let segmentAnalytics: AnalyticsBrowser;

if (segmentKey) {
  segmentAnalytics = AnalyticsBrowser.load(
    {
      cdnURL: 'https://pa-events-cdn.bitrise.io',
      writeKey: segmentKey,
    },
    {
      initialPageview: false,
      integrations: {
        'Segment.io': {
          apiHost: 'pa-events-api.bitrise.io/v1',
          protocol: 'https',
        },
      },
      obfuscate: true,
    },
  );

  if (GlobalProps.userSlug()) {
    segmentAnalytics.identify(GlobalProps.userSlug());
  }
}

type SegmentEventProperties = {
  [key: string]: unknown;
  app_slug: string;
  event_schema_version: number;
  event_scope: 'user' | 'app' | 'workspace';
  event_type: 'core' | 'product' | 'interaction' | 'technical';
  event_workspace_association: 'workspace_specific' | 'not_workspace_related' | 'implicit';
  initiator: 'user' | 'system';
  is_known_user: boolean;
  page_url: string;
  platform: 'website';
  source_service_name: 'workflow-editor';
  source_service_version: string;
  tracking_type: 'server_side' | 'client_side' | 'client_to_server';
  workspace_slug: string;
};

type SegmentEventContext = {
  [key: string]: unknown;
  workspace_slug: string;
};

const baseProperties: SegmentEventProperties = {
  app_slug: PageProps.appSlug(),
  event_schema_version: 1,
  event_scope: 'user',
  event_type: 'interaction',
  event_workspace_association: 'workspace_specific',
  initiator: 'user',
  is_known_user: RuntimeUtils.isWebsiteMode(),
  page_url: window.location.href,
  platform: 'website',
  source_service_name: 'workflow-editor',
  source_service_version: process.env.WFE_VERSION || '',
  tracking_type: 'client_side',
  workspace_slug: GlobalProps.workspaceSlug(),
};

const baseContext: SegmentEventContext = {
  workspace_slug: GlobalProps.workspaceSlug(),
};

export const segmentTrack = (
  eventName: string,
  eventProps?: Partial<SegmentEventProperties>,
  eventContext?: Partial<SegmentEventContext>,
) => {
  const mergedProps = toMerged(baseProperties, eventProps || {});
  const mergedContext = toMerged(baseContext, eventContext || {});
  console.debug('Tracking event:', eventName, mergedProps, mergedContext);

  if (RuntimeUtils.isWebsiteMode() && segmentAnalytics) {
    segmentAnalytics?.track(eventName, mergedProps, mergedContext);

    if (WindowUtils.dataLayer()) {
      WindowUtils.dataLayer()?.push({
        event: eventName,
        ...mergedProps,
      });
    }
  }
};
