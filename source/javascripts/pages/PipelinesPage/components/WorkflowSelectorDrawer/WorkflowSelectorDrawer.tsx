import { Text } from '@bitrise/bitkit';
import { useEffect } from 'react';

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
};

// Marks what opens this drawer, so clicking it again keeps the drawer open instead of closing it.
export const OPENS_WORKFLOW_SELECTOR = 'data-opens-workflow-selector';

const WorkflowSelectorDrawer = ({ pipelineId, onSelectWorkflow, ...props }: Props) => {
  const { isOpen, onClose } = props;

  // Picking Workflows is a quick side trip, so a click anywhere outside the drawer ends it. The drawer and
  // its menus live in portals; the canvas, sidebar and header don't. A drag to pan the canvas isn't a click.
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target?.isConnected || target.closest(`.chakra-portal, [${OPENS_WORKFLOW_SELECTOR}]`)) {
        return;
      }
      onClose();
    };
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [isOpen, onClose]);

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
          <WorkflowsList pipelineId={pipelineId} onSelectWorkflow={onSelectWorkflow} />
        </FloatingDrawerBody>
      </FloatingDrawerContent>
    </FloatingDrawer>
  );
};

export default WorkflowSelectorDrawer;
