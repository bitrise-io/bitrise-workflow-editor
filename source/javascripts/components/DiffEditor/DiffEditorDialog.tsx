import { Box, Dialog, DialogBody, DialogProps, List, ListItem, Notification, Text } from '@bitrise/bitkit';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { YAMLError } from 'yaml';

import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import { forceRefreshStates, setBitriseYmlDocument } from '@/core/stores/BitriseYmlStore';
import YmlUtils from '@/core/utils/YmlUtils';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useCurrentPage from '@/hooks/useCurrentPage';

import DiffEditor from './DiffEditor';

const DiffEditorDialogBody = forwardRef((_, ref) => {
  const currentPage = useCurrentPage();
  const [currentText, setCurrentText] = useState<string>();
  const [yamlErrors, setYamlErrors] = useState<YAMLError[]>([]);

  const { modifiedText, originalText } = useBitriseYmlStore((s) => ({
    modifiedText: YmlUtils.toYml(s.ymlDocument),
    originalText: YmlUtils.toYml(s.savedYmlDocument),
  }));

  const trySaveChanges = () => {
    setYamlErrors([]);

    if (currentText === undefined) {
      return true;
    }

    const doc = YmlUtils.toDoc(currentText);
    if (doc.errors.length > 0) {
      setYamlErrors(doc.errors);
      segmentTrack('Workflow Editor Invalid Yml Popup Shown', {
        tab_name: currentPage,
        source: 'diff',
      });
      return false;
    }

    setBitriseYmlDocument(doc);
    forceRefreshStates();

    return true;
  };

  useImperativeHandle(ref, () => ({ trySaveChanges }));

  return (
    <DialogBody>
      <Box display="flex" gap="16" flexDirection="column" height="calc(100% - 32px)">
        <Notification status="info">
          You can edit the right side of the diff view, and your changes will be saved
        </Notification>
        {yamlErrors.length > 0 && (
          <Notification status="error">
            <Text textStyle="comp/notification/title">
              Your YAML contains errors, please fix them before closing the dialog.
            </Text>
            <List>
              {yamlErrors.slice(0, 4).map((error) => (
                <ListItem key={error.pos.join('.') + error.code} textStyle="comp/notification/description">
                  {error.message}
                </ListItem>
              ))}
            </List>
          </Notification>
        )}
        <Box flex="1">
          {originalText && modifiedText && (
            <DiffEditor originalText={originalText} modifiedText={modifiedText} onChange={setCurrentText} />
          )}
        </Box>
      </Box>
    </DialogBody>
  );
});

const DiffEditorDialog = ({ onClose, ...rest }: Omit<DialogProps, 'title'>) => {
  const bodyRef = useRef<{ trySaveChanges: () => string | undefined }>(null);
  const handleClose = () => {
    if (bodyRef.current?.trySaveChanges()) {
      onClose?.();
    }
  };

  return (
    <Dialog
      {...rest}
      size="full"
      onClose={handleClose}
      minHeight={['100dvh', 'unset']}
      title="View and edit YAML changes"
    >
      <DiffEditorDialogBody ref={bodyRef} />
    </Dialog>
  );
};

export default DiffEditorDialog;
