import { useStepBundles } from '@/hooks/useStepBundles';
import EntitySelector from '@/components/unified-editor/EntitySelector/EntitySelector';
import useSelectedStepBundle from '@/hooks/useSelectedStepBundle';
import { StepBundlesPageDialogType, useStepBundlesPageStore } from '../StepBundlesPage.store';

const StepBundlesSelector = () => {
  const stepBundles = useStepBundles();
  const stepBundleIds = Object.keys(stepBundles);
  const openDialog = useStepBundlesPageStore((s) => s.openDialog);
  const [{ id: selectedStepBundleId }, setSelectedStepBundle] = useSelectedStepBundle();

  const onCreateStepBundle = () => {
    openDialog({ type: StepBundlesPageDialogType.CREATE_STEP_BUNDLE })();
  };

  return (
    <EntitySelector
      entityIds={stepBundleIds}
      entityName="Step bundle"
      onChange={setSelectedStepBundle}
      onCreate={onCreateStepBundle}
      value={selectedStepBundleId}
    />
  );
};

export default StepBundlesSelector;
