/* eslint-disable react-hooks/purity */
import { BitkitSkeletonGroup, rem } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';

type Props = {
  rows?: number;
};

const LoadingState = ({ rows = 4 }: Props) => {
  return (
    <>
      {Array(rows)
        .fill(null)
        .map(() => {
          return (
            <BitkitSkeletonGroup key={Math.random()} paddingBlock="12" display="flex" flexDirection="column" gap="4">
              <Box height={rem(22)} width={rem(Math.random() * 128 + 128)} />
              <Box height="16" width="96" />
            </BitkitSkeletonGroup>
          );
        })}
    </>
  );
};

export default LoadingState;
