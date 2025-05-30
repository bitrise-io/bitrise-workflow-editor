import { memo } from 'react';

import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import { useStepActions } from '../contexts/WorkflowCardContext';
import StepList from './StepList';

type Props = {
  workflowId: string;
};

const WorkflowStepList = ({ workflowId }: Props) => {
  const steps = useBitriseYmlStore(({ yml }) => {
    return (yml.workflows?.[workflowId]?.steps ?? []).map((s) => Object.keys(s)[0]);
  });

  const { onAddStep, onMoveStep } = useStepActions();

  return <StepList workflowId={workflowId} onAdd={onAddStep} onMove={onMoveStep} steps={steps} />;
};

export default memo(WorkflowStepList);
