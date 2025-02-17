import { ChangeEventHandler, useState } from 'react';
import { Button, Textarea, useDisclosure } from '@bitrise/bitkit';
import { useDebounceCallback } from 'usehooks-ts';
import EditableInput from '@/components/EditableInput/EditableInput';
import StepBundleService from '@/core/models/StepBundleService';
import { useStepBundles } from '@/hooks/useStepBundles';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { StepBundleYmlObject } from '@/core/models/Step';
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
  const updateStepBundle = useBitriseYmlStore((s) => s.updateStepBundle);
  const debouncedUpdateStepBundle = useDebounceCallback(updateStepBundle, 100);

  const [{ summary, description }, setValues] = useState({
    summary: stepBundle?.userValues.summary || '',
    description: stepBundle?.userValues.description || '',
  });
  const rename = useRenameStepBundle(onRename);

  const handleNameChange = (newValue: string) => {
    if (newValue !== stepBundle?.id) {
      rename(newValue);
    }
  };

  const handleSummaryChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setValues((prev) => ({ ...prev, summary: e.target.value }));
    debouncedUpdateStepBundle(stepBundle?.id || '', { summary: e.target.value } as StepBundleYmlObject);
  };

  const handleDescriptionChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setValues((prev) => ({ ...prev, description: e.target.value }));
    debouncedUpdateStepBundle(stepBundle?.id || '', {
      description: e.target.value,
    } as StepBundleYmlObject);
  };

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
        marginBlockEnd="16"
        size="md"
      />
      <Textarea label="Summary" value={summary} onChange={handleSummaryChange} marginBlockEnd="16" />
      <Textarea label="Description" value={description} onChange={handleDescriptionChange} />
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
