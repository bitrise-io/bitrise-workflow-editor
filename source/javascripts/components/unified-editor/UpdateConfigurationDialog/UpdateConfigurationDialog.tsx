import { Box, Button, Dialog, DialogBody, DialogFooter, Text, useToast } from '@bitrise/bitkit';
import { useState } from 'react';
import { useCopyToClipboard } from 'usehooks-ts';

import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import { getYmlString } from '@/core/stores/BitriseYmlStore';
import { download } from '@/core/utils/CommonUtils';
import PageProps from '@/core/utils/PageProps';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const DialogContent = ({ onClose }: Pick<Props, 'onClose'>) => {
  const toast = useToast();
  const [, copyToClipboard] = useCopyToClipboard();
  const { defaultBranch, gitRepoSlug } = PageProps.app() ?? {};
  const [isCopiedOrDownloded, setIsCopiedOrDownloaded] = useState(false);

  const handleCopyToClipboard = () => {
    segmentTrack('Workflow Editor Copy Current Bitrise Yml Content Button Clicked', {
      yml_source: 'bitrise',
      source: 'update_configuration_yml_modal',
    });

    copyToClipboard(getYmlString()).then((isCopied) => {
      if (isCopied) {
        toast({
          title: 'Copied to clipboard',
          description:
            "Commit the content of the current configuration YAML file to the project's repository before updating the setting.",
          status: 'success',
          isClosable: true,
        });
        setIsCopiedOrDownloaded(true);
      } else {
        toast({
          title: 'Failed to copy to clipboard',
          description: 'Something went wrong while copying the configuration YAML content.',
          status: 'error',
          isClosable: true,
        });
      }
    });
  };

  const handleDownloadClick = () => {
    segmentTrack('Workflow Editor Download Yml Button Clicked', {
      yml_source: 'bitrise',
      source: 'update_configuration_yml_modal',
    });

    download(getYmlString(), 'bitrise.yml', 'application/yaml;charset=utf-8');

    setIsCopiedOrDownloaded(true);
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
            onClick={handleDownloadClick}
          >
            Download changed version
          </Button>
          <Button
            size="sm"
            variant="tertiary"
            width="fit-content"
            leftIconName="Duplicate"
            onClick={handleCopyToClipboard}
          >
            Copy changed configuration
          </Button>
        </Box>
        <Text textStyle="heading/h4" marginBlockEnd="4">
          Using multiple configuration files
        </Text>
        <Text>You need to re-create the changes in the relevant configuration file on your Git repository.</Text>
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button isDisabled={!isCopiedOrDownloded} onClick={onClose}>
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
