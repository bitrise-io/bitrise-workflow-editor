/* eslint-disable import/no-cycle */
import { memo } from 'react';

import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import useMergedBitriseYml from '@/hooks/useMergedBitriseYml';

import { useStepActions } from '../contexts/WorkflowCardContext';
import StepList from './StepList';

type Props = {
  stepBundleId: string;
};

const StepBundleStepList = ({ stepBundleId }: Props) => {
  const mergedYml = useMergedBitriseYml();

  const steps = useBitriseYmlStore(({ yml }) => {
    const stepBundle = yml.step_bundles?.[stepBundleId] ?? mergedYml?.step_bundles?.[stepBundleId];
    return (stepBundle?.steps ?? []).map((s) => Object.keys(s)[0]);
  });

  const { onAddStepToStepBundle, onMoveStepInStepBundle } = useStepActions();

  return (
    <StepList stepBundleId={stepBundleId} steps={steps} onAdd={onAddStepToStepBundle} onMove={onMoveStepInStepBundle} />
  );
};

export default memo(StepBundleStepList);
