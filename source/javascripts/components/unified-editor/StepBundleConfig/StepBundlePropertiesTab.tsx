import { Button, Input, Textarea, useDisclosure } from '@bitrise/bitkit';

import EditableInput from '@/components/EditableInput/EditableInput';
import StepBundleService from '@/core/services/StepBundleService';
import { useStepBundles } from '@/hooks/useStepBundles';

import DeleteStepBundleDialog from '../DeleteStepBundleDialog/DeleteStepBundleDialog';
import useChangeStepBundleId from './hooks/useChangeStepBundleId';
import { useStepBundleConfigContext } from './StepBundleConfig.context';

type StepBundlePropertiesTabProps = {
  nameLabel?: string;
  onDelete?: () => void;
  onChangeId?: (newStepBundleId: string) => void;
};

const StepBundlePropertiesTab = ({ onDelete, onChangeId }: StepBundlePropertiesTabProps) => {
  const stepBundleIds = useStepBundles((s) => Object.keys(s));
  const contextData = useStepBundleConfigContext((s) => s);
  const id = contextData.stepBundle?.id || contextData.stepBundleId || '';

  const at = {
    cvs: contextData.stepBundle?.cvs || `bundle::${contextData.stepBundle?.id || contextData.stepBundleId}`,
    source: contextData.parentStepBundleId ? 'step_bundles' : ('workflows' as 'step_bundles' | 'workflows'),
    sourceId: contextData.parentStepBundleId || contextData.parentWorkflowId || '',
    stepIndex: contextData.stepIndex,
  };

  const { isOpen: isDeleteDialogOpen, onOpen: openDeleteDialog, onClose: closeDeleteDialog } = useDisclosure();

  const rename = useChangeStepBundleId(id, onChangeId);

  const handleIdChange = (newStepBundleId: string) => {
    if (newStepBundleId !== id) {
      rename(newStepBundleId);
    }
  };

  const handleFieldChange = (field: 'description' | 'summary' | 'title', value: string) => {
    if (contextData.parentStepBundleId || contextData.stepBundle) {
      StepBundleService.updateStepBundleInstanceField(field, value, at);
    } else {
      StepBundleService.updateStepBundleField(id, field, value);
    }
  };

  return (
    <>
      <EditableInput
        isRequired
        name="id"
        label="ID"
        value={contextData.stepBundle?.id}
        sanitize={StepBundleService.sanitizeName}
        validate={(v) => StepBundleService.validateName(v, contextData.stepBundle?.id || '', stepBundleIds)}
        onCommit={handleIdChange}
      />
      <Input
        label="Title"
        size="md"
        onChange={(e) => handleFieldChange('title', e.target.value)}
        value={contextData.stepBundle?.mergedValues.title || ''}
      />
      <Textarea
        label="Summary"
        value={contextData.stepBundle?.mergedValues.summary || ''}
        onChange={(e) => handleFieldChange('summary', e.target.value)}
      />
      <Textarea
        label="Description"
        value={contextData.stepBundle?.mergedValues.description || ''}
        onChange={(e) => handleFieldChange('description', e.target.value)}
      />
      {!!onDelete && (
        <>
          <Button
            leftIconName="Trash"
            size="md"
            variant="secondary"
            isDanger
            onClick={openDeleteDialog}
            width="fit-content"
          >
            Delete Step bundle
          </Button>
          <DeleteStepBundleDialog
            stepBundleId={contextData.stepBundle?.id || ''}
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
