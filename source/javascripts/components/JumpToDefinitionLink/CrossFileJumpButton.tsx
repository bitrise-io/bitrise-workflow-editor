import { BitkitIconButton, IconArrowNortheast } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';

import { EntityKind } from '@/core/models/Tree';

import JumpToDefinitionLink from './JumpToDefinitionLink';

type Props = {
  kind: EntityKind;
  id: string;
};

/**
 * The "Go to definition" icon button on a cross-file card. Render it last so it stays
 * pinned right while hover-only actions appear to its left; the wrapper stops the click
 * from selecting the card (and `nopan` keeps the canvas from panning).
 */
const CrossFileJumpButton = ({ kind, id }: Props) => (
  <Box onClick={(e) => e.stopPropagation()} className="nopan">
    <JumpToDefinitionLink
      kind={kind}
      id={id}
      trigger={
        <BitkitIconButton
          size="sm"
          variant="tertiary"
          color="icon/secondary"
          label="Go to definition"
          icon={IconArrowNortheast}
        />
      }
    />
  </Box>
);

export default CrossFileJumpButton;
