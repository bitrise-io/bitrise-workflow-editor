import { Icon } from '@bitrise/bitkit';
import {
  CloseButtonProps,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentProps,
  DrawerHeader,
  DrawerOverlay,
  DrawerProps,
  HTMLChakraProps,
  ModalBodyProps,
  ModalHeaderProps,
  ModalOverlayProps,
  useBreakpointValue,
} from 'chakra-ui-2--react';
import { useMemo, useState } from 'react';

import { isFloatingDrawerSwitch } from './drawerSwitch';

type FloatingDrawerProps = Omit<DrawerProps, 'size'>;

// Every entity's drawer (Workflow, Step, Step bundle, Pipeline, …) is the same width, so moving between
// them never resizes the panel. Pages that keep content beside a drawer reserve this much room.
const FLOATING_DRAWER_WIDTH = 'clamp(420px, 40vw, 700px)';

// The same width in pixels plus the drawer's 16px margin: how much of the page's right side an open
// drawer covers. Below the tablet breakpoint the drawer comes up from the bottom instead, covering none.
const floatingDrawerCoveredWidth = () =>
  window.innerWidth < 768 ? 0 : Math.min(Math.max(420, window.innerWidth * 0.4), 700) + 16;

const FloatingDrawer = ({ children, ...props }: FloatingDrawerProps) => {
  const placement = useBreakpointValue<DrawerProps['placement']>({ base: 'bottom', tablet: 'right' }, { ssr: false });

  return (
    <Drawer
      isFullHeight
      trapFocus={false}
      placement={placement}
      blockScrollOnMount={false}
      closeOnOverlayClick={false}
      {...props}
    >
      {/* NOTE: Without the overlay the close animation doesn't occur */}
      <FloatingDrawerOverlay display="none" />
      {children}
    </Drawer>
  );
};

const FloatingDrawerOverlay = (props: ModalOverlayProps) => {
  return (
    <DrawerOverlay
      top="0px"
      zIndex="fullDialogOverlay"
      bg="linear-gradient(to left, rgba(0, 0, 0, 0.22) 0%, rgba(0, 0, 0, 0) 60%, rgba(0, 0, 0, 0) 100%);"
      {...props}
    />
  );
};

const FloatingDrawerCloseButton = ({ children, ...props }: CloseButtonProps) => {
  return (
    <DrawerCloseButton size="md" {...props}>
      {children ?? <Icon name="Cross" />}
    </DrawerCloseButton>
  );
};

const FloatingDrawerContent = (props: DrawerContentProps) => {
  const containerProps = useMemo<HTMLChakraProps<'div'>>(() => ({ display: 'contents' }), []);
  // Decided once, on mount: a drawer that replaces another appears in place.
  const [isSwappedIn] = useState(isFloatingDrawerSwitch);
  const motionProps = useMemo(() => (isSwappedIn ? { initial: false as const } : undefined), [isSwappedIn]);

  return (
    <DrawerContent
      zIndex="fullDialog"
      top={0}
      gap={0}
      maxW={['100%', FLOATING_DRAWER_WIDTH]}
      padding={0}
      display="flex"
      flexDir="column"
      overflow="hidden"
      boxShadow="large"
      border="1px solid"
      borderColor="border/regular"
      margin={[0, 16]}
      marginTop={[0, 72]}
      borderRadius={[0, 12]}
      containerProps={containerProps}
      motionProps={motionProps}
      {...props}
    />
  );
};

const FloatingDrawerHeader = (props: ModalHeaderProps) => {
  return <DrawerHeader p="24" pb="0" color="initial" textTransform="initial" fontWeight="initial" {...props} />;
};

const FloatingDrawerBody = (props: ModalBodyProps) => {
  return <DrawerBody p="24" flex="1" overflowY="auto" {...props} />;
};

export {
  FLOATING_DRAWER_WIDTH,
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  floatingDrawerCoveredWidth,
  FloatingDrawerHeader,
  FloatingDrawerProps,
};

export default FloatingDrawer;
