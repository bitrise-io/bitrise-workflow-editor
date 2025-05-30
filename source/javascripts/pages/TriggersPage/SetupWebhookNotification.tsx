import { Notification, Text } from '@bitrise/bitkit';

import PageProps from '@/core/utils/PageProps';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import useUserMetaData from '@/hooks/useUserMetaData';

const TRIGGERS_CONFIGURED_METADATA_KEY = 'wfe_triggers_configure_webhooks_notification_closed';

const SetupWebhookNotification = () => {
  const appSlug = PageProps.appSlug();
  const isWebsiteMode = RuntimeUtils.isWebsiteMode();
  const integrationsUrl = appSlug ? `/app/${appSlug}/settings/integrations?tab=webhooks` : '';

  const { value: metaDataValue, update: updateMetaData } = useUserMetaData(
    TRIGGERS_CONFIGURED_METADATA_KEY,
    isWebsiteMode,
  );

  if (metaDataValue !== null) {
    return null;
  }

  return (
    <Notification
      status="info"
      onClose={() => updateMetaData('true')}
      action={{ href: integrationsUrl, label: 'Set up webhooks' }}
      marginY="32"
    >
      <Text fontWeight="bold">Configure webhooks</Text>
      <Text>Enable Bitrise to interact with third-party services and are necessary for triggers to work.</Text>
    </Notification>
  );
};

export default SetupWebhookNotification;
