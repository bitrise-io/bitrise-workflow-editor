import { useState } from 'react';
import { Box, Card, Notification, Tab, TabList, Tabs, TabPanels, TabPanel, Tag, Text } from '@bitrise/bitkit';

import { FormProvider, useForm } from 'react-hook-form';
import WindowUtils from '@/core/utils/WindowUtils';
import FloatingDrawer, {
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerOverlay,
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
  const [activeTab, setActiveTab] = useState<'step' | 'stepBundle'>('step');
  const form = useForm<SearchFormValues>({
    defaultValues: {
      search: '',
      categories: [],
    },
  });

  const uniqueStepCount = enabledSteps?.size ?? -1;
  const uniqueStepLimit = WindowUtils.limits()?.uniqueStepLimit;
  const showStepLimit = typeof uniqueStepLimit === 'number';
  const stepLimitReached = uniqueStepLimit && uniqueStepCount >= uniqueStepLimit;
  const upgradeLink = `/organization/${WindowUtils.workspaceSlug()}/credit_subscription/plan_selector_page`;

  const handleCloseCompete = () => {
    form.reset();
    onCloseComplete?.();
  };

  const handleTabChange = (index: number) => {
    setActiveTab(index === 0 ? 'step' : 'stepBundle');
  };

  return (
    <FormProvider {...form}>
      <FloatingDrawer onCloseComplete={handleCloseCompete} {...props}>
        <FloatingDrawerOverlay />
        <FloatingDrawerContent maxWidth={['100%', '50%']}>
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
          </FloatingDrawerHeader>
          <FloatingDrawerBody>
            <Tabs variant="line" onChange={handleTabChange}>
              <TabList>
                <Tab>Step</Tab>
                <Tab>Step bundle</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
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
                      Your team has already reached the {uniqueStepLimit} unique Steps per project limit included in
                      your current plan. To add more Steps, upgrade your plan.
                    </Notification>
                  )}
                  <StepFilter mt={16} activeTab={activeTab} />
                  <StepList enabledSteps={stepLimitReached ? enabledSteps : undefined} onSelectStep={onSelectStep} />
                </TabPanel>
                <TabPanel display="flex" flexDir="column" gap="16">
                  <StepFilter mt={16} activeTab={activeTab} />
                  <Card variant="outline" padding="8px 12px">
                    <Text textStyle="body/lg/semibold" marginBlockEnd="4">
                      Step bundle 1
                    </Text>
                    <Text textStyle="body/md/regular" color="text/secondary">
                      Not used by any Workflows
                    </Text>
                  </Card>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </FloatingDrawerBody>
        </FloatingDrawerContent>
      </FloatingDrawer>
    </FormProvider>
  );
};

export default StepSelectorDrawer;
