import { Box, Link, MarkdownContent, useDisclosure } from '@bitrise/bitkit';
import { Collapse } from '@chakra-ui/react';

type Props = {
  summary?: string;
  details?: string;
};

const StepHelperText = ({ summary, details }: Props) => {
  const { isOpen, onToggle } = useDisclosure();
  const showMoreLabel = isOpen ? 'Show less' : 'Show more';
  const detailsText = details?.trim() || '';
  const summaryText = summary?.trim() || detailsText?.split('\n')[0].trim() || '';
  const isOneLinerDetails = detailsText.split('\n').length <= 1;
  const isDetailsOverlapsSummary = detailsText.startsWith(summaryText);

  if (!summaryText && !detailsText) {
    return null;
  }

  if (summaryText && !detailsText) {
    return <MarkdownContent md={summaryText} size="sm" gap="8" />;
  }

  if (isOneLinerDetails) {
    return <MarkdownContent md={detailsText} size="sm" gap="8" />;
  }

  return (
    <Box display="flex" flexDirection="column" gap="8">
      {!isDetailsOverlapsSummary && <MarkdownContent md={summaryText} size="sm" gap="8" />}
      {detailsText && (
        <>
          <Collapse
            in={isOpen}
            startingHeight={isDetailsOverlapsSummary ? 20 : 0}
            transition={{ enter: { duration: 0.2 }, exit: { duration: 0.2 } }}
          >
            <MarkdownContent md={detailsText} size="sm" gap="8" />
          </Collapse>
          <Link colorScheme="purple" cursor="pointer" size="2" onClick={onToggle}>
            {showMoreLabel}
          </Link>
        </>
      )}
    </Box>
  );
};

export default StepHelperText;
