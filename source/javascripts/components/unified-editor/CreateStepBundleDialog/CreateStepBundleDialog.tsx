import { DialogProps } from '@bitrise/bitkit';
import CreateEntityDialog from '@/components/unified-editor/CreateEntityDialog/CreateEntityDialog';
import StepBundleService from '@/core/models/StepBundleService';
import { useStepBundles } from '@/hooks/useStepBundles';

type Props = Omit<DialogProps, 'title'> & {
  onCreateStepBundle: (stepBundleId: string, baseStepBundleId?: string) => void;
};

const CreateStepBundleDialog = ({ onClose, onCloseComplete, onCreateStepBundle, ...props }: Props) => {
  const stepBundles = useStepBundles();
  const stepBundleIds = Object.keys(stepBundles);

  const handleCloseComplete = () => {
    onCloseComplete?.();
  };

  return (
    <CreateEntityDialog
      baseEntityIds={stepBundleIds}
      entityName="Step bundle"
      onClose={onClose}
      onCloseComplete={handleCloseComplete}
      onCreateEntity={onCreateStepBundle}
      sanitizer={StepBundleService.sanitizeName}
      validator={(v) => StepBundleService.validateName(v, '', stepBundleIds)}
      {...props}
    />
  );
};

export default CreateStepBundleDialog;
