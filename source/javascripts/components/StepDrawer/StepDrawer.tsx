import { Box, Drawer, Text, useDisclosure } from '@bitrise/bitkit';
import { FormProvider, useForm } from 'react-hook-form';

import { SearchFormValues } from './StepDrawer.types';
import StepFilter from './components/StepFilter';
import StepList from './components/StepList';

type Props = {
  isOpen: boolean;
};

const StepDrawer = ({ isOpen: isInitialOpen }: Props) => {
  const { isOpen, onClose } = useDisclosure({ defaultIsOpen: isInitialOpen });
  const form = useForm<SearchFormValues>({
    defaultValues: {
      search: '',
      categories: [],
    },
  });

  return (
    <FormProvider {...form}>
      <Drawer maxWidth={['100%', '50%']} title="Steps" isOpen={isOpen} onClose={onClose}>
        <Box display="flex" gap="16" flexDir="column">
          <Text textStyle="heading/h3">Add Step</Text>
          <StepFilter />
          <StepList />
        </Box>
      </Drawer>
    </FormProvider>
  );
};

export default StepDrawer;
