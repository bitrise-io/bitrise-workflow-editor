import { useCallback, useEffect, useRef, useState } from 'react';
import { Box } from '@bitrise/bitkit';
import { useResizeObserver } from 'usehooks-ts';
import { useVirtualizer } from '@tanstack/react-virtual';

import { SelectStepHandlerFn } from '../../StepSelectorDrawer.types';

import useSearchAlgoliaSteps from './hooks/useSearchAlgoliaSteps';
import { findScrollContainer } from './AlgoliaStepList.utils';
import AlgoliaStepItem from './components/AlgoliaStepItem';

type Props = {
  enabledSteps?: Set<string>;
  onSelectStep: SelectStepHandlerFn;
};

const AlgoliaStepList = ({ enabledSteps: _, onSelectStep }: Props) => {
  const [lanes, setLanes] = useState(1);
  const ref = useRef<HTMLDivElement>(null);
  const { data: steps = [] } = useSearchAlgoliaSteps();

  const {
    measure,
    getTotalSize,
    getVirtualItems,
    options: { gap },
  } = useVirtualizer({
    lanes,
    gap: 16,
    count: steps.length,
    estimateSize: useCallback(() => 98, []),
    getScrollElement: useCallback(() => findScrollContainer(ref.current), [ref]),
  });

  useEffect(() => {
    measure();
  }, [lanes, measure]);

  useResizeObserver({
    ref,
    onResize: ({ width }) => setLanes((width ?? 0) > 600 ? 2 : 1),
  });

  return (
    <Box ref={ref} height={getTotalSize()} position="relative">
      {getVirtualItems().map(({ key, index, start, size, lane }) => {
        const step = steps[index];

        const { version } = step;
        const { title, description } = step.step;
        const logo = step.step.asset_urls?.['icon.svg'];

        const left = lane === 0 ? 0 : `calc(50% + ${gap / 2}px)`;
        const width = lanes > 1 ? `calc(50% - ${gap / 2}px)` : '100%';

        return (
          <AlgoliaStepItem
            key={key}
            top={start}
            left={left}
            logo={logo}
            title={title}
            width={width}
            height={size}
            version={version}
            position="absolute"
            description={description}
            onClick={() => onSelectStep(step.cvs)}
          />
        );
      })}
    </Box>
  );
};

export default AlgoliaStepList;
