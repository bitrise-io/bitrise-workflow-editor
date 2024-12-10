import { Tab, TabPanels, Tabs, Text, useTabs } from '@bitrise/bitkit';
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
import StepBundlePropertiesTab from '@/components/unified-editor/StepBundleDrawer/StepBundlePropertiesTab';
import useDependantWorkflows from '@/hooks/useDependantWorkflows';
import StepBundleService from '@/core/models/StepBundleService';

type Props = Omit<FloatingDrawerProps, 'children'> & {
  workflowId: string;
  stepIndex: number;
};

const StepBundleDrawer = ({ workflowId, stepIndex, ...props }: Props) => {
  const { data } = useStep({ workflowId, stepIndex });
  const defaultStepLibrary = useDefaultStepLibrary();
  const { tabIndex, setTabIndex } = useTabs<'configuration' | 'properties'>({
    tabIds: ['configuration', 'properties'],
  });
  const stepBundleId = data?.title;
  const dependants = useDependantWorkflows({ stepBundleCvs: `bundle::${stepBundleId}` });
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
              {stepBundleId}
            </Text>
            <Text color="text/secondary" textStyle="body/md/regular" marginBlockEnd="16">
              {usedInWorkflowsText}
            </Text>
            <TabList>
              <Tab>Properties</Tab>
            </TabList>
          </FloatingDrawerHeader>
          <FloatingDrawerBody>
            <TabPanels>
              <TabPanel>{stepBundleId && <StepBundlePropertiesTab stepBundleId={stepBundleId} />}</TabPanel>
            </TabPanels>
          </FloatingDrawerBody>
        </FloatingDrawerContent>
      </FloatingDrawer>
    </Tabs>
  );
};

export default StepBundleDrawer;
