import { Text } from '@bitrise/bitkit';
import FloatingDrawer, {
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerOverlay,
  FloatingDrawerProps,
} from '@/components/unified-editor/FloatingDrawer/FloatingDrawer';
import WorkflowsList from './components/WorkflowsList';

type Props = Omit<FloatingDrawerProps, 'children'> & {
  onSelectWorkflow: (id: string) => void;
};

const WorkflowSelectorDrawer = ({ onSelectWorkflow, ...props }: Props) => {
  return (
    <FloatingDrawer {...props}>
      <FloatingDrawerOverlay />
      <FloatingDrawerContent>
        <FloatingDrawerCloseButton />
        <FloatingDrawerHeader>
          <Text as="h3" textStyle="heading/h3">
            Workflows
          </Text>
        </FloatingDrawerHeader>
        <FloatingDrawerBody display="flex" flexDir="column" gap="12">
          <WorkflowsList onSelectWorkflow={onSelectWorkflow} />
        </FloatingDrawerBody>
      </FloatingDrawerContent>
    </FloatingDrawer>
  );
};

export default WorkflowSelectorDrawer;
