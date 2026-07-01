import {
  BitkitButton,
  BitkitControlButton,
  BitkitDialog,
  BitkitSectionHeading,
  createBitkitToast,
  IconCopy,
  IconDownload,
} from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Card } from '@chakra-ui/react/card';
import { Table } from '@chakra-ui/react/table';
import { Text } from '@chakra-ui/react/text';
import { useEffect, useState } from 'react';
import { useCopyToClipboard } from 'usehooks-ts';

import { trackCopyYmlClicked, trackDownloadYmlClicked } from '@/core/analytics/ConfigManagementAnalytics';
import { getFileYmlString, getYmlString } from '@/core/stores/BitriseYmlStore';
import { download } from '@/core/utils/CommonUtils';
import PageProps from '@/core/utils/PageProps';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useChangedModules, { moduleCountLabel } from '@/hooks/useChangedModules';

import ChangedModulesNote from '../ChangedModulesNote/ChangedModulesNote';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

type ChangedFileRow = {
  key: string;
  name: string;
  downloadName: string;
  getContent: () => string;
};

const UpdateConfigurationDialog = ({ isOpen, onClose }: Props) => {
  const [, copyToClipboard] = useCopyToClipboard();
  const { defaultBranch, gitRepoSlug } = PageProps.app() ?? {};
  const [isCopiedOrDownloaded, setIsCopiedOrDownloaded] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsCopiedOrDownloaded(false);
    }
  }, [isOpen]);

  const isModular = useBitriseYmlStore((s) => Boolean(s.tree));
  const changedModules = useChangedModules();

  // Single config → one synthetic "bitrise.yml" row (the whole config); modular → one row per changed module file.
  const rows: ChangedFileRow[] = isModular
    ? changedModules.map(({ nodeId, path }) => ({
        key: nodeId,
        // Show the full module path; download it flattened (slashes → dashes) so same-named modules
        // in different folders don't collide as downloaded files.
        name: path,
        downloadName: path.replace(/\//g, '-'),
        getContent: () => getFileYmlString(nodeId),
      }))
    : [{ key: 'bitrise.yml', name: 'bitrise.yml', downloadName: 'bitrise.yml', getContent: getYmlString }];

  const handleDownload = (row: ChangedFileRow) => {
    trackDownloadYmlClicked('git', 'update_configuration_yml_modal');
    download(row.getContent(), row.downloadName, 'application/yaml;charset=utf-8');
    setIsCopiedOrDownloaded(true);
  };

  const handleCopy = (row: ChangedFileRow) => {
    trackCopyYmlClicked('git', 'update_configuration_yml_modal');
    copyToClipboard(row.getContent()).then((isCopied) => {
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

  return (
    <BitkitDialog
      title="Update configuration YAML"
      open={isOpen}
      onOpenChange={({ open }) => {
        if (!open) onClose();
      }}
      footerButtons={
        <>
          <BitkitButton variant="secondary" onClick={onClose}>
            Cancel
          </BitkitButton>
          <BitkitButton state={!isCopiedOrDownloaded ? 'disabled' : undefined} onClick={onClose}>
            Done
          </BitkitButton>
        </>
      }
    >
      <Box display="flex" flexDirection="column" gap="24">
        <ChangedModulesNote />

        <Text textStyle="body/lg/regular" color="text/body">
          {isModular ? (
            'You need to re-create the changes in the relevant configuration file on your Git repository.'
          ) : (
            <>
              You need to update the content of the configuration YAML in the {gitRepoSlug} repository&apos;s{' '}
              {defaultBranch} branch.
            </>
          )}
        </Text>

        <Box display="flex" flexDirection="column" gap="24">
          <BitkitSectionHeading label={isModular ? moduleCountLabel(changedModules.length) : 'Changed configuration'} />
          <Card.Root elevation={false} overflow="hidden">
            <Table.Root variant="borderless" size="md">
              <Table.Body>
                {rows.map((row) => (
                  <Table.Row key={row.key}>
                    <Table.Cell>{row.name}</Table.Cell>
                    <Table.Cell display="flex" alignItems="center" justifyContent="flex-end" gap="8">
                      <BitkitControlButton
                        icon={IconDownload}
                        label="Download changed version"
                        onClick={() => handleDownload(row)}
                      />
                      <BitkitControlButton
                        icon={IconCopy}
                        label="Copy changed configuration"
                        onClick={() => handleCopy(row)}
                      />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Card.Root>
        </Box>
      </Box>
    </BitkitDialog>
  );
};

export default UpdateConfigurationDialog;
