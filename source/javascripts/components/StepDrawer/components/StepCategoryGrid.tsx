import { Box, Text } from '@bitrise/bitkit';
import { SimpleGrid } from '@chakra-ui/react';

import { Step } from '../StepDrawer.types';
import { displayCategoryName } from '../StepDrawer.utils';
import StepGridCard from './StepGridCard';

type Props = {
  category: string;
  steps: Step[];
  onStepSelected: (cvs: string) => void;
};
const StepCategoryGrid = ({ category, steps, onStepSelected }: Props) => {
  if (steps.length === 0) {
    return null;
  }

  return (
    <Box key={category}>
      <Text as="h4" textStyle="heading/h4" marginBottom="8">
        {displayCategoryName(category)}
      </Text>
      <SimpleGrid columns={[1, 2]} spacing="16">
        {steps.map((step) => (
          <StepGridCard key={`${category}/${step.id}`} {...step} onClick={() => onStepSelected(step.cvs)} />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default StepCategoryGrid;
