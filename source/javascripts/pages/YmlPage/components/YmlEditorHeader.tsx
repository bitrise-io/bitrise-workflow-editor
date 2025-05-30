import { Box, Button, DataWidget, DataWidgetItem, Text, Tooltip, useDisclosure } from '@bitrise/bitkit';
import { useToast } from '@chakra-ui/react';
import { useMemo } from 'react';

import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import { bitriseYmlStore } from '@/core/stores/BitriseYmlStore';
import { download } from '@/core/utils/CommonUtils';
import PageProps from '@/core/utils/PageProps';
import RuntimeUtils from '@/core/utils/RuntimeUtils';
import { useCiConfigSettings } from '@/hooks/useCiConfigSettings';
import { useFormatYml } from '@/hooks/useFormattedYml';

import ConfigurationYmlSourceDialog from './ConfigurationYmlSourceDialog';

const YmlEditorHeader = () => {
  const isWebsiteMode = RuntimeUtils.isWebsiteMode();
  const { defaultBranch, gitRepoSlug } = PageProps.app() ?? {};
  const { isRepositoryYmlAvailable } = PageProps.limits() ?? {};

  const toast = useToast();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { data: ymlSettings, isLoading: isYmlSettingsLoading } = useCiConfigSettings();
  const { mutate: formatYml, isPending: isFormattingYml } = useFormatYml();

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
    formatYml(bitriseYmlStore.getState().yml, {
      onSuccess: (formattedYml) => {
        download(formattedYml, 'bitrise.yml', 'application/yaml;charset=utf-8');
      },
      onError: () => {
        toast({
          title: 'Failed to download',
          description: 'Something went wrong while preparing the configuration YAML file for download.',
          status: 'error',
          isClosable: true,
        });
      },
    });
  };

  return (
    <Box display="flex" flexDirection={['column', 'row']} gap="16" alignItems={['flex-start', 'center']} p="32">
      <Text as="h2" alignSelf="flex-start" marginInlineEnd="auto" textStyle="heading/h2">
        Configuration YAML
      </Text>
      {isWebsiteMode && !isYmlSettingsLoading && !ymlSettings?.usesRepositoryYml && (
        <Button
          leftIconName="Download"
          size="sm"
          variant="tertiary"
          isLoading={isFormattingYml}
          onClick={onDownloadClick}
        >
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
