import { memo } from 'react';
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import StepList from '@/components/unified-editor/WorkflowCard/components/StepList';
import { useStepActions } from '@/components/unified-editor/WorkflowCard/contexts/WorkflowCardContext';

type Props = {
  workflowId: string;
};

const WorkflowStepList = ({ workflowId }: Props) => {
  const steps = useBitriseYmlStore(({ yml }) => {
    return (yml.workflows?.[workflowId]?.steps ?? []).map((s) => Object.keys(s)[0]);
  });

  const { onAddStep, onMoveStep } = useStepActions();

  return <StepList workflowId={workflowId} onAdd={onAddStep} onMove={onMoveStep} steps={steps} showStepBundles />;
};

export default memo(WorkflowStepList);
