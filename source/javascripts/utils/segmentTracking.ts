import merge from 'lodash/merge';
import { AnalyticsBrowser } from '@segment/analytics-next';

const { globalProps, dataLayer } = window.parent;

const { account, user }: any = globalProps;

let newSegmentAnalytics: AnalyticsBrowser;

if (window.segmentWriteKey) {
  newSegmentAnalytics = AnalyticsBrowser.load(
    {
      cdnURL: 'https://pa-events-cdn.bitrise.io',
      writeKey: window.segmentWriteKey,
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

  newSegmentAnalytics.identify(user.slug);
}

type SegmentEventProperties = {
  [key: string]: unknown;
  event_schema_version: number;
  event_scope: 'user' | 'app' | 'workspace';
  event_type: 'core' | 'product' | 'interaction' | 'technical';
  event_workspace_association: 'workspace_specific' | 'not_workspace_related' | 'implicit';
  initiator: 'user' | 'system';
  is_known_user: boolean;
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
  event_schema_version: 1,
  event_scope: 'user',
  event_type: 'interaction',
  event_workspace_association: 'workspace_specific',
  initiator: 'user',
  is_known_user: true,
  page_url: window.location.href,
  source_service_name: 'workflow-editor',
  source_service_version: window.serviceVersion,
  tracking_type: 'client_side',
  workspace_slug: account.slug,
};

const baseContext: SegmentEventContext = {
  workspace_slug: account.slug,
};

const dataLayerPush = (eventName: string, props: Partial<SegmentEventProperties>) => {
  dataLayer?.push({
    event: eventName,
    ...props,
  });
};

export const segmentTrack = (
  eventName: string,
  eventProps?: Partial<SegmentEventProperties>,
  eventContext?: Partial<SegmentEventContext>,
) => {
  if (newSegmentAnalytics) {
    const mergedProps = merge({}, baseProperties, eventProps || {});
    const mergedContext = merge({}, baseContext, eventContext || {});

    newSegmentAnalytics?.track(eventName, mergedProps, mergedContext);

    dataLayerPush(eventName, mergedProps);
  }
};
