import { BitkitCollapsible, BitkitMarkdown } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';

type Props = {
  summary: string;
  details: string;
};

const DetailedHelperText = ({ summary, details }: Props) => (
  <Box display="flex" flexDirection="column" gap="8">
    <BitkitMarkdown size="sm" gap="8">
      {summary}
    </BitkitMarkdown>

    <BitkitCollapsible collapsedHeight="0px">
      <BitkitMarkdown size="sm" gap="8">
        {details}
      </BitkitMarkdown>
    </BitkitCollapsible>
  </Box>
);

export default DetailedHelperText;
