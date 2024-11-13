import { TabPanel, TabPanels, Tabs } from '@bitrise/bitkit';
import FloatingDrawer, {
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerOverlay,
  FloatingDrawerProps,
} from '@/components/unified-editor/FloatingDrawer/FloatingDrawer';
import WorkflowConfigProvider from './WorkflowConfig.context';
import ConfigurationTab from './tabs/ConfigurationTab';
import PropertiesTab from './tabs/PropertiesTab';
import WorkflowConfigHeader from './components/WorkflowConfigHeader';

type Props = Omit<FloatingDrawerProps, 'children'> & {
  workflowId: string;
  context: 'pipeline' | 'workflow';
  onRename: (name: string) => void;
};

const WorkflowConfigDrawerContent = ({ context, onRename, ...props }: Omit<Props, 'workflowId'>) => {
  const contentProps = context === 'workflow' ? { maxWidth: ['100%', '50%'] } : {};

  return (
    <Tabs>
      <FloatingDrawer {...props}>
        <FloatingDrawerOverlay />
        <FloatingDrawerContent {...contentProps}>
          <FloatingDrawerCloseButton />
          <FloatingDrawerHeader p="0" pb="0">
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
