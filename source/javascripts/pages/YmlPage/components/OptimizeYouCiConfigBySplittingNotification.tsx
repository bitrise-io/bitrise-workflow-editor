import { Link, Notification, Text } from '@bitrise/bitkit';

import { useCiConfigSettings } from '@/hooks/useCiConfigSettings';
import useUserMetaData from '@/hooks/useUserMetaData';

const SPLIT_METADATA_ENTERPRISE_KEY = 'wfe_modular_yaml_enterprise_notification_closed';
const SPLIT_METADATA_KEY = 'wfe_modular_yaml_split_notification_closed';

const OptimizeYouCiConfigBySplittingNotification = () => {
  const { data: ymlSettings, isLoading } = useCiConfigSettings();
  const { value: splitMetaDataValue, update: updateSplitMetaData } = useUserMetaData(
    ymlSettings?.isModularYamlSupported ? SPLIT_METADATA_ENTERPRISE_KEY : SPLIT_METADATA_KEY,
    Boolean(ymlSettings && !ymlSettings.isYmlSplit && ymlSettings.lines > 500),
  );

  if (isLoading || !ymlSettings || splitMetaDataValue !== null) {
    return null;
  }

  return (
    <Notification
      pos="absolute"
      zIndex="1000"
      left="50%"
      transform="translateX(-50%)"
      status="info"
      whiteSpace="nowrap"
      width="auto"
      onClose={() => updateSplitMetaData('true')}
    >
      Optimize your config by splitting your{' '}
      <Text as="span" fontWeight="600">
        {ymlSettings.lines}-lines
      </Text>{' '}
      YAML file into smaller chunks.{' '}
      <Link
        href="https://devcenter.bitrise.io/en/builds/configuration-yaml/modular-yaml-configuration.html"
        isExternal
        isUnderlined
      >
        Learn more
      </Link>
    </Notification>
  );
};

export default OptimizeYouCiConfigBySplittingNotification;
