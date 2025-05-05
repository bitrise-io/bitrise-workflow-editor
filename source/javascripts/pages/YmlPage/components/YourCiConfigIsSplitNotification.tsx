import { Notification } from '@bitrise/bitkit';

import { useCiConfigSettings } from '@/hooks/useCiConfigSettings';
import useUserMetaData from '@/hooks/useUserMetaData';

const SPLITTED_METADATA_KEY = 'wfe_modular_yaml_git_notification_closed';

const YourCiConfigIsSplitNotification = () => {
  const { data: ymlSettings, isLoading } = useCiConfigSettings();
  const { value: splittedMetaDataValue, update: updateSplittedMetaData } = useUserMetaData(
    SPLITTED_METADATA_KEY,
    Boolean(ymlSettings && ymlSettings.isYmlSplit && ymlSettings.usesRepositoryYml),
  );

  if (isLoading || splittedMetaDataValue !== null) {
    return null;
  }

  return (
    <Notification
      pos="absolute"
      zIndex="1000"
      left="50%"
      transform="translateX(-50%)"
      status="info"
      onClose={() => updateSplittedMetaData('true')}
      whiteSpace="nowrap"
      width="auto"
    >
      Your configuration in the Git repository is split across multiple files, but on this page you can see it as one
      merged YAML.
    </Notification>
  );
};

export default YourCiConfigIsSplitNotification;
