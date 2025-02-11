/* eslint-disable import/no-cycle */
import useBitriseYmlStore from '@/hooks/useBitriseYmlStore';
import { useStepActions } from '../contexts/WorkflowCardContext';
import StepList from './StepList';

type Props = {
  stepBundleId: string;
};

const StepBundleStepList = ({ stepBundleId }: Props) => {
  const steps = useBitriseYmlStore(({ yml }) => {
    return (yml.step_bundles?.[stepBundleId]?.steps ?? []).map((s) => Object.keys(s)[0]);
  });

  const { onAddStepToStepBundle, onMoveStepInStepBundle } = useStepActions();

  return (
    <StepList stepBundleId={stepBundleId} steps={steps} onAdd={onAddStepToStepBundle} onMove={onMoveStepInStepBundle} />
  );
};

export default StepBundleStepList;
