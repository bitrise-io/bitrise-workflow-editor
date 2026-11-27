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

const FloatingDrawerContext = createContext<RefObject<HTMLDivElement> | undefined>(undefined);

/**
 * A non-modal floating drawer: the canvas and the page header stay usable while it is open, so
 * selecting another Step or saving does not need the drawer closed first. That is why it has no
 * backdrop and starts below the 72px page header.
 * Opening it focuses the panel itself (or a field inside that took focus on mount) rather than its
 * first button, the close button.
 */
const FloatingDrawer = ({ children, isOpen, onClose, onCloseComplete, size = 'md' }: FloatingDrawerProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // The dialog listens for Escape on the document before anything inside sees the key, so an Escape
  // that closes Monaco's suggestions would close the drawer too. For a key from an editor, close only
  // once it bubbles out of the editor: Monaco stops the key when it uses it.
  const handleEscapeKeyDown = (event: KeyboardEvent) => {
    const content = contentRef.current;
    if (!content || !(event.target instanceof Element) || !event.target.closest('.monaco-editor')) {
      return;
    }

    event.preventDefault();
    const closeIfUnused = (bubbled: Event) => {
      if (bubbled === event) {
        onClose();
      }
    };
    content.addEventListener('keydown', closeIfUnused, { once: true });
    setTimeout(() => content.removeEventListener('keydown', closeIfUnused));
  };

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
      onEscapeKeyDown={handleEscapeKeyDown}
      onExitComplete={onCloseComplete}
      onOpenChange={({ open }) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <Portal>
        <BitkitDrawer.Positioner paddingBlockStart={rem(72)}>
          <FloatingDrawerContext.Provider value={contentRef}>{children}</FloatingDrawerContext.Provider>
        </BitkitDrawer.Positioner>
      </Portal>
    </BitkitDrawer.Root>
  );
};

const FloatingDrawerContent = (props: BitkitDrawerContentProps) => {
  const contentRef = useContext(FloatingDrawerContext);
  return <BitkitDrawer.Content ref={contentRef} {...props} />;
};

const FloatingDrawerBody = BitkitDrawer.Body;
const FloatingDrawerCloseButton = BitkitDrawer.CloseButton;
const FloatingDrawerHeader = BitkitDrawer.Header;
const FloatingDrawerTitle = BitkitDrawer.Title;

export {
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerProps,
  FloatingDrawerTitle,
};

export default FloatingDrawer;
