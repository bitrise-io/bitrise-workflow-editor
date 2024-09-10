import merge from 'lodash/merge';
import { AnalyticsBrowser } from '@segment/analytics-next';
import WindowUtils from '@/core/utils/WindowUtils';

const { globalProps, dataLayer } = window.parent || {};

const { account, user }: any = globalProps || {};

const segmentKey = globalProps?.env.SEGMENT_JS_WRITE_KEY_NEW || '';
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

  if (user?.slug) {
    segmentAnalytics.identify(user.slug);
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
  app_slug: WindowUtils.appSlug() ?? '',
  event_schema_version: 1,
  event_scope: 'user',
  event_type: 'interaction',
  event_workspace_association: 'workspace_specific',
  initiator: 'user',
  is_known_user: true,
  page_url: window.location.href,
  platform: 'website',
  source_service_name: 'workflow-editor',
  source_service_version: window.serviceVersion,
  tracking_type: 'client_side',
  workspace_slug: account?.slug || '',
};

const baseContext: SegmentEventContext = {
  workspace_slug: account?.slug || '',
};

export const segmentTrack = (
  eventName: string,
  eventProps?: Partial<SegmentEventProperties>,
  eventContext?: Partial<SegmentEventContext>,
) => {
  if (segmentAnalytics) {
    const mergedProps = merge({}, baseProperties, eventProps || {});
    const mergedContext = merge({}, baseContext, eventContext || {});

    segmentAnalytics?.track(eventName, mergedProps, mergedContext);

    if (dataLayer) {
      dataLayer.push({
        event: eventName,
        ...mergedProps,
      });
    }
  }
};
