import { DialogProps } from '@bitrise/bitkit';
import CreateEntityDialog from '@/components/unified-editor/CreateEntityDialog/CreateEntityDialog';
import StepBundleService from '@/core/services/StepBundleService';
import { useStepBundles } from '@/hooks/useStepBundles';
import useSelectedStepBundle from '@/hooks/useSelectedStepBundle';
import { useWorkflows } from '@/hooks/useWorkflows';

type Props = Omit<DialogProps, 'title'> & {
  onCreateStepBundle: (stepBundleId: string, baseEntityId?: string) => void;
};

const CreateStepBundleDialog = ({ onClose, onCloseComplete, onCreateStepBundle, ...props }: Props) => {
  const workflows = useWorkflows();
  const workflowIds = Object.keys(workflows);

  const stepBundles = useStepBundles();
  const stepBundleIds = Object.keys(stepBundles);

  const [, setSelectedStepBundle] = useSelectedStepBundle();

  const utilityWorkflowIds = workflowIds.filter((workflowId) => workflowId.startsWith('_'));

  const handleCloseComplete = (stepBundleId: string) => {
    if (stepBundleId) {
      setSelectedStepBundle(stepBundleId);
    }
    onCloseComplete?.();
  };

  const baseEntities = [
    { ids: stepBundleIds, groupLabel: utilityWorkflowIds.length ? 'Step bundle' : undefined, type: 'step_bundles' },
  ];

  if (utilityWorkflowIds.length) {
    baseEntities.push({ ids: utilityWorkflowIds, groupLabel: 'Utility workflow', type: 'workflows' });
  }

  return (
    <CreateEntityDialog
      baseEntities={baseEntities}
      entityName="Step bundle"
      onClose={onClose}
      onCloseComplete={handleCloseComplete}
      onCreateEntity={onCreateStepBundle}
      sanitizer={StepBundleService.sanitizeName}
      validator={(v) => StepBundleService.validateName(v, '', stepBundleIds)}
      {...props}
    />
  );
};

export default CreateStepBundleDialog;
