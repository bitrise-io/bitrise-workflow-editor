/* eslint-disable import/no-cycle */
import { memo } from 'react';

import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import { useStepActions } from '../contexts/WorkflowCardContext';
import StepList from './StepList';

type Props = {
  stepBundleId: string;
  workflowId?: string;
};

const StepBundleStepList = ({ stepBundleId, workflowId }: Props) => {
  const steps = useBitriseYmlStore(({ yml }) => {
    return (yml.step_bundles?.[stepBundleId]?.steps ?? []).map((s) => Object.keys(s)[0]);
  });

  const { onAddStepToStepBundle, onMoveStepInStepBundle } = useStepActions();

  return (
    <StepList
      stepBundleId={stepBundleId}
      workflowId={workflowId}
      steps={steps}
      onAdd={onAddStepToStepBundle}
      onMove={onMoveStepInStepBundle}
    />
  );
};

export default memo(StepBundleStepList);
