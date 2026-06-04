import { BitkitButton, BitkitDialog, createBitkitToast, IconCopy, IconDownload } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';
import { useState } from 'react';
import { useCopyToClipboard } from 'usehooks-ts';

import { trackCopyYmlClicked, trackDownloadYmlClicked } from '@/core/analytics/ConfigManagementAnalytics';
import { getYmlString } from '@/core/stores/BitriseYmlStore';
import { download } from '@/core/utils/CommonUtils';
import PageProps from '@/core/utils/PageProps';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const DialogContent = ({ onClose }: Pick<Props, 'onClose'>) => {
  const [, copyToClipboard] = useCopyToClipboard();
  const { defaultBranch, gitRepoSlug } = PageProps.app() ?? {};
  const [isCopiedOrDownloded, setIsCopiedOrDownloaded] = useState(false);

  const handleCopyToClipboard = () => {
    trackCopyYmlClicked('git', 'update_configuration_yml_modal');

    copyToClipboard(getYmlString()).then((isCopied) => {
      if (isCopied) {
        createBitkitToast({
          titleText: 'Copied to clipboard',
          messageText:
            "Commit the content of the current configuration YAML file to the project's repository before updating the setting.",
          variant: 'success',
        });
        setIsCopiedOrDownloaded(true);
      } else {
        createBitkitToast({
          titleText: 'Failed to copy to clipboard',
          messageText: 'Something went wrong while copying the configuration YAML content.',
          variant: 'critical',
        });
      }
    });
  };

  const handleDownloadClick = () => {
    trackDownloadYmlClicked('git', 'update_configuration_yml_modal');

    download(getYmlString(), 'bitrise.yml', 'application/yaml;charset=utf-8');

    setIsCopiedOrDownloaded(true);
  };

  return (
    <>
      <BitkitDialog.Body>
        <Text>
          If you would like to apply these changes to your configuration, depending on your setup, you need to do the
          following:
        </Text>
        <Box display="flex" flexDirection="column">
          <Text textStyle="heading/h4" marginBlockEnd="4">
            Using a single configuration file
          </Text>
          <Text marginBlockEnd="16">
            Update the content of the configuration YAML in the {gitRepoSlug} repository&apos;s {defaultBranch} branch.
          </Text>
          <Box display="flex" flexDirection="column" gap="8">
            <BitkitButton
              size="sm"
              variant="tertiary"
              width="fit-content"
              icon={IconDownload}
              onClick={handleDownloadClick}
            >
              Download changed version
            </BitkitButton>
            <BitkitButton
              size="sm"
              variant="tertiary"
              width="fit-content"
              icon={IconCopy}
              onClick={handleCopyToClipboard}
            >
              Copy changed configuration
            </BitkitButton>
          </Box>
        </Box>
        <Box display="flex" flexDirection="column">
          <Text textStyle="heading/h4" marginBlockEnd="4">
            Using multiple configuration files
          </Text>
          <Text>You need to re-create the changes in the relevant configuration file on your Git repository.</Text>
        </Box>
      </BitkitDialog.Body>
      <BitkitDialog.Footer>
        <BitkitDialog.Buttons>
          <BitkitButton variant="secondary" onClick={onClose}>
            Cancel
          </BitkitButton>
          <BitkitButton state={!isCopiedOrDownloded ? 'disabled' : undefined} onClick={onClose}>
            Done
          </BitkitButton>
        </BitkitDialog.Buttons>
      </BitkitDialog.Footer>
    </>
  );
};

const UpdateConfigurationDialog = ({ isOpen, onClose }: Props) => {
  return (
    <BitkitDialog
      title="Update configuration YAML"
      open={isOpen}
      onOpenChange={({ open }) => {
        if (!open) onClose();
      }}
    >
      <DialogContent onClose={onClose} />
    </BitkitDialog>
  );
};

export default UpdateConfigurationDialog;
