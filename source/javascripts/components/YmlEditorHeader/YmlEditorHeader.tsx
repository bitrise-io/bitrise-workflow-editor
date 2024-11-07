import { useState } from 'react';
import { Box, Button, DataWidget, DataWidgetItem, Text, Tooltip, useDisclosure } from '@bitrise/bitkit';
import { useUserMetaData } from '@/hooks/useUserMetaData';
import { AppConfig } from '@/models/AppConfig';
import { segmentTrack } from '@/utils/segmentTracking';
import ConfigurationYmlSourceDialog from '../ConfigurationYmlSource/ConfigurationYmlSourceDialog';
import SplitNotification from './SplitNotification';
import GitNotification from './GitNotification';

const GIT_METADATA_KEY = 'wfe_modular_yaml_git_notification_closed';
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
  ymlRootPath: string;
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
    ymlRootPath,
  } = props;
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [usesRepositoryYml, setUsesRepositoryYml] = useState(!!initialUsesRepositoryYml);
  const { isVisible: isGitNotiVisible, close: closeGitNoti } = useUserMetaData({
    key: GIT_METADATA_KEY,
    enabled: isWebsiteMode && split && usesRepositoryYml,
  });
  const { isVisible: isSplitNotiVisible, close: closeSplitNoti } = useUserMetaData({
    key: modularYamlSupported ? SPLIT_METADATA_ENTERPRISE_KEY : SPLIT_METADATA_KEY,
    enabled: isWebsiteMode && !split && lines > 500,
  });

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
      {isSplitNotiVisible && (
        <SplitNotification modularYamlSupported={modularYamlSupported} lines={lines} onClose={closeSplitNoti} />
      )}
      {isGitNotiVisible && <GitNotification onClose={closeGitNoti} />}
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
        ymlRootPath={ymlRootPath}
      />
    </>
  );
};

export default YmlEditorHeader;
