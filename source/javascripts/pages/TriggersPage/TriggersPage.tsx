/* eslint-disable react-hooks/exhaustive-deps */
import { Link, Notification, Text } from '@bitrise/bitkit';
import { useUserMetaData } from '@/hooks/useUserMetaData';
import WindowUtils from '@/core/utils/WindowUtils';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import { BitriseYml } from '@/core/models/BitriseYml';
import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';
import { getPipelineableTriggers } from './TriggersPage.utils';
import SelectiveTriggers from './components/SelectiveTriggers';
import LegacyTriggers from './components/LegacyTriggers';

const TRIGGERS_CONFIGURED_METADATA_KEY = 'wfe_triggers_configure_webhooks_notification_closed';

export type TriggersPageContentProps = {
  yml: BitriseYml;
};

const TriggersPageContent = (props: TriggersPageContentProps) => {
  const { yml } = props;

  const appSlug = WindowUtils.appSlug() ?? '';
  const isWebsiteMode = RuntimeUtils.isWebsiteMode();

  const pipelineableTriggers = getPipelineableTriggers(yml);
  console.log('pipelineableTriggers', pipelineableTriggers);

  const integrationsUrl = appSlug ? `/app/${appSlug}/settings/integrations?tab=webhooks` : '';

  const { isVisible: isWebhookNotificationOpen, close: closeWebhookNotification } = useUserMetaData({
    key: TRIGGERS_CONFIGURED_METADATA_KEY,
    enabled: isWebsiteMode,
  });

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
      {isWebhookNotificationOpen && (
        <Notification
          status="info"
          onClose={closeWebhookNotification}
          action={{ href: integrationsUrl, label: 'Set up webhooks' }}
          marginY="32"
        >
          <Text fontWeight="bold">Configure webhooks</Text>
          <Text>Enable Bitrise to interact with third-party services and are necessary for triggers to work.</Text>
        </Notification>
      )}
      <SelectiveTriggers pipelineableTriggers={pipelineableTriggers} />
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
