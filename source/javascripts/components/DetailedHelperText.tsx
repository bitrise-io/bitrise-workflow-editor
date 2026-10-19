import { Collapse, MarkdownContent } from '@bitrise/bitkit';
import { BitkitLinkButton } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { useDisclosure } from '@chakra-ui/react/hooks';

type Props = {
  summary: string;
  details: string;
};

const DetailedHelperText = ({ summary, details }: Props) => {
  const { open: isOpen, onToggle } = useDisclosure();
  const showMoreLabel = isOpen ? 'Show less' : 'Show more';

  return (
    <Box display="flex" flexDirection="column" gap="8">
      <MarkdownContent md={summary} size="sm" gap="8" />

      <Collapse in={isOpen}>
        <MarkdownContent md={details} size="sm" gap="8" />
      </Collapse>

      <BitkitLinkButton alignSelf="start" onClick={onToggle}>
        {showMoreLabel}
      </BitkitLinkButton>
    </Box>
  );
};

export default DetailedHelperText;
