import { Icon } from '@bitrise/bitkit';
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
  HTMLChakraProps,
  ModalBodyProps,
  ModalFooterProps,
  ModalHeaderProps,
  ModalOverlayProps,
  useBreakpointValue,
} from '@chakra-ui/react';
import { createContext, useContext, useMemo } from 'react';

type FloatingDrawerProps = Omit<DrawerProps, 'size'> & {
  size?: 'md' | 'lg';
};

const FloatingDrawerContext = createContext<Required<Pick<FloatingDrawerProps, 'size'>>>({ size: 'md' });
const useFloatingDrawerContext = () => useContext(FloatingDrawerContext);

const FloatingDrawer = ({ children, size = 'md', ...props }: FloatingDrawerProps) => {
  const providerProps = useMemo(() => ({ size }), [size]);
  const placement = useBreakpointValue<DrawerProps['placement']>({ base: 'bottom', tablet: 'right' }, { ssr: false });

  return (
    <FloatingDrawerContext.Provider value={providerProps}>
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
    </FloatingDrawerContext.Provider>
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

function getContentMaxWidth(size: 'md' | 'lg') {
  switch (size) {
    case 'lg':
      return ['100%', 'clamp(420px, 55%, 1024px)'];
    case 'md':
    default:
      return ['100%', 'clamp(420px, 40%, 700px)'];
  }
}

const FloatingDrawerContent = (props: DrawerContentProps) => {
  const containerProps = useMemo<HTMLChakraProps<'div'>>(() => ({ display: 'contents' }), []);
  const { size } = useFloatingDrawerContext();
  const maxW = getContentMaxWidth(size);

  return (
    <DrawerContent
      zIndex="fullDialog"
      top={0}
      gap={0}
      maxW={maxW}
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
  FloatingDrawerBody,
  FloatingDrawerCloseButton,
  FloatingDrawerContent,
  FloatingDrawerFooter,
  FloatingDrawerHeader,
  FloatingDrawerOverlay,
  FloatingDrawerProps,
};

export default FloatingDrawer;
