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
import { SearchFormValues } from './StepDrawer.types';
import StepFilter from './components/StepFilter';
import StepList from './components/StepList';

type Props = UseDisclosureProps;

const StepDrawer = (props: Props) => {
  const { isOpen, onClose } = useDisclosure(props);
  const form = useForm<SearchFormValues>({
    defaultValues: {
      search: '',
      categories: [],
    },
  });

  return (
    <FormProvider {...form}>
      <Drawer isFullHeight isOpen={isOpen} onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent maxWidth={['100%', '50%']}>
          <DrawerCloseButton size="md">
            <Icon name="CloseSmall" />
          </DrawerCloseButton>
          <DrawerHeader>
            <Text as="h3" textStyle="heading/h3">
              Add Step
            </Text>
            <StepFilter my={16} />
          </DrawerHeader>
          <DrawerBody overflowY="auto">
            <StepList />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </FormProvider>
  );
};

export default StepDrawer;
