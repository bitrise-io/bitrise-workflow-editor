import { Box, Card, Skeleton, SkeletonBox } from '@bitrise/bitkit';
import { SimpleGrid } from '@chakra-ui/react';
import { RowGaps, RowHeights } from '../StepSelectorDrawer.constants';

const SkeletonCard = () => (
  <Card variant="outline" padding="12" minH={RowHeights.steps}>
    <Box display="flex" gap="8" mb="8">
      <SkeletonBox height="40px" width="40px" borderRadius="4px" />
      <Box>
        <SkeletonBox width="120px" height="20px" mb="4px" />
        <SkeletonBox width="50px" height="16px" />
      </Box>
    </Box>
    <SkeletonBox width="85%" height="14px" mb="4px" />
    <SkeletonBox width="70%" height="14px" />
  </Card>
);

type RowProps = {
  groupIdx: number;
  rowIdx: number;
  columns: number;
};

const SkeletonRow = ({ groupIdx, rowIdx, columns }: RowProps) => (
  <SimpleGrid columns={columns} spacing="16" mb={RowGaps.steps}>
    {Array.from({ length: columns }).map((___, colIdx) => (
      // eslint-disable-next-line react/no-array-index-key
      <SkeletonCard key={`group-${groupIdx}/row-${rowIdx}/card-${colIdx}`} />
    ))}
  </SimpleGrid>
);

type GroupProps = {
  groupIdx: number;
  rows: number;
  columns: number;
};

const SkeletonGroup = ({ groupIdx, rows, columns }: GroupProps) => (
  <Box key={`group-${groupIdx}`}>
    <SkeletonBox height={RowHeights.category} width="150px" mb={RowGaps.category} />
    {Array.from({ length: rows }).map((_, rowIdx) => (
      // eslint-disable-next-line react/no-array-index-key
      <SkeletonRow key={`group-${groupIdx}/row-${rowIdx}`} groupIdx={groupIdx} rowIdx={rowIdx} columns={columns} />
    ))}
  </Box>
);

type Props = {
  groups?: number;
  rows?: number;
  columns: number;
};

const SkeletonRows = ({ groups = 2, rows = 3, columns }: Props) => {
  return (
    <Skeleton isActive>
      {Array.from({ length: groups }).map((_, groupIdx) => (
        // eslint-disable-next-line react/no-array-index-key
        <SkeletonGroup key={`group-${groupIdx}`} groupIdx={groupIdx} rows={rows} columns={columns} />
      ))}
    </Skeleton>
  );
};

export default SkeletonRows;
