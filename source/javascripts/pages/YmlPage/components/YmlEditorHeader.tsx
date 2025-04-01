import { useState } from 'react';
import { Box, Button, DataWidget, DataWidgetItem, Text, Tooltip, useDisclosure } from '@bitrise/bitkit';

import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import { BitriseYmlSettings } from '@/core/models/BitriseYmlSettings';
import PageProps from '@/core/utils/PageProps';
import RuntimeUtils from '@/core/utils/RuntimeUtils';

import ConfigurationYmlSourceDialog from './ConfigurationYmlSourceDialog';

export type YmlEditorHeaderProps = {
  ciConfigYml: string;
  onConfigSourceChangeSaved: (usesRepositoryYml: boolean, ymlRootPath: string) => void;
  ymlSettings: BitriseYmlSettings;
};
const YmlEditorHeader = (props: YmlEditorHeaderProps) => {
  const { ciConfigYml, onConfigSourceChangeSaved, ymlSettings } = props;

  const isWebsiteMode = RuntimeUtils.isWebsiteMode();

  const isRepositoryYmlAvailable = PageProps.limits()?.isRepositoryYmlAvailable;

  const appSlug = PageProps.appSlug() || '';
  const defaultBranch = PageProps.app()?.defaultBranch || '';
  const gitRepoSlug = PageProps.app()?.gitRepoSlug || '';

  const { isYmlSplit, lastModified, ymlRootPath } = ymlSettings;

  const { isOpen, onClose, onOpen } = useDisclosure();
  const [usesRepositoryYml, setUsesRepositoryYml] = useState(!!ymlSettings?.usesRepositoryYml);

  let infoLabel;
  if (usesRepositoryYml) {
    infoLabel = isYmlSplit
      ? `The root configuration YAML is stored on ${gitRepoSlug} repository’s ${defaultBranch} branch. It also use configuration from other files.`
      : `Stored on ${gitRepoSlug} repository’s ${defaultBranch} branch.`;
  }

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
        paddingInline="32"
      >
        <Text as="h2" alignSelf="flex-start" marginInlineEnd="auto" textStyle="heading/h2">
          Configuration YAML
        </Text>
        {!usesRepositoryYml && isWebsiteMode && (
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
                isDisabled={isRepositoryYmlAvailable}
                label="Upgrade to a Teams or Enterprise plan to be able to change the source to a Git repository."
              >
                <Button
                  isDisabled={!isRepositoryYmlAvailable}
                  onClick={onYmlSourceChangeClick}
                  size="sm"
                  variant="tertiary"
                >
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
      {!!ymlSettings && (
        <ConfigurationYmlSourceDialog
          isOpen={isOpen}
          onClose={onClose}
          initialUsesRepositoryYml={usesRepositoryYml}
          projectSlug={appSlug}
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
