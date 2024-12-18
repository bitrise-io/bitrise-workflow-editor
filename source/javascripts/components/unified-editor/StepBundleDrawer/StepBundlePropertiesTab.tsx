import EditableInput from '@/components/EditableInput/EditableInput';
import StepBundleService from '@/core/models/StepBundleService';
import { useStepBundles } from '@/hooks/useStepBundles';
import useRenameStepBundle from './hooks/useRenameStepBundle';

type StepBundlesPropertiesTabProps = {
  stepBundleId: string;
};

const StepBundlesPropertiesTab = (props: StepBundlesPropertiesTabProps) => {
  const { stepBundleId } = props;

  const stepBundles = useStepBundles();
  const stepBundleIds = Object.keys(stepBundles);

  const handleNameChange = useRenameStepBundle(stepBundleId);

  return (
    <EditableInput
      isRequired
      name="name"
      label="Name"
      value={stepBundleId}
      sanitize={StepBundleService.sanitizeName}
      validate={(v) => StepBundleService.validateName(v, stepBundleId, stepBundleIds)}
      onCommit={handleNameChange}
    />
  );
};

export default StepBundlesPropertiesTab;
