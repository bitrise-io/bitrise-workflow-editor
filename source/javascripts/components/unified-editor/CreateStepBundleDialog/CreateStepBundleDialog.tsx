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

  const utililityWorkflowIds = workflowIds.filter((workflowId) => workflowId.startsWith('_'));

  const handleCloseComplete = (stepBundleId: string) => {
    if (stepBundleId) {
      setSelectedStepBundle(stepBundleId);
    }
    onCloseComplete?.();
  };

  return (
    <CreateEntityDialog
      entities={[
        { ids: stepBundleIds, groupLabel: 'Step bundle', type: 'step_bundles' },
        { ids: utililityWorkflowIds, groupLabel: 'Utility workflows', type: 'workflows' },
      ]}
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
