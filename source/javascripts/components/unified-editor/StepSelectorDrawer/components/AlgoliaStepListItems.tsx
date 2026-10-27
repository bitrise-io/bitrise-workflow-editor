import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { AlgoliaStepResponse } from '@/core/api/AlgoliaApi';
import { findScrollContainer } from '@/core/utils/CommonUtils';

import useCalculateColumns from '../hooks/useCalculateColumns';
import useVirtualItems from '../hooks/useVirtualItems';
import { CATEGORY_HEIGHT, GAP, STEP_HEIGHT } from './AlgoliaStepList.const';
import AlgoliaStepListItem from './AlgoliaStepListItem';

type Props = {
  steps: AlgoliaStepResponse[];
  enabledSteps?: Set<string>;
  onSelectStep: (cvs: string, objectId: string, position: number) => void;
};

const AlgoliaStepListItems = ({ steps, enabledSteps, onSelectStep }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const columns = useCalculateColumns(ref);
  const rows = useVirtualItems({ steps, columns, enabledSteps });

  // The tags above the list scroll with it, so the list starts below them in the scroll container. The
  // virtualizer needs that offset (`scrollMargin`), kept current as the tags wrap or the drawer resizes.
  const [scrollMargin, setScrollMargin] = useState(0);
  useLayoutEffect(() => {
    const list = ref.current;
    const container = findScrollContainer(list);
    if (!list || !container) {
      return undefined;
    }
    const update = () =>
      setScrollMargin(list.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop);
    const observer = new ResizeObserver(update);
    observer.observe(container);
    if (list.parentElement) {
      observer.observe(list.parentElement);
    }
    return () => observer.disconnect();
  }, []);

  const { measure, getTotalSize, getVirtualItems } = useVirtualizer({
    gap: GAP,
    count: rows.length,
    scrollMargin,
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
            <Text key={key} top={start - scrollMargin} height={size} position="absolute" textStyle="heading/h4">
              {item}
            </Text>
          );
        }

        return (
          <Box
            gap={GAP}
            key={key}
            top={start - scrollMargin}
            width="100%"
            height={size}
            display="grid"
            position="absolute"
            gridTemplateColumns={`repeat(${columns}, 1fr)`}
          >
            {item.map((step) => {
              const { title, description } = step.step;
              const { version, cvs, id, objectID } = step;

              const maintainer = step.info?.maintainer;
              const logo = step.step.asset_urls?.['icon.svg'];
              const isDisabled = enabledSteps && !enabledSteps.has(id);

              return (
                <AlgoliaStepListItem
                  key={cvs}
                  logo={logo}
                  title={title}
                  version={version}
                  maintainer={maintainer}
                  isDisabled={isDisabled}
                  description={description}
                  onClick={() => onSelectStep(cvs, objectID, steps.findIndex((s) => s.objectID === objectID) + 1)}
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
