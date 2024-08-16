import { Box, BoxProps, forwardRef } from '@bitrise/bitkit';
import DragHandleIcon from './DragHandleIcon';

type Props = BoxProps & {
  isDisabled?: boolean;
  withGroupHover?: boolean;
};

const DragHandle = forwardRef(({ isDisabled, withGroupHover, _groupHover, ...props }: Props, ref) => {
  if (isDisabled) {
    return (
      <Box display="flex" alignItems="center" p="8" ref={ref} color="text/disabled" {...props}>
        <DragHandleIcon />
      </Box>
    );
  }

  return (
    <Box
      p="8"
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

export default DragHandle;
