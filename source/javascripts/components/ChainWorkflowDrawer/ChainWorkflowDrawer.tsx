import { Icon, Notification, SearchInput, Text, useDisclosure } from '@bitrise/bitkit';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  UseDisclosureProps,
} from '@chakra-ui/react';
import { ChainWorkflowCallback, InitialValues, SearchFormValues } from './ChainWorkflowDrawer.types';
import ChainableWorkflowList from './components/ChainableWorkflowList';
import BitriseYmlProvider from '@/contexts/BitriseYmlProvider';
import { BitriseYml } from '@/models/BitriseYml';

type Props = UseDisclosureProps & {
  id: string;
  yml: BitriseYml;
  onChainWorkflow: ChainWorkflowCallback;
};

const ChainWorkflowDrawer = ({ id, yml, onChainWorkflow, ...disclosureProps }: Props) => {
  const { isOpen, onClose } = useDisclosure(disclosureProps);
  const form = useForm<SearchFormValues>({
    defaultValues: {
      ...InitialValues,
    },
  });

  if (!yml || !id) {
    return null;
  }

  return (
    <BitriseYmlProvider yml={yml}>
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
                Chain Workflows to '{id}'
              </Text>
            </DrawerHeader>
            <DrawerBody display="flex" overflow="auto" flexDir="column" gap="16">
              <Text>
                Add Workflows before or after the Steps of the selected Workflow. Each linked Workflow executes on the
                same VM, ensuring a cohesive build process.
              </Text>
              <Notification status="info" flexShrink="0">
                Remember, changes to a chained Workflow affect all other Workflows using it.
              </Notification>
              <Controller<SearchFormValues>
                name="search"
                render={({ field: { ref, onChange, ...rest } }) => (
                  <SearchInput
                    inputRef={ref}
                    placeholder="Filter by name "
                    onChange={(value) => onChange({ target: { value } })}
                    {...rest}
                  />
                )}
              />
              <ChainableWorkflowList id={id} onChainWorkflow={onChainWorkflow} />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </FormProvider>
    </BitriseYmlProvider>
  );
};

export default ChainWorkflowDrawer;
