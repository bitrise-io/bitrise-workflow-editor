import { Icon, Tooltip } from '@bitrise/bitkit';
import { Box, type BoxProps } from '@chakra-ui/react/box';
import { memo } from 'react';

type Props = BoxProps;

const AddStepButton = ({ onClick, ...props }: Props) => {
  return (
    <Box height="8" cursor="pointer" position="relative" {...props} className="group">
      <Box
        height="2"
        display="none"
        background="interactive/base"
        top="calc(50% - 1px)"
        left={0}
        right={0}
        position="absolute"
        _groupHover={{
          display: 'block',
        }}
      />
      <Tooltip label="Add Step or Step bundle" aria-label="Add Step or Step bundle">
        <Box
          width="20"
          height="20"
          as="button"
          position="absolute"
          top="calc(50% - 10px)"
          left="calc(50% - 10px)"
          onClick={onClick}
          aria-label="Add Step or Step bundle"
          display="none"
          alignItems="center"
          justifyContent="center"
          background="button/primary/bg"
          color="button/primary/fg"
          borderRadius="4"
          _hover={{
            background: 'button/primary/bg-hover',
            color: 'button/primary/fg-hover',
            outline: '3px solid',
            outlineColor: 'interactive/moderate',
          }}
          _groupHover={{
            display: 'flex',
          }}
        >
          <Icon name="Plus" size="16" />
        </Box>
      </Tooltip>
    </Box>
  );
};

export default memo(AddStepButton);
