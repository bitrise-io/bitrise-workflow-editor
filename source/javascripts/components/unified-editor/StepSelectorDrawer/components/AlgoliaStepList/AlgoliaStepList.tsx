import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Text } from '@bitrise/bitkit';
import { useResizeObserver } from 'usehooks-ts';
import { useVirtualizer } from '@tanstack/react-virtual';

import { capitalize, startCase } from 'es-toolkit';
import { SelectStepHandlerFn } from '../../StepSelectorDrawer.types';

import useSearchAlgoliaSteps from './hooks/useSearchAlgoliaSteps';
import { createVirtualizedItems, findScrollContainer } from './AlgoliaStepList.utils';
import AlgoliaStepItem from './components/AlgoliaStepItem';

type Props = {
  enabledSteps?: Set<string>;
  onSelectStep: SelectStepHandlerFn;
};

const AlgoliaStepList = ({ enabledSteps: _, onSelectStep }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(1);
  const { data: steps = [] } = useSearchAlgoliaSteps();
  const rows = useMemo(() => createVirtualizedItems(steps, columns), [steps, columns]);

  const {
    measure,
    getTotalSize,
    getVirtualItems,
    options: { gap },
  } = useVirtualizer({
    gap: 16,
    count: rows.length,
    getScrollElement: () => findScrollContainer(ref.current),
    estimateSize: (index: number) => {
      const item = rows[index];

      if (typeof item === 'string') {
        return 24;
      }

      return 98;
    },
  });

  useEffect(() => {
    measure();
  }, [columns, measure]);

  useResizeObserver({
    ref,
    onResize: ({ width }) => setColumns((width ?? 0) > 600 ? 2 : 1),
  });

  return (
    <Box ref={ref} height={getTotalSize()} position="relative">
      {getVirtualItems().map(({ key, index, start, size }) => {
        const item = rows[index];

        if (typeof item === 'string') {
          return (
            <Text key={key} top={start} height={size} position="absolute" textStyle="heading/h4">
              {capitalize(startCase(item))}
            </Text>
          );
        }

        return (
          <Box
            gap={gap}
            key={key}
            top={start}
            width="100%"
            height={size}
            display="grid"
            position="absolute"
            gridTemplateColumns={`repeat(${columns}, 1fr)`}
          >
            {item.map((step) => {
              const { version, cvs } = step;
              const { title, description } = step.step;
              const logo = step.step.asset_urls?.['icon.svg'];

              return (
                <AlgoliaStepItem
                  key={cvs}
                  logo={logo}
                  title={title}
                  version={version}
                  description={description}
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

export default AlgoliaStepList;
