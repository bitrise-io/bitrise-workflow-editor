import { BitkitButton, BitkitDialog } from '@bitrise/bitkit-v2';
import { Text } from '@chakra-ui/react/text';

type Props = {
  isOpen: boolean;
  fileName: string;
  onKeepEditing: () => void;
  onDiscard: () => void;
};

const DiscardFileTabDialog = ({ isOpen, fileName, onKeepEditing, onDiscard }: Props) => (
  <BitkitDialog
    title="Discard unsaved changes?"
    open={isOpen}
    onOpenChange={({ open }) => {
      if (!open) onKeepEditing();
    }}
  >
    <BitkitDialog.Body>
      <Text>
        Closing this tab discards your edits to <Text as="strong">{fileName}</Text>.
      </Text>
    </BitkitDialog.Body>
    <BitkitDialog.Footer>
      <BitkitDialog.Buttons>
        <BitkitButton variant="secondary" onClick={onKeepEditing}>
          Keep editing
        </BitkitButton>
        <BitkitButton variant="danger-primary" onClick={onDiscard}>
          Discard and close
        </BitkitButton>
      </BitkitDialog.Buttons>
    </BitkitDialog.Footer>
  </BitkitDialog>
);

export default DiscardFileTabDialog;
