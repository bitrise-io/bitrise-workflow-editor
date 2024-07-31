import { Avatar, Box, Card, Skeleton, SkeletonBox, Text } from '@bitrise/bitkit';
import useStep from '@/hooks/useStep';

type StepCardProps = {
  workflowId: string;
  stepIndex: number;
  onClick?: VoidFunction;
  showSecondary?: boolean;
};

const StepCard = ({ workflowId, stepIndex, showSecondary = true, onClick }: StepCardProps) => {
  const step = useStep(workflowId, stepIndex);

  if (!step) {
    return null;
  }

  const { cvs, isLoading, icon, title, selectedVersion } = step;

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

  const content = (
    <>
      <Avatar
        size="32"
        src={icon}
        variant="step"
        outline="1px solid"
        name={title || cvs}
        outlineColor="border/minimal"
      />
      <Box minW={0} textAlign="left">
        <Text textStyle="body/sm/regular" hasEllipsis>
          {title}
        </Text>
        {showSecondary && (
          <Text textStyle="body/sm/regular" color="text/secondary" hasEllipsis>
            {selectedVersion || 'Always latest'}
          </Text>
        )}
      </Box>
    </>
  );

  if (onClick) {
    return (
      <Card variant="outline" display="flex" gap="8" p="8" borderRadius="4" as="button" onClick={onClick} withHover>
        {content}
      </Card>
    );
  }

  return (
    <Card variant="outline" display="flex" gap="8" p="8" borderRadius="4">
      {content}
    </Card>
  );
};

export default StepCard;
