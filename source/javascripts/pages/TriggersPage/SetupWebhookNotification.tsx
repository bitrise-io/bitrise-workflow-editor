import { BitkitAlert } from '@bitrise/bitkit-v2';

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
    <BitkitAlert
      variant="info"
      data-clarity-unmask="true"
      dismissible
      onClose={() => updateMetaData('true')}
      action={{ href: integrationsUrl, label: 'Set up webhooks' }}
      marginBlock="32"
      titleText="Set up webhooks to activate your triggers"
      messageText="Triggers need a webhook to detect activity in your repository. Set one up so pushes and pull requests can start builds automatically."
    />
  );
};

export default SetupWebhookNotification;
