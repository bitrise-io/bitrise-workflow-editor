import FloatingDrawer, {
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerProps,
  FloatingDrawerTitle,
} from '@/components/unified-editor/FloatingDrawer/FloatingDrawer';

import WorkflowsList from './components/WorkflowsList';

type Props = Omit<FloatingDrawerProps, 'children'> & {
  pipelineId: string;
  onSelectWorkflow: (id: string) => void;
};

const WorkflowSelectorDrawer = ({ pipelineId, onSelectWorkflow, ...props }: Props) => {
  return (
    <FloatingDrawer {...props}>
      <FloatingDrawerContent>
        <FloatingDrawerCloseButton />
        <FloatingDrawerHeader>
          <FloatingDrawerTitle data-clarity-unmask="true">Add Workflows</FloatingDrawerTitle>
        </FloatingDrawerHeader>
        <FloatingDrawerBody display="flex" flexDirection="column" gap="12">
          <WorkflowsList pipelineId={pipelineId} onSelectWorkflow={onSelectWorkflow} />
        </FloatingDrawerBody>
      </FloatingDrawerContent>
    </FloatingDrawer>
  );
};

export default WorkflowSelectorDrawer;
