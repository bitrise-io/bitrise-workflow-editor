import { Button, Textarea, useDisclosure } from '@bitrise/bitkit';
import { ChangeEventHandler } from 'react';

import EditableInput from '@/components/EditableInput/EditableInput';
import StepBundleService from '@/core/services/StepBundleService';
import { useStepBundles } from '@/hooks/useStepBundles';

import DeleteStepBundleDialog from '../DeleteStepBundleDialog/DeleteStepBundleDialog';
import useRenameStepBundle from './hooks/useRenameStepBundle';
import { useStepBundleConfigContext } from './StepBundleConfig.context';

type StepBundlePropertiesTabProps = {
  onDelete?: () => void;
  onRename?: (newStepBundleId: string) => void;
};

const NameInput = ({ onRename }: Pick<StepBundlePropertiesTabProps, 'onRename'>) => {
  const value = useStepBundleConfigContext((s) => s.stepBundle?.id);
  const stepBundleIds = useStepBundles((s) => Object.keys(s));
  const rename = useRenameStepBundle(value, onRename);

  const handleNameChange = (newStepBundleId: string) => {
    if (newStepBundleId !== value) {
      rename(newStepBundleId);
    }
  };

  return (
    <EditableInput
      isRequired
      name="name"
      label="Name"
      value={value}
      marginBlockEnd="16"
      sanitize={StepBundleService.sanitizeName}
      validate={(v) => StepBundleService.validateName(v, value || '', stepBundleIds)}
      onCommit={handleNameChange}
    />
  );
};

const SummaryInput = () => {
  const id = useStepBundleConfigContext((s) => s.stepBundle?.id || '');
  const value = useStepBundleConfigContext((s) => s.stepBundle?.userValues.summary || '');

  const handleSummaryChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    StepBundleService.updateStepBundleField(id, 'summary', e.target.value);
  };

  return <Textarea label="Summary" value={value} onChange={handleSummaryChange} marginBlockEnd="16" />;
};

const DescriptionInput = () => {
  const id = useStepBundleConfigContext((s) => s.stepBundle?.id || '');
  const value = useStepBundleConfigContext((s) => s.stepBundle?.userValues.description || '');

  const handleDescriptionChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    StepBundleService.updateStepBundleField(id, 'description', e.target.value);
  };

  return <Textarea label="Description" value={value} onChange={handleDescriptionChange} />;
};

const StepBundlePropertiesTab = ({ onDelete, onRename }: StepBundlePropertiesTabProps) => {
  const id = useStepBundleConfigContext((s) => s.stepBundle?.id || '');
  const { isOpen: isDeleteDialogOpen, onOpen: openDeleteDialog, onClose: closeDeleteDialog } = useDisclosure();

  return (
    <>
      <NameInput onRename={onRename} />
      <SummaryInput />
      <DescriptionInput />
      {!!onDelete && (
        <>
          <Button leftIconName="Trash" variant="secondary" isDanger marginBlockStart="24" onClick={openDeleteDialog}>
            Delete Step bundle
          </Button>
          <DeleteStepBundleDialog
            stepBundleId={id}
            isOpen={isDeleteDialogOpen}
            onClose={closeDeleteDialog}
            onDeleteStepBundle={onDelete}
          />
        </>
      )}
    </>
  );
};

export default StepBundlePropertiesTab;
