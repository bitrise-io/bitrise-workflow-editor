import { useState } from 'react';
import { Box, Button, DataWidget, DataWidgetItem, Text, Tooltip, useDisclosure, Notification } from '@bitrise/bitkit';
import { segmentTrack } from '@/utils/segmentTracking';
import useUserMetaData from '@/hooks/useUserMetaData';
import { BitriseYmlSettings } from '@/core/models/BitriseYmlSettings';
import WindowUtils from '@/core/utils/WindowUtils';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import ConfigurationYmlSourceDialog from '../../../components/ConfigurationYmlSource/ConfigurationYmlSourceDialog';

const SPLITTED_METADATA_KEY = 'wfe_modular_yaml_git_notification_closed';
const SPLIT_METADATA_ENTERPRISE_KEY = 'wfe_modular_yaml_enterprise_notification_closed';
const SPLIT_METADATA_KEY = 'wfe_modular_yaml_split_notification_closed';

export type YmlEditorHeaderProps = {
  ciConfigYml: string;
  onConfigSourceChangeSaved: (usesRepositoryYml: boolean, ymlRootPath: string) => void;
  ymlSettings: BitriseYmlSettings;
};
const YmlEditorHeader = (props: YmlEditorHeaderProps) => {
  const { ciConfigYml, onConfigSourceChangeSaved, ymlSettings } = props;

  const isWebsiteMode = RuntimeUtils.isWebsiteMode();

  const isRepositoryYmlAvailable = WindowUtils.limits()?.isRepositoryYmlAvailable;

  const appSlug = WindowUtils.appSlug() || '';
  const defaultBranch = WindowUtils.pageProps()?.project?.defaultBranch || '';
  const gitRepoSlug = WindowUtils.pageProps()?.project?.gitRepoSlug || '';

  const {
    isModularYamlSupported,
    isYmlSplit,
    lastModified,
    lines,
    usesRepositoryYml: initialUsesRepositoryYml,
    ymlRootPath,
  } = ymlSettings;

  const { isOpen, onClose, onOpen } = useDisclosure();
  const [usesRepositoryYml, setUsesRepositoryYml] = useState(!!ymlSettings?.usesRepositoryYml);

  const { value: splittedMetaDataValue, update: updateSplittedMetaData } = useUserMetaData(
    SPLITTED_METADATA_KEY,
    isWebsiteMode && !!isYmlSplit && !!initialUsesRepositoryYml,
  );
  const { value: splitMetaDataValue, update: updateSplitMetaData } = useUserMetaData(
    isModularYamlSupported ? SPLIT_METADATA_ENTERPRISE_KEY : SPLIT_METADATA_KEY,
    isWebsiteMode && !isYmlSplit && lines > 500,
  );

  let infoLabel;
  if (usesRepositoryYml) {
    infoLabel = isYmlSplit
      ? `The root configuration YAML is stored on ${gitRepoSlug} repository’s ${defaultBranch} branch. It also use configuration from other files.`
      : `Stored on ${gitRepoSlug} repository’s ${defaultBranch} branch.`;
  }

  const isChangeEnabled = isRepositoryYmlAvailable;

  const onYmlSourceChangeClick = () => {
    onOpen();
    segmentTrack('Change Configuration Yml Source Button Clicked', {
      yml_source: usesRepositoryYml ? 'git' : 'bitrise',
    });
  };

  const onDownloadClick = () => {
    segmentTrack('Workflow Editor Download Yml Button Clicked', {
      yml_source: 'bitrise',
      source: 'yml_editor_header',
    });
  };

  return (
    <>
      <Box
        display="flex"
        flexDirection={['column', 'row']}
        gap="16"
        alignItems={['flex-start', 'center']}
        marginBlockEnd="24"
        minHeight="40"
      >
        <Text as="h2" alignSelf="flex-start" marginInlineEnd="auto" textStyle="heading/h2">
          Configuration YAML
        </Text>
        {usesRepositoryYml && isWebsiteMode && (
          <Button
            as="a"
            href={`/api/app/${appSlug}/config.yml?is_download=1`}
            leftIconName="Download"
            size="sm"
            target="_blank"
            variant="tertiary"
            onClick={onDownloadClick}
          >
            Download
          </Button>
        )}
        {isWebsiteMode && (
          <DataWidget
            additionalElement={
              <Tooltip
                isDisabled={isChangeEnabled}
                label="Upgrade to a Teams or Enterprise plan to be able to change the source to a Git repository."
              >
                <Button isDisabled={!isChangeEnabled} onClick={onYmlSourceChangeClick} size="sm" variant="tertiary">
                  Change
                </Button>
              </Tooltip>
            }
            infoLabel={infoLabel}
          >
            <DataWidgetItem
              label="Source:"
              labelTooltip="The source is where your configuration file is stored and managed."
              value={usesRepositoryYml ? 'Git repository' : 'bitrise.io'}
            />
          </DataWidget>
        )}
      </Box>
      {splitMetaDataValue === null && (
        <Notification
          status="info"
          action={{
            href: 'https://devcenter.bitrise.io/en/builds/configuration-yaml/modular-yaml-configuration.html',
            label: 'Learn more',
            target: '_blank',
          }}
          onClose={() => updateSplitMetaData('true')}
          marginBlockEnd="24"
        >
          <Text textStyle="heading/h4">Optimize your configuration file</Text>
          <Text>
            We recommend splitting your configuration file with {lines} lines of code into smaller, more manageable
            files for easier maintenance.{' '}
            {isModularYamlSupported ? '' : 'This feature is only available for Workspaces on Enterprise plan.'}
          </Text>
        </Notification>
      )}
      {splittedMetaDataValue === null && (
        <Notification status="info" onClose={() => updateSplittedMetaData('true')} marginBlockEnd="24">
          Your configuration in the Git repository is split across multiple files, but on this page you can see it as
          one merged YAML.
        </Notification>
      )}
      {!!ymlSettings && (
        <ConfigurationYmlSourceDialog
          isOpen={isOpen}
          onClose={onClose}
          initialUsesRepositoryYml={usesRepositoryYml}
          appSlug={appSlug}
          onConfigSourceChangeSaved={(newValue: boolean, newYmlRootPath: string) => {
            onConfigSourceChangeSaved(newValue, newYmlRootPath);
            setUsesRepositoryYml(newValue);
          }}
          defaultBranch={defaultBranch}
          gitRepoSlug={gitRepoSlug}
          lastModified={lastModified}
          initialYmlRootPath={ymlRootPath}
          ciConfigYml={ciConfigYml}
        />
      )}
    </>
  );
};

export default YmlEditorHeader;
