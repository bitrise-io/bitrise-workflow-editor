import { BitkitDrawer, BitkitDrawerContentProps, rem } from '@bitrise/bitkit-v2';
import { Portal } from '@chakra-ui/react/portal';
import { createContext, ReactNode, RefObject, useContext, useRef } from 'react';

type FloatingDrawerProps = {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  onCloseComplete?: () => void;
  size?: 'md' | 'lg';
};

const ContentRefContext = createContext<RefObject<HTMLDivElement> | undefined>(undefined);

/**
 * A non-modal floating drawer: the canvas and the page header stay usable while it is open, so
 * selecting another Step or saving does not need the drawer closed first. That is why it has no
 * backdrop, lets pointer events through its positioner, and starts below the 72px page header.
 * Opening it focuses the panel itself (or a field inside that took focus on mount) rather than its
 * first button, the close button.
 */
const FloatingDrawer = ({ children, isOpen, onClose, onCloseComplete, size = 'md' }: FloatingDrawerProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <BitkitDrawer.Root
      lazyMount
      unmountOnExit
      modal={false}
      trapFocus={false}
      preventScroll={false}
      closeOnInteractOutside={false}
      open={isOpen}
      size={size}
      variant="floating"
      initialFocusEl={() => {
        const { activeElement } = document;
        // Keep an `autoFocus` field (the Step selector's search) focused.
        return activeElement instanceof HTMLElement && contentRef.current?.contains(activeElement)
          ? activeElement
          : contentRef.current;
      }}
      onExitComplete={onCloseComplete}
      onOpenChange={({ open }) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <Portal>
        <BitkitDrawer.Positioner pointerEvents="none" paddingBlockStart={rem(72)}>
          <ContentRefContext.Provider value={contentRef}>{children}</ContentRefContext.Provider>
        </BitkitDrawer.Positioner>
      </Portal>
    </BitkitDrawer.Root>
  );
};

const FloatingDrawerContent = (props: BitkitDrawerContentProps) => {
  const contentRef = useContext(ContentRefContext);
  return <BitkitDrawer.Content ref={contentRef} pointerEvents="auto" {...props} />;
};

const FloatingDrawerBody = BitkitDrawer.Body;
const FloatingDrawerCloseButton = BitkitDrawer.CloseButton;
const FloatingDrawerHeader = BitkitDrawer.Header;

export {
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerProps,
};

export default FloatingDrawer;
