import { Box, Button, Dialog, DialogBody, DialogFooter, Text, useToast } from '@bitrise/bitkit';
import { useCopyToClipboard } from 'usehooks-ts';

import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import { bitriseYmlStore, initFromServerResponse } from '@/core/stores/BitriseYmlStore';
import { download } from '@/core/utils/CommonUtils';
import PageProps from '@/core/utils/PageProps';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useGetCiConfig } from '@/hooks/useCiConfig';
import useFormattedYml from '@/hooks/useFormattedYml';
import useIsYmlPage from '@/hooks/useIsYmlPage';

import YmlDialogErrorNotification from './YmlDialogErrorNotification';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const DialogContent = ({ onClose }: Pick<Props, 'onClose'>) => {
  const toast = useToast();
  const isOpenedOnTheYmlPage = useIsYmlPage();
  const [, copyToClipboard] = useCopyToClipboard();
  const { defaultBranch, gitRepoSlug } = PageProps.app() ?? {};
  const dataToSave = useBitriseYmlStore(({ yml, ymlString }) => (isOpenedOnTheYmlPage ? ymlString : yml));

  const { data: formattedYml, isLoading: isPendingFormatYml, error: errorFormatYml } = useFormattedYml(dataToSave);

  const {
    error: errorCiConfigYml,
    refetch: refetchCiConfigYml,
    isLoading: isLoadingCiConfigYml,
  } = useGetCiConfig({ projectSlug: PageProps.appSlug() }, { enabled: false });

  const error = errorFormatYml || errorCiConfigYml;
  const isPending = isPendingFormatYml || isLoadingCiConfigYml;

  const handleCopyToClipboard = async () => {
    if (!formattedYml) {
      return;
    }

    segmentTrack('Workflow Editor Copy Current Bitrise Yml Content Button Clicked', {
      yml_source: 'bitrise',
      source: 'update_configuration_yml_modal',
    });
    const isYmlCopiedSuccessfully = await copyToClipboard(formattedYml);
    if (isYmlCopiedSuccessfully) {
      toast({
        title: 'Copied to clipboard',
        description:
          "Commit the content of the current configuration YAML file to the project's repository before updating the setting.",
        status: 'success',
        isClosable: true,
      });
    } else {
      toast({
        title: 'Error',
        description: 'Something went wrong while copying the yml.',
        status: 'error',
        isClosable: true,
      });
    }
  };

  const handleDownloadClick = () => {
    if (!formattedYml) {
      return;
    }

    segmentTrack('Workflow Editor Download Yml Button Clicked', {
      yml_source: 'bitrise',
      source: 'update_configuration_yml_modal',
    });
    download(formattedYml, 'bitrise.yml', 'application/yaml;charset=utf-8');
  };

  const handleDoneClick = () => {
    refetchCiConfigYml().then(({ data }) => {
      if (data) {
        initFromServerResponse(data);
        // TODO: Remove this when we have a better way to force the editor to re-render
        bitriseYmlStore.setState({ discardKey: Date.now() });
      }
    });
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
            isDisabled={isPendingFormatYml || !!error}
            onClick={handleDownloadClick}
          >
            Download changed version
          </Button>
          <Button
            size="sm"
            variant="tertiary"
            width="fit-content"
            leftIconName="Duplicate"
            isDisabled={isPendingFormatYml || !!error}
            onClick={handleCopyToClipboard}
          >
            Copy changed configuration
          </Button>
        </Box>
        <Text textStyle="heading/h4" marginBlockEnd="4">
          Using multiple configuration files
        </Text>
        <Text>You need to re-create the changes in the relevant configuration file on your Git repository.</Text>
        {error && <YmlDialogErrorNotification error={error} />}
      </DialogBody>
      <DialogFooter>
        <Button isLoading={isPending} variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button isLoading={isPending} isDisabled={!!error} onClick={handleDoneClick}>
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
