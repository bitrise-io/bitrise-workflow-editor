import { DialogProps } from '@bitrise/bitkit';
import CreateEntityDialog from '@/components/unified-editor/CreateEntityDialog/CreateEntityDialog';
import WorkflowService from '@/core/services/WorkflowService';
import StepBundleService from '@/core/services/StepBundleService';
import { useStepBundles } from '@/hooks/useStepBundles';
import useSelectedStepBundle from '@/hooks/useSelectedStepBundle';
import { useWorkflows } from '@/hooks/useWorkflows';

export enum StepBundleBaseEntityType {
  STEP_BUNDLES = 'step_bundles',
  WORKFLOWS = 'workflows',
}

type Props = Omit<DialogProps, 'title'> & {
  onCreateStepBundle: (stepBundleId: string, baseEntityId?: string) => void;
};

const CreateStepBundleDialog = ({ onClose, onCloseComplete, onCreateStepBundle, ...props }: Props) => {
  const workflows = useWorkflows();
  const workflowIds = Object.keys(workflows);

  const stepBundles = useStepBundles();
  const stepBundleIds = Object.keys(stepBundles);

  const [, setSelectedStepBundle] = useSelectedStepBundle();

  const utilityWorkflowIds = workflowIds.filter((workflowId) => WorkflowService.isUtilityWorkflow(workflowId));

  const handleCloseComplete = (stepBundleId: string) => {
    if (stepBundleId) {
      setSelectedStepBundle(stepBundleId);
    }
    onCloseComplete?.();
  };

  const baseEntities = [
    {
      ids: stepBundleIds,
      groupLabel: utilityWorkflowIds.length ? 'Step bundles' : undefined,
      type: StepBundleBaseEntityType.STEP_BUNDLES,
    },
  ];

  if (utilityWorkflowIds.length) {
    baseEntities.push({
      ids: utilityWorkflowIds,
      groupLabel: 'Utility workflows',
      type: StepBundleBaseEntityType.WORKFLOWS,
    });
  }

  return (
    <CreateEntityDialog<StepBundleBaseEntityType>
      baseEntities={baseEntities}
      entityName="Step bundle"
      onClose={onClose}
      onCloseComplete={handleCloseComplete}
      onCreateEntity={onCreateStepBundle}
      sanitizer={StepBundleService.sanitizeName}
      validator={(v: string) => StepBundleService.validateName(v, '', stepBundleIds)}
      {...props}
    />
  );
};

export default CreateStepBundleDialog;
