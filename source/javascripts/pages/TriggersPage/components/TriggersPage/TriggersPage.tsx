/* eslint-disable react-hooks/exhaustive-deps */
import { Link, Notification, Text } from '@bitrise/bitkit';
import WindowUtils from '@/core/utils/WindowUtils';
import { BitriseYml } from '@/core/models/BitriseYml';
import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';
import useUserMetaData from '@/hooks/useUserMetaData';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import LegacyTriggers from '../LegacyTriggers/LegacyTriggers';
import TargetBasedTriggers from '../TargetBasedTriggers/TargetBasedTriggers';

const TRIGGERS_CONFIGURED_METADATA_KEY = 'wfe_triggers_configure_webhooks_notification_closed';

export type TriggersPageContentProps = {
  yml: BitriseYml;
};

const TriggersPageContent = (props: TriggersPageContentProps) => {
  const { yml } = props;

  const appSlug = WindowUtils.appSlug() ?? '';

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
      <LegacyTriggers yml={yml} />
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
      <TriggersPageContent yml={yml} />
    </BitriseYmlProvider>
  );
};

export default TriggersPage;
