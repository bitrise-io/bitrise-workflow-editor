import { Box, Card, Skeleton, SkeletonBox } from '@bitrise/bitkit';
import { range } from 'es-toolkit';
import { useRef } from 'react';

import useCalculateColumns from '../hooks/useCalculateColumns';
import { CATEGORY_HEIGHT, GAP, STEP_HEIGHT } from './AlgoliaStepList.const';

const AlgoliaStepListLoadingState = () => {
  const ref = useRef<HTMLDivElement>(null);
  const columns = useCalculateColumns(ref);

  return (
    <Skeleton ref={ref} display="flex" flexDirection="column" gap={GAP} isActive>
      <SkeletonBox height={CATEGORY_HEIGHT} width={150} />
      {range(16 * columns).map((row) => (
        <Box key={row} display="grid" gap={GAP} height={STEP_HEIGHT} gridTemplateColumns={`repeat(${columns}, 1fr)`}>
          {range(columns).map((col) => (
            <Card key={col} p="8" gap="8" display="flex" variant="outline" flexDirection="column">
              <Box display="flex" gap="8">
                <SkeletonBox width={40} height={40} borderRadius="4" />
                <Box flex="1" display="flex" flexDirection="column" gap="2">
                  <SkeletonBox width="80%" height={18} />
                  <SkeletonBox width="64" height={14} />
                </Box>
              </Box>
              <Box display="flex" flexDirection="column" gap="2">
                <SkeletonBox width="100%" height={14} />
                <SkeletonBox width="75%" height={14} />
              </Box>
            </Card>
          ))}
        </Box>
      ))}
    </Skeleton>
  );
};

export default AlgoliaStepListLoadingState;
