import { Box, Button, Dialog, DialogBody, DialogFooter, Text, useToast } from '@bitrise/bitkit';
import { useState } from 'react';
import { useCopyToClipboard } from 'usehooks-ts';

import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import { getYmlString } from '@/core/stores/BitriseYmlStore';
import { download } from '@/core/utils/CommonUtils';
import PageProps from '@/core/utils/PageProps';
import useIsModular from '@/hooks/useIsModular';
import useModularConfig from '@/hooks/useModularConfig';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const SingleFileDialogContent = ({ onClose }: Pick<Props, 'onClose'>) => {
  const toast = useToast();
  const [, copyToClipboard] = useCopyToClipboard();
  const { defaultBranch, gitRepoSlug } = PageProps.app() ?? {};
  const [isCopiedOrDownloaded, setIsCopiedOrDownloaded] = useState(false);

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
          Update the content of the configuration YAML in the {gitRepoSlug} repository&apos;s {defaultBranch} branch.
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
        <Button isDisabled={!isCopiedOrDownloaded} onClick={onClose}>
          Done
        </Button>
      </DialogFooter>
    </>
  );
};

const ModularFileDialogContent = ({ onClose }: Pick<Props, 'onClose'>) => {
  const toast = useToast();
  const [, copyToClipboard] = useCopyToClipboard();
  const files = useModularConfig((s) => s.files);
  const changedFiles = files.filter((f) => f.currentContents !== f.savedContents);
  const [copiedOrDownloadedFiles, setCopiedOrDownloadedFiles] = useState<Set<string>>(new Set());

  const handleCopyFile = (filePath: string, contents: string) => {
    segmentTrack('Workflow Editor Copy Current Bitrise Yml Content Button Clicked', {
      yml_source: 'bitrise',
      source: 'update_configuration_yml_modal_modular',
    });

    copyToClipboard(contents).then((isCopied) => {
      if (isCopied) {
        toast({
          title: `Copied ${filePath} to clipboard`,
          description: 'Commit the content to the relevant repository.',
          status: 'success',
          isClosable: true,
        });
        setCopiedOrDownloadedFiles((prev) => new Set([...prev, filePath]));
      } else {
        toast({
          title: 'Failed to copy to clipboard',
          description: 'Something went wrong while copying the file content.',
          status: 'error',
          isClosable: true,
        });
      }
    });
  };

  const handleDownloadFile = (filePath: string, contents: string) => {
    segmentTrack('Workflow Editor Download Yml Button Clicked', {
      yml_source: 'bitrise',
      source: 'update_configuration_yml_modal_modular',
    });

    const fileName = filePath.split('/').pop() || filePath;
    download(contents, fileName, 'application/yaml;charset=utf-8');
    setCopiedOrDownloadedFiles((prev) => new Set([...prev, filePath]));
  };

  const hasAction = copiedOrDownloadedFiles.size > 0;

  return (
    <>
      <DialogBody>
        <Text marginBlockEnd="24">
          The following files have been modified. Update them in their respective repositories and branches.
        </Text>
        {changedFiles.map((file) => (
          <Box
            key={file.path}
            marginBlockEnd="16"
            padding="16"
            borderRadius="8"
            border="1px solid"
            borderColor="border/regular"
          >
            <Text textStyle="heading/h4" marginBlockEnd="4">
              {file.path}
            </Text>
            {file.repository && (
              <Text textStyle="body/sm" color="text/secondary" marginBlockEnd="8">
                Repository: {file.repository}
                {file.branch ? ` (branch: ${file.branch})` : ''}
              </Text>
            )}
            <Box display="flex" gap="8">
              <Button
                size="sm"
                variant="tertiary"
                leftIconName="Download"
                onClick={() => handleDownloadFile(file.path, file.currentContents)}
              >
                Download
              </Button>
              <Button
                size="sm"
                variant="tertiary"
                leftIconName="Duplicate"
                onClick={() => handleCopyFile(file.path, file.currentContents)}
              >
                Copy
              </Button>
            </Box>
          </Box>
        ))}
        {changedFiles.length === 0 && <Text color="text/secondary">No files have been modified.</Text>}
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button isDisabled={!hasAction} onClick={onClose}>
          Done
        </Button>
      </DialogFooter>
    </>
  );
};

const UpdateConfigurationDialog = ({ isOpen, onClose }: Props) => {
  const isModular = useIsModular();

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Update configuration YAML">
      {isModular ? <ModularFileDialogContent onClose={onClose} /> : <SingleFileDialogContent onClose={onClose} />}
    </Dialog>
  );
};

export default UpdateConfigurationDialog;
