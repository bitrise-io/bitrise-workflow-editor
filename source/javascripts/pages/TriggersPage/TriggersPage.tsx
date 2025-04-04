import { Link, Notification, Text } from '@bitrise/bitkit';

import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';
import { BitriseYml } from '@/core/models/BitriseYml';
import PageProps from '@/core/utils/PageProps';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useUserMetaData from '@/hooks/useUserMetaData';
import LegacyTriggers from './components/LegacyTriggers/LegacyTriggers';
import TargetBasedTriggers from './components/TargetBasedTriggers/TargetBasedTriggers';

const TRIGGERS_CONFIGURED_METADATA_KEY = 'wfe_triggers_configure_webhooks_notification_closed';

export const TriggersPageContent = () => {
  const { yml } = useBitriseYmlStore();

  const appSlug = PageProps.appSlug();

  const integrationsUrl = appSlug ? `/app/${appSlug}/settings/integrations?tab=webhooks` : '';

  const isWebsiteMode = RuntimeUtils.isWebsiteMode();

  const { value: metaDataValue, update: updateMetaData } = useUserMetaData(
    TRIGGERS_CONFIGURED_METADATA_KEY,
    isWebsiteMode,
  );

  return (
    <>
      <Text as="h2" textStyle="heading/h2" marginBlockEnd="4">
        Triggers
      </Text>
      <Text color="text/secondary" marginBlockEnd="32">
        Triggers help you start builds automatically.{' '}
        <Link
          colorScheme="purple"
          href="https://devcenter.bitrise.io/en/builds/starting-builds/triggering-builds-automatically.html"
          isExternal
        >
          Learn more
        </Link>
      </Text>
      {metaDataValue === null && (
        <Notification
          status="info"
          onClose={() => updateMetaData('true')}
          action={{ href: integrationsUrl, label: 'Set up webhooks' }}
          marginY="32"
        >
          <Text fontWeight="bold">Configure webhooks</Text>
          <Text>Enable Bitrise to interact with third-party services and are necessary for triggers to work.</Text>
        </Notification>
      )}
      <TargetBasedTriggers yml={yml} />
      {!!yml.trigger_map && <LegacyTriggers yml={yml} />}
    </>
  );
};

type Props = {
  onChange: (yml: BitriseYml) => void;
  yml: BitriseYml;
};

const TriggersPage = ({ onChange, yml }: Props) => {
  return (
    <BitriseYmlProvider yml={yml} onChange={onChange}>
      <TriggersPageContent />
    </BitriseYmlProvider>
  );
};

export default TriggersPage;
