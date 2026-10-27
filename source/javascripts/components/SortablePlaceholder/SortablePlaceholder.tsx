import { Box, BoxProps } from '@chakra-ui/react/box';
import { forwardRef } from 'react';

type Props = Pick<BoxProps, 'height' | 'style'>;

/**
 * The empty drop slot a sortable card leaves behind while it is being dragged. It is not a card,
 * so it is a plain Box rather than a Card.Root restyled against the Card recipe. `height` must be
 * the dragged card's rendered height, or the list jumps when the drag starts.
 */
const SortablePlaceholder = forwardRef<HTMLDivElement, Props>(({ height, style }, ref) => (
  <Box
    ref={ref}
    style={style}
    width="full"
    height={height}
    borderRadius="8"
    border="1px dashed"
    borderColor="border/strong"
    backgroundColor="background/secondary"
  />
));

SortablePlaceholder.displayName = 'SortablePlaceholder';

export default SortablePlaceholder;
