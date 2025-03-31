import { Box, Link, Notification, Text } from '@bitrise/bitkit';
import { BitriseYmlSettings } from '@/core/models/BitriseYmlSettings';
import useUserMetaData from '@/hooks/useUserMetaData';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import YmlEditor from './components/YmlEditor';
import YmlEditorHeader from './components/YmlEditorHeader';

const SPLITTED_METADATA_KEY = 'wfe_modular_yaml_git_notification_closed';
const SPLIT_METADATA_ENTERPRISE_KEY = 'wfe_modular_yaml_enterprise_notification_closed';
const SPLIT_METADATA_KEY = 'wfe_modular_yaml_split_notification_closed';

type YmlPageProps = {
  ciConfigYml: string;
  onConfigSourceChangeSaved: (usesRepositoryYml: boolean, ymlRootPath: string) => void;
  onEditorChange: (changedText?: string) => void;
  isEditorLoading: boolean;
  ymlSettings: BitriseYmlSettings;
};

const YmlPage = (props: YmlPageProps) => {
  const { ciConfigYml, isEditorLoading, onConfigSourceChangeSaved, onEditorChange, ymlSettings } = props;

  const isWebsiteMode = RuntimeUtils.isWebsiteMode();

  const { value: splittedMetaDataValue, update: updateSplittedMetaData } = useUserMetaData(
    SPLITTED_METADATA_KEY,
    isWebsiteMode && !!ymlSettings.isYmlSplit && !!ymlSettings.usesRepositoryYml,
  );
  const { value: splitMetaDataValue, update: updateSplitMetaData } = useUserMetaData(
    ymlSettings.isModularYamlSupported ? SPLIT_METADATA_ENTERPRISE_KEY : SPLIT_METADATA_KEY,
    isWebsiteMode && !ymlSettings.isYmlSplit && ymlSettings.lines > 500,
  );

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <YmlEditorHeader
        ciConfigYml={ciConfigYml}
        onConfigSourceChangeSaved={onConfigSourceChangeSaved}
        ymlSettings={ymlSettings || {}}
      />
      <Box flexGrow="1" flexShrink="1" paddingBlock="12" backgroundColor="#1e1e1e" position="relative">
        {(splitMetaDataValue === null || splittedMetaDataValue === null) && (
          <Notification
            pos="absolute"
            zIndex="1000"
            left="50%"
            transform="translateX(-50%)"
            status="info"
            onClose={() => {
              if (splitMetaDataValue === null) {
                updateSplitMetaData('true');
              }
              if (splittedMetaDataValue === null) {
                updateSplittedMetaData('true');
              }
            }}
            whiteSpace="nowrap"
            width="auto"
          >
            {splitMetaDataValue === null && (
              <>
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
              </>
            )}
            {splittedMetaDataValue === null && (
              <>
                Your configuration in the Git repository is split across multiple files, but on this page you can see it
                as one merged YAML.
              </>
            )}
          </Notification>
        )}
        <YmlEditor
          ciConfigYml={ciConfigYml}
          isLoading={isEditorLoading}
          readOnly={!!ymlSettings?.usesRepositoryYml}
          onEditorChange={onEditorChange}
        />
      </Box>
    </Box>
  );
};

export default YmlPage;
