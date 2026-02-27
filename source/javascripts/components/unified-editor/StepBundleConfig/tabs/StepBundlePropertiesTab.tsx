import { Box, Button, IconButton, Input, Textarea, useDisclosure } from '@bitrise/bitkit';

import EditableInput from '@/components/EditableInput/EditableInput';
import StepBundleService from '@/core/services/StepBundleService';
import { useStepBundles } from '@/hooks/useStepBundles';

import DeleteStepBundleDialog from '../../DeleteStepBundleDialog/DeleteStepBundleDialog';
import useChangeStepBundleId from '../hooks/useChangeStepBundleId';
import { useStepBundleConfigContext } from '../StepBundleConfig.context';

type StepBundlePropertiesTabProps = {
  onDelete?: () => void;
  onChangeId?: (newStepBundleId: string) => void;
  variant: 'panel' | 'drawer';
};

const StepBundlePropertiesTab = ({ onDelete, onChangeId, variant }: StepBundlePropertiesTabProps) => {
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
    if (contextData.parentStepBundleId || contextData.parentWorkflowId) {
      StepBundleService.updateStepBundleInstanceField(field, value, at);
    } else {
      StepBundleService.updateStepBundleField(id, field, value);
    }
  };

  return (
    <>
      {variant === 'panel' && (
        <EditableInput
          isRequired
          helperText="Unique ID for referencing in YAML. Allowed characters: A-Za-z0-9-_."
          name="id"
          label="ID"
          value={contextData.stepBundle?.id}
          sanitize={StepBundleService.sanitizeName}
          validate={(v) => StepBundleService.validateName(v, contextData.stepBundle?.id || '', stepBundleIds)}
          onCommit={handleIdChange}
        />
      )}
      <Box display="flex" gap="8" width="100%">
        <Input
          flex="1"
          helperText="Human-readable name, overridable per instance."
          label="Title"
          size="md"
          onChange={(e) => handleFieldChange('title', e.target.value)}
          value={contextData.stepBundle?.mergedValues.title || ''}
        />
        {variant === 'drawer' && contextData.stepBundle?.userValues.title && (
          <IconButton
            aria-label="Reset to default"
            iconName="Refresh"
            marginBlockStart="24"
            onClick={() => handleFieldChange('title', '')}
            size="md"
            variant="secondary"
          />
        )}
      </Box>
      <Box display="flex" gap="8" width="100%">
        <Input
          flex="1"
          label="Summary"
          value={contextData.stepBundle?.mergedValues.summary || ''}
          onChange={(e) => handleFieldChange('summary', e.target.value)}
        />
        {variant === 'drawer' && contextData.stepBundle?.userValues.summary && (
          <IconButton
            aria-label="Reset to default"
            iconName="Refresh"
            marginBlockStart="24"
            onClick={() => handleFieldChange('summary', '')}
            size="md"
            variant="secondary"
          />
        )}
      </Box>
      <Box display="flex" gap="8" width="100%">
        <Textarea
          flex="1"
          label="Description"
          value={contextData.stepBundle?.mergedValues.description || ''}
          onChange={(e) => handleFieldChange('description', e.target.value)}
        />
        {variant === 'drawer' && contextData.stepBundle?.userValues.description && (
          <IconButton
            aria-label="Reset to default"
            iconName="Refresh"
            marginBlockStart="24"
            onClick={() => handleFieldChange('description', '')}
            size="md"
            variant="secondary"
          />
        )}
      </Box>
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
