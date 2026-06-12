import { ControlButton } from '@bitrise/bitkit';
import { Box } from '@chakra-ui/react/box';

import { EntityKind } from '@/core/models/Tree';

import JumpToDefinitionLink from './JumpToDefinitionLink';

type Props = {
  kind: EntityKind;
  id: string;
  onOpenChange?: (isOpen: boolean) => void;
};

/**
 * The "Go to definition" icon button on a cross-file card. Shown on hover alongside
 * other card controls; the wrapper stops the click from selecting the card (and `nopan`
 * keeps the canvas from panning).
 */
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
