import { Icon, Text, useDisclosure } from '@bitrise/bitkit';
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
import { SearchFormValues, StepSelected } from './StepDrawer.types';
import StepFilter from './components/StepFilter';
import StepList from './components/StepList';

type Props = UseDisclosureProps & {
  enabledStepIds?: Set<string>;
  onStepSelected: StepSelected;
};

const StepDrawer = ({ enabledStepIds, onStepSelected, ...disclosureProps }: Props) => {
  const { isOpen, onClose } = useDisclosure(disclosureProps);
  const form = useForm<SearchFormValues>({
    defaultValues: {
      search: '',
      categories: [],
    },
  });

  return (
    <FormProvider {...form}>
      <Drawer isFullHeight isOpen={isOpen} onClose={onClose}>
        <DrawerOverlay
          top="0px"
          bg="linear-gradient(to left, rgba(0, 0, 0, 0.22) 0%, rgba(0, 0, 0, 0) 60%, rgba(0, 0, 0, 0) 100%);"
        />
        <DrawerContent
          top="0px"
          display="flex"
          flexDir="column"
          maxWidth={['100%', '50%']}
          borderRadius={[0, 12]}
          margin={[0, 32]}
          boxShadow="large"
        >
          <DrawerCloseButton size="md">
            <Icon name="CloseSmall" />
          </DrawerCloseButton>
          <DrawerHeader color="inherit" textTransform="inherit" fontWeight="inherit">
            <Text as="h3" textStyle="heading/h3" fontWeight="bold">
              Add Step
            </Text>
            <StepFilter my={16} />
          </DrawerHeader>
          <DrawerBody flex="1" overflow="auto">
            <StepList enabledStepIds={enabledStepIds} onStepSelected={onStepSelected} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </FormProvider>
  );
};

export default StepDrawer;
