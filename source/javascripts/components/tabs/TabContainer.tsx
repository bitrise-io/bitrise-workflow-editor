import { Box } from '@chakra-ui/react/box';
import { PropsWithChildren } from 'react';

const TabContainer = ({ children }: PropsWithChildren) => {
  return (
    <Box padding="32" display="flex" flexDirection="column" gap="24">
      {children}
    </Box>
  );
};

export default TabContainer;
