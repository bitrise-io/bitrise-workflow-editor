import { Box, Notification, Tab, TabList, TabPanel, TabPanels, Tabs, Tag, Text, useTabs } from '@bitrise/bitkit';

import { FormProvider, useForm } from 'react-hook-form';
import WindowUtils from '@/core/utils/WindowUtils';
import StepBundleFilter from '@/components/unified-editor/StepSelectorDrawer/components/StepBundleFilter';
import StepBundleList from '@/components/unified-editor/StepSelectorDrawer/components/StepBundleList';
import useFeatureFlag from '@/hooks/useFeatureFlag';
import FloatingDrawer, {
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerProps,
} from '../FloatingDrawer/FloatingDrawer';
import { SearchFormValues, SelectStepHandlerFn } from './StepSelectorDrawer.types';
import StepFilter from './components/StepFilter';
import StepList from './components/StepList';

type Props = Omit<FloatingDrawerProps, 'children'> & {
  enabledSteps?: Set<string>;
  onSelectStep: SelectStepHandlerFn;
};

const StepSelectorDrawer = ({ enabledSteps, onSelectStep, onCloseComplete, ...props }: Props) => {
  const { tabId, tabIndex, setTabIndex } = useTabs<'step' | 'stepBundle'>({
    tabIds: ['step', 'stepBundle'],
  });
  const form = useForm<SearchFormValues>({
    defaultValues: {
      searchSteps: '',
      filterStepBundles: '',
      categories: [],
    },
  });

  const enableStepBundles = useFeatureFlag('enable-wfe-step-bundles-ui');

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
                  Add Step
                </Text>
                {showStepLimit && (
                  <Tag size="sm">
                    {uniqueStepCount}/{uniqueStepLimit} Steps used
                  </Tag>
                )}
              </Box>
              {enableStepBundles && (
                <TabList>
                  <Tab>Step</Tab>
                  <Tab>Step bundle</Tab>
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
              {tabId === 'step' && <StepFilter mt={16} />}
              {tabId === 'stepBundle' && <StepBundleFilter marginBlockStart={16} />}
            </FloatingDrawerHeader>
            <FloatingDrawerBody>
              <TabPanels height={tabId === 'step' ? '100%' : undefined}>
                <TabPanel height={tabId === 'step' ? '100%' : undefined}>
                  <StepList enabledSteps={stepLimitReached ? enabledSteps : undefined} onSelectStep={onSelectStep} />
                </TabPanel>
                <TabPanel>
                  <StepBundleList />
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
