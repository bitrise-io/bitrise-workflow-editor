import { Icon } from '@bitrise/bitkit';
import { Box, type BoxProps } from '@chakra-ui/react/box';
import { memo } from 'react';

import LabelTooltip from '@/components/LabelTooltip';

// `isActive`: a Step is being added here, so the line and the + stay on screen while the Step drawer is open,
// showing where the Step will go.
type Props = BoxProps & { isActive?: boolean };

const AddStepButton = ({ onClick, isActive, ...props }: Props) => {
  return (
    <Box height="8" cursor="pointer" position="relative" {...props} className="group">
      <Box
        height="2"
        display={isActive ? 'block' : 'none'}
        background="interactive/base"
        top="calc(50% - 1px)"
        left={0}
        right={0}
        position="absolute"
        _groupHover={{
          display: 'block',
        }}
      />
      <LabelTooltip text="Add Step or Step bundle">
        <Box
          width="20"
          height="20"
          as="button"
          position="absolute"
          top="calc(50% - 10px)"
          left="calc(50% - 10px)"
          onClick={onClick}
          aria-label="Add Step or Step bundle"
          display={isActive ? 'flex' : 'none'}
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
      </LabelTooltip>
    </Box>
  );
};

export default memo(AddStepButton);
