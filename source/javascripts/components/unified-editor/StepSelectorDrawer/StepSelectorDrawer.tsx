import { Box, Notification, Tab, TabList, TabPanel, TabPanels, Tabs, Tag, Text, useTabs } from '@bitrise/bitkit';

import { FormProvider, useForm } from 'react-hook-form';
import WindowUtils from '@/core/utils/WindowUtils';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import FloatingDrawer, {
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerProps,
} from '../FloatingDrawer/FloatingDrawer';
import StepBundleFilter from './components/StepBundleFilter';
import StepBundleList from './components/StepBundleList';
import { SearchFormValues, SelectStepHandlerFn } from './StepSelectorDrawer.types';
import StepFilter from './components/StepFilter';
import StepList from './components/StepList';

type Props = Omit<FloatingDrawerProps, 'children'> & {
  enabledSteps?: Set<string>;
  onSelectStep: SelectStepHandlerFn;
  showStepBundles: boolean;
};

const StepSelectorDrawer = ({ enabledSteps, onSelectStep, onCloseComplete, showStepBundles, ...props }: Props) => {
  const { tabId, tabIndex, setTabIndex } = useTabs<'steps' | 'stepBundles'>({
    tabIds: ['steps', 'stepBundles'],
  });
  const form = useForm<SearchFormValues>({
    defaultValues: {
      searchSteps: '',
      filterStepBundles: '',
      categories: [],
    },
  });

  const enableStepBundles = useFeatureFlag('enable-wfe-step-bundles-ui') && showStepBundles;

  const uniqueStepCount = enabledSteps?.size ?? -1;
  const uniqueStepLimit = WindowUtils.limits()?.uniqueStepLimit;
  const showStepLimit = typeof uniqueStepLimit === 'number';
  const stepLimitReached = uniqueStepLimit && uniqueStepCount >= uniqueStepLimit;
  const upgradeLink = `/organization/${WindowUtils.workspaceSlug()}/credit_subscription/plan_selector_page`;

  const handleCloseCompete = () => {
    form.reset();
    onCloseComplete?.();
  };

  return (
    <Tabs variant="line" index={tabIndex} onChange={setTabIndex}>
      <FormProvider {...form}>
        <FloatingDrawer onCloseComplete={handleCloseCompete} {...props}>
          <FloatingDrawerContent data-clarity-unmask="true">
            <FloatingDrawerCloseButton />
            <FloatingDrawerHeader>
              <Box display="flex" gap="12">
                <Text as="h3" textStyle="heading/h3" fontWeight="bold">
                  {showStepBundles ? 'Add Step or Step bundle' : 'Add step'}
                </Text>
                {showStepLimit && (
                  <Tag size="sm">
                    {uniqueStepCount}/{uniqueStepLimit} Steps used
                  </Tag>
                )}
              </Box>
              {enableStepBundles && (
                <TabList>
                  <Tab>Steps</Tab>
                  <Tab>Step bundles</Tab>
                </TabList>
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
              {tabId === 'steps' && <StepFilter mt={16} />}
              {tabId === 'stepBundles' && <StepBundleFilter marginBlockStart={16} />}
            </FloatingDrawerHeader>
            <FloatingDrawerBody>
              <TabPanels height={tabId === 'steps' ? '100%' : undefined}>
                <TabPanel height={tabId === 'steps' ? '100%' : undefined}>
                  <StepList enabledSteps={stepLimitReached ? enabledSteps : undefined} onSelectStep={onSelectStep} />
                </TabPanel>
                <TabPanel>
                  <StepBundleList onSelectStep={onSelectStep} />
                </TabPanel>
              </TabPanels>
            </FloatingDrawerBody>
          </FloatingDrawerContent>
        </FloatingDrawer>
      </FormProvider>
    </Tabs>
  );
};

export default StepSelectorDrawer;
