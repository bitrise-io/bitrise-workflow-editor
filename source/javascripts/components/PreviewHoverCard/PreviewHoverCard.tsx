import { rem } from '@bitrise/bitkit-v2';
import { HoverCard } from '@chakra-ui/react/hover-card';
import { Portal } from '@chakra-ui/react/portal';
import { ReactElement, ReactNode } from 'react';

type Props = {
  /** The card the preview opens from. It receives the trigger's ref and pointer and focus handlers. */
  children: ReactElement;
  preview: ReactNode;
};

/**
 * A preview that opens to the left of a selector drawer's card on hover and focus, and stays open while
 * the pointer moves onto it. Bitkit has no hover preview, and BitkitPopover opens on click, which these
 * cards already use to select. The Bitkit theme ships no HoverCard recipe, so the panel takes the tokens of
 * Bitkit's popover.
 */
const PreviewHoverCard = ({ children, preview }: Props) => (
  <HoverCard.Root
    lazyMount
    unmountOnExit
    // The delays of the bitkit v1 hover popover this replaced.
    openDelay={200}
    closeDelay={200}
    positioning={{ placement: 'left-start', offset: { mainAxis: 40 } }}
  >
    <HoverCard.Trigger asChild>{children}</HoverCard.Trigger>
    <Portal>
      <HoverCard.Positioner>
        <HoverCard.Content
          background="background/primary"
          borderRadius="8"
          boxShadow="elevation/lg"
          width={rem(320)}
          zIndex="popover"
        >
          {preview}
        </HoverCard.Content>
      </HoverCard.Positioner>
    </Portal>
  </HoverCard.Root>
);

export default PreviewHoverCard;
