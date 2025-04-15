import { useState } from 'react';
import { Box, Button, DataWidget, DataWidgetItem, Text, Tooltip, useDisclosure } from '@bitrise/bitkit';

import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import PageProps from '@/core/utils/PageProps';
import RuntimeUtils from '@/core/utils/RuntimeUtils';

import useFormattedYml from '@/hooks/useFormattedYml';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useCiConfigSettings } from '@/hooks/useCiConfigSettings';
import { download } from '@/core/utils/CommonUtils';
import ConfigurationYmlSourceDialog from './ConfigurationYmlSourceDialog';

const YmlEditorHeader = () => {
  const appSlug = PageProps.appSlug() || '';
  const defaultBranch = PageProps.app()?.defaultBranch || '';
  const gitRepoSlug = PageProps.app()?.gitRepoSlug || '';
  const isWebsiteMode = RuntimeUtils.isWebsiteMode();
  const isRepositoryYmlAvailable = PageProps.limits()?.isRepositoryYmlAvailable;

  const { data: ymlSettings } = useCiConfigSettings();
  const { data: formattedYml } = useFormattedYml(useBitriseYmlStore((s) => s.yml));

  const { isYmlSplit, lastModified, ymlRootPath } = ymlSettings || {};

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
    if (!formattedYml) {
      return;
    }

    segmentTrack('Workflow Editor Download Yml Button Clicked', {
      yml_source: 'bitrise',
      source: 'yml_editor_header',
    });
    download(formattedYml, 'bitrise.yml', 'application/yaml;charset=utf-8');
  };

  return (
    <Box display="flex" flexDirection={['column', 'row']} gap="16" alignItems={['flex-start', 'center']} p="32">
      <Text as="h2" alignSelf="flex-start" marginInlineEnd="auto" textStyle="heading/h2">
        Configuration YAML
      </Text>
      {isWebsiteMode && !usesRepositoryYml && (
        <Button leftIconName="Download" size="sm" variant="tertiary" onClick={onDownloadClick}>
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
      {formattedYml && (
        <ConfigurationYmlSourceDialog
          isOpen={isOpen}
          onClose={onClose}
          initialUsesRepositoryYml={usesRepositoryYml}
          projectSlug={appSlug}
          onConfigSourceChangeSaved={(newValue: boolean) => setUsesRepositoryYml(newValue)}
          defaultBranch={defaultBranch}
          gitRepoSlug={gitRepoSlug}
          lastModified={lastModified || null}
          initialYmlRootPath={ymlRootPath || null}
          ciConfigYml={formattedYml}
        />
      )}
    </Box>
  );
};

export default YmlEditorHeader;
