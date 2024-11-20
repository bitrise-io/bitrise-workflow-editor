import useStep from '@/hooks/useStep';
import StepService from '@/core/models/StepService';
import useDefaultStepLibrary from '@/hooks/useDefaultStepLibrary';
import FloatingDrawer, {
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerOverlay,
  FloatingDrawerProps,
} from '@/components/unified-editor/FloatingDrawer/FloatingDrawer';
import { StepBundleContent, StepBundleHeader } from './StepBundlePanel';

type Props = Omit<FloatingDrawerProps, 'children'> & {
  workflowId: string;
  stepIndex: number;
};

const StepBundleDrawer = ({ workflowId, stepIndex, ...props }: Props) => {
  const { data } = useStep(workflowId, stepIndex);
  const defaultStepLibrary = useDefaultStepLibrary();
  const isStepBundle = StepService.isStepBundle(data?.cvs || '', defaultStepLibrary, data?.userValues);

  if (!isStepBundle || !data) {
    return null;
  }

  const { title } = data;

  return (
    <FloatingDrawer {...props}>
      <FloatingDrawerOverlay />
      <FloatingDrawerContent maxWidth={['100%', '50%']}>
        <FloatingDrawerCloseButton />
        <FloatingDrawerHeader p="0" pb="0">
          <StepBundleHeader title={title} />
        </FloatingDrawerHeader>
        <FloatingDrawerBody p="0" pt="0">
          <StepBundleContent />
        </FloatingDrawerBody>
      </FloatingDrawerContent>
    </FloatingDrawer>
  );
};

export default StepBundleDrawer;
