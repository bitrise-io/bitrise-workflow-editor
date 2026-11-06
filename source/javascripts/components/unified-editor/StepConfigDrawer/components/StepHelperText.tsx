import { BitkitLinkButton, BitkitMarkdown } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { useDisclosure } from '@chakra-ui/react/hooks';
import { Collapse } from 'chakra-ui-2--react';

type Props = {
  summary?: string;
  details?: string;
};

const StepHelperText = ({ summary, details }: Props) => {
  const { open: isOpen, onToggle } = useDisclosure();
  const showMoreLabel = isOpen ? 'Show less' : 'Show more';
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
        <>
          <Collapse
            in={isOpen}
            startingHeight={isDetailsOverlapsSummary ? 20 : 0}
            transition={{ enter: { duration: 0.2 }, exit: { duration: 0.2 } }}
          >
            <BitkitMarkdown size="sm" gap="8">
              {detailsText}
            </BitkitMarkdown>
          </Collapse>
          <BitkitLinkButton alignSelf="start" onClick={onToggle}>
            {showMoreLabel}
          </BitkitLinkButton>
        </>
      )}
    </Box>
  );
};

export default StepHelperText;
