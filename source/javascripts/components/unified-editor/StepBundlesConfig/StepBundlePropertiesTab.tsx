import { Button, useDisclosure } from '@bitrise/bitkit';
import EditableInput from '@/components/EditableInput/EditableInput';
import StepBundleService from '@/core/models/StepBundleService';
import { useStepBundles } from '@/hooks/useStepBundles';
import DeleteStepBundleDialog from '../DeleteStepBundleDialog/DeleteStepBundleDialog';
import { useStepBundleConfigContext } from './StepBundlesConfig.context';
import useRenameStepBundle from './hooks/useRenameStepBundle';

type StepBundlePropertiesTabProps = {
  onDelete?: (id: string) => void;
  onRename?: (newStepBundleId: string) => void;
};

const StepBundlePropertiesTab = (props: StepBundlePropertiesTabProps) => {
  const { onDelete, onRename } = props;
  const stepBundle = useStepBundleConfigContext();
  const { isOpen: isDeleteDialogOpen, onOpen: openDeleteDialog, onClose: closeDeleteDialog } = useDisclosure();
  const stepBundles = useStepBundles();
  const stepBundleIds = Object.keys(stepBundles);

  const handleNameChange = useRenameStepBundle(onRename);

  return (
    <>
      <EditableInput
        isRequired
        name="name"
        label="Name"
        value={stepBundle?.id}
        sanitize={StepBundleService.sanitizeName}
        validate={(v) => StepBundleService.validateName(v, stepBundle?.id || '', stepBundleIds)}
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
            stepBundleId={stepBundle?.id || ''}
            onDeleteStepBundle={onDelete}
          />
        </>
      )}
    </>
  );
};

export default StepBundlePropertiesTab;
