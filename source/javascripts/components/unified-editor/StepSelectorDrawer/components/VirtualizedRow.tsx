import { CSSProperties } from 'react';
import { SimpleGrid } from '@chakra-ui/react';
import { Text } from '@bitrise/bitkit';
import defaultIcon from '@/../images/step/icon-default.svg';
import { displayCategoryName, isCategoryRow, isStepsRow } from '../StepSelectorDrawer.utils';
import { SelectStepHandlerFn, VirtualizedListItem } from '../StepSelectorDrawer.types';
import { RowGaps, RowHeights, RowSizes } from '../StepSelectorDrawer.constants';
import DrawerStepCard from './DrawerStepCard';

type VirtualizedRowProps = {
  item: VirtualizedListItem;
  style?: CSSProperties;
  onSelectStep: SelectStepHandlerFn;
};

const VirtualizedRow = ({ item, style = {}, onSelectStep }: VirtualizedRowProps) => {
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
      <SimpleGrid columns={item.columns} spacing={RowGaps.steps} mb={`${RowGaps.steps}px`} style={style}>
        {item.steps.map(({ id, step, isDisabled }) => (
          <DrawerStepCard
            key={`${item.category}/${id}`}
            icon={step?.icon || defaultIcon}
            title={step?.title || id}
            summary={step.defaultValues?.summary}
            description={step.defaultValues?.description}
            version={step.resolvedInfo?.version}
            isOfficial={step.resolvedInfo?.isOfficial}
            isVerified={step.resolvedInfo?.isVerified}
            isDeprecated={step.resolvedInfo?.isDeprecated}
            isDisabled={isDisabled}
            cardProps={{ minH: `${RowHeights.steps}px` }}
            onClick={() => onSelectStep(step)}
          />
        ))}
      </SimpleGrid>
    );
  }

  return null;
};

export default VirtualizedRow;
