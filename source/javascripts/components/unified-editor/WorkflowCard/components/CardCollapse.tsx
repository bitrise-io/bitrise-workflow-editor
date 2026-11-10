import { Collapsible } from '@chakra-ui/react/collapsible';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  open: boolean;
};

// Zag sets `data-state="open"` only while the content expands, so `_open` styles the animation and the
// base styles the settled, open content. That one stays overflow-visible: the first and last
// "Add Step" buttons of a step list overhang the list's edges.
const CardCollapse = ({ children, open }: Props) => (
  <Collapsible.Root open={open} lazyMount unmountOnExit unstyled>
    <Collapsible.Content
      _open={{ animationName: 'expand-height', animationDuration: 'moderate', overflow: 'clip' }}
      _closed={{ animationName: 'collapse-height', animationDuration: 'moderate', overflow: 'clip' }}
    >
      {children}
    </Collapsible.Content>
  </Collapsible.Root>
);

export default CardCollapse;
