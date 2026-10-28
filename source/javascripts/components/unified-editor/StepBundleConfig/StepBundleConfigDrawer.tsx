import { Tabs } from '@bitrise/bitkit';

import FloatingDrawer, {
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerProps,
} from '../FloatingDrawer/FloatingDrawer';
import StepBundleConfigContent from './StepBundleConfigContent';
import StepBundleConfigHeader from './StepBundleConfigHeader';
import StepBundleConfigProvider from './StepBundleConfigProvider';

type Props = Omit<FloatingDrawerProps, 'children'> & {
  stepBundleId?: string;
  parentWorkflowId?: string;
  parentStepBundleId?: string;
  stepIndex: number;
  // The Step bundles page's own bundle: the settings its old fixed panel had (ID and delete).
  isDefinition?: boolean;
  onDelete?: () => void;
  onChangeId?: (id: string) => void;
};

const StepBundleConfigDrawer = ({
  stepBundleId,
  stepIndex,
  parentWorkflowId,
  parentStepBundleId,
  isDefinition,
  onDelete,
  onChangeId,
  ...rest
}: Props) => {
  return (
    <StepBundleConfigProvider
      stepBundleId={stepBundleId}
      parentWorkflowId={parentWorkflowId}
      parentStepBundleId={parentStepBundleId}
      stepIndex={stepIndex}
    >
      <Tabs>
        <FloatingDrawer {...rest}>
          <FloatingDrawerContent>
            <FloatingDrawerCloseButton />
            <FloatingDrawerHeader>
              <StepBundleConfigHeader variant="drawer" isDefinition={isDefinition} />
            </FloatingDrawerHeader>
            <FloatingDrawerBody>
              <StepBundleConfigContent
                variant={isDefinition ? 'panel' : 'drawer'}
                onDelete={onDelete}
                onChangeId={onChangeId}
              />
            </FloatingDrawerBody>
          </FloatingDrawerContent>
        </FloatingDrawer>
      </Tabs>
    </StepBundleConfigProvider>
  );
};

export default StepBundleConfigDrawer;
