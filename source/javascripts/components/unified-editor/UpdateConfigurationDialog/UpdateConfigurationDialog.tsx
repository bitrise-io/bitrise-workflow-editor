import {
  BitkitButton,
  BitkitControlButton,
  BitkitDialog,
  BitkitNoteCard,
  BitkitSectionHeading,
  createBitkitToast,
  IconCopy,
  IconDownload,
} from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Card } from '@chakra-ui/react/card';
import { Table } from '@chakra-ui/react/table';
import { Text } from '@chakra-ui/react/text';
import { useState } from 'react';
import { useCopyToClipboard } from 'usehooks-ts';

import { trackCopyYmlClicked, trackDownloadYmlClicked } from '@/core/analytics/ConfigManagementAnalytics';
import TreeService from '@/core/services/TreeService';
import { getFileYmlString, getYmlString, isFileDirty } from '@/core/stores/BitriseYmlStore';
import { download } from '@/core/utils/CommonUtils';
import PageProps from '@/core/utils/PageProps';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useShallow } from '@/hooks/useShallow';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

type ChangedFileRow = {
  key: string;
  name: string;
  getContent: () => string;
};

const moduleCountLabel = (count: number) => `${count} ${count === 1 ? 'module' : 'modules'} changed`;

const DialogContent = ({ onClose }: Pick<Props, 'onClose'>) => {
  const [, copyToClipboard] = useCopyToClipboard();
  const { defaultBranch, gitRepoSlug } = PageProps.app() ?? {};
  const [isCopiedOrDownloaded, setIsCopiedOrDownloaded] = useState(false);

  const isModular = useBitriseYmlStore((s) => Boolean(s.tree));
  const changedModules = useBitriseYmlStore(
    useShallow((s) =>
      !s.tree
        ? []
        : Object.values(s.files)
            .filter((slice) => isFileDirty(slice))
            .map((slice) => ({ nodeId: slice.nodeId, path: slice.path, name: TreeService.fileName(slice.path) })),
    ),
  );

  // Single config → one synthetic "bitrise.yml" row (the whole config); modular → one row per changed module file.
  const rows: ChangedFileRow[] = isModular
    ? changedModules.map(({ nodeId, name }) => ({ key: nodeId, name, getContent: () => getFileYmlString(nodeId) }))
    : [{ key: 'bitrise.yml', name: 'bitrise.yml', getContent: getYmlString }];

  const handleDownload = (row: ChangedFileRow) => {
    trackDownloadYmlClicked('git', 'update_configuration_yml_modal');
    download(row.getContent(), row.name, 'application/yaml;charset=utf-8');
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
    <>
      <BitkitDialog.Body>
        <Box display="flex" flexDirection="column" gap="24">
          {isModular && (
            <BitkitNoteCard
              status="info"
              title={moduleCountLabel(changedModules.length)}
              message={changedModules.map((module) => module.path).join(', ')}
            />
          )}

          <Text textStyle="body/lg/regular" color="text/body">
            {isModular
              ? 'You need to re-create the changes in the relevant configuration file on your Git repository.'
              : `You need to update the content of the configuration YAML in the ${gitRepoSlug} repository's ${defaultBranch} branch.`}
          </Text>

          <Box display="flex" flexDirection="column" gap="24">
            <BitkitSectionHeading
              label={isModular ? moduleCountLabel(changedModules.length) : 'Changed configuration'}
            />
            <Card.Root elevation={false} overflow="hidden">
              <Table.Root variant="borderless">
                <Table.Body>
                  {rows.map((row) => (
                    <Table.Row key={row.key}>
                      <Table.Cell>{row.name}</Table.Cell>
                      <Table.Cell>
                        <Box display="flex" gap="8" justifyContent="flex-end">
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
                        </Box>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Card.Root>
          </Box>
        </Box>
      </BitkitDialog.Body>
      <BitkitDialog.Footer>
        <BitkitDialog.Buttons>
          <BitkitButton variant="secondary" onClick={onClose}>
            Cancel
          </BitkitButton>
          <BitkitButton state={!isCopiedOrDownloaded ? 'disabled' : undefined} onClick={onClose}>
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
