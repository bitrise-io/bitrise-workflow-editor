import { useEffect, useRef } from 'react';

import { Box, Text } from '@bitrise/bitkit';
import { useVirtualizer } from '@tanstack/react-virtual';

import { AlgoliaStepResponse } from '@/core/api/StepApi';

import useCalculateColumns from '../hooks/useCalculateColumns';
import { CATEGORY_HEIGHT, GAP, STEP_HEIGHT } from '../AlgoliaStepList.const';
import { findScrollContainer } from '../AlgoliaStepList.utils';

import useVirtualItems from '../hooks/useVirtualItems';
import AlgoliaStepListItem from './AlgoliaStepListItem';

type Props = {
  steps: AlgoliaStepResponse[];
  enabledSteps?: Set<string>;
  onSelectStep: (cvs: string) => void;
};

const AlgoliaStepListItems = ({ steps, enabledSteps, onSelectStep }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const columns = useCalculateColumns(ref);
  const rows = useVirtualItems({ steps, columns, enabledSteps });

  const { measure, getTotalSize, getVirtualItems } = useVirtualizer({
    gap: GAP,
    count: rows.length,
    getScrollElement: () => {
      return findScrollContainer(ref.current);
    },
    estimateSize: (index: number) => {
      const item = rows[index];

      if (typeof item === 'string') {
        return CATEGORY_HEIGHT;
      }

      return STEP_HEIGHT;
    },
  });

  useEffect(() => {
    measure();
  }, [columns, measure]);

  return (
    <Box ref={ref} height={getTotalSize()} position="relative">
      {getVirtualItems().map(({ key, index, start, size }) => {
        const item = rows[index];

        if (typeof item === 'string') {
          return (
            <Text key={key} top={start} height={size} position="absolute" textStyle="heading/h4">
              {item}
            </Text>
          );
        }

        return (
          <Box
            gap={GAP}
            key={key}
            top={start}
            width="100%"
            height={size}
            display="grid"
            position="absolute"
            gridTemplateColumns={`repeat(${columns}, 1fr)`}
          >
            {item.map((step) => {
              const { version, cvs, id } = step;
              const { title, description } = step.step;
              const logo = step.step.asset_urls?.['icon.svg'];
              const maintainer = step.info?.maintainer;
              const isDisabled = enabledSteps && !enabledSteps.has(id);

              return (
                <AlgoliaStepListItem
                  key={cvs}
                  logo={logo}
                  title={title}
                  version={version}
                  maintainer={maintainer}
                  description={description}
                  isDisabled={isDisabled}
                  onClick={() => onSelectStep(cvs)}
                />
              );
            })}
          </Box>
        );
      })}
    </Box>
  );
};

export default AlgoliaStepListItems;
