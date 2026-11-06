import { Collapse } from '@bitrise/bitkit';
import { BitkitLinkButton, BitkitMarkdown } from '@bitrise/bitkit-v2';
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
      <BitkitMarkdown size="sm" gap="8">
        {summary}
      </BitkitMarkdown>

      <Collapse in={isOpen}>
        <BitkitMarkdown size="sm" gap="8">
          {details}
        </BitkitMarkdown>
      </Collapse>

      <BitkitLinkButton alignSelf="start" onClick={onToggle}>
        {showMoreLabel}
      </BitkitLinkButton>
    </Box>
  );
};

export default DetailedHelperText;
