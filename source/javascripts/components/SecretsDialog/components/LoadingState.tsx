import { Td, SkeletonBox, Skeleton, Tbody, Tr } from '@bitrise/bitkit';

type Props = {
  rows?: number;
};

const LoadingState = ({ rows = 8 }: Props) => {
  return (
    <Tbody>
      {Array(rows)
        .fill(null)
        .map((_, i) => {
          const key = `row-${i}`;
          return (
            <Tr key={key}>
              <Td paddingInlineEnd="0">
                <Skeleton isActive>
                  <SkeletonBox width="24" height="24" borderRadius="12" />
                </Skeleton>
              </Td>
              <Td>
                <Skeleton display="flex" flexDirection="column" gap="4" isActive>
                  <SkeletonBox height="22" width={Math.random() * 128 + 128} />
                  <SkeletonBox height="16" width="96" />
                </Skeleton>
              </Td>
            </Tr>
          );
        })}
    </Tbody>
  );
};

export default LoadingState;
