import { BitkitLabelTooltip, BitkitLabelTooltipProps } from '@bitrise/bitkit-v2';
import { Box, BoxProps } from '@chakra-ui/react/box';

type Props = BitkitLabelTooltipProps & {
  // Puts a focusable span around a trigger that can't open a tooltip itself, e.g. a disabled button.
  wrapTrigger?: boolean;
  wrapperProps?: BoxProps;
};

// The editor's one tooltip look: Bitkit's small label tooltip, everywhere. It adds what BitkitTooltip has and
// the label tooltip lacks, the wrapper for triggers that take no pointer events.
const LabelTooltip = ({ wrapTrigger, wrapperProps, children, ...props }: Props) => (
  <BitkitLabelTooltip {...props}>
    {wrapTrigger ? (
      <Box as="span" display="inline-block" tabIndex={0} {...wrapperProps}>
        {children}
      </Box>
    ) : (
      children
    )}
  </BitkitLabelTooltip>
);

export default LabelTooltip;
