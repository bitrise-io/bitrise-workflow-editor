import { Skeleton, SkeletonBox } from '@bitrise/bitkit';

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
            <Skeleton key={Math.random()} paddingBlock="12" display="flex" flexDirection="column" gap="4">
              <SkeletonBox height="22" width={Math.random() * 128 + 128} />
              <SkeletonBox height="16" width="96" />
            </Skeleton>
          );
        })}
    </>
  );
};

export default LoadingState;
