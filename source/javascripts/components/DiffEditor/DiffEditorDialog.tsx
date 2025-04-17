import { Box, Dialog, DialogBody, DialogProps, Notification, Text } from '@bitrise/bitkit';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

import LoadingState from '@/components/LoadingState';
import { segmentTrack } from '@/core/analytics/SegmentBaseTracking';
import { bitriseYmlStore, updateYmlInStore } from '@/core/stores/BitriseYmlStore';
import useCurrentPage from '@/hooks/useCurrentPage';
import useFormattedYml from '@/hooks/useFormattedYml';

import DiffEditor from './DiffEditor';

const DiffEditorDialogBody = forwardRef((_, ref) => {
  const currentPage = useCurrentPage();
  const [currentText, setCurrentText] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    data: originalText,
    error: originalYmlFormatError,
    isLoading: isOriginalYmlFormatLoading,
  } = useFormattedYml(bitriseYmlStore.getState().savedYml);

  const {
    data: modifiedText,
    error: modifiedYmlFormatError,
    isLoading: isModifiedYmlFormatLoading,
  } = useFormattedYml(bitriseYmlStore.getState().yml);

  useEffect(() => {
    if (modifiedYmlFormatError) {
      setErrorMessage(`Failed to format modified YML: ${modifiedYmlFormatError.message}`);
    } else if (originalYmlFormatError) {
      setErrorMessage(`Failed to format original YML: ${originalYmlFormatError.message}`);
    }
  }, [modifiedYmlFormatError, originalYmlFormatError]);

  const trySaveChanges = () => {
    try {
      if (currentText === undefined) {
        return true;
      }
      updateYmlInStore(currentText);
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

  const isLoading = isModifiedYmlFormatLoading || isOriginalYmlFormatLoading;

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
          {isLoading && <LoadingState />}
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
