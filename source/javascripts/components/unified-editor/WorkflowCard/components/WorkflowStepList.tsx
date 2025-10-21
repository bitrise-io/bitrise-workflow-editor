import { memo } from 'react';

import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import { useStepActions } from '../contexts/WorkflowCardContext';
import StepList from './StepList';

type Props = {
  id: string;
};

const WorkflowStepList = ({ id }: Props) => {
  const steps = useBitriseYmlStore(({ yml }) => {
    return (yml.workflows?.[id]?.steps ?? []).map((s) => Object.keys(s)[0]);
  });

  const { onAddStep, onMoveStep } = useStepActions();

  return <StepList parentWorkflowId={id} onAdd={onAddStep} onMove={onMoveStep} steps={steps} />;
};

export default memo(WorkflowStepList);
