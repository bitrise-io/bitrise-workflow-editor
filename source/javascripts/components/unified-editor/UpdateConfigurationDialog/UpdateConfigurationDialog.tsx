import { Box, Button, Dialog, DialogBody, DialogFooter, Notification, Text, useToast } from '@bitrise/bitkit';
import { useCallback, useState } from 'react';
import { useCopyToClipboard } from 'usehooks-ts';

import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import { initializeStore } from '@/core/stores/BitriseYmlStore';
import { download } from '@/core/utils/CommonUtils';
import PageProps from '@/core/utils/PageProps';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useFormatYml } from '@/hooks/useFormattedYml';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const DialogContent = ({ onClose }: Pick<Props, 'onClose'>) => {
  const toast = useToast();
  const [, copyToClipboard] = useCopyToClipboard();
  const [formattedYml, setFormattedYml] = useState<string>();
  const { defaultBranch, gitRepoSlug } = PageProps.app() ?? {};
  const yml = useBitriseYmlStore((s) => s.yml);
  const {
    mutate: formatYml,
    isPending: isPendingFormatYml,
    error: errorFormatYml,
  } = useFormatYml({ onSuccess: setFormattedYml });

  const copy = useCallback(
    async (text: string) => {
      if (await copyToClipboard(text)) {
        toast({
          title: 'Copied to clipboard',
          description:
            "Commit the content of the current configuration YAML file to the project's repository before updating the setting.",
          status: 'success',
          isClosable: true,
        });
      } else {
        toast({
          title: 'Failed to copy to clipboard',
          description: 'Something went wrong while copying the configuration YAML content.',
          status: 'error',
          isClosable: true,
        });
      }
    },
    [copyToClipboard, toast],
  );

  const handleCopyToClipboard = async () => {
    segmentTrack('Workflow Editor Copy Current Bitrise Yml Content Button Clicked', {
      yml_source: 'bitrise',
      source: 'update_configuration_yml_modal',
    });

    formatYml(yml, {
      onSuccess: copy,
      onError: () => {
        toast({
          title: 'Failed to copy to clipboard',
          description: 'Something went wrong while copying the configuration YAML content.',
          status: 'error',
          isClosable: true,
        });
      },
    });
  };

  const handleDownloadClick = () => {
    segmentTrack('Workflow Editor Download Yml Button Clicked', {
      yml_source: 'bitrise',
      source: 'update_configuration_yml_modal',
    });

    formatYml(yml, {
      onSuccess: (data) => download(data, 'bitrise.yml', 'application/yaml;charset=utf-8'),
      onError: () => {
        toast({
          title: 'Failed to download',
          description: 'Something went wrong while downloading the configuration YAML file.',
          status: 'error',
          isClosable: true,
        });
      },
    });
  };

  const handleDoneClick = () => {
    // NOTE: Instead of re-fetching, we can just update the store's saved yml with the formatted yml
    // Pro: Even if the user didn't save the YML to their repo yet, we still have all their changes.
    if (formattedYml) {
      initializeStore({ ymlString: formattedYml, version: '' });
    }
  };

  return (
    <>
      <DialogBody>
        <Text marginBlockEnd="24">
          If you would like to apply these changes to your configuration, depending on your setup, you need to do the
          following:
        </Text>
        <Text textStyle="heading/h4" marginBlockEnd="4">
          Using a single configuration file
        </Text>
        <Text marginBlockEnd="16">
          Update the content of the configuration YAML in the {gitRepoSlug} repository’s {defaultBranch} branch.
        </Text>
        <Box display="flex" flexDir="column" gap="8" marginBlockEnd="24">
          <Button
            size="sm"
            variant="tertiary"
            width="fit-content"
            leftIconName="Download"
            isDisabled={isPendingFormatYml}
            onClick={handleDownloadClick}
          >
            Download changed version
          </Button>
          <Button
            size="sm"
            variant="tertiary"
            width="fit-content"
            leftIconName="Duplicate"
            isDisabled={isPendingFormatYml}
            onClick={handleCopyToClipboard}
          >
            Copy changed configuration
          </Button>
        </Box>
        <Text textStyle="heading/h4" marginBlockEnd="4">
          Using multiple configuration files
        </Text>
        <Text>You need to re-create the changes in the relevant configuration file on your Git repository.</Text>
        {errorFormatYml && (
          <Notification marginBlockStart="24" status="error">
            {errorFormatYml.getResponseErrorMessage() || 'Failed to prepare the configuration YAML changes'}
          </Notification>
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button isDisabled={!formattedYml} onClick={handleDoneClick}>
          Done
        </Button>
      </DialogFooter>
    </>
  );
};

const UpdateConfigurationDialog = ({ isOpen, onClose }: Props) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Update configuration YAML">
      <DialogContent onClose={onClose} />
    </Dialog>
  );
};

export default UpdateConfigurationDialog;
