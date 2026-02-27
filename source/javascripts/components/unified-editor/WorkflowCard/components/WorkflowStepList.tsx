import { memo } from 'react';

import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useMergedBitriseYml from '@/hooks/useMergedBitriseYml';

import { useStepActions } from '../contexts/WorkflowCardContext';
import StepList from './StepList';

type Props = {
  workflowId: string;
};

const WorkflowStepList = ({ workflowId }: Props) => {
  const mergedYml = useMergedBitriseYml();

  const steps = useBitriseYmlStore(({ yml }) => {
    const workflow = yml.workflows?.[workflowId] ?? mergedYml?.workflows?.[workflowId];
    return (workflow?.steps ?? []).map((s) => Object.keys(s)[0]);
  });

  const { onAddStep, onMoveStep } = useStepActions();

  return <StepList workflowId={workflowId} onAdd={onAddStep} onMove={onMoveStep} steps={steps} />;
};

export default memo(WorkflowStepList);
