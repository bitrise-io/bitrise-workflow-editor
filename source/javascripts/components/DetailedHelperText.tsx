import { Box, Collapse, Link, MarkdownContent } from '@bitrise/bitkit';
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

      <Link colorScheme="purple" cursor="pointer" fontSize="md" onClick={onToggle}>
        {showMoreLabel}
      </Link>
    </Box>
  );
};

export default DetailedHelperText;
