import { Button, Textarea, useDisclosure } from '@bitrise/bitkit';
import { ChangeEventHandler, useState } from 'react';
import { useDebounceCallback } from 'usehooks-ts';

import EditableInput from '@/components/EditableInput/EditableInput';
import { StepBundleModel } from '@/core/models/BitriseYml';
import StepBundleService from '@/core/services/StepBundleService';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useStepBundles } from '@/hooks/useStepBundles';

import DeleteStepBundleDialog from '../DeleteStepBundleDialog/DeleteStepBundleDialog';
import useRenameStepBundle from './hooks/useRenameStepBundle';
import { useStepBundleConfigContext } from './StepBundleConfig.context';

type StepBundlePropertiesTabProps = {
  onDelete?: () => void;
  onRename?: (newStepBundleId: string) => void;
};

const StepBundlePropertiesTab = (props: StepBundlePropertiesTabProps) => {
  const { onDelete, onRename } = props;
  const { stepBundle } = useStepBundleConfigContext();
  const { isOpen: isDeleteDialogOpen, onOpen: openDeleteDialog, onClose: closeDeleteDialog } = useDisclosure();
  const stepBundles = useStepBundles();
  const stepBundleIds = Object.keys(stepBundles);
  const updateStepBundle = useBitriseYmlStore((s) => s.updateStepBundle);
  const debouncedUpdateStepBundle = useDebounceCallback(updateStepBundle, 100);
  const [{ summary, description }, setValues] = useState({
    summary: stepBundle?.userValues.summary || '',
    description: stepBundle?.userValues.description || '',
  });
  const rename = useRenameStepBundle(stepBundle?.id, onRename);

  const handleNameChange = (newStepBundleId: string) => {
    if (newStepBundleId !== stepBundle?.id) {
      rename(newStepBundleId);
    }
  };

  const handleSummaryChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setValues((prev) => ({ ...prev, summary: e.target.value }));
    debouncedUpdateStepBundle(stepBundle?.id || '', { summary: e.target.value } as StepBundleModel);
  };

  const handleDescriptionChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setValues((prev) => ({ ...prev, description: e.target.value }));
    debouncedUpdateStepBundle(stepBundle?.id || '', {
      description: e.target.value,
    } as StepBundleModel);
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
