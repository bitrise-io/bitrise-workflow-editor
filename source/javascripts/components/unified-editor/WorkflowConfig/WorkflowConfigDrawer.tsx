import { BitkitTabs } from '@bitrise/bitkit-v2';

import FloatingDrawer, {
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerProps,
} from '@/components/unified-editor/FloatingDrawer/FloatingDrawer';

import WorkflowConfigHeader from './components/WorkflowConfigHeader';
import ConfigurationTab from './tabs/ConfigurationTab';
import PropertiesTab from './tabs/PropertiesTab';
import TriggersTab from './tabs/TriggersTab';
import { WorkflowConfigTab } from './WorkflowConfig.types';
import WorkflowConfigProvider from './WorkflowConfigProvider';

type Props = Omit<FloatingDrawerProps, 'children'> & {
  workflowId: string;
  parentWorkflowId?: string;
  context: 'pipeline' | 'workflow';
  onRename: (name: string) => void;
};

const WorkflowConfigDrawerContent = ({ context, parentWorkflowId, onRename, ...props }: Omit<Props, 'workflowId'>) => {
  return (
    <BitkitTabs.Root defaultValue={WorkflowConfigTab.CONFIGURATION}>
      <FloatingDrawer {...props}>
        <FloatingDrawerContent>
          <FloatingDrawerCloseButton />
          <FloatingDrawerHeader>
            <WorkflowConfigHeader context={context} variant="drawer" parentWorkflowId={parentWorkflowId} />
          </FloatingDrawerHeader>
          <FloatingDrawerBody>
            <BitkitTabs.ContentGroup>
              <BitkitTabs.Content value={WorkflowConfigTab.CONFIGURATION}>
                <ConfigurationTab context={context} parentWorkflowId={parentWorkflowId} />
              </BitkitTabs.Content>
              <BitkitTabs.Content value={WorkflowConfigTab.PROPERTIES}>
                <PropertiesTab variant="drawer" onRename={onRename} />
              </BitkitTabs.Content>
              <BitkitTabs.Content value={WorkflowConfigTab.TRIGGERS}>
                <TriggersTab />
              </BitkitTabs.Content>
            </BitkitTabs.ContentGroup>
          </FloatingDrawerBody>
        </FloatingDrawerContent>
      </FloatingDrawer>
    </BitkitTabs.Root>
  );
};

const WorkflowConfigDrawer = ({ workflowId, ...props }: Props) => {
  return (
    <WorkflowConfigProvider workflowId={workflowId}>
      <WorkflowConfigDrawerContent {...props} />
    </WorkflowConfigProvider>
  );
};

export default WorkflowConfigDrawer;
