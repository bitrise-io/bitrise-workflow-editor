import { Text } from '@bitrise/bitkit';

import FloatingDrawer, {
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerProps,
} from '@/components/unified-editor/FloatingDrawer/FloatingDrawer';

import WorkflowsList from './components/WorkflowsList';

type Props = Omit<FloatingDrawerProps, 'children'> & {
  pipelineId: string;
  onSelectWorkflow: (id: string) => void;
  onCreateEmptyWorkflow: VoidFunction;
};

const WorkflowSelectorDrawer = ({ pipelineId, onSelectWorkflow, onCreateEmptyWorkflow, ...props }: Props) => {
  return (
    <FloatingDrawer {...props}>
      <FloatingDrawerContent>
        <FloatingDrawerCloseButton />
        <FloatingDrawerHeader>
          <Text as="h3" textStyle="heading/h3" data-clarity-unmask="true">
            Add Workflows
          </Text>
        </FloatingDrawerHeader>
        <FloatingDrawerBody display="flex" flexDir="column" gap="12">
          <WorkflowsList
            pipelineId={pipelineId}
            onSelectWorkflow={onSelectWorkflow}
            onCreateEmptyWorkflow={onCreateEmptyWorkflow}
          />
        </FloatingDrawerBody>
      </FloatingDrawerContent>
    </FloatingDrawer>
  );
};

export default WorkflowSelectorDrawer;
