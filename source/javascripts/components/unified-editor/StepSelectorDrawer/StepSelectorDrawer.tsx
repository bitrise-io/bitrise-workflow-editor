import { Box, Icon, Notification, Tag, Text, useDisclosure } from '@bitrise/bitkit';
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  UseDisclosureProps,
} from '@chakra-ui/react';

import { FormProvider, useForm } from 'react-hook-form';
import WindowUtils from '@/core/utils/WindowUtils';
import { SearchFormValues, SelectStepHandlerFn } from './StepSelectorDrawer.types';
import StepFilter from './components/StepFilter';
import StepList from './components/StepList';

type Props = UseDisclosureProps & {
  enabledSteps?: Set<string>;
  onSelectStep: SelectStepHandlerFn;
};

const StepSelectorDrawer = ({ enabledSteps, onSelectStep, ...disclosureProps }: Props) => {
  const { isOpen, onClose } = useDisclosure(disclosureProps);
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

  return (
    <FormProvider {...form}>
      <Drawer isFullHeight isOpen={isOpen} onClose={onClose} onCloseComplete={form.reset}>
        <DrawerOverlay
          top="0px"
          bg="linear-gradient(to left, rgba(0, 0, 0, 0.22) 0%, rgba(0, 0, 0, 0) 60%, rgba(0, 0, 0, 0) 100%);"
        />
        <DrawerContent
          top="0px"
          display="flex"
          flexDir="column"
          margin={[0, 24]}
          boxShadow="large"
          borderRadius={[0, 12]}
          maxWidth={['100%', '50%']}
        >
          <DrawerCloseButton size="md">
            <Icon name="CloseSmall" />
          </DrawerCloseButton>
          <DrawerHeader color="inherit" textTransform="inherit" fontWeight="inherit">
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

            <StepFilter my={16} />
          </DrawerHeader>
          <DrawerBody flex="1" overflow="auto">
            <StepList enabledSteps={stepLimitReached ? enabledSteps : undefined} onSelectStep={onSelectStep} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </FormProvider>
  );
};

export default StepSelectorDrawer;
