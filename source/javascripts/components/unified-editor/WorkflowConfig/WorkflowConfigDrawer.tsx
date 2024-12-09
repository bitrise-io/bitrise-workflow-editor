import { TabPanel, TabPanels, Tabs } from '@bitrise/bitkit';
import FloatingDrawer, {
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerProps,
} from '@/components/unified-editor/FloatingDrawer/FloatingDrawer';
import WorkflowConfigProvider from './WorkflowConfig.context';
import ConfigurationTab from './tabs/ConfigurationTab';
import PropertiesTab from './tabs/PropertiesTab';
import WorkflowConfigHeader from './components/WorkflowConfigHeader';

type Props = Omit<FloatingDrawerProps, 'children'> & {
  workflowId: string;
  parentWorkflowId?: string;
  context: 'pipeline' | 'workflow';
  onRename: (name: string) => void;
};

const WorkflowConfigDrawerContent = ({ context, parentWorkflowId, onRename, ...props }: Omit<Props, 'workflowId'>) => {
  return (
    <Tabs>
      <FloatingDrawer {...props}>
        <FloatingDrawerContent>
          <FloatingDrawerCloseButton />
          <FloatingDrawerHeader>
            <WorkflowConfigHeader context={context} variant="drawer" />
          </FloatingDrawerHeader>
          <FloatingDrawerBody>
            <TabPanels>
              <TabPanel>
                <ConfigurationTab context={context} parentWorkflowId={parentWorkflowId} />
              </TabPanel>
              <TabPanel>
                <PropertiesTab variant="drawer" onRename={onRename} />
              </TabPanel>
            </TabPanels>
          </FloatingDrawerBody>
        </FloatingDrawerContent>
      </FloatingDrawer>
    </Tabs>
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
