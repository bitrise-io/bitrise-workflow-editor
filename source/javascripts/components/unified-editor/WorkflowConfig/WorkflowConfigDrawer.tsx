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

type Props = Omit<FloatingDrawerProps, 'size' | 'children'> & {
  size?: 'md' | 'lg';
  workflowId: string;
  context: 'pipeline' | 'workflow';
  onRename: (name: string) => void;
};

const WorkflowConfigDrawerContent = ({ size = 'md', context, onRename, ...props }: Omit<Props, 'workflowId'>) => {
  return (
    <Tabs>
      <FloatingDrawer {...props}>
        <FloatingDrawerContent size={size}>
          <FloatingDrawerCloseButton />
          <FloatingDrawerHeader>
            <WorkflowConfigHeader variant="drawer" context={context} />
          </FloatingDrawerHeader>
          <FloatingDrawerBody>
            <TabPanels>
              <TabPanel>
                <ConfigurationTab context={context} />
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
