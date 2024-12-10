import { useCallback, useEffect, useState } from 'react';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useWorkflowConfigContext } from '@/components/unified-editor/WorkflowConfig/WorkflowConfig.context';

const useRenameStepBundle = (onChange?: (newStepBundleId: string) => void) => {
  const selectedStepBundleId = useWorkflowConfigContext()?.id ?? '';
  // const selectedStepBundleId = useBitriseYmlStore((s) => s.yml.step_bundles?.id || '');
  const stepBundleIdsInTheStore = useBitriseYmlStore((s) => Object.keys(s.yml.step_bundles ?? {}));

  const [isRenaming, setIsRenaming] = useState(false);
  const [nextStepBundleId, setNextStepBundleId] = useState(selectedStepBundleId);
  const [prevStepBundleId, setPrevStepBundleId] = useState(selectedStepBundleId);

  const { createWorkflow, renameWorkflow, deleteWorkflow } = useBitriseYmlStore((s) => ({
    createWorkflow: s.createWorkflow,
    renameWorkflow: s.renameWorkflow,
    deleteWorkflow: s.deleteWorkflow,
  }));

  const isNewWorkflowPersisted = stepBundleIdsInTheStore.includes(nextStepBundleId);
  const isNewWorkflowSelected = nextStepBundleId === selectedStepBundleId;

  const shouldRunOnChange = isRenaming && isNewWorkflowPersisted && !isNewWorkflowSelected;
  const shouldFinishRenaming = isRenaming && isNewWorkflowPersisted && isNewWorkflowSelected;

  useEffect(() => {
    if (shouldRunOnChange) {
      onChange?.(nextStepBundleId);
    }
  }, [onChange, shouldRunOnChange, nextStepBundleId]);

  useEffect(() => {
    if (shouldFinishRenaming) {
      setIsRenaming(false);
      deleteWorkflow(prevStepBundleId);
    }
  }, [deleteWorkflow, shouldFinishRenaming, prevStepBundleId]);

  return useCallback(
    (newStepBundleId: string) => {
      if (selectedStepBundleId) {
        setIsRenaming(true);

        renameWorkflow(selectedStepBundleId, newStepBundleId);
        createWorkflow(selectedStepBundleId, newStepBundleId);

        setNextStepBundleId(newStepBundleId);
        setPrevStepBundleId(selectedStepBundleId);
      }
    },
    [createWorkflow, renameWorkflow, selectedStepBundleId],
  );
};

export default useRenameStepBundle;
