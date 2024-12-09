import { Notification, Tab, TabPanels, Tabs, Text, useTabs } from '@bitrise/bitkit';
import { TabList, TabPanel } from '@chakra-ui/react';
import useStep from '@/hooks/useStep';
import StepService from '@/core/models/StepService';
import useDefaultStepLibrary from '@/hooks/useDefaultStepLibrary';
import FloatingDrawer, {
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerProps,
} from '@/components/unified-editor/FloatingDrawer/FloatingDrawer';
import useNavigation from '@/hooks/useNavigation';
import StepBundlePropertiesTab from '@/components/StepBundlePropertiesTab';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import StepBundleService from '@/core/models/StepBundleService';

type Props = Omit<FloatingDrawerProps, 'children'> & {
  workflowId: string;
  stepIndex: number;
};

const StepBundleDrawer = ({ workflowId, stepIndex, ...props }: Props) => {
  const { replace } = useNavigation();
  const { data } = useStep({ workflowId, stepIndex });
  const defaultStepLibrary = useDefaultStepLibrary();
  const { tabIndex, setTabIndex } = useTabs<'configuration' | 'properties'>({
    tabIds: ['configuration', 'properties'],
  });
  const title = data?.title;
  const dependants = useDependantWorkflows({ stepBundleCvs: `bundle::${title}` });
  const usedInWorkflowsText = StepBundleService.getUsedByText(dependants.length);

  const isStepBundle = StepService.isStepBundle(data?.cvs || '', defaultStepLibrary, data?.userValues);

  if (!isStepBundle || !data) {
    return null;
  }

  return (
    <Tabs variant="line" index={tabIndex} onChange={setTabIndex}>
      <FloatingDrawer {...props}>
        <FloatingDrawerContent>
          <FloatingDrawerCloseButton />
          <FloatingDrawerHeader>
            <Text as="h3" textStyle="heading/h3">
              {title}
            </Text>
            <Text color="text/secondary" textStyle="body/md/regular" marginBlockEnd="16">
              {usedInWorkflowsText}
            </Text>
            <TabList>
              <Tab>Properties</Tab>
            </TabList>
          </FloatingDrawerHeader>
          <FloatingDrawerBody>
            <Notification
              action={{
                label: 'Go to YAML page',
                onClick: () => replace('/yml'),
              }}
              status="info"
              marginBlockEnd="24"
            >
              <Text textStyle="comp/notification/title">Edit step bundle configuration</Text>
              <Text textStyle="comp/notification/message">
                View more details or edit step bundle configuration in the Configuration YAML page.
              </Text>
            </Notification>
            <TabPanels>
              <TabPanel>
                <StepBundlePropertiesTab stepBundleName={title} workflowId={workflowId} stepIndex={stepIndex} />
              </TabPanel>
            </TabPanels>
          </FloatingDrawerBody>
        </FloatingDrawerContent>
      </FloatingDrawer>
    </Tabs>
  );
};

export default StepBundleDrawer;
