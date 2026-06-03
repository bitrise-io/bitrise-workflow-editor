import { DialogProps } from '@bitrise/bitkit';

import CreateEntityDialog from '@/components/unified-editor/CreateEntityDialog/CreateEntityDialog';
import { StepBundleCreationSource } from '@/core/models/StepBundle';
import StepBundleService from '@/core/services/StepBundleService';
import WorkflowService from '@/core/services/WorkflowService';
import useSelectedStepBundle from '@/hooks/useSelectedStepBundle';
import { useStepBundles } from '@/hooks/useStepBundles';
import { useWorkflows } from '@/hooks/useWorkflows';

type BaseEntityGroup = {
  ids: string[];
  groupLabel?: string;
  type: StepBundleCreationSource;
};

type Props = Omit<DialogProps, 'title'> & {
  onCreateStepBundle: (stepBundleId: string, baseEntityId?: string, title?: string) => void;
};

const CreateStepBundleDialog = ({ onClose, onCloseComplete, onCreateStepBundle, ...props }: Props) => {
  const workflowIds = useWorkflows((s) => Object.keys(s));
  const stepBundleIds = useStepBundles((s) => Object.keys(s));

  const [, setSelectedStepBundle] = useSelectedStepBundle();

  const utilityWorkflowIds = workflowIds.filter((workflowId) => WorkflowService.isUtilityWorkflow(workflowId));

  const handleCloseComplete = (stepBundleId: string) => {
    if (stepBundleId) {
      setSelectedStepBundle(stepBundleId);
    }
    onCloseComplete?.();
  };

  const baseEntities: BaseEntityGroup[] = [
    {
      ids: stepBundleIds,
      groupLabel: utilityWorkflowIds.length ? 'Step bundles' : undefined,
      type: 'step_bundles',
    },
  ];

  if (utilityWorkflowIds.length) {
    baseEntities.push({
      ids: utilityWorkflowIds,
      groupLabel: 'Utility workflows',
      type: 'workflows',
    });
  }

  return (
    <CreateEntityDialog<StepBundleCreationSource>
      baseEntities={baseEntities}
      extraInputs={['title']}
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
