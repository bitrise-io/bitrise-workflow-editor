import { BitkitSectionHeading } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';
import { ReactNode } from 'react';

type Props = { label: string; helperText: ReactNode };

// Every tool page's title, with a line under it on what the tool is for, spaced the same on each page.
// The end padding keeps it clear of the tool panel's close button.
const ToolPageHeading = ({ label, helperText }: Props) => (
  <Box
    paddingBlockStart="32"
    paddingBlockEnd="24"
    paddingInlineStart="32"
    paddingInlineEnd="72"
    data-clarity-unmask="true"
  >
    <BitkitSectionHeading headingLevel="h2" label={label} helperText={helperText} />
  </Box>
);

export default ToolPageHeading;
