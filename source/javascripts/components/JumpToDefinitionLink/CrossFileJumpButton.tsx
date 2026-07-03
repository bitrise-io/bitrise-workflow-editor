import { BitkitControlButton, IconArrowNortheast } from '@bitrise/bitkit-v2';
import { Box } from '@chakra-ui/react/box';

import { EntityKind } from '@/core/models/Tree';

import JumpToDefinitionLink from './JumpToDefinitionLink';

type Props = {
  kind: EntityKind;
  id: string;
  /** Override the jump targets — see {@link JumpToDefinitionLink}'s `nodeIds`. */
  nodeIds?: string[];
  /** Accessible label / tooltip for the button. Defaults to "Edit definition". */
  label?: string;
  onOpenChange?: (isOpen: boolean) => void;
};

const CrossFileJumpButton = ({ kind, id, nodeIds, label = 'Edit definition', onOpenChange }: Props) => (
  <Box onClick={(e) => e.stopPropagation()} className="nopan">
    <JumpToDefinitionLink
      kind={kind}
      id={id}
      nodeIds={nodeIds}
      onOpenChange={onOpenChange}
      trigger={<BitkitControlButton size="xs" icon={IconArrowNortheast} label={label} />}
    />
  </Box>
);

export default CrossFileJumpButton;
