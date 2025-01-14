import { useStepBundles } from '@/hooks/useStepBundles';
import EntitySelector from '@/components/unified-editor/EntitySelector/EntitySelector';
import { StepBundlesPageDialogType, useStepBundlesPageStore } from '../StepBundlesPage.store';

const StepBundlesSelector = () => {
  const stepBundles = useStepBundles();
  const stepBundleIds = Object.keys(stepBundles);
  const openDialog = useStepBundlesPageStore((s) => s.openDialog);
  const stepBundleId = useStepBundlesPageStore((s) => s.stepBundleId) || stepBundleIds[0];
  const setStepBundleId = useStepBundlesPageStore((s) => s.setStepBundleId);

  const onCreateStepBundle = () => {
    openDialog({ type: StepBundlesPageDialogType.CREATE_STEP_BUNDLE })();
  };

  return (
    <EntitySelector
      entityIds={stepBundleIds}
      entityName="Step bundle"
      onChange={setStepBundleId}
      onCreate={onCreateStepBundle}
      value={stepBundleId}
    />
  );
};

export default StepBundlesSelector;
