import { BitkitCollapsible, BitkitMarkdown } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';

type Props = {
  summary?: string;
  details?: string;
};

const StepHelperText = ({ summary, details }: Props) => {
  const detailsText = details?.trim() || '';
  const summaryText = summary?.trim() || detailsText?.split('\n')[0].trim() || '';
  const isOneLinerDetails = detailsText.split('\n').length <= 1;
  const isDetailsOverlapsSummary = detailsText.startsWith(summaryText);

  if (!summaryText && !detailsText) {
    return null;
  }

  if (summaryText && !detailsText) {
    return (
      <BitkitMarkdown size="sm" gap="8">
        {summaryText}
      </BitkitMarkdown>
    );
  }

  if (isOneLinerDetails) {
    return (
      <BitkitMarkdown size="sm" gap="8">
        {detailsText}
      </BitkitMarkdown>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap="8">
      {!isDetailsOverlapsSummary && (
        <BitkitMarkdown size="sm" gap="8">
          {summaryText}
        </BitkitMarkdown>
      )}
      {detailsText && (
        <BitkitCollapsible collapsedHeight={isDetailsOverlapsSummary ? '20px' : '0px'}>
          <BitkitMarkdown size="sm" gap="8">
            {detailsText}
          </BitkitMarkdown>
        </BitkitCollapsible>
      )}
    </Box>
  );
};

export default StepHelperText;
