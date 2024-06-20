import { useMemo } from 'react';
import { Box, Text } from '@bitrise/bitkit';
import { SimpleGrid } from '@chakra-ui/react';
import { Step } from '../StepDrawer.types';
import { displayCategoryName } from '../StepDrawer.utils';
import StepCard from './StepCard';

type Props = {
  categories: string[];
  steps: Step[];
};

const StepList = ({ categories = [], steps = [] }: Props) => {
  const stepsByCategories = useMemo(
    () =>
      steps.reduce(
        (acc, step) => {
          step.categories.forEach((category) => {
            acc[category] ||= [];
            acc[category].push(step);
          });

          return acc;
        },
        {} as Record<string, Step[]>,
      ),
    [steps],
  );

  return (
    <Box display="flex" flexDir="column" gap="16">
      {categories?.map((category) => (
        <>
          {stepsByCategories[category]?.length > 0 && (
            <Box key={category}>
              <Text textStyle="heading/h4" marginBottom="8">
                {displayCategoryName(category)}
              </Text>
              <SimpleGrid columns={[1, 2]} spacing="16">
                {stepsByCategories[category]?.map((step) => <StepCard key={step.id} {...step} />)}
              </SimpleGrid>
            </Box>
          )}
        </>
      ))}
    </Box>
  );
};

export default StepList;
