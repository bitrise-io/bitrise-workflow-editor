import { CSSProperties } from 'react';
import { SimpleGrid } from '@chakra-ui/react';
import { Text } from '@bitrise/bitkit';
import { displayCategoryName, isCategoryRow, isStepsRow } from '../StepDrawer.utils';
import { StepSelected, VirtualizedListItem } from '../StepDrawer.types';
import { ColumnValues, RowGaps, RowHeights, RowSizes } from '../StepDrawer.constants';
import DrawerStepCard from './DrawerStepCard';

type VirtualizedRowProps = {
  item: VirtualizedListItem;
  style?: CSSProperties;
  onStepSelected: StepSelected;
};

const VirtualizedRow = ({ item, style = {}, onStepSelected }: VirtualizedRowProps) => {
  if (isCategoryRow(item)) {
    return (
      <Text
        key={item.category}
        as="h4"
        textStyle="heading/h4"
        minH={`${RowSizes.category}px`}
        mb={`${RowGaps.category}px`}
        style={style}
      >
        {displayCategoryName(item.category)}
      </Text>
    );
  }

  if (isStepsRow(item)) {
    return (
      <SimpleGrid columns={ColumnValues} spacing={RowGaps.steps} mb={`${RowGaps.steps}px`} style={style}>
        {item.steps.map((step) => (
          <DrawerStepCard
            key={`${item.category}/${step.id}`}
            {...step}
            cardProps={{ minH: `${RowHeights.steps}px` }}
            onClick={() => onStepSelected(step)}
          />
        ))}
      </SimpleGrid>
    );
  }

  return null;
};

export default VirtualizedRow;
