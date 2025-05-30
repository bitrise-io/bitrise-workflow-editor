import EntitySelector from '@/components/unified-editor/EntitySelector/EntitySelector';
import useSelectedStepBundle from '@/hooks/useSelectedStepBundle';
import { useStepBundles } from '@/hooks/useStepBundles';

import { StepBundlesPageDialogType, useStepBundlesPageStore } from '../StepBundlesPage.store';

const StepBundlesSelector = () => {
  const stepBundleIds = useStepBundles((s) => Object.keys(s));
  const openDialog = useStepBundlesPageStore((s) => s.openDialog);
  const [selectedStepBundleId, setSelectedStepBundle] = useSelectedStepBundle();

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
