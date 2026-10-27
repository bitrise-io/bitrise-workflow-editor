import { BitkitHeading } from '@bitrise/bitkit-v2';

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
          <BitkitHeading as="h3" data-clarity-unmask="true">
            Add Workflows
          </BitkitHeading>
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
