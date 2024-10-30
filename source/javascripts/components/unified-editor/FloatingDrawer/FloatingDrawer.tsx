import { memo } from 'react';
import {
  CloseButtonProps,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentProps,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerProps,
  ModalBodyProps,
  ModalFooterProps,
  ModalHeaderProps,
  ModalOverlayProps,
} from '@chakra-ui/react';
import { Icon } from '@bitrise/bitkit';

type FloatingDrawerProps = DrawerProps;

const FloatingDrawer = memo((props: FloatingDrawerProps) => {
  return <Drawer isFullHeight {...props} />;
});

const FloatingDrawerOverlay = memo((props: ModalOverlayProps) => {
  return (
    <DrawerOverlay
      top="0px"
      bg="linear-gradient(to left, rgba(0, 0, 0, 0.22) 0%, rgba(0, 0, 0, 0) 60%, rgba(0, 0, 0, 0) 100%);"
      {...props}
    />
  );
});

const FloatingDrawerCloseButton = memo(({ children, ...props }: CloseButtonProps) => {
  return (
    <DrawerCloseButton size="md" {...props}>
      {children ?? <Icon name="Cross" />}
    </DrawerCloseButton>
  );
});

const FloatingDrawerContent = memo((props: DrawerContentProps) => {
  return (
    <DrawerContent
      top={0}
      gap={0}
      padding={0}
      margin={[0, 24]}
      display="flex"
      flexDir="column"
      overflow="hidden"
      boxShadow="large"
      borderRadius={[0, 12]}
      maxWidth={['100%', '50%']}
      {...props}
    />
  );
});

const FloatingDrawerHeader = memo((props: ModalHeaderProps) => {
  return <DrawerHeader p="24" pb="16" color="inherit" textTransform="inherit" fontWeight="inherit" {...props} />;
});

const FloatingDrawerBody = memo((props: ModalBodyProps) => {
  return <DrawerBody p="24" pt="16" flex="1" overflowY="auto" {...props} />;
});

const FloatingDrawerFooter = memo((props: ModalFooterProps) => {
  return <DrawerFooter {...props} />;
});

export {
  FloatingDrawerProps,
  FloatingDrawerOverlay,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerHeader,
  FloatingDrawerBody,
  FloatingDrawerFooter,
};

export default FloatingDrawer;
