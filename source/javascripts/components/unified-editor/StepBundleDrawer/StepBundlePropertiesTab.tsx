import EditableInput from '@/components/EditableInput/EditableInput';
import useRenameStepBundle from '@/components/unified-editor/StepBundleDrawer/hooks/useRenameStepBundle';
import StepBundleService from '@/core/models/StepBundleService';
import { useStepBundles } from '@/hooks/useStepBundles';

type StepBundlesPropertiesTabProps = {
  stepBundleId: string | undefined;
};

const StepBundlesPropertiesTab = (props: StepBundlesPropertiesTabProps) => {
  const { stepBundleId } = props;

  const stepBundles = useStepBundles();
  const stepBundleIds = Object.keys(stepBundles);

  const handleNameChange = useRenameStepBundle();

  return (
    <EditableInput
      isRequired
      name="name"
      label="Name"
      value={stepBundleId}
      sanitize={StepBundleService.sanitizeName}
      validate={(v) => StepBundleService.validateName(v, stepBundleIds)}
      onCommit={handleNameChange}
    />
  );
};

export default StepBundlesPropertiesTab;
