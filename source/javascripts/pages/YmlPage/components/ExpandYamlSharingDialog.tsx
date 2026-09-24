import { DialogBody, DialogFooter, Icon, Text } from '@bitrise/bitkit';
import { BitkitAlert, BitkitButton } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { HStack } from '@chakra-ui/react/stack';
import { datadogRum } from '@datadog/browser-rum';
import { ModalCloseButton, ModalHeader } from 'chakra-ui-2--react';
import { useState } from 'react';

import DiffEditor from '@/components/DiffEditor/DiffEditor';
import { DiffEditorDialogShell } from '@/components/DiffEditor/DiffEditorDialog';
import YamlSharingService from '@/core/services/YamlSharingService';

type Props = { isOpen: boolean; onClose: VoidFunction };

function previewOrError() {
  try {
    return { preview: YamlSharingService.previewExpansion() };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

const ExpandYamlSharingDialogContent = ({ onClose }: Pick<Props, 'onClose'>) => {
  const [{ preview, error }] = useState(previewOrError);

  const expand = () => {
    const { hasAliases, hasMergeKeys } = YamlSharingService.expand();
    datadogRum.addAction('wfe_yaml_sharing_expanded', { hasAliases, hasMergeKeys });
    onClose();
  };

  return (
    <>
      <ModalHeader>
        <Text as="h1" textStyle="comp/dialog/title">
          Expand aliases and merge keys
        </Text>
      </ModalHeader>
      <ModalCloseButton size="large">
        <Icon name="Cross" />
      </ModalCloseButton>
      <DialogBody flex="1" display="flex" flexDirection="column" gap="16" minHeight="0">
        <BitkitAlert
          variant={error ? 'critical' : 'info'}
          messageText={
            error ??
            'Every alias becomes a copy of what it points to, and every merge key becomes the keys it merges. Nothing is shared afterwards, so a change to one copy no longer changes the others. Nothing is saved until you save the configuration.'
          }
        />
        {preview && (
          <Box flex="1" display="flex" flexDirection="column" minWidth="0">
            <DiffEditor originalText={preview.currentText} modifiedText={preview.expandedText} readOnly />
          </Box>
        )}
      </DialogBody>
      <DialogFooter>
        <HStack gap="16">
          <BitkitButton variant="secondary" onClick={onClose}>
            Cancel
          </BitkitButton>
          <BitkitButton variant="primary" state={preview ? undefined : 'disabled'} onClick={expand}>
            Expand
          </BitkitButton>
        </HStack>
      </DialogFooter>
    </>
  );
};

const ExpandYamlSharingDialog = ({ isOpen, onClose }: Props) => (
  <DiffEditorDialogShell isOpen={isOpen} onClose={onClose}>
    {isOpen && <ExpandYamlSharingDialogContent onClose={onClose} />}
  </DiffEditorDialogShell>
);

export default ExpandYamlSharingDialog;
