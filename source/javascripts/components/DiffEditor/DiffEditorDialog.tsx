import { Box, Dialog, DialogBody, DialogProps, Notification, Text } from '@bitrise/bitkit';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { parseDocument } from 'yaml';

import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import BitriseYmlApi from '@/core/api/BitriseYmlApi';
import { bitriseYmlStore } from '@/core/stores/BitriseYmlStore';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useCurrentPage from '@/hooks/useCurrentPage';

import DiffEditor from './DiffEditor';

const DiffEditorDialogBody = forwardRef((_, ref) => {
  const currentPage = useCurrentPage();
  const [currentText, setCurrentText] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { modifiedText, originalText } = useBitriseYmlStore((s) => ({
    modifiedText: BitriseYmlApi.toYml(s.ymlDocument),
    originalText: BitriseYmlApi.toYml(s.savedYmlDocument),
  }));

  const trySaveChanges = () => {
    try {
      if (currentText === undefined) {
        return true;
      }
      bitriseYmlStore.setState({ ymlDocument: parseDocument(currentText), discardKey: Date.now() });
      return true;
    } catch (error) {
      setErrorMessage(`Invalid YML format: ${(error as Error)?.message}`);
      segmentTrack('Workflow Editor Invalid Yml Popup Shown', {
        tab_name: currentPage,
        source: 'diff',
      });
      return false;
    }
  };

  useImperativeHandle(ref, () => ({ trySaveChanges }));

  return (
    <DialogBody>
      <Box display="flex" gap="16" flexDirection="column" height="calc(100% - 32px)">
        <Notification status="info">
          You can edit the right side of the diff view, and your changes will be saved
        </Notification>
        {errorMessage && (
          <Notification status="error">
            <Text textStyle="comp/notification/title">Error saving...</Text>
            <Text>{errorMessage}</Text>
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
    <Dialog {...rest} onClose={handleClose} title="View and edit YAML changes" size="full">
      <DiffEditorDialogBody ref={bodyRef} />
    </Dialog>
  );
};

export default DiffEditorDialog;
