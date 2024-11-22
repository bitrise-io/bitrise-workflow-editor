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

const FloatingDrawer = ({ children, ...props }: FloatingDrawerProps) => {
  return (
    <Drawer isFullHeight blockScrollOnMount={false} closeOnOverlayClick={false} {...props}>
      {/* NOTE: Without the overlay the close animation doesn't occur */}
      <FloatingDrawerOverlay zIndex="fullDialogOverlay" display="none" />
      {children}
    </Drawer>
  );
};

const FloatingDrawerOverlay = (props: ModalOverlayProps) => {
  return (
    <DrawerOverlay
      top="0px"
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

function getContentMaxWidth(size: 'md' | 'lg') {
  switch (size) {
    case 'lg':
      return ['100%', 'clamp(420px, 60%, 1024px)'];
    case 'md':
    default:
      return ['100%', 'clamp(420px, 40%, 700px)'];
  }
}

type FloatingDrawerContentProps = DrawerContentProps & {
  size?: 'md' | 'lg';
};
const FloatingDrawerContent = ({ size = 'md', ...props }: FloatingDrawerContentProps) => {
  const maxW = getContentMaxWidth(size);

  return (
    <DrawerContent
      zIndex="fullDialog"
      top={0}
      gap={0}
      padding={0}
      margin={[0, 24]}
      marginTop={[0, 64]}
      display="flex"
      flexDir="column"
      overflow="hidden"
      boxShadow="large"
      borderRadius={[0, 12]}
      maxW={maxW}
      containerProps={{
        display: 'contents',
      }}
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

const FloatingDrawerFooter = (props: ModalFooterProps) => {
  return <DrawerFooter {...props} />;
};

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
