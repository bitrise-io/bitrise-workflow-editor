import { Link, Text } from '@bitrise/bitkit';
import { BitkitAlert } from '@bitrise/bitkit-v2';

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
    <BitkitAlert
      position="absolute"
      zIndex="1000"
      left="50%"
      transform="translateX(-50%)"
      variant="info"
      whiteSpace="nowrap"
      width="auto"
      dismissible
      onClose={() => updateSplitMetaData('true')}
      messageText={
        <>
          Optimize your config by splitting your{' '}
          <Text as="span" fontWeight="600">
            {ymlSettings.lines}-lines
          </Text>{' '}
          YAML file into smaller chunks.{' '}
          <Link
            href="https://docs.bitrise.io/en/bitrise-ci/configure-builds/configuration-yaml/modular-yaml-configuration.html"
            isExternal
            isUnderlined
          >
            Learn more
          </Link>
        </>
      }
    />
  );
};

export default OptimizeYouCiConfigBySplittingNotification;
