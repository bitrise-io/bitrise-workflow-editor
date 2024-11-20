import useStep from '@/hooks/useStep';
import StepService from '@/core/models/StepService';
import { WithGroup } from '@/core/models/Step';
import useDefaultStepLibrary from '@/hooks/useDefaultStepLibrary';
import FloatingDrawer, {
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerOverlay,
  FloatingDrawerProps,
} from '@/components/unified-editor/FloatingDrawer/FloatingDrawer';
import { WithBlockContent, WithBlockHeader } from './WithGroupPanel';

type Props = Omit<FloatingDrawerProps, 'children'> & {
  workflowId: string;
  stepIndex: number;
};

const WithGroupDrawer = ({ workflowId, stepIndex, ...props }: Props) => {
  const { data } = useStep(workflowId, stepIndex);
  const defaultStepLibrary = useDefaultStepLibrary();
  const isWithGroup = StepService.isWithGroup(data?.cvs || '', defaultStepLibrary, data?.userValues);

  if (!isWithGroup || !data) {
    return null;
  }

  const {
    title,
    userValues: { container = '', services = [] },
  } = data as WithGroup;

  return (
    <FloatingDrawer {...props}>
      <FloatingDrawerOverlay />
      <FloatingDrawerContent maxWidth={['100%', '50%']}>
        <FloatingDrawerCloseButton />
        <FloatingDrawerHeader p="0" pb="0">
          <WithBlockHeader title={title} />
        </FloatingDrawerHeader>
        <FloatingDrawerBody p="0" pt="0">
          <WithBlockContent imageName={container} services={services} />
        </FloatingDrawerBody>
      </FloatingDrawerContent>
    </FloatingDrawer>
  );
};

export default WithGroupDrawer;
