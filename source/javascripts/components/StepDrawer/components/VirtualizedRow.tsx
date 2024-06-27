import { CSSProperties } from 'react';
import { SimpleGrid } from '@chakra-ui/react';
import { Text } from '@bitrise/bitkit';
import { displayCategoryName, isCategoryRow, isStepsRow } from '../StepDrawer.utils';
import { Step, VirtualizedListItem } from '../StepDrawer.types';
import { RowGaps, RowHeights } from '../contants';
import DrawerStepCard from './DrawerStepCard';

type CategoryRowProps = {
  category: string;
  style?: CSSProperties;
};

const CategoryRow = ({ category, style = {} }: CategoryRowProps) => (
  <Text key={category} as="h4" textStyle="heading/h4" style={style}>
    {displayCategoryName(category)}
  </Text>
);

type StepsRowProps = {
  columns: number;
  category: string;
  steps: Step[];
  style?: CSSProperties;
  onStepSelected: (cvs: string) => void;
};

const StepsRow = ({ columns, category, steps, style = {}, onStepSelected }: StepsRowProps) => (
  <SimpleGrid columns={[1, columns]} spacing={RowGaps.steps} style={style}>
    {steps.map((step) => (
      <DrawerStepCard
        key={`${category}/${step.id}`}
        {...step}
        cardProps={{ minH: `${RowHeights.steps}px` }}
        onClick={() => onStepSelected(step.cvs)}
      />
    ))}
  </SimpleGrid>
);

type VirtualizedRowProps = {
  columns: number;
  item: VirtualizedListItem;
  style?: CSSProperties;
  onStepSelected: (cvs: string) => void;
};

const VirtualizedRow = ({ columns, item, style = {}, onStepSelected }: VirtualizedRowProps) => {
  if (isCategoryRow(item)) {
    return <CategoryRow category={item.category} style={style} />;
  }

  if (isStepsRow(item)) {
    return (
      <StepsRow
        columns={columns}
        category={item.category}
        steps={item.steps}
        style={style}
        onStepSelected={onStepSelected}
      />
    );
  }

  return null;
};

export default VirtualizedRow;
