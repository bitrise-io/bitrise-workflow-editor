import { useState } from 'react';
import { Box, Button, DataWidget, DataWidgetItem, Text, Tooltip, useDisclosure } from '@bitrise/bitkit';
import ConfigurationYmlSourceDialog from '../ConfigurationYmlSource/ConfigurationYmlSourceDialog';
import SplitNotification from './SplitNotification';
import GitNotification from './GitNotification';
import { AppConfig } from '@/models/AppConfig';

export type YmlEditorHeaderProps = {
  appSlug: string;
  appConfig: AppConfig | string;
  url: string;
  initialUsesRepositoryYml?: boolean;
  repositoryYmlAvailable: boolean;
  shouldShowYmlStorageSettings: boolean;
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
    shouldShowYmlStorageSettings,
    url,
    initialUsesRepositoryYml,
    split,
    modularYamlSupported,
    lines,
    lastModified,
  } = props;
  const { isOpen, onClose, onOpen } = useDisclosure();

  const [usesRepositoryYml, setUsesRepositoryYml] = useState(!!initialUsesRepositoryYml);

  let infoLabel;
  if (usesRepositoryYml) {
    infoLabel = split
      ? `The root configuration YAML is stored on ${gitRepoSlug} repository’s ${defaultBranch} branch. It also use configuration from other files.`
      : `Stored on ${gitRepoSlug} repository’s ${defaultBranch} branch.`;
  }

  const isChangeEnabled = repositoryYmlAvailable || initialUsesRepositoryYml === true;

  return (
    <>
      <Box display="flex" gap="16" alignItems="center" marginBlockEnd="24" minHeight="40">
        <Text as="h2" alignSelf="flex-start" marginInlineEnd="auto" textStyle="heading/h2">
          Configuration YAML
        </Text>
        {url && (
          <Button as="a" href={url} leftIconName="Download" size="sm" target="_blank" variant="tertiary">
            Download
          </Button>
        )}
        {shouldShowYmlStorageSettings && (
          <DataWidget
            additionalElement={
              <Tooltip
                isDisabled={isChangeEnabled}
                label="Upgrade to a Teams or Enterprise plan to be able to change the source to a Git repository."
              >
                <Button isDisabled={!isChangeEnabled} onClick={onOpen} size="sm" variant="tertiary">
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
      <SplitNotification modularYamlSupported={modularYamlSupported} split={split} lines={lines} />
      <GitNotification split={split} usesRepositoryYml={usesRepositoryYml} />
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
