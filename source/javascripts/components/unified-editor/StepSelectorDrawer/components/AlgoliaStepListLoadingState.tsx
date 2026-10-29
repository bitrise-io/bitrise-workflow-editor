import { BitkitSkeletonGroup, rem } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { Card } from '@chakra-ui/react/card';
import { Skeleton } from '@chakra-ui/react/skeleton';
import { range } from 'es-toolkit';
import { useRef } from 'react';

import useCalculateColumns from '../hooks/useCalculateColumns';
import { CATEGORY_HEIGHT, GAP, STEP_HEIGHT } from './AlgoliaStepList.const';

const AlgoliaStepListLoadingState = () => {
  const ref = useRef<HTMLDivElement>(null);
  const columns = useCalculateColumns(ref);

  return (
    <Box ref={ref} display="flex" flexDirection="column" gap={GAP}>
      <Skeleton height={CATEGORY_HEIGHT} width={rem(150)} />
      {range(16 * columns).map((row) => (
        <Box key={row} display="grid" gap={GAP} height={STEP_HEIGHT} gridTemplateColumns={`repeat(${columns}, 1fr)`}>
          {range(columns).map((col) => (
            <Card.Root key={col} elevation={false}>
              <Card.Body padding="8">
                <BitkitSkeletonGroup
                  display="grid"
                  gridTemplateColumns="auto 1fr"
                  gridTemplateRows={rem(18)}
                  columnGap="8"
                  rowGap="2"
                >
                  <Box gridRow="span 2" width="40" height="40" borderRadius="4" />
                  <Box width="80%" height={rem(18)} />
                  <Box width="64" height={rem(14)} />
                  <Box gridColumn="1 / -1" marginBlockStart="6" width="100%" height={rem(14)} />
                  <Box gridColumn="1 / -1" width="75%" height={rem(14)} />
                </BitkitSkeletonGroup>
              </Card.Body>
            </Card.Root>
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default AlgoliaStepListLoadingState;
