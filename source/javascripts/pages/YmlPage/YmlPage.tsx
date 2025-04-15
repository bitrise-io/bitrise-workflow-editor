import { Box, Link, Notification, Text } from '@bitrise/bitkit';

import RuntimeUtils from '@/core/utils/RuntimeUtils';
import { useCiConfigSettings } from '@/hooks/useCiConfigSettings';
import useUserMetaData from '@/hooks/useUserMetaData';

import YmlEditor from './components/YmlEditor';
import YmlEditorHeader from './components/YmlEditorHeader';

const SPLITTED_METADATA_KEY = 'wfe_modular_yaml_git_notification_closed';
const SPLIT_METADATA_ENTERPRISE_KEY = 'wfe_modular_yaml_enterprise_notification_closed';
const SPLIT_METADATA_KEY = 'wfe_modular_yaml_split_notification_closed';

// TODO: implement onConfigSourceChangeSaved function
const YmlPage = () => {
  const isWebsiteMode = RuntimeUtils.isWebsiteMode();
  const { data: ymlSettings } = useCiConfigSettings();
  const { value: splittedMetaDataValue, update: updateSplittedMetaData } = useUserMetaData(
    SPLITTED_METADATA_KEY,
    Boolean(isWebsiteMode && ymlSettings && ymlSettings.isYmlSplit && ymlSettings.usesRepositoryYml),
  );
  const { value: splitMetaDataValue, update: updateSplitMetaData } = useUserMetaData(
    ymlSettings?.isModularYamlSupported ? SPLIT_METADATA_ENTERPRISE_KEY : SPLIT_METADATA_KEY,
    Boolean(isWebsiteMode && ymlSettings && !ymlSettings.isYmlSplit && ymlSettings.lines > 500),
  );

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <YmlEditorHeader />
      <Box flexGrow="1" flexShrink="1" paddingBlock="12" backgroundColor="#1e1e1e" position="relative">
        {isWebsiteMode && ymlSettings && splittedMetaDataValue === null && (
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
            Your configuration in the Git repository is split across multiple files, but on this page you can see it as
            one merged YAML.
          </Notification>
        )}
        {isWebsiteMode && ymlSettings && splitMetaDataValue === null && (
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
        )}
        <YmlEditor />
      </Box>
    </Box>
  );
};

export default YmlPage;
