import { Box, type BoxProps } from '@chakra-ui/react/box';
import { forwardRef } from 'react';

import DragHandleIcon from './DragHandleIcon';

type Props = BoxProps & {
  isDisabled?: boolean;
  withGroupHover?: boolean;
};

const DragHandle = forwardRef<HTMLDivElement, Props>(({ isDisabled, withGroupHover, _groupHover, ...props }, ref) => {
  if (isDisabled) {
    return (
      <Box display="flex" alignItems="center" padding="8" ref={ref} color="icon/disabled" {...props}>
        <DragHandleIcon />
      </Box>
    );
  }

  return (
    <Box
      padding="8"
      ref={ref}
      as="button"
      cursor="grab"
      display="flex"
      alignItems="center"
      color="icon/tertiary"
      _hover={{ color: 'icon/secondary', background: 'background/hover' }}
      _groupHover={withGroupHover ? { color: 'icon/secondary', ..._groupHover } : _groupHover}
      _active={{ color: 'icon/secondary', background: 'background/active', cursor: 'grabbing' }}
      {...props}
    >
      <DragHandleIcon />
    </Box>
  );
});

DragHandle.displayName = 'DragHandle';

export default DragHandle;
