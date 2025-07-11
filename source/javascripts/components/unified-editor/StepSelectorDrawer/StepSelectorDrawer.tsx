import { Box, Notification, Tab, TabList, TabPanel, TabPanels, Tabs, Tag, Text, useTabs } from '@bitrise/bitkit';

import GlobalProps from '@/core/utils/GlobalProps';
import PageProps from '@/core/utils/PageProps';

import FloatingDrawer, {
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerProps,
} from '../FloatingDrawer/FloatingDrawer';
import AlgoliaStepList from './components/AlgoliaStepList';
import StepBundleFilter from './components/StepBundleFilter';
import StepBundleList from './components/StepBundleList';
import StepFilter from './components/StepFilter';
import useSearch from './hooks/useSearch';
import { SelectStepHandlerFn } from './StepSelectorDrawer.types';

type Props = Omit<FloatingDrawerProps, 'children'> & {
  enabledSteps?: Set<string>;
  onSelectStep: SelectStepHandlerFn;
  parentStepBundleId?: string;
};

const StepSelectorDrawer = ({ enabledSteps, onSelectStep, onCloseComplete, parentStepBundleId, ...props }: Props) => {
  const resetSearch = useSearch((s) => s.reset);

  const { tabId, tabIndex, setTabIndex } = useTabs<'step' | 'stepBundle'>({
    tabIds: ['step', 'stepBundle'],
  });

  const uniqueStepCount = enabledSteps?.size ?? -1;
  const uniqueStepLimit = PageProps.limits()?.uniqueStepLimit;
  const showStepLimit = typeof uniqueStepLimit === 'number';
  const stepLimitReached = uniqueStepLimit && uniqueStepCount >= uniqueStepLimit;
  const upgradeLink = `/organization/${GlobalProps.workspaceSlug()}/credit_subscription/plan_selector_page`;

  const handleCloseComplete = () => {
    resetSearch();
    onCloseComplete?.();
  };

  return (
    <Tabs variant="line" index={tabIndex} onChange={setTabIndex} isLazy>
      <FloatingDrawer onCloseComplete={handleCloseComplete} {...props}>
        <FloatingDrawerContent data-clarity-unmask="true">
          <FloatingDrawerCloseButton />
          <FloatingDrawerHeader>
            <Box display="flex" gap="12">
              <Text as="h3" textStyle="heading/h3" fontWeight="bold">
                Add Step
              </Text>
              {showStepLimit && (
                <Tag size="sm">
                  {uniqueStepCount}/{uniqueStepLimit} Steps used
                </Tag>
              )}
            </Box>
            <Box position="relative" mt="8" mx="-24">
              <TabList paddingX="8">
                <Tab>Step</Tab>
                <Tab>Step bundle</Tab>
              </TabList>
            </Box>
            {stepLimitReached && (
              <Notification
                mt={16}
                status="warning"
                alignSelf="flex-end"
                action={{
                  label: 'Upgrade',
                  href: upgradeLink,
                  target: '_blank',
                  rel: 'noreferrer noopener',
                }}
              >
                <Text size="3" fontWeight="bold">
                  You cannot add a new Step now
                </Text>
                Your team has already reached the {uniqueStepLimit} unique Steps per project limit included in your
                current plan. To add more Steps, upgrade your plan.
              </Notification>
            )}
            {tabId === 'step' && <StepFilter mt="24" mb="12" />}
            {tabId === 'stepBundle' && <StepBundleFilter mt="24" mb="12" />}
          </FloatingDrawerHeader>
          <FloatingDrawerBody pt="12">
            <TabPanels>
              <TabPanel>
                <AlgoliaStepList
                  enabledSteps={stepLimitReached ? enabledSteps : undefined}
                  onSelectStep={onSelectStep}
                />
              </TabPanel>
              <TabPanel display="flex" flexDir="column" gap="12">
                <StepBundleList onSelectStep={onSelectStep} excludedStepBundleId={parentStepBundleId} />
              </TabPanel>
            </TabPanels>
          </FloatingDrawerBody>
        </FloatingDrawerContent>
      </FloatingDrawer>
    </Tabs>
  );
};

export default StepSelectorDrawer;
