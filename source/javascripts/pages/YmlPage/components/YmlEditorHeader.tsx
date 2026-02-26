import { Box, Button, DataWidget, DataWidgetItem, Text, Tooltip, useDisclosure } from '@bitrise/bitkit';
import { useMemo } from 'react';

import YmlValidationBadge from '@/components/YmlValidationBadge';
import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import { getYmlString } from '@/core/stores/BitriseYmlStore';
import { download } from '@/core/utils/CommonUtils';
import PageProps from '@/core/utils/PageProps';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import { useCiConfigSettings } from '@/hooks/useCiConfigSettings';
import useIsModular from '@/hooks/useIsModular';
import useModularConfig from '@/hooks/useModularConfig';
import useYmlValidationStatus from '@/hooks/useYmlValidationStatus';

import ConfigurationYmlSourceDialog from './ConfigurationYmlSourceDialog';

const YmlEditorHeader = () => {
  const isWebsiteMode = RuntimeUtils.isWebsiteMode();
  const { defaultBranch, gitRepoSlug } = PageProps.app() ?? {};
  const { isRepositoryYmlAvailable } = PageProps.limits() ?? {};
  const isModular = useIsModular();
  const activeFileIndex = useModularConfig((s) => s.activeFileIndex);
  const activeFile = useModularConfig((s) => (s.activeFileIndex >= 0 ? s.files[s.activeFileIndex] : undefined));

  const ymlStatus = useYmlValidationStatus();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { data: ymlSettings, isLoading: isYmlSettingsLoading } = useCiConfigSettings();

  const infoLabel = useMemo(() => {
    if (isYmlSettingsLoading || !ymlSettings?.usesRepositoryYml) {
      return undefined;
    }

    if (ymlSettings?.isYmlSplit) {
      return `The root configuration YAML is stored on ${gitRepoSlug} repository’s ${defaultBranch} branch. It also use configuration from other files.`;
    }

    return `Stored on ${gitRepoSlug} repository’s ${defaultBranch} branch.`;
  }, [defaultBranch, gitRepoSlug, isYmlSettingsLoading, ymlSettings?.isYmlSplit, ymlSettings?.usesRepositoryYml]);

  const onYmlSourceChangeClick = () => {
    segmentTrack('Change Configuration Yml Source Button Clicked', {
      yml_source: ymlSettings?.usesRepositoryYml ? 'git' : 'bitrise',
    });
    onOpen();
  };

  const onDownloadClick = () => {
    segmentTrack('Workflow Editor Download Yml Button Clicked', {
      yml_source: 'bitrise',
      source: 'yml_editor_header',
    });
    download(getYmlString(), 'bitrise.yml', 'application/yaml;charset=utf-8');
  };

  return (
    <Box display="flex" flexDirection={['column', 'row']} gap="16" alignItems={['flex-start', 'center']} p="32">
      <Text as="h2" textStyle="heading/h2">
        {isModular && activeFileIndex >= 0 && activeFile
          ? activeFile.path
          : isModular && activeFileIndex === -1
            ? 'Merged Configuration'
            : 'Configuration YAML'}
      </Text>
      <Box marginInlineEnd="auto">
        <YmlValidationBadge status={ymlStatus} />
      </Box>
      {isWebsiteMode && !isYmlSettingsLoading && !ymlSettings?.usesRepositoryYml && (
        <Button leftIconName="Download" size="sm" variant="tertiary" onClick={onDownloadClick}>
          Download
        </Button>
      )}
      {isWebsiteMode && !isYmlSettingsLoading && (
        <DataWidget
          additionalElement={
            <Tooltip
              isDisabled={isRepositoryYmlAvailable}
              label="Upgrade to a Teams or Enterprise plan to be able to change the source to a Git repository."
            >
              <Button
                isDisabled={!isRepositoryYmlAvailable || isYmlSettingsLoading}
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
            value={ymlSettings?.usesRepositoryYml ? 'Git repository' : 'bitrise.io'}
          />
        </DataWidget>
      )}
      <ConfigurationYmlSourceDialog isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};

export default YmlEditorHeader;
