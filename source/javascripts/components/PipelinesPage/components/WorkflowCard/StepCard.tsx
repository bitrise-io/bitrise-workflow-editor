import { Avatar, Box, Card, Skeleton, SkeletonBox, Text } from '@bitrise/bitkit';
import useStepCardData from '../../hooks/useStepCardData';

type StepCardProps = {
  cvs: string;
  title?: string;
  icon?: string;
  showSecondary?: boolean;
};

const StepCard = ({ cvs, title, icon, showSecondary = true }: StepCardProps) => {
  const {
    title: resolvedTitle,
    icon: resolvedIcon,
    normalizedVersion,
    isLoading,
  } = useStepCardData({ cvs, title, icon });

  if (isLoading) {
    return (
      <Card variant="outline" p="8" borderRadius="4">
        <Skeleton isActive display="flex" gap="4">
          <SkeletonBox height="32" width="32" />
          <Box display="flex" flexDir="column" gap="4">
            <SkeletonBox height="14" width="250px" />
            {showSecondary && <SkeletonBox height="14" width="100px" />}
          </Box>
        </Skeleton>
      </Card>
    );
  }

  return (
    <Card variant="outline" display="flex" gap="8" p="8" borderRadius="4">
      <Avatar
        name={resolvedTitle}
        src={resolvedIcon}
        size="32"
        borderRadius="4"
        outline="1px solid"
        outlineColor="neutral.90"
      />
      <Box>
        <Text textStyle="body/sm/regular" hasEllipsis>
          {resolvedTitle}
        </Text>
        {showSecondary && (
          <Text textStyle="body/sm/regular" color="text/secondary" hasEllipsis>
            {normalizedVersion}
          </Text>
        )}
      </Box>
    </Card>
  );
};

export default StepCard;
