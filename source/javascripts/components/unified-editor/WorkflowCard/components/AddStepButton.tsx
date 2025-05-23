import { Box, BoxProps, Icon, Tooltip } from '@bitrise/bitkit';
import { memo } from 'react';

type Props = BoxProps;

const AddStepButton = ({ onClick, ...props }: Props) => {
  return (
    <Box h={8} cursor="pointer" position="relative" {...props} className="group">
      <Box
        h={2}
        display="none"
        bg="icon/interactive"
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
          w={20}
          h={20}
          as="button"
          position="absolute"
          top="calc(50% - 10px)"
          left="calc(50% - 10px)"
          onClick={onClick}
          aria-label="Add Step or Step bundle"
          display="none"
          alignItems="center"
          justifyContent="center"
          bg="button/primary/bg"
          color="button/primary/fg"
          borderRadius="4"
          _hover={{
            bg: 'button/primary/bg-hover',
            color: 'button/primary/fg-hover',
            outline: '3px solid',
            outlineColor: 'sys/interactive/moderate',
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
