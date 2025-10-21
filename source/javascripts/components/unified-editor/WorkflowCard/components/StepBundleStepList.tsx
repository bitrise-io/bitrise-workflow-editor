/* eslint-disable import/no-cycle */
import { memo } from 'react';

import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';

import { useStepActions } from '../contexts/WorkflowCardContext';
import StepList from './StepList';

type Props = {
  id: string;
};

const StepBundleStepList = ({ id }: Props) => {
  const steps = useBitriseYmlStore(({ yml }) => {
    return (yml.step_bundles?.[id]?.steps ?? []).map((s) => Object.keys(s)[0]);
  });

  const { onAddStepToStepBundle, onMoveStepInStepBundle } = useStepActions();

  return (
    <StepList parentStepBundleId={id} steps={steps} onAdd={onAddStepToStepBundle} onMove={onMoveStepInStepBundle} />
  );
};

export default memo(StepBundleStepList);
