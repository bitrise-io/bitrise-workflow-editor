import { Box, Drawer, Text, useDisclosure } from '@bitrise/bitkit';
import { FormProvider, useForm } from 'react-hook-form';
import { FilterFormValues } from './StepDrawer.types';
import StepFilter from './components/StepFilter';
import StepList from './components/StepList';
import { useCategories, useFilter } from './hooks/useSteps';

type Props = {
  isOpen: boolean;
};

const StepDrawer = ({ isOpen: isInitialOpen }: Props) => {
  const { isOpen, onClose } = useDisclosure({ defaultIsOpen: isInitialOpen });
  const { categories } = useCategories();
  const form = useForm<FilterFormValues>({
    defaultValues: {
      search: '',
      categories: [],
    },
  });

  const { steps } = useFilter(form.watch());

  return (
    <FormProvider {...form}>
      <Drawer maxWidth={['100%', '50%']} title="Steps" isOpen={isOpen} onClose={onClose}>
        <Box display="flex" gap="16" flexDir="column">
          <Text textStyle="heading/h3">Add Step</Text>
          <StepFilter />
          <StepList categories={categories} steps={steps} />
        </Box>
      </Drawer>
    </FormProvider>
  );
};

export default StepDrawer;
