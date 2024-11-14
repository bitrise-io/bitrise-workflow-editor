import { useState } from 'react';
import { Box, Button, DataWidget, DataWidgetItem, Text, Tooltip, useDisclosure, Notification } from '@bitrise/bitkit';
import { AppConfig } from '@/models/AppConfig';
import { segmentTrack } from '@/utils/segmentTracking';
import useUserMetaData from '@/hooks/useUserMetaData';
import ConfigurationYmlSourceDialog from '../ConfigurationYmlSource/ConfigurationYmlSourceDialog';

const SPLITTED_METADATA_KEY = 'wfe_modular_yaml_git_notification_closed';
const SPLIT_METADATA_ENTERPRISE_KEY = 'wfe_modular_yaml_enterprise_notification_closed';
const SPLIT_METADATA_KEY = 'wfe_modular_yaml_split_notification_closed';

export type YmlEditorHeaderProps = {
  appSlug: string;
  appConfig: AppConfig | string;
  url: string;
  initialUsesRepositoryYml?: boolean;
  repositoryYmlAvailable: boolean;
  isWebsiteMode: boolean;
  onUsesRepositoryYmlChangeSaved: (usesRepositoryYml: boolean) => void;
  defaultBranch: string;
  gitRepoSlug: string;
  split: boolean;
  modularYamlSupported?: boolean;
  lines: number;
  lastModified: string | null;
};
const YmlEditorHeader = (props: YmlEditorHeaderProps) => {
  const {
    appSlug,
    appConfig,
    defaultBranch,
    gitRepoSlug,
    onUsesRepositoryYmlChangeSaved,
    repositoryYmlAvailable,
    isWebsiteMode,
    url,
    initialUsesRepositoryYml,
    split,
    modularYamlSupported,
    lines,
    lastModified,
  } = props;
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [usesRepositoryYml, setUsesRepositoryYml] = useState(!!initialUsesRepositoryYml);

  const { value: splittedMetaDataValue, update: updateSplittedMetaData } = useUserMetaData(
    SPLITTED_METADATA_KEY,
    isWebsiteMode && split && usesRepositoryYml,
  );
  const { value: splitMetaDataValue, update: updateSplitMetaData } = useUserMetaData(
    modularYamlSupported ? SPLIT_METADATA_ENTERPRISE_KEY : SPLIT_METADATA_KEY,
    isWebsiteMode && !split && lines > 500,
  );

  let infoLabel;
  if (usesRepositoryYml) {
    infoLabel = split
      ? `The root configuration YAML is stored on ${gitRepoSlug} repository’s ${defaultBranch} branch. It also use configuration from other files.`
      : `Stored on ${gitRepoSlug} repository’s ${defaultBranch} branch.`;
  }

  const isChangeEnabled = repositoryYmlAvailable || initialUsesRepositoryYml === true;

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
        {url && (
          <Button
            as="a"
            href={url}
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
            {modularYamlSupported ? '' : 'This feature is only available for Workspaces on Enterprise plan.'}
          </Text>
        </Notification>
      )}
      {splittedMetaDataValue === null && (
        <Notification status="info" onClose={() => updateSplittedMetaData('true')} marginBlockEnd="24">
          Your configuration in the Git repository is split across multiple files, but on this page you can see it as
          one merged YAML.
        </Notification>
      )}
      <ConfigurationYmlSourceDialog
        isOpen={isOpen}
        onClose={onClose}
        initialUsesRepositoryYml={usesRepositoryYml}
        appConfig={appConfig}
        appSlug={appSlug}
        onUsesRepositoryYmlChangeSaved={(newValue: boolean) => {
          onUsesRepositoryYmlChangeSaved(newValue);
          setUsesRepositoryYml(newValue);
        }}
        defaultBranch={defaultBranch}
        gitRepoSlug={gitRepoSlug}
        lastModified={lastModified}
      />
    </>
  );
};

export default YmlEditorHeader;
