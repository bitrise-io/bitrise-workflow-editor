import { Box, Button, Dialog, DialogBody, DialogFooter, Text, useToast } from '@bitrise/bitkit';

import { useCopyToClipboard } from 'usehooks-ts';
import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import PageProps from '@/core/utils/PageProps';
import useFormattedYml from '@/hooks/useFormattedYml';

import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { download } from '@/core/utils/CommonUtils';
import useIsYmlPage from '@/hooks/useIsYmlPage';
import { useGetCiConfig } from '@/hooks/useCiConfig';
import { initFromServerResponse } from '@/core/stores/BitriseYmlStore';
import YmlDialogErrorNotification from './YmlDialogErrorNotification';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const UpdateConfigurationDialog = ({ isOpen, onClose }: Props) => {
  const toast = useToast();
  const isOpenedOnTheYmlPage = useIsYmlPage();
  const [, copyToClipboard] = useCopyToClipboard();
  const { defaultBranch, gitRepoSlug } = PageProps.app() ?? {};
  const dataToSave = useBitriseYmlStore(({ yml, ymlString }) => (isOpenedOnTheYmlPage ? ymlString : yml));

  const { isPending: isPendingFormatYml, error: errorFormatYml, mutate: formatYml } = useFormattedYml();

  const {
    error: errorCiConfigYml,
    refetch: refetchCiConfigYml,
    isLoading: isLoadingCiConfigYml,
  } = useGetCiConfig({ projectSlug: PageProps.appSlug() }, { enabled: false });

  const error = errorFormatYml || errorCiConfigYml;
  const isPending = isPendingFormatYml || isLoadingCiConfigYml;

  const handleCopyToClipboard = () => {
    formatYml(dataToSave, {
      onSuccess: async (formattedYml) => {
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
      },
      onSettled: () => {
        segmentTrack('Workflow Editor Copy Current Bitrise Yml Content Button Clicked', {
          yml_source: 'bitrise',
          source: 'update_configuration_yml_modal',
        });
      },
    });
  };

  const handleDownloadClick = () => {
    formatYml(dataToSave, {
      onSuccess: (formattedYml) => {
        download(formattedYml, 'bitrise.yml', 'application/yaml;charset=utf-8');
      },
      onSettled: () => {
        segmentTrack('Workflow Editor Download Yml Button Clicked', {
          yml_source: 'bitrise',
          source: 'update_configuration_yml_modal',
        });
      },
    });
  };

  const handleDoneClick = () => {
    refetchCiConfigYml().then(({ data }) => {
      if (data) {
        initFromServerResponse({ ymlString: data.data, version: data.version });
      }
    });
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Update configuration YAML">
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
        {!!error?.response && <YmlDialogErrorNotification response={error.response} />}
      </DialogBody>
      <DialogFooter>
        <Button isLoading={isPending} variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button isLoading={isPending} onClick={handleDoneClick}>
          Done
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default UpdateConfigurationDialog;
