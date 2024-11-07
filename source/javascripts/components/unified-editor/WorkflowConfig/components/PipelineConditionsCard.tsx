import { Box, ExpandableCard, Text } from '@bitrise/bitkit';
import { usePipelinesPageStore } from '../../../../pages/PipelinesPage/PipelinesPage.store';

type ButtonContentProps = {
  pipelineId: string;
};

const ButtonContent = ({ pipelineId }: ButtonContentProps) => {
  return (
    <Box display="flex" flex="1" alignItems="center" justifyContent="space-between" minW={0}>
      <Box display="flex" flexDir="column" alignItems="flex-start" minW={0}>
        <Text textStyle="body/lg/semibold">Pipeline Conditions</Text>
        <Text textStyle="body/md/regular" color="text/secondary" hasEllipsis>
          Running conditions related to {pipelineId}
        </Text>
      </Box>
    </Box>
  );
};

const PipelineConditionsCard = () => {
  const { pipelineId, workflowId } = usePipelinesPageStore();

  return (
    <ExpandableCard
      padding="24px"
      buttonPadding="16px 24px"
      buttonContent={<ButtonContent pipelineId={pipelineId + workflowId} />}
    >
      <Box display="flex" flexDir="column" gap="24" />
    </ExpandableCard>
  );
};

export default PipelineConditionsCard;
