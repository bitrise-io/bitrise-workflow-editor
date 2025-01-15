import { Box, Button, useDisclosure } from '@bitrise/bitkit';
import EditableInput from '@/components/EditableInput/EditableInput';
import StepBundleService from '@/core/models/StepBundleService';
import { useStepBundles } from '@/hooks/useStepBundles';
import DeleteStepBundleDialog from '@/components/unified-editor/DeleteStepBundleDialog/DeleteStepBundleDialog';
import useRenameStepBundle from '@/components/unified-editor/StepBundleConfigDrawer/hooks/useRenameStepBundle';

type StepBundlePropertiesTabProps = {
  stepBundleId: string;
  onDelete?: (id: string) => void;
  onRename?: (newStepBundleId: string) => void;
};

const StepBundlePropertiesTab = (props: StepBundlePropertiesTabProps) => {
  const { stepBundleId, onDelete, onRename } = props;
  const { isOpen: isDeleteDialogOpen, onOpen: openDeleteDialog, onClose: closeDeleteDialog } = useDisclosure();
  const stepBundles = useStepBundles();
  const stepBundleIds = Object.keys(stepBundles);

  const handleNameChange = useRenameStepBundle(onRename);

  return (
    <Box padding="16px 24px">
      <EditableInput
        isRequired
        name="name"
        label="Name"
        value={stepBundleId}
        sanitize={StepBundleService.sanitizeName}
        validate={(v) => StepBundleService.validateName(v, stepBundleId, stepBundleIds)}
        onCommit={handleNameChange}
      />
      {!!onDelete && (
        <>
          <Button leftIconName="Trash" variant="secondary" isDanger marginBlockStart="24" onClick={openDeleteDialog}>
            Delete Step bundle
          </Button>
          <DeleteStepBundleDialog
            isOpen={isDeleteDialogOpen}
            onClose={closeDeleteDialog}
            stepBundleId={stepBundleId}
            onDeleteStepBundle={onDelete}
          />
        </>
      )}
    </Box>
  );
};

export default StepBundlePropertiesTab;
