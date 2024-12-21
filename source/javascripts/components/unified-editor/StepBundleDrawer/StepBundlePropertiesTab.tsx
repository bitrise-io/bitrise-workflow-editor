import { Button, useDisclosure } from '@bitrise/bitkit';
import EditableInput from '@/components/EditableInput/EditableInput';
import StepBundleService from '@/core/models/StepBundleService';
import { useStepBundles } from '@/hooks/useStepBundles';
import DeleteStepBundleDialog from '@/pages/StepBundlesPage/components/DeleteStepBundleDialog/DeleteStepBundleDialog';
import useRenameStepBundle from './hooks/useRenameStepBundle';

type StepBundlesPropertiesTabProps = {
  stepBundleId: string;
  onDelete?: (id: string) => void;
};

const StepBundlesPropertiesTab = (props: StepBundlesPropertiesTabProps) => {
  const { stepBundleId, onDelete } = props;
  const { isOpen: isDeleteDialogOpen, onOpen: openDeleteDialog, onClose: closeDeleteDialog } = useDisclosure();

  const stepBundles = useStepBundles();
  const stepBundleIds = Object.keys(stepBundles);

  const handleNameChange = useRenameStepBundle(stepBundleId);

  return (
    <>
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
          <DeleteStepBundleDialog isOpen={isDeleteDialogOpen} onClose={closeDeleteDialog} stepBundleId={stepBundleId} />
        </>
      )}
    </>
  );
};

export default StepBundlesPropertiesTab;
