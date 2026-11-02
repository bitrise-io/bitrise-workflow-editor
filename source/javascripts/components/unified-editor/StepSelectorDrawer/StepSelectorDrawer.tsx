import { BitkitAlert, BitkitHeading, BitkitTabs, BitkitTag } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { useEffect, useState } from 'react';

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
import useSearch, { initializeSearchDefaults } from './hooks/useSearch';
import { SelectStepHandlerFn } from './StepSelectorDrawer.types';

type Props = Omit<FloatingDrawerProps, 'children'> & {
  enabledSteps?: Set<string>;
  onSelectStep: SelectStepHandlerFn;
  parentStepBundleId?: string;
};

const StepSelectorDrawer = ({ enabledSteps, onSelectStep, onCloseComplete, parentStepBundleId, ...props }: Props) => {
  const resetSearch = useSearch((s) => s.reset);

  const [tabId, setTabId] = useState('step');

  const uniqueStepCount = enabledSteps?.size ?? -1;
  const uniqueStepLimit = PageProps.limits()?.uniqueStepLimit;
  const showStepLimit = typeof uniqueStepLimit === 'number';
  const stepLimitReached = uniqueStepLimit && uniqueStepCount >= uniqueStepLimit;
  const upgradeLink = `/organization/${GlobalProps.workspaceSlug()}/credit_subscription/plan_selector_page`;

  useEffect(() => {
    initializeSearchDefaults();
  }, []);

  const handleCloseComplete = () => {
    resetSearch();
    onCloseComplete?.();
  };

  return (
    <BitkitTabs.Root value={tabId} onValueChange={({ value }) => setTabId(value)} lazyMount unmountOnExit>
      <FloatingDrawer onCloseComplete={handleCloseComplete} {...props}>
        <FloatingDrawerContent data-clarity-unmask="true">
          <FloatingDrawerCloseButton />
          <FloatingDrawerHeader>
            <Box display="flex" gap="12">
              <BitkitHeading as="h3">Add Step</BitkitHeading>
              {showStepLimit && <BitkitTag labelText={`${uniqueStepCount}/${uniqueStepLimit} Steps used`} size="sm" />}
            </Box>
            <BitkitTabs.List marginBlockStart="8" marginInline="-24" paddingInline="8" data-clarity-unmask="true">
              <BitkitTabs.Trigger value="step">Step</BitkitTabs.Trigger>
              <BitkitTabs.Trigger value="stepBundle">Step bundle</BitkitTabs.Trigger>
            </BitkitTabs.List>
            {stepLimitReached && (
              <BitkitAlert
                marginBlockStart="16"
                variant="warning"
                alignSelf="flex-end"
                action={{
                  label: 'Upgrade',
                  href: upgradeLink,
                  target: '_blank',
                }}
                titleText="You cannot add a new Step now"
                messageText={`Your team has already reached the ${uniqueStepLimit} unique Steps per project limit included in your current plan. To add more Steps, upgrade your plan.`}
              />
            )}
            {tabId === 'step' && <StepFilter mt="24" mb="12" />}
            {tabId === 'stepBundle' && <StepBundleFilter mt="24" mb="12" />}
          </FloatingDrawerHeader>
          <FloatingDrawerBody pt="12">
            <BitkitTabs.ContentGroup>
              <BitkitTabs.Content value="step">
                <AlgoliaStepList
                  enabledSteps={stepLimitReached ? enabledSteps : undefined}
                  onSelectStep={onSelectStep}
                />
              </BitkitTabs.Content>
              <BitkitTabs.Content value="stepBundle" display="flex" flexDirection="column" gap="12">
                <StepBundleList onSelectStep={onSelectStep} excludedStepBundleId={parentStepBundleId} />
              </BitkitTabs.Content>
            </BitkitTabs.ContentGroup>
          </FloatingDrawerBody>
        </FloatingDrawerContent>
      </FloatingDrawer>
    </BitkitTabs.Root>
  );
};

export default StepSelectorDrawer;
