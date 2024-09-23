import { useRef } from 'react';
import { Box, Dialog, DialogBody, useDisclosure } from '@bitrise/bitkit';
import { UseDisclosureProps } from '@chakra-ui/react';
import Notification from '@/components/Notification';
import DiffEditor from './DiffEditor';

type Props = UseDisclosureProps & {
  originalText: string;
  modifiedText: string;
  onChange: (value: string) => void;
};

const DiffEditorDialog = ({ originalText, modifiedText, onChange, ...disclosureProps }: Props) => {
  const changeRef = useRef<string>(modifiedText);
  const { isOpen, onClose } = useDisclosure(disclosureProps);

  const handleClose = () => {
    onChange(changeRef.current);
    onClose();
  };

  return (
    <Dialog title="View and edit YAML changes" isOpen={isOpen} onClose={handleClose} size="full">
      <DialogBody>
        <Notification
          status="info"
          message="You can edit the right side of the diff view, and your changes will be saved"
        />
        <Box mt="16" height="calc(100% - 96px)">
          <DiffEditor
            originalText={originalText}
            modifiedText={modifiedText}
            onChange={(changed) => {
              changeRef.current = changed;
            }}
          />
        </Box>
      </DialogBody>
    </Dialog>
  );
};

export default DiffEditorDialog;
