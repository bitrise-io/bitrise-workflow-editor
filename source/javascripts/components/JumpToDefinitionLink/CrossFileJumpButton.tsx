import { ControlButton } from '@bitrise/bitkit';
import { Box } from '@chakra-ui/react/box';

import { EntityKind } from '@/core/models/Tree';

import JumpToDefinitionLink from './JumpToDefinitionLink';

type Props = {
  kind: EntityKind;
  id: string;
  onOpenChange?: (isOpen: boolean) => void;
};

const CrossFileJumpButton = ({ kind, id, onOpenChange }: Props) => (
  <Box onClick={(e) => e.stopPropagation()} className="nopan">
    <JumpToDefinitionLink
      kind={kind}
      id={id}
      onOpenChange={onOpenChange}
      trigger={
        <ControlButton
          size="xs"
          iconName="ArrowNorthEast"
          aria-label="Go to definition"
          tooltipProps={{ 'aria-label': 'Go to definition' }}
        />
      }
    />
  </Box>
);

export default CrossFileJumpButton;
