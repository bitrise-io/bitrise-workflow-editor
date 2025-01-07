import { Box, Tabs, Tag, Text, useTabs, Notification, TabList, Tab, TabPanels, TabPanel } from '@bitrise/bitkit';
import { ReactFlowProvider } from '@xyflow/react';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import WindowUtils from '@/core/utils/WindowUtils';
import FloatingDrawer, {
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerProps,
} from '../FloatingDrawer/FloatingDrawer';
import { SelectStepHandlerFn } from './StepSelectorDrawer.types';
import useSearch from './hooks/useSearch';
import StepBundleFilter from './components/StepBundleFilter';
import StepFilter from './components/StepFilter';
import StepBundleList from './components/StepBundleList';
import AlgoliaStepList from './components/AlgoliaStepList/AlgoliaStepList';
import StepList from './components/StepList';

type Props = Omit<FloatingDrawerProps, 'children'> & {
  enabledSteps?: Set<string>;
  onSelectStep: SelectStepHandlerFn;
  showStepBundles: boolean;
};

const StepSelectorDrawer = ({ enabledSteps, showStepBundles, onSelectStep, onCloseComplete, ...props }: Props) => {
  const resetSearch = useSearch((s) => s.reset);

  const { tabId, tabIndex, setTabIndex } = useTabs<'step' | 'stepBundle'>({
    tabIds: ['step', 'stepBundle'],
  });

  const enableStepBundles = useFeatureFlag('enable-wfe-step-bundles-ui') && showStepBundles;
  const enableAlgoliaSearch = useFeatureFlag('enable-algolia-search-for-steps');

  const uniqueStepCount = enabledSteps?.size ?? -1;
  const uniqueStepLimit = WindowUtils.limits()?.uniqueStepLimit;
  const showStepLimit = typeof uniqueStepLimit === 'number';
  const stepLimitReached = uniqueStepLimit && uniqueStepCount >= uniqueStepLimit;
  const upgradeLink = `/organization/${WindowUtils.workspaceSlug()}/credit_subscription/plan_selector_page`;

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
            {enableStepBundles && (
              <Box position="relative" mt="8" mx="-24">
                <TabList paddingX="8">
                  <Tab>Step</Tab>
                  <Tab>Step bundle</Tab>
                </TabList>
              </Box>
            )}
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
            <ReactFlowProvider>
              <TabPanels>
                <TabPanel>
                  {enableAlgoliaSearch ? (
                    <AlgoliaStepList
                      enabledSteps={stepLimitReached ? enabledSteps : undefined}
                      onSelectStep={onSelectStep}
                    />
                  ) : (
                    <StepList enabledSteps={stepLimitReached ? enabledSteps : undefined} onSelectStep={onSelectStep} />
                  )}
                </TabPanel>
                <TabPanel display="flex" flexDir="column" gap="12">
                  <StepBundleList onSelectStep={onSelectStep} />
                </TabPanel>
              </TabPanels>
            </ReactFlowProvider>
          </FloatingDrawerBody>
        </FloatingDrawerContent>
      </FloatingDrawer>
    </Tabs>
  );
};

export default StepSelectorDrawer;
